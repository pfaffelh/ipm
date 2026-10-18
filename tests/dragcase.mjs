// On a board of its own (one of two cases of obtain on ∨), every block can be dragged.
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const page = await (await browser.newContext({ viewport: { width: 1300, height: 850 } })).newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
const wait = ms => page.waitForTimeout(ms)
const click = async l => { await l.dispatchEvent('click'); await wait(200) }
const ok = async () => { for (let i = 0; i < 5 && await page.locator('.ipm-tip-overlay').count(); i++) await click(page.locator('.ipm-tip-overlay button').last()) }
await page.goto(base + 'World-3___-Disjunction/'); await page.evaluate(() => { localStorage.clear(); localStorage.setItem('ipm-verso:mode', 'tactics'); localStorage.setItem('ipm-verso:in-order', 'off') })
await page.goto(base + 'World-3___-Disjunction/#level-5'); await page.reload(); await wait(600); await ok()
const t = page.locator('.ipm-task.ipm-current')
await click(t.locator('.ipm-assumption .ipm-port.ipm-out').first()); await ok()
await click(t.locator('.ipm-step').filter({ hasText: 'obtain' }).first()); await ok()
console.log('tabs:', (await t.locator('.ipm-board-tab').allInnerTexts()).join(' / '))
const blocks = t.locator('.ipm-canvas svg > g:has(> rect), .ipm-canvas .ipm-rule, .ipm-canvas .ipm-assumption, .ipm-canvas .ipm-conclusion')
const n = await t.locator('.ipm-canvas .ipm-block').count()
console.log('blocks on the board:', n)
for (let k = 0; k < n; k++) {
  const blk = t.locator('.ipm-canvas .ipm-block').nth(k)
  const cls = (await blk.getAttribute('class')).replace('ipm-block', '').trim()
  const b = await blk.boundingBox()
  await page.mouse.move(b.x + 6, b.y + b.height / 2); await page.mouse.down()
  for (let i = 1; i <= 6; i++) await page.mouse.move(b.x + 6 + 12 * i, b.y + b.height / 2 + 15 * i)
  await page.mouse.up(); await wait(300)
  const a = await t.locator('.ipm-canvas .ipm-block').nth(k).boundingBox()
  console.log(`  ${cls}: ${Math.round(b.x)},${Math.round(b.y)} → ${Math.round(a.x)},${Math.round(a.y)}`, a.x !== b.x || a.y !== b.y ? 'moved' : 'NOT MOVED')
}
await browser.close()
