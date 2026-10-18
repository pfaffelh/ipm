// The levels open in order: level n+1 once all levels up to n are solved, in whichever mode, also when a
// level is undone and solved again (then the levels after it open again, without a reload).
// Usage: BASE=http://localhost:8002/ node resolve.mjs
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const page = await (await browser.newContext({ viewport: { width: 1300, height: 900 } })).newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
const wait = ms => page.waitForTimeout(ms)
const click = async l => { await l.dispatchEvent('click'); await wait(150) }
const ok = async () => { for (let i = 0; i < 5 && await page.locator('.ipm-tip-overlay').count(); i++) await click(page.locator('.ipm-tip-overlay button').last()) }
const cur = () => page.locator('.ipm-task.ipm-current')
const state = async label => console.log(label, (await page.evaluate(() => [...document.querySelectorAll('.ipm-task')].slice(0, 4).map(t => (t.classList.contains('ipm-solved') ? 'S' : '-') + (t.classList.contains('ipm-locked') ? 'L' : '')))).join(' '))
const mode = async m => { await click(page.locator('.ipm-mode-switch:visible button', { hasText: m }).first()); await ok() }
const go = async n => { await page.evaluate(n => { location.hash = `#level-${n}` }, n); await wait(300); await ok() }
// level 1 (A ⊢ A) and 2 (A, B ⊢ A): in the tactic mode with `exact`, in the puzzle mode with a line
const solve = async tactics => {
  await click(cur().locator('.ipm-conclusion .ipm-port.ipm-in').first())
  await click(tactics ? cur().locator('.ipm-step', { hasText: 'exact' }).first() : cur().locator('.ipm-assumption .ipm-port.ipm-out').first())
  await wait(500)
}
await page.goto(base + 'World-1___-Conjunction/'); await page.evaluate(() => { localStorage.clear(); localStorage.setItem('ipm-verso:mode', 'tactics') }); await page.reload(); await wait(400); await ok()
await solve(true); await state('1 solved (tactics):            ')
await go(2); await state('on 2:                          ')
await go(1); await click(cur().locator('.ipm-undo')); await state('1 undone:                      ')
await go(2); await mode(/Puzzle/); await solve(false); await wait(400); await state('2 solved (puzzle):             ')
await go(1); await solve(false); await wait(400); await state('1 solved again (puzzle):       ')
console.log((await page.evaluate(() => document.querySelectorAll('.ipm-task')[2].classList.contains('ipm-locked'))) ? 'FAIL: level 3 still locked' : 'ok: level 3 open')
await browser.close()
