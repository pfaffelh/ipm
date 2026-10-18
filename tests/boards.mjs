// The boards: goals with different hypotheses each on a board of their own (tabs above the picture),
// local hypotheses on top as blocks of their own. Plays level 3.5 (A ∨ B ⊢ B ∨ A) by tapping, with
// blocks from the column on the left, and 2.5 with tactics. Usage: BASE=http://localhost:8002/ node boards.mjs (SHOT=dir)
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const page = await (await browser.newContext({ viewport: { width: 1300, height: 800 } })).newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
const tap = async l => { await l.dispatchEvent('click'); await page.waitForTimeout(150) }
const open = async (path, n, tactics) => {
  await page.goto(base + path + '#level-' + n)
  await page.evaluate(t => { localStorage.clear(); localStorage.setItem('ipm-verso:tactics', t); localStorage.setItem('ipm-verso:in-order', 'off') }, tactics)
  await page.reload(); await page.waitForTimeout(400)
  await page.locator('.ipm-tip-overlay button').click().catch(() => {})
  return page.locator('.ipm-task.ipm-current')
}
const blocks = t => t.locator('.ipm-canvas .ipm-block').evaluateAll(xs => xs.map(x => x.textContent.replace(/\s+/g, ' ').trim()))
const block = (t, text) => t.locator('.ipm-canvas .ipm-block').filter({ hasText: text })
const state = async (t, what) => console.log(`${what}: tabs ${JSON.stringify(await t.locator('.ipm-board-tab').allTextContents())} | blocks ${JSON.stringify(await blocks(t))} | ${await t.locator('.ipm-status').innerText()}`)
// 3.5 by tapping
let t = await open('World-3___-Disjunction/', 5, 'off')
await tap(t.locator('.ipm-palette-item[data-rule="disjE"]'))
await state(t, '∨E added')
await tap(block(t, 'A ∨ B').first().locator('.ipm-port.ipm-out')); await tap(t.locator('.ipm-canvas .ipm-rule'))
await tap(t.locator('.ipm-canvas .ipm-rule .ipm-port.ipm-out').first()); await tap(t.locator('.ipm-canvas .ipm-conclusion .ipm-port.ipm-in'))
await state(t, 'root done')
for (const [n, rule] of [[0, 'disjI2'], [1, 'disjI1']]) {
  // with one goal left there is one board, and no tabs
  if (await t.locator('.ipm-board-tab').count() > 1) await tap(t.locator('.ipm-board-tab').nth(0))
  await tap(t.locator(`.ipm-palette-item[data-rule="${rule}"]`))
  const label = rule === 'disjI1' ? '∨I₁' : '∨I₂', added = t.locator('.ipm-canvas .ipm-rule').filter({ hasText: label })
  await tap(t.locator('.ipm-canvas .ipm-local-hyp .ipm-port.ipm-out')); await tap(added)
  await tap(added.locator('.ipm-port.ipm-out'))
  // the goal of this board: the open input that is not the new block's
  const goals = t.locator('.ipm-canvas .ipm-port.ipm-in.ipm-open')
  const k = await goals.evaluateAll((ps, label) => ps.findIndex(p => !p.closest('.ipm-block').textContent.includes(label)), label)
  await tap(goals.nth(k))
  await state(t, `case ${n + 1} done`)
  if (process.env.SHOT && n === 0) await page.screenshot({ path: process.env.SHOT + '/boards-case.png' })
}
console.log('Lean:', (await t.locator('.ipm-lean-code').textContent()).split('\n').slice(1).join(' ').trim())
if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/boards-done.png' })
// 2.5 with tactics: one board, the hypothesis on top
t = await open('World-2___-Implication/', 5, 'all')
await tap(t.locator('.ipm-conclusion .ipm-port.ipm-in')); await tap(t.locator('.ipm-step', { hasText: 'intro' }))
await state(t, '2.5 intro')
await browser.close()
