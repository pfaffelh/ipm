// The boards of the tactic mode: goals with different hypotheses each on a board of their own (tabs
// above the picture), local hypotheses on top as blocks of their own. Plays 3.5 (A ∨ B ⊢ B ∨ A) and
// the start of 2.5 with tactics. Usage: BASE=http://localhost:8002/ node boards.mjs (SHOT=dir)
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const page = await (await browser.newContext({ viewport: { width: 1300, height: 800 } })).newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
const tap = async l => { await l.dispatchEvent('click'); await page.waitForTimeout(150) }
const open = async (path, n, tactics) => {
  await page.goto(base + path + '#level-' + n)
  await page.evaluate(t => { localStorage.clear(); localStorage.setItem('ipm-verso:mode', t === 'off' ? 'blocks' : 'tactics'); localStorage.setItem('ipm-verso:in-order', 'off') }, tactics)
  await page.reload(); await page.waitForTimeout(400)
  await page.locator('.ipm-tip-overlay button').click().catch(() => {})
  return page.locator('.ipm-task.ipm-current')
}
const blocks = t => t.locator('.ipm-canvas .ipm-block').evaluateAll(xs => xs.map(x => x.textContent.replace(/\s+/g, ' ').trim()))
const block = (t, text) => t.locator('.ipm-canvas .ipm-block').filter({ hasText: text })
const state = async (t, what) => console.log(`${what}: tabs ${JSON.stringify(await t.locator('.ipm-board-tab').allTextContents())} | blocks ${JSON.stringify(await blocks(t))} | ${await t.locator('.ipm-status').innerText()}`)
// 3.5 with tactics: obtain on h₁ makes two boards; each case solved on its own board
let t = await open('World-3___-Disjunction/', 5, 'tactics')
await tap(t.locator('.ipm-assumption .ipm-port.ipm-out').first()); await tap(t.locator('.ipm-step', { hasText: 'obtain' }))
await state(t, 'after obtain')
for (const [n, side] of [[1, 'right'], [2, 'left']]) {
  // with one goal left there is one board, and no tabs
  if (await t.locator('.ipm-board-tab').count() > 1) await tap(t.locator('.ipm-board-tab').nth(0))
  await tap(t.locator('.ipm-canvas .ipm-port.ipm-in.ipm-open').first()); await tap(t.locator('.ipm-step', { hasText: side }))
  await tap(t.locator('.ipm-canvas .ipm-port.ipm-in.ipm-open').first()); await tap(t.locator('.ipm-step', { hasText: 'exact' }))
  await state(t, `case ${n} done`)
  if (process.env.SHOT && n === 1) await page.screenshot({ path: process.env.SHOT + '/boards-case.png' })
}
console.log('Lean:', (await t.locator('.ipm-lean-code').textContent()).split('\n').slice(1).join(' ').trim())
if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/boards-done.png' })
// 2.5 with tactics: one board, the hypothesis on top
t = await open('World-2___-Implication/', 5, 'tactics')
await tap(t.locator('.ipm-conclusion .ipm-port.ipm-in')); await tap(t.locator('.ipm-step', { hasText: 'intro' }))
await state(t, '2.5 intro')
await browser.close()
