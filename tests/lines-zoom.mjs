// Removes a line by tapping it and its ✕, and zooms in and out (simulated phone).
// Usage: BASE=http://localhost:8002/ node lines-zoom.mjs
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 })
const page = await ctx.newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
await page.goto((process.env.BASE ?? 'http://127.0.0.1:8002/') + 'Session-1___-Conjunction/')
await page.evaluate(() => localStorage.clear()); await page.reload()
const t = page.locator('.ipm-task').nth(0)
await t.locator('.ipm-board').scrollIntoViewIfNeeded()
const tapAt = async l => { const b = await l.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(150) }
await tapAt(t.locator('.ipm-conclusion rect')); await tapAt(t.locator('.ipm-assumption rect'))
console.log('connected:', await t.locator('.ipm-status').innerText(), '| lines:', await t.locator('.ipm-conn').count())
// tap the line (its middle), then the ✕
const p = await t.locator('.ipm-conn path:not(.ipm-conn-hit)').evaluate(path => { const l = path.getTotalLength(); const q = path.getPointAtLength(l / 2); const m = path.ownerSVGElement.getScreenCTM(); return { x: q.x * m.a + m.e, y: q.y * m.d + m.f } })
await page.touchscreen.tap(p.x + 4, p.y); await page.waitForTimeout(150)
console.log('line selected:', await t.locator('.ipm-conn-selected').count(), '| ✕ shown:', await t.locator('.ipm-conn-remove').count())
await tapAt(t.locator('.ipm-conn-remove circle'))
console.log('after ✕:', await t.locator('.ipm-status').innerText(), '| lines:', await t.locator('.ipm-conn').count())
// zoom
const width = async () => Math.round((await t.locator('.ipm-svg').boundingBox()).width)
const w0 = await width()
await t.locator('.ipm-zoom', { hasText: '+' }).click(); await t.locator('.ipm-zoom', { hasText: '+' }).click()
const w1 = await width()
await t.locator('.ipm-zoom', { hasText: '−' }).click(); await t.locator('.ipm-zoom', { hasText: '−' }).click(); await t.locator('.ipm-zoom', { hasText: '−' }).click()
const w2 = await width()
await t.locator('.ipm-zoom', { hasText: 'Fit' }).click()
console.log(`zoom widths: fit ${w0}px, ++ ${w1}px, −−− ${w2}px, Fit ${await width()}px | board scrolls when large: ${await t.locator('.ipm-canvas').evaluate(c => getComputedStyle(c).overflow)}`)
await browser.close()
