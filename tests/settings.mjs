// Settings (⚙): only "levels in order" (the tactics come with the mode, see modes.mjs). At first a
// level is locked until the one before it is solved; with the setting off, every level is playable.
// Usage: BASE=http://localhost:8002/ node settings.mjs   (SHOTDIR=dir for screenshots)
import { chromium } from 'playwright-core'
import { allTasks } from './all-tasks.mjs'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 })
const page = await ctx.newPage()
await allTasks(page)
page.on('pageerror', e => console.log('PAGEERROR', e.message))
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const locked = () => page.locator('.ipm-task.ipm-locked').count()
await page.goto(base + 'World-2___-Implication/')
await page.evaluate(() => localStorage.clear()); await page.reload()
console.log('locked levels at first:', await locked())
await page.locator('.ipm-settings-button').click()
if (process.env.SHOTDIR) await page.screenshot({ path: process.env.SHOTDIR + '/settings-phone.png' })
console.log('settings:', (await page.locator('.ipm-settings').innerText()).replace(/\s+/g, ' ').trim(), '| tactic choices:', await page.locator('.ipm-settings input[type="radio"]').count())
await page.locator('.ipm-settings input[name="ipm-in-order"]').uncheck()
await page.waitForTimeout(200)
await page.reload()
console.log('after "in order" off and a reload: locked levels', await locked(), '| kept:', await page.evaluate(() => localStorage.getItem('ipm-verso:in-order')))
await browser.close()
