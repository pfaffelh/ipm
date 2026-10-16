// Tasks that are not playable yet are shown greyed out; solving a task unlocks the next one.
// Usage: BASE=http://localhost:8002/ node locked.mjs   (SHOT=file for a screenshot)
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 })
const page = await ctx.newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
await page.goto((process.env.BASE ?? 'http://127.0.0.1:8002/') + 'Session-1___-Conjunction/')
await page.evaluate(() => localStorage.clear()); await page.reload()
const t = i => page.locator('.ipm-task').nth(i)
const info = async i => `locked: ${await t(i).evaluate(x => x.classList.contains('ipm-locked'))}, ` +
  `picture visible: ${await t(i).locator('.ipm-svg').isVisible()}, menu visible: ${await t(i).locator('.ipm-menu').isVisible()}, ` +
  `inert: ${await t(i).evaluate(x => x.inert)}, board height: ${Math.round((await t(i).locator('.ipm-canvas').boundingBox()).height)}`
console.log('task 2 before:', await info(1))
await t(1).scrollIntoViewIfNeeded()
if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT })
const tap = async l => { await l.dispatchEvent('click'); await page.waitForTimeout(150) }
await tap(t(0).locator('.ipm-conclusion rect')); await tap(t(0).locator('.ipm-assumption rect'))
await page.waitForTimeout(1500)
console.log('task 2 after solving task 1:', await info(1))
console.log('task 3:', await info(2))
await browser.close()
