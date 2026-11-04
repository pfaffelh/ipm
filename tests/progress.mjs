// A solved level turns the board green and counts on the world map at once; the tip of a level comes
// once, when it is played for the first time; the last level of a world leads to the next world.
// Usage: BASE=http://localhost:8002/ node progress.mjs (SHOT=dir)
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const page = await (await browser.newContext({ viewport: { width: 1300, height: 800 } })).newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
const tap = async l => { await l.dispatchEvent('click'); await page.waitForTimeout(200) }
const tip = async () => { const c = page.locator('.ipm-tip-card'); if (!(await c.count())) return '(none)'; const t = (await c.innerText()).replace(/\s+/g, ' ').slice(0, 110); await page.locator('.ipm-tip-ok').click(); return t }
await page.goto(base)
await page.evaluate(() => { localStorage.clear() })
await page.goto(base + 'World-1___-Conjunction/#level-1'); await page.waitForTimeout(500)
console.log('1.1 at the start:', await tip())
const t = page.locator('.ipm-task.ipm-current')
const count = () => page.locator('.ipm-map-world').first().locator('.ipm-map-count').textContent()
console.log('map before:', await count())
// A ⊢ A: a line from the assumption to the goal
await tap(t.locator('.ipm-conclusion .ipm-port.ipm-in'))
await tap(t.locator('.ipm-assumption .ipm-port.ipm-out'))
await page.waitForTimeout(500)
console.log('solved:', await t.locator('.ipm-status').innerText(), '| board green:', await t.locator('.ipm-canvas.ipm-board-done').count(), '| map after:', await count())
if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/progress-solved.png' })
await page.goto(base + 'World-1___-Conjunction/#level-1'); await page.reload(); await page.waitForTimeout(500)
console.log('1.1 again (no tip):', await tip())
await page.evaluate(() => localStorage.setItem('ipm-verso:in-order', 'off'))
await page.goto(base + 'World-1___-Conjunction/#level-4'); await page.reload(); await page.waitForTimeout(500)
console.log('1.4 at the start:', await tip())
await page.goto(base + 'World-1___-Conjunction/#level-13'); await page.reload(); await page.waitForTimeout(500)
await page.locator('.ipm-tip-ok').click().catch(() => {})
const next = page.locator('.ipm-task.ipm-current .ipm-next')
console.log('1.13 next:', (await next.innerText()).replace(/\s+/g, ' '), '| enabled:', await next.isEnabled())
await next.click(); await page.waitForTimeout(600)
console.log('  leads to:', new URL(page.url()).pathname)
await browser.close()
