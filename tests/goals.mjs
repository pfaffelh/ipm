// The goals of the Lean tactic mode, numbered as in Lean (①, ②, … beside the red circles, in a list
// below the board and on the tabs of the boards): after each step the first goal is the current one
// (its board comes into view), and when a goal is done the next one is chosen and announced.
// Usage: BASE=http://localhost:8002/ node goals.mjs   (screenshots goals1.png, goals2.png)
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const page = await (await browser.newContext({ viewport: { width: 1300, height: 850 } })).newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
const wait = ms => page.waitForTimeout(ms)
const click = async l => { await l.dispatchEvent('click'); await wait(200) }
const ok = async () => { for (let i = 0; i < 5 && await page.locator('.ipm-tip-overlay').count(); i++) await click(page.locator('.ipm-tip-overlay button').last()) }
await page.goto((process.env.BASE ?? 'http://127.0.0.1:8002/') + 'World-2___-Implication/'); await page.evaluate(() => { localStorage.clear(); localStorage.setItem('ipm-verso:mode', 'tactics'); localStorage.setItem('ipm-verso:in-order', 'off'); localStorage.setItem('ipm-verso:lang', 'de') })
await page.goto((process.env.BASE ?? 'http://127.0.0.1:8002/') + 'World-2___-Implication/#level-22'); await page.reload(); await wait(600); await ok()
const t = page.locator('.ipm-task.ipm-current')
const show = async l => console.log(l, '| tabs:', (await t.locator('.ipm-board-tab').allInnerTexts()).join(' / '), '| status:', await t.locator('.ipm-status').innerText(), '| goals:', (await t.locator('.ipm-goals').innerText()).replace(/\s+/g, ' '), '| steps:', (await t.locator('.ipm-step text').allTextContents()).join(', '))
const step = async x => { await click(t.locator('.ipm-step').filter({ hasText: x }).first()); await ok() }
await show('start:')
await step('apply h₁'); await show('after apply h₁:')
await step('apply h₂'); await show('after apply h₂:')
await page.screenshot({ path: (process.env.SHOTDIR ?? '.') + '/goals1.png' })
await step('intro'); await show('after intro:')
await step('apply h₁'); await show('after apply h₁:')
await page.screenshot({ path: (process.env.SHOTDIR ?? '.') + '/goals2.png' })
await step('exact'); await show('after exact:')
await step('exact'); await wait(300); await show('after exact:')
await browser.close()
