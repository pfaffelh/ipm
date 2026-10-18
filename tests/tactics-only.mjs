// Can every level be solved with tactics alone? For each level a search plays only the tactic
// buttons (as on a tactics-only level): at the first open goal, and at the named things one has.
// Usage: BASE=http://localhost:8002/ node tactics-only.mjs [World-2___-Implication/ …]
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
let page
const newPage = async () => {
  page = await (await browser.newContext({ viewport: { width: 1300, height: 900 } })).newPage()
  page.on('pageerror', e => console.log('PAGEERROR', e.message))
}
await newPage()
const worlds = process.argv.slice(2).length ? process.argv.slice(2) : ['World-1___-Conjunction/', 'World-2___-Implication/',
  'World-3___-Disjunction/', 'World-4___-Falsity-and-Negation/', 'World-5___-Classical-Logic/', 'World-6___-Equivalence-and-Truth/',
  'World-7___-Quantifiers/', 'World-8___-Two-Puzzles/', 'World-9___-Induction/']
const failed = [], solutions = []
let solved = 0, total = 0
for (const w of worlds) {
  await page.goto(base + w)
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('ipm-verso:in-order', 'off') }); await page.reload()
  const n = await page.evaluate(() => window.ipmTasks.length)
  for (let i = 0; i < n; i++) {
    total++
    let r
    try { r = await page.evaluate(i => {
      const t = window.ipmTasks[i]
      t.tacticsOnly = true
      t.render = function () { this.analysis = this.proof.analyze() }
      t.closeSheet = () => {}
      t.render()
      const deadline = Date.now() + 8000
      const seen = new Map()
      // moves: the steps at the first open goal, and at each named thing one has
      const moves = () => {
        const a = t.analysis, out = []
        // as in Lean: the newest goal, and what one has there
        const goal = a.openInputs.at(-1)
        if (!goal) return out
        t.selected = { kind: 'in', ...goal }
        for (const s of t.steps()) out.push({ sel: { kind: 'in', ...goal }, s })
        const blocks = t.proof.blocks
        const usable = t.usableAt(goal)
        for (const b of blocks) b.outputs.forEach((_, j) => {
          if (b.kind === 'conclusion' || !usable[`${b.id}.${j}`]) return
          // like `obtain` in Lean, which uses up what it takes apart: only what is not used yet
          // (∀, → and ↔ may be used again: specialize, apply)
          if (!['all', 'imp', 'iff'].includes(b.outputs[j].t) && t.proof.connections.some(c => c.from.block === b.id && c.from.port === j)) return
          t.selected = { kind: 'out', block: b.id, port: j }
          for (const s of t.steps()) out.push({ sel: { kind: 'out', block: b.id, port: j }, s })
        })
        t.selected = null
        return out
      }
      const key = () => t.leanCode?.textContent ?? ''
      const search = depth => {
        if (t.analysis.qed) return true
        if (depth === 0 || Date.now() > deadline) return false
        // a short key: a hash of the picture without the ids
        const str = t.proof.snapshot().replace(/"(b|c)\d+"/g, '')
        let hsh = 0
        for (let q = 0; q < str.length; q++) hsh = (hsh * 31 + str.charCodeAt(q)) | 0
        const k = hsh + '|' + t.analysis.openInputs.length
        if ((seen.get(k) ?? -1) >= depth) return false
        if (seen.size > 100000) return false
        seen.set(k, depth)
        for (const m of moves()) {
          const snap = t.proof.snapshot()
          t.selected = m.sel
          // the step's act uses `this.selected`; recompute the steps for this selection and run the same one
          const s = t.steps().find(x => x.text === m.s.text)
          if (!s) continue
          s.act()
          t.render()
          if (t.analysis.qed && !t.proof.connections.some(c => t.analysis.status[c.id] !== 'ok')) return [m.s.text]
          const r = search(depth - 1)
          if (r) return [m.s.text, ...(r === true ? [] : r)]
          t.proof.restore(snap); t.render()
        }
        return false
      }
      for (let d = 1; d <= 14; d++) { seen.clear(); const r = search(d); if (r) return { ok: true, steps: r, graph: t.proof.snapshot() }; if (Date.now() > deadline) break }
      return { ok: false }
    }, i) } catch (e) {
      // the page gave up (memory): a new one, and on with the next level
      r = { ok: false, crash: String(e).split('\n')[0] }
      await newPage(); await page.goto(base + w)
      await page.evaluate(() => { localStorage.setItem('ipm-verso:in-order', 'off') }); await page.reload()
    }
    const name = `${w.match(/World-(\d+)/)[1]}.${i + 1}`
    if (r.ok) { solved++; solutions.push({ level: name, graph: r.graph }); if (process.env.VERBOSE) console.log(name, r.steps.join(' ; ')) }
    else { failed.push(name); console.log(name, r.crash ? 'CRASH ' + r.crash : 'not found') }
    if (process.env.SNAPOUT) (await import('node:fs')).writeFileSync(process.env.SNAPOUT, JSON.stringify(solutions))
  }
}
console.log(`solved with tactics alone: ${solved}/${total}`, failed.length ? `not found: ${failed.join(', ')}` : '')
if (process.env.SNAPOUT) (await import('node:fs')).writeFileSync(process.env.SNAPOUT, JSON.stringify(solutions))
await browser.close()
