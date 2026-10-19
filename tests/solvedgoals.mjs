// Goals done stay in the list of goals, green, and can be tapped: their board comes into view (also
// when nothing is open there), the goal gets a green ring, and below the board what one had there.
// A goal that was taken apart is not listed (its parts are). Usage: BASE=http://localhost:8002/ node solvedgoals.mjs
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const page = await (await browser.newContext({ viewport: { width: 1300, height: 850 } })).newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
const wait = ms => page.waitForTimeout(ms)
await page.goto(base + 'World-3___-Disjunction/'); await page.evaluate(() => { localStorage.clear(); localStorage.setItem('ipm-verso:mode', 'tactics'); localStorage.setItem('ipm-verso:in-order', 'off'); localStorage.setItem('ipm-verso:hold', '0'); localStorage.setItem('ipm-verso:anim', '0'); localStorage.setItem('ipm-verso:lang', 'de') })
await page.goto(base + 'World-3___-Disjunction/#level-5'); await page.reload(); await wait(600)
while (await page.locator('.ipm-tip-overlay').count()) { await page.locator('.ipm-tip-ok').click(); await wait(150) }
const t = page.locator('.ipm-task.ipm-current')
const click = async l => { await l.dispatchEvent('click'); await wait(250); while (await page.locator('.ipm-tip-overlay').count()) { await page.locator('.ipm-tip-ok').click(); await wait(150) } }
const goals = async () => (await t.locator('.ipm-goal-item').evaluateAll(es => es.map(e => e.textContent + (e.classList.contains('ipm-goal-done') ? ' [done]' : '') + (e.classList.contains('ipm-goal-current') ? ' [current]' : '')))).join(' | ')
await click(t.locator('.ipm-assumption .ipm-port.ipm-out').first())
await click(t.locator('.ipm-step').filter({ hasText: 'obtain' }).first())
console.log('two cases:', await goals())
await click(t.locator('.ipm-step').filter({ hasText: 'right' }).first())
await click(t.locator('.ipm-step').filter({ hasText: 'exact' }).first()); await wait(200)
console.log('case 1 done:', await goals())
await click(t.locator('.ipm-goal-item.ipm-goal-done').first())
console.log('tapped the green goal:', await goals(), '| tab:', await t.locator('.ipm-board-tab.ipm-board-current').innerText(), '| ring:', await t.locator('.ipm-port.ipm-goal-shown').count(), '| context:', await t.locator('.ipm-context').innerText(), '| status:', await t.locator('.ipm-status').innerText())
await page.screenshot({ path: (process.env.SHOTDIR ?? '.') + '/solved-goal.png' })
await click(t.locator('.ipm-goal-item:not(.ipm-goal-done)').first())
console.log('back to the open goal:', await goals(), '| steps:', (await t.locator('.ipm-step text').allTextContents()).join(', '))
await click(t.locator('.ipm-step').filter({ hasText: 'left' }).first())
await click(t.locator('.ipm-step').filter({ hasText: 'exact' }).first()); await wait(200)
console.log('all done:', await t.locator('.ipm-status').innerText(), '| goals:', await goals())
await browser.close()
