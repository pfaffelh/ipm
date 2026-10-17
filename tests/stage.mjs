// The stage of a session page: one task at a time, as high as the screen. Navigates with the dots
// above on the right and with ← →, keeps the task in the address (also after reloading), shows "Next ›" once a task is
// solved, and the page does not scroll while one plays. On a phone and on a desktop.
// Usage: BASE=http://localhost:8002/ node stage.mjs   (SHOTDIR=dir for screenshots)
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
for (const [opts, name] of [[{ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }, 'phone'], [{ viewport: { width: 1300, height: 900 } }, 'desktop']]) {
  const page = await (await browser.newContext(opts)).newPage()
  page.on('pageerror', e => console.log('PAGEERROR', e.message))
  await page.goto(base + 'Session-1___-Conjunction/'); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(300)
  const cur = () => page.locator('.ipm-task.ipm-current')
  const where = async () => `task ${await page.locator('.ipm-dot').evaluateAll(ds => ds.findIndex(d => d.classList.contains('ipm-dot-current')) + 1)} (${new URL(page.url()).hash})`
  const fits = async () => page.evaluate(() => {
    const st = document.querySelector('.ipm-stage').getBoundingClientRect(), bar = document.querySelector('.ipm-current .ipm-bar').getBoundingClientRect()
    return st.top >= 0 && bar.bottom <= innerHeight + 1
  })
  console.log(`${name}: ${await where()}, ${await page.locator('.ipm-task.ipm-current').count()} task shown, intro open: ${await page.locator('.ipm-intro').evaluate(d => d.open)}, stage and tool bar on the screen: ${await fits()}`)
  // solve task 1 (A ⊢ A) by tapping, with the real pointer
  const y0 = await page.evaluate(() => scrollY)
  const tapOn = async l => { const b = await l.boundingBox(); if (opts.hasTouch) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(150) }
  await tapOn(cur().locator('.ipm-conclusion rect')); await tapOn(cur().locator('.ipm-assumption rect'))
  await page.waitForTimeout(500)
  console.log(`  task 1: ${await cur().locator('.ipm-status').innerText()} | scrolled: ${await page.evaluate(() => scrollY) - y0}px | "Next" shown: ${await cur().locator('.ipm-next').isVisible()} | next dot glows: ${await page.locator('.ipm-dot-next').count()} | dots solved: ${await page.locator('.ipm-dot-solved').count()}`)
  await tapOn(cur().locator('.ipm-next'))
  console.log(`  after Next: ${await where()}`)
  await page.reload(); await page.waitForTimeout(300)
  console.log(`  after reload: ${await where()}, stage on the screen: ${await fits()}`)
  await page.locator('.ipm-dot').nth(0).click(); await page.waitForTimeout(150)
  await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(100)
  console.log(`  dot 1, then ←: ${await where()}`)
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(150)
  console.log(`  → twice: ${await where()} | locked: ${await cur().evaluate(t => t.classList.contains('ipm-locked'))}`)
  const foot = await page.locator('.ipm-foot').boundingBox(), dots = await page.locator('.ipm-dots').boundingBox(), stageBox = await page.locator('.ipm-stage').boundingBox()
  console.log(`  dots above on the right: ${dots.y < stageBox.y + 40 && dots.x + dots.width > stageBox.x + stageBox.width - 4} | "About this session" at the bottom of the screen: ${foot.y + foot.height <= (opts.viewport.height) + 1 && foot.y > opts.viewport.height * 0.6}`)
  if (process.env.SHOTDIR) await page.screenshot({ path: `${process.env.SHOTDIR}/stage-${name}.png` })
}
await browser.close()
