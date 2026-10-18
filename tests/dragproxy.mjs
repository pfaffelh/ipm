// The dashed hypotheses on a board of the Lean tactic mode can be dragged (with the mouse and a finger).
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const page = await (await browser.newContext({ viewport: { width: 1300, height: 850 } })).newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
const wait = ms => page.waitForTimeout(ms)
const click = async l => { await l.dispatchEvent('click'); await wait(200) }
const ok = async () => { for (let i = 0; i < 5 && await page.locator('.ipm-tip-overlay').count(); i++) await click(page.locator('.ipm-tip-overlay button').last()) }
await page.goto(base + 'World-2___-Implication/'); await page.evaluate(() => { localStorage.clear(); localStorage.setItem('ipm-verso:mode', 'tactics'); localStorage.setItem('ipm-verso:in-order', 'off') })
await page.goto(base + 'World-2___-Implication/#level-22'); await page.reload(); await wait(600); await ok()
const t = page.locator('.ipm-task.ipm-current')
const step = async x => { await click(t.locator('.ipm-step').filter({ hasText: x }).first()); await ok() }
await step('apply h₁'); await step('apply h₂'); await step('intro')
const proxy = t.locator('.ipm-local-hyp').first()
const box = async () => { const b = await proxy.boundingBox(); return `${Math.round(b.x)},${Math.round(b.y)}` }
const before = await box(), b = await proxy.boundingBox()
await page.mouse.move(b.x + b.width / 2, b.y + 8); await page.mouse.down()
for (let k = 1; k <= 8; k++) await page.mouse.move(b.x + b.width / 2 - 25 * k, b.y + 8 + 20 * k)
await page.mouse.up(); await wait(400)
console.log('dashed h₃ dragged:', before, '→', await box(), (await box()) !== before ? 'ok' : 'FAIL: not moved')
await browser.close()
