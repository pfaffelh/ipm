// The phone: the tool bar is one row at the bottom of the screen (a symbol over a short word);
// "Tips" and Lean are sheets over the board that scroll and close with a tap elsewhere;
// the page does not scroll; ☰ shows the map of the worlds above the tool bar.
// Usage: BASE=http://localhost:8002/ node mobile.mjs   (SHOTDIR=dir for screenshots)
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 })).newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
const shot = async n => { if (process.env.SHOTDIR) await page.screenshot({ path: `${process.env.SHOTDIR}/mobile-${n}.png` }) }
await page.goto(base + 'World-6___-Equivalence-and-Truth/'); await page.evaluate(() => { localStorage.clear(); localStorage.setItem('ipm-verso:lang', 'de') }); await page.reload(); await page.waitForTimeout(400)
await shot('tip')
await page.locator('.ipm-tip-ok').tap()
const bar = page.locator('.ipm-current .ipm-bar')
const b = await bar.boundingBox(), rows = await bar.evaluate(x => new Set([...x.children].filter(c => c.offsetParent).map(c => Math.round(c.getBoundingClientRect().top))).size)
console.log(`tool bar: ${rows} row(s), bottom at ${Math.round(b.y + b.height)} of 844 | buttons: ${JSON.stringify((await bar.innerText()).split('\n').filter(x => x.trim()))}`)
await shot('bar')
await page.locator('.ipm-current .ipm-about-button').tap(); await page.waitForTimeout(200)
const ab = await page.locator('.ipm-about').boundingBox(), board = await page.locator('.ipm-current .ipm-canvas').boundingBox()
console.log(`About: over the board ${ab.y < board.y + board.height}, scrolls ${await page.locator('.ipm-about').evaluate(x => x.scrollHeight > x.clientHeight)}, board height unchanged ${Math.round(board.height)}`)
await shot('about')
await page.touchscreen.tap(200, 160); await page.waitForTimeout(200)
console.log('after a tap elsewhere, About open:', await page.locator('.ipm-about').isVisible())
await page.locator('.ipm-current .ipm-lean-toggle').tap(); await page.waitForTimeout(200)
console.log('Lean open:', await page.locator('.ipm-current .ipm-lean').evaluate(d => d.open), '| as a sheet:', await page.locator('.ipm-current .ipm-lean').evaluate(d => getComputedStyle(d).position))
await shot('lean')
await page.touchscreen.tap(200, 160); await page.waitForTimeout(200)
console.log('page scrolls:', await page.evaluate(() => document.documentElement.scrollHeight > innerHeight + 1 && getComputedStyle(document.documentElement).overflow !== 'hidden'))
await page.locator('#toggle-toc-click').tap(); await page.waitForTimeout(500)
const top = await page.evaluate(() => { const r = document.querySelector('#toc .ipm-map').getBoundingClientRect(); const e = document.elementFromPoint(r.x + 30, r.y + 30); return e.closest('#toc') ? 'map on top' : `covered by ${e.className}` })
const bottom = await page.evaluate(() => { const e = document.elementFromPoint(100, 820); return e.closest('#toc') ? 'menu covers the bar' : `bar on top (${e.className})` })
console.log(`☰: ${top} | at the bottom: ${bottom}`)
await shot('menu')
await browser.close()
