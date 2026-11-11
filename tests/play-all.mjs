// Plays the whole game as a player does, from an empty browser: the start page's Start, then every
// level of every world in order (levels locked until the one before is solved), each by taking its
// blocks from the blocks beside the board (or ＋ on a phone) and tapping an output and an input for
// every line; then Next, also from the last level of a world into the next world. A level is
// solved when the game says so ("goals accomplished"); its Lean proof is collected.
// The proofs played are graphs from files of `[{level: 'W.N', graph}]` (`Proof.snapshot()`); the first
// one for a level is used. `solutions.json` (the default) has one for every level (see docs/fuzzing.md).
// Usage: BASE=http://localhost:8002/ LEANOUT=all.lean node play-all.mjs [solutions.json …]
//   PHONE=1 for a phone; ONLY=3 for world 3 alone (opened directly, with the levels in order off).
// Then `lake env lean all.lean` checks the Lean proofs.
import fs from 'node:fs'
import { chromium } from 'playwright-core'
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const sols = new Map()
const files = process.argv.slice(2).length ? process.argv.slice(2) : [new URL('solutions.json', import.meta.url)]
for (const f of files) for (const s of JSON.parse(fs.readFileSync(f, 'utf8'))) if (!sols.has(s.level)) sols.set(s.level, s.graph)
const phone = !!process.env.PHONE
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const ctx = await browser.newContext(phone ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1366, height: 900 } })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push(e.message))
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
const pause = ms => page.waitForTimeout(ms)
const report = [], lean = []
let solvedCount = 0, total = 0

const closeTip = async () => {
  for (let k = 0; k < 3; k++) {
    const ok = page.locator('.ipm-tip-ok')
    if (await ok.count() && await ok.first().isVisible()) { await ok.first().click(); await pause(150) } else break
  }
}
// the level shown: its index on the page and its element
const current = async () => {
  const i = await page.evaluate(() => [...document.querySelectorAll('.ipm-task')].findIndex(t => t.classList.contains('ipm-current')))
  return { i, t: page.locator('.ipm-task').nth(i) }
}
const worldOf = () => page.evaluate(() => /World-(\d+)/.exec(location.pathname)?.[1])

// a tap on a port: a real click; where something lies over it, a click on the port itself
let forced = 0
const tapPort = async loc => {
  await loc.scrollIntoViewIfNeeded().catch(() => {})
  try { await loc.click({ timeout: 1500 }) } catch { forced++; await loc.dispatchEvent('click') }
  await pause(60)
}
const addBlock = async (t, rule) => {
  const pal = t.locator(`.ipm-palette-item[data-rule="${rule}"]`)
  if (await pal.count() && await pal.first().isVisible()) { await pal.first().click(); await pause(120); return true }
  await t.locator('.ipm-add').click(); await pause(150)
  const item = t.locator(`.ipm-menu-item[data-rule="${rule}"]`)
  if (!(await item.count())) { await page.keyboard.press('Escape'); return false }
  await item.first().click(); await pause(150)
  return true
}

async function playLevel(level) {
  const { i, t } = await current()
  const g = sols.get(level)
  if (!g) return { ok: false, why: 'no solution in the files' }
  const graph = JSON.parse(g)
  // the blocks the level starts with, by kind and order; the rule blocks as they are added
  const fresh = await page.evaluate(i => window.ipmTasks[i].proof.blocks.map(b => ({ id: b.id, kind: b.kind })), i)
  const ids = {}
  for (const kind of ['assumption', 'conclusion']) {
    const a = graph.b.filter(b => b.kind === kind), f = fresh.filter(b => b.kind === kind)
    if (a.length !== f.length) return { ok: false, why: `${a.length} ${kind}s in the solution, ${f.length} on the board` }
    a.forEach((b, k) => { ids[b.id] = f[k].id })
  }
  for (const b of graph.b.filter(b => b.kind === 'rule')) {
    const before = await page.evaluate(i => window.ipmTasks[i].proof.blocks.map(b => b.id), i)
    if (!(await addBlock(t, b.rule))) return { ok: false, why: `block ${b.rule} not offered` }
    const after = await page.evaluate(i => window.ipmTasks[i].proof.blocks.map(b => b.id), i)
    const added = after.filter(x => !before.includes(x))
    if (added.length !== 1) return { ok: false, why: `adding ${b.rule} gave ${added.length} blocks` }
    ids[b.id] = added[0]
  }
  const port = (block, kind, n) => t.locator(`.ipm-canvas .ipm-block[data-id="${block}"] .ipm-port[data-kind="${kind}"][data-i="${n}"]`)
  let refused = 0
  for (const c of graph.c) {
    const n0 = await page.evaluate(i => window.ipmTasks[i].proof.connections.length, i)
    await tapPort(port(ids[c.from.block], 'out', c.from.port))
    await tapPort(port(ids[c.to.block], 'in', c.to.port))
    const n1 = await page.evaluate(i => window.ipmTasks[i].proof.connections.length, i)
    if (n1 !== n0 + 1) {
      refused++
      // what is selected stays selected: tap beside the blocks
      await page.keyboard.press('Escape')
    }
  }
  await pause(300)
  const r = await page.evaluate(i => {
    const t = window.ipmTasks[i]
    return { qed: !!t.analysis.qed, status: t.status?.textContent ?? '', solved: t.root?.classList?.contains('ipm-solved') ?? null,
      bad: Object.values(t.analysis.status ?? {}).filter(s => s !== 'ok').length, lean: t.leanCode?.textContent ?? '' }
  }, i)
  const shown = await t.locator('.ipm-status').innerText()
  return { ok: r.qed && /goals accomplished/.test(shown), why: r.qed ? (refused ? `${refused} line(s) refused` : '') : `not solved: "${shown}"${refused ? `, ${refused} line(s) refused` : ''}${r.bad ? `, ${r.bad} bad line(s)` : ''}`, lean: r.lean, refused }
}

// the start page, Start
await page.goto(base)
await page.evaluate(() => localStorage.clear()); await page.reload()
if (process.env.ONLY) {
  await page.evaluate(() => localStorage.setItem('ipm-verso:in-order', 'off'))
  const href = await page.evaluate(w => [...document.querySelectorAll('a[href*="World-"]')].map(a => a.getAttribute('href')).find(h => new RegExp(`World-${w}___`).test(h)), process.env.ONLY)
  await page.goto(new URL(href.replace(/#.*$/, ''), page.url()).href)
} else {
  const start = page.locator('.ipm-start-button, a.ipm-start').first()
  await start.click()
}
await page.waitForLoadState(); await pause(500)
const t0 = Date.now()
for (let guard = 0; guard < 400; guard++) {
  await closeTip()
  const w = await worldOf()
  if (process.env.ONLY && w !== process.env.ONLY) break
  const { i, t } = await current()
  if (i < 0) { report.push(`world ${w}: no level shown`); break }
  const level = `${w}.${i + 1}`
  total++
  const locked = await t.evaluate(e => e.classList.contains('ipm-locked'))
  const s = Date.now()
  let r = locked ? { ok: false, why: 'locked' } : await playLevel(level)
  // a level the game does not solve: shown, then the next one opened by the settings (to go on)
  if (r.ok) { solvedCount++; lean.push(`namespace L${level.replace('.', '_')}\n${r.lean}\nend L${level.replace('.', '_')}`) }
  console.log(`${level}: ${r.ok ? 'solved' : 'NOT SOLVED'}${r.why ? ' — ' + r.why : ''} (${Date.now() - s} ms)`)
  if (!r.ok) report.push(`${level}: ${r.why}`)
  // Next: the next level, or the next world after the last one
  const next = t.locator('.ipm-next')
  const n = await page.evaluate(() => document.querySelectorAll('.ipm-task').length)
  if (!r.ok) {
    if (i + 1 < n) { await page.evaluate(() => localStorage.setItem('ipm-verso:in-order', 'off')); await page.evaluate(k => { location.hash = `#level-${k}` }, i + 2); await page.reload(); await pause(400); continue }
  }
  if (!(await next.count()) || !(await next.isEnabled())) { console.log(`${level}: no Next (the end)`); break }
  const url0 = page.url()
  await next.click(); await pause(500)
  await page.waitForLoadState()
  const { i: i2 } = await current()
  const w2 = await worldOf()
  if (w2 === w && i2 !== i + 1) { report.push(`${level}: Next went to level ${i2 + 1}`); break }
  if (w2 !== w) console.log(`— Next from world ${w} leads to world ${w2} (${page.url().replace(base, '')})`)
  if (page.url() === url0 && w2 === w && i2 === i) break
}
console.log(`\nsolved ${solvedCount} of ${total} levels in ${Math.round((Date.now() - t0) / 1000)} s; lines tapped beside the port: ${forced}`)
// at the end: the start page says Continue, and the map counts every level
await page.goto(base); await pause(400)
const map = await page.evaluate(() => [...document.querySelectorAll('.ipm-map-count')].map(e => e.textContent))
const startText = await page.locator('.ipm-start-button, a.ipm-start').first().innerText().catch(() => '?')
console.log('map:', map.join(' '), '| start button:', startText.replace(/\s+/g, ' '))
if (errors.length) console.log('PAGE ERRORS:\n' + [...new Set(errors)].join('\n'))
if (report.length) console.log('PROBLEMS:\n' + report.join('\n'))
if (process.env.LEANOUT) fs.writeFileSync(process.env.LEANOUT, 'set_option linter.unusedVariables false\n\n' + lean.join('\n\n') + '\n')
await browser.close()
process.exit(report.length || errors.length ? 1 : 0)
