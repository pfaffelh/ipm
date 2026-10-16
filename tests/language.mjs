// The language switch in the header: English by default, German after tapping DE (kept on reload).
// Usage: BASE=http://localhost:8002/ node language.mjs   (SHOTDIR=dir for screenshots)
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 })
const page = await ctx.newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
await page.goto(base + 'Session-2___-Implication/')
await page.evaluate(() => localStorage.clear()); await page.reload()
const visibleText = async sel => (await page.locator(sel).count()) ? (await page.locator(sel).first().innerText()).slice(0, 60).replace(/\n/g, ' ') : '–'
const report = async label => console.log(`${label}: title "${await page.title()}" | intro "${await visibleText('main .ipm-lang:visible')}" | ` +
  `task "${await visibleText('.ipm-task .ipm-lang:visible')}" | label "${await visibleText('.ipm-task-label')}" | ` +
  `status "${await visibleText('.ipm-status')}" | menu "${await visibleText('.ipm-menu-label')}" | lang ${await page.evaluate(() => document.documentElement.lang)}`)
await report('EN')
await page.locator('.ipm-lang-switch button', { hasText: 'DE' }).click()
await page.waitForLoadState('load'); await page.waitForTimeout(300)
await report('DE')
const t = page.locator('.ipm-task').nth(0)
await t.locator('.ipm-conclusion .ipm-port.ipm-in').dispatchEvent('click'); await page.waitForTimeout(150)
console.log('DE, goal tapped:', await t.locator('.ipm-status').innerText())
if (process.env.SHOTDIR) await page.screenshot({ path: process.env.SHOTDIR + '/lang-de-phone.png' })
await page.goto(base)
await report('DE start page')
console.log('  TOC:', (await page.locator('#toc').innerText()).replace(/\n/g, ' | ').slice(0, 160))
const d = await (await browser.newContext({ viewport: { width: 1300, height: 800 } })).newPage()
await d.goto(base); await d.evaluate(() => localStorage.setItem('ipm-verso:lang', 'de')); await d.reload()
if (process.env.SHOTDIR) await d.screenshot({ path: process.env.SHOTDIR + '/lang-de-desk.png' })
await page.locator('.ipm-lang-switch button', { hasText: 'EN' }).click()
await page.waitForLoadState('load'); await page.waitForTimeout(300)
await report('back to EN')
await browser.close()
