// Drags rule blocks from the menu onto the board, with the mouse and with a finger.
// Usage: BASE=http://localhost:8002/ node menu-drag.mjs
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = (process.env.BASE ?? 'http://127.0.0.1:8002/') + 'Session-2___-Implication/'
const center = async l => { const b = await l.boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 } }
async function open(opts) {
  const page = await (await browser.newContext(opts)).newPage()
  page.on('pageerror', e => console.log('PAGEERROR', e.message))
  await page.goto(base); await page.evaluate(() => localStorage.clear()); await page.reload()
  const t = page.locator('.ipm-task').nth(0)
  await t.locator('.ipm-board').scrollIntoViewIfNeeded()
  return { page, t }
}
const blocks = t => t.locator('.ipm-canvas .ipm-rule')

// Mouse: drag →E to a point on the board
let { page, t } = await open({ viewport: { width: 1300, height: 900 } })
let from = await center(t.locator('.ipm-menu-item[title^="→E"]'))
let board = await t.locator('.ipm-canvas').boundingBox()
let target = { x: board.x + board.width * 0.3, y: board.y + board.height * 0.5 }
await page.mouse.move(from.x, from.y); await page.mouse.down(); await page.mouse.move(target.x, target.y, { steps: 12 })
console.log('mouse: ghost shown', await page.locator('.ipm-ghost').count(), '| board highlighted', await t.locator('.ipm-canvas.ipm-drop-target').count())
await page.mouse.up(); await page.waitForTimeout(200)
let c = await center(blocks(t).first())
console.log('mouse: blocks', await blocks(t).count(), '| dropped at', Math.round(target.x), Math.round(target.y), '→ block centre', Math.round(c.x), Math.round(c.y))
// drag and drop outside the board: nothing happens
from = await center(t.locator('.ipm-menu-item[title^="∧I"]'))
await page.mouse.move(from.x, from.y); await page.mouse.down(); await page.mouse.move(from.x + 300, from.y + 200, { steps: 8 }); await page.mouse.up()
console.log('mouse, dropped outside: blocks', await blocks(t).count())

// Finger
;({ page, t } = await open({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }))
const cdp = await page.context().newCDPSession(page)
const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] })
from = await center(t.locator('.ipm-menu-item[title^="→I"]'))
board = await t.locator('.ipm-canvas').boundingBox()
target = { x: board.x + board.width * 0.6, y: board.y + board.height * 0.45 }
await touch('touchStart', from.x, from.y)
for (let k = 1; k <= 12; k++) await touch('touchMove', from.x + (target.x - from.x) * k / 12, from.y + (target.y - from.y) * k / 12)
await touch('touchEnd'); await page.waitForTimeout(200)
c = await center(blocks(t).first())
console.log('finger: blocks', await blocks(t).count(), '| dropped at', Math.round(target.x), Math.round(target.y), '→ block centre', Math.round(c.x), Math.round(c.y))
// a tap still adds a block
from = await center(t.locator('.ipm-menu-item[title^="∧E"]'))
await touch('touchStart', from.x, from.y); await touch('touchEnd'); await page.waitForTimeout(200)
console.log('finger tap: blocks', await blocks(t).count())
await browser.close()
