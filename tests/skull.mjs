// A line with ☠: tapping the ☠ shows what is wrong in a box beside it, with ✕ to remove the line;
// a tap elsewhere closes the box. With the finger and with the mouse.
// Usage: BASE=http://localhost:8002/ node skull.mjs   (SHOT=file for a screenshot)
import { chromium } from 'playwright-core'
const b = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
for (const [opts, how] of [[{ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }, 'finger'], [{ viewport: { width: 1300, height: 900 } }, 'mouse']]) {
  const p = await (await b.newContext(opts)).newPage()
  p.on('pageerror', e => console.log('PAGEERROR', e.message))
  await p.goto(base + 'Session-1___-Conjunction/'); await p.evaluate(() => localStorage.clear()); await p.reload()
  await p.evaluate(() => document.querySelectorAll('.ipm-task').forEach(x => { x.classList.remove('ipm-locked'); x.inert = false }))
  const t = p.locator('.ipm-task').nth(1)  // A, B ⊢ A: connect B (wrong)
  const press = async l => { await l.scrollIntoViewIfNeeded(); const r = await l.boundingBox(); const x = r.x + r.width / 2, y = r.y + r.height / 2
    if (how === 'finger') await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); await p.waitForTimeout(200) }
  await t.locator('.ipm-conclusion .ipm-port.ipm-in').dispatchEvent('click')
  await t.locator('.ipm-assumption .ipm-port.ipm-out').nth(1).dispatchEvent('click')
  await press(t.locator('.ipm-skull'))
  console.log(`${how}: box "${(await t.locator('.ipm-bubble text').allTextContents()).join(' ')}"`)
  if (process.env.SHOT && how === 'finger') await t.locator('.ipm-canvas').screenshot({ path: process.env.SHOT })
  await press(t.locator('.ipm-assumption').first())  // a tap elsewhere: closes the box (and selects A)
  console.log(`${how}: after a tap elsewhere, box shown: ${await t.locator('.ipm-bubble').count()}`)
  await t.locator('.ipm-canvas svg').dispatchEvent('click')  // deselect
  await press(t.locator('.ipm-skull'))
  await press(t.locator('.ipm-bubble .ipm-conn-remove'))
  console.log(`${how}: after ✕: lines ${await t.locator('.ipm-conn').count()}, ☠ ${await t.locator('.ipm-skull').count()} | ${await t.locator('.ipm-status').innerText()}`)
}
await b.close()
