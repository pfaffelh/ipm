// The line between the blocks and the board (large screens): dragging it makes the blocks wider and
// the board narrower (and back); the width holds for other levels and after reloading.
// Usage: BASE=http://localhost:8002/ node splitter.mjs   (SHOTDIR=dir for screenshots)
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const page = await (await browser.newContext({ viewport: { width: 1500, height: 900 } })).newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
await page.goto(base + 'World-3___-Disjunction/'); await page.evaluate(() => { localStorage.clear(); localStorage.setItem('ipm-verso:in-order', 'off') }); await page.reload(); await page.waitForTimeout(300)
await page.locator('.ipm-tip-ok').click()
const widths = async () => { const pal = await page.locator('.ipm-current .ipm-palette').boundingBox(), c = await page.locator('.ipm-current .ipm-canvas').boundingBox(); return `blocks ${Math.round(pal.width)}px, board ${Math.round(c.width)}px` }
console.log('at first:', await widths())
const line = await page.locator('.ipm-current .ipm-splitter').boundingBox()
await page.mouse.move(line.x + 6, line.y + line.height / 2); await page.mouse.down(); await page.mouse.move(line.x + 160, line.y + line.height / 2, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(200)
console.log('dragged 154px to the right:', await widths(), '| picture height', Math.round((await page.locator('.ipm-current .ipm-palette-item .ipm-rule-picture').first().boundingBox()).height))
if (process.env.SHOTDIR) await page.screenshot({ path: process.env.SHOTDIR + '/splitter.png' })
await page.locator('.ipm-dot').nth(1).click(); await page.waitForTimeout(200)
console.log('another level:', await widths())
await page.reload(); await page.waitForTimeout(300)
console.log('after reloading:', await widths())
await browser.close()
