// No tip is lost when the mode is switched: what was missed in the other mode comes at the next level
// that needs it. 1) the whole game with blocks: never a block before its tip; 2) world 1 with blocks,
// then tactics; 3) worlds 1–2 with tactics, then blocks. Usage: BASE=http://localhost:8002/ node tips-switch.mjs
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const page = await (await browser.newContext({ viewport: { width: 1300, height: 800 } })).newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
const worlds = ['World-1___-Conjunction/', 'World-2___-Implication/', 'World-3___-Disjunction/', 'World-4___-Falsity-and-Negation/',
  'World-5___-Classical-Logic/', 'World-6___-Equivalence-and-Truth/', 'World-7___-Quantifiers/', 'World-8___-Puzzles/', 'World-9___-Induction/']
const sizes = [13, 23, 20, 21, 15, 26, 23, 3, 6]
// visits a level; returns what its tip shows (tactics, blocks caught up) and closes it
const visit = async (w, n) => {
  await page.goto(base + worlds[w] + '#level-' + n); await page.reload(); await page.waitForTimeout(250)
  const card = page.locator('.ipm-tip-card')
  if (!(await card.count())) return null
  const r = { tactics: await card.locator('.ipm-lexicon-cmd').allTextContents(),
    missed: await card.locator('.ipm-tip-sub', { hasText: /not met|nicht kennst/ }).count() ? await card.locator('.ipm-lexicon-entry .ipm-menu-caption').allTextContents() : [] }
  await page.locator('.ipm-tip-ok').click()
  return r
}
const fresh = async mode => { await page.goto(base); await page.evaluate(m => { localStorage.clear(); localStorage.setItem('ipm-verso:in-order', 'off'); localStorage.setItem('ipm-verso:mode', m) }, mode) }
const setMode = m => page.evaluate(m => localStorage.setItem('ipm-verso:mode', m), m)
// 1)
await fresh('blocks')
let lost = []
for (let w = 0; w < worlds.length; w++) for (let n = 1; n <= sizes[w]; n++) { const r = await visit(w, n); if (r?.missed.length) lost.push(`${w + 1}.${n}: ${r.missed.join(', ')}`) }
console.log('1) whole game with blocks, blocks before their tip:', lost.length ? lost.join(' | ') : 'none')
// 2)
await fresh('blocks')
for (let n = 1; n <= 13; n++) await visit(0, n)
await setMode('tactics')
console.log('2) world 1 with blocks, then tactics: tip at 2.1:', JSON.stringify((await visit(1, 1))?.tactics))
// 3)
await fresh('tactics')
const seen = []
for (let n = 1; n <= 13; n++) seen.push(...((await visit(0, n))?.tactics ?? []))
for (let n = 1; n <= 23; n++) seen.push(...((await visit(1, n))?.tactics ?? []))
console.log('3) tactics seen in worlds 1–2:', JSON.stringify(seen))
await setMode('blocks')
const r3 = await visit(2, 1)
console.log('   then blocks: blocks caught up at 3.1:', JSON.stringify(r3?.missed))
console.log('   and at 3.2 nothing more:', JSON.stringify(await visit(2, 2)))
await browser.close()
