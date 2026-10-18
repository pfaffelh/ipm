// Tips: the first time a level is played, a box explains what is new in it (for the first level of a
// world: also the rules of the world); "Got it" closes it, and it does not come again. "About this
// level" at the foot always shows the tip and the rules of the world.
// Usage: BASE=http://localhost:8002/ node tips.mjs   (SHOTDIR=dir for screenshots)
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 })).newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
await page.goto(base + 'World-1___-Conjunction/'); await page.evaluate(() => { localStorage.clear(); localStorage.setItem('ipm-verso:in-order', 'off') }); await page.reload(); await page.waitForTimeout(400)
const box = page.locator('.ipm-tip-overlay')
const text = async l => (await l.innerText()).replace(/\s+/g, ' ').slice(0, 110)
console.log('level 1, first time:', await box.count() ? await text(box) : '(no tip)')
if (process.env.SHOTDIR) await page.screenshot({ path: process.env.SHOTDIR + '/tip-phone.png' })
await page.locator('.ipm-tip-ok').click(); await page.waitForTimeout(150)
await page.reload(); await page.waitForTimeout(300)
console.log('level 1, again:', await box.count() ? 'tip shown again' : '(no tip)')
await page.locator('.ipm-dot').nth(1).click(); await page.waitForTimeout(200)
console.log('level 2 (nothing new):', await box.count() ? await text(box) : '(no tip)')
await page.locator('.ipm-dot').nth(3).click(); await page.waitForTimeout(200)
console.log('level 4, first time:', await box.count() ? await text(box) : '(no tip)')
await page.locator('.ipm-tip-ok').click(); await page.waitForTimeout(150)
await page.locator('.ipm-current .ipm-about-button').click(); await page.waitForTimeout(200)
console.log('level 4, Tips:', await text(page.locator('.ipm-intro-body')))
if (process.env.SHOTDIR) await page.screenshot({ path: process.env.SHOTDIR + '/about-phone.png' })
await browser.close()
