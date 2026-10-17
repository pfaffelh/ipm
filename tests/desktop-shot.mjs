// The board on a large screen and on a phone.
import { chromium } from 'playwright-core'
import { allTasks } from './all-tasks.mjs'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
for (const [name, opts] of [['large', { viewport: { width: 1920, height: 1080 } }], ['phone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
  const page = await (await browser.newContext(opts)).newPage()
  await allTasks(page)
  page.on('pageerror', e => console.log('PAGEERROR', e.message))
  await page.goto((process.env.BASE ?? 'http://127.0.0.1:8002/') + 'Session-2___-Implication/')
  await page.evaluate(() => localStorage.clear()); await page.reload()
  const t = page.locator('.ipm-task').nth(0)
  await t.scrollIntoViewIfNeeded()
  const tb = await t.boundingBox(), cb = await t.locator('.ipm-canvas').boundingBox(), sb = await t.locator('.ipm-svg').boundingBox()
  const text = await page.locator('main section p').first().boundingBox()
  console.log(`${name}: text column x ${Math.round(text.x)}–${Math.round(text.x + text.width)}, task x ${Math.round(tb.x)}–${Math.round(tb.x + tb.width)}, board ${Math.round(cb.width)}×${Math.round(cb.height)}, picture ${Math.round(sb.width)}×${Math.round(sb.height)}`)
  await page.screenshot({ path: `${process.env.SHOTDIR ?? '.'}/board-${name}.png` })
}
await browser.close()
