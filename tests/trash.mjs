// Drags a rule block onto the trash can, with the mouse and with a finger.
// Usage: BASE=http://localhost:8002/ node trash.mjs
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = (process.env.BASE ?? 'http://127.0.0.1:8002/') + 'Session-1___-Conjunction/'
const center = async l => { const b = await l.boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 } }

async function setup(ctxOptions) {
  const ctx = await browser.newContext(ctxOptions)
  const page = await ctx.newPage()
  page.on('pageerror', e => console.log('PAGEERROR', e.message))
  await page.goto(base); await page.evaluate(() => localStorage.clear()); await page.reload()
  await page.evaluate(() => document.querySelectorAll('.ipm-task').forEach(x => { x.classList.remove('ipm-locked'); x.inert = false }))
  const t = page.locator('.ipm-task').nth(3)  // A, B ⊢ A ∧ B
  const click = async l => { await l.dispatchEvent('click'); await page.waitForTimeout(120) }
  await click(t.locator('.ipm-conclusion .ipm-port.ipm-in'))
  await click(t.locator('.ipm-menu-item[title^="∧I"]'))
  await click(t.locator('.ipm-canvas .ipm-rule .ipm-port.ipm-out').first())
  await t.locator('.ipm-canvas .ipm-rule').scrollIntoViewIfNeeded()
  return { ctx, page, t }
}

// Mouse
let { page, t } = await setup({ viewport: { width: 1300, height: 900 } })
console.log('mouse, before:', await t.locator('.ipm-canvas .ipm-rule').count(), 'rule block(s)')
let c = await center(t.locator('.ipm-canvas .ipm-rule rect'))
await page.mouse.move(c.x, c.y); await page.mouse.down(); await page.mouse.move(c.x + 30, c.y + 10, { steps: 5 })
const trash = await center(t.locator('.ipm-trash'))
console.log('  trash shown while dragging:', await t.locator('.ipm-trash').evaluate(e => e.classList.contains('ipm-trash-shown')))
await page.mouse.move(trash.x, trash.y, { steps: 10 })
console.log('  trash hot over it:', await t.locator('.ipm-trash').evaluate(e => e.classList.contains('ipm-trash-hot')))
await page.mouse.up(); await page.waitForTimeout(200)
console.log('  after drop:', await t.locator('.ipm-canvas .ipm-rule').count(), 'rule block(s) |', await t.locator('.ipm-status').innerText())
await t.locator('.ipm-button', { hasText: 'Undo' }).click()
console.log('  after undo:', await t.locator('.ipm-canvas .ipm-rule').count(), 'rule block(s), lines:', await t.locator('.ipm-conn').count())

// Finger
;({ page, t } = await setup({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }))
const cdp = await page.context().newCDPSession(page)
const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] })
c = await center(t.locator('.ipm-canvas .ipm-rule rect'))
await touch('touchStart', c.x, c.y); await touch('touchMove', c.x + 10, c.y + 10)
const trash2 = await center(t.locator('.ipm-trash'))
for (let k = 1; k <= 10; k++) await touch('touchMove', c.x + (trash2.x - c.x) * k / 10, c.y + (trash2.y - c.y) * k / 10)
await touch('touchEnd'); await page.waitForTimeout(200)
console.log('finger, after drop:', await t.locator('.ipm-canvas .ipm-rule').count(), 'rule block(s) |', await t.locator('.ipm-status').innerText())
await browser.close()
