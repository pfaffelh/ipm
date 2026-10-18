// The start page: two big "Start" buttons alike (puzzle mode, Lean tactic mode) to world 1; after
// playing, "Continue" to the last level.
// Usage: BASE=http://localhost:8002/ node start.mjs   (SHOTDIR=dir for screenshots)
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 })).newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
await page.goto(base); await page.evaluate(() => localStorage.clear()); await page.reload()
const btn = page.locator('.ipm-start-button').first()
const box = await btn.boundingBox()
console.log('start button:', await btn.innerText(), '| visible without scrolling:', box.y + box.height < 844, `| ${Math.round(box.width)}×${Math.round(box.height)}`)
if (process.env.SHOTDIR) await page.screenshot({ path: process.env.SHOTDIR + '/start-phone.png' })
await btn.click(); await page.waitForLoadState('load'); await page.waitForTimeout(300)
await page.locator('.ipm-tip-ok').click()
console.log('→', await page.title(), '|', new URL(page.url()).pathname + new URL(page.url()).hash, '| tasks:', await page.locator('.ipm-dot').count())
await page.reload(); await page.waitForTimeout(200)
console.log('after reload:', await page.title(), '|', new URL(page.url()).hash)
await page.locator('.ipm-dot').nth(1).click(); await page.waitForTimeout(200)
await page.goto(base); await page.waitForTimeout(200)
console.log('again on the start page:', await btn.innerText(), '|', await page.locator('.ipm-start-where').innerText(), '|', await btn.getAttribute('href'))
await browser.close()
