// The board shows the whole picture, always: with many blocks, and with a block dragged far
// down, everything stays inside the board, and there is nothing to scroll in it.
// Usage: BASE=http://localhost:8002/ node fit.mjs   (SHOTDIR=dir for screenshots)
import { chromium } from 'playwright-core'
import { allTasks } from './all-tasks.mjs'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
for (const [opts, name] of [[{ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }, 'phone'], [{ viewport: { width: 1300, height: 900 } }, 'desktop']]) {
  const page = await (await browser.newContext(opts)).newPage()
  await allTasks(page)
  page.on('pageerror', e => console.log('PAGEERROR', e.message))
  await page.goto(base + 'Session-5___-Classical-Logic/')
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('ipm-verso:in-order', 'off') }); await page.reload()
  const t = page.locator('.ipm-task').nth(6)
  const check = async label => {
    const c = await t.locator('.ipm-canvas').boundingBox(), sv = await t.locator('.ipm-svg').boundingBox()
    const blocks = await t.locator('.ipm-canvas .ipm-block').evaluateAll(xs => xs.map(x => x.getBoundingClientRect()))
    const inside = blocks.every(r => r.left >= c.x - 1 && r.right <= c.x + c.width + 1 && r.top >= c.y - 1 && r.bottom <= c.y + c.height + 1)
    const scroll = await t.locator('.ipm-canvas').evaluate(x => x.scrollHeight > x.clientHeight + 1 || x.scrollWidth > x.clientWidth + 1)
    const font = await t.locator('.ipm-canvas .ipm-prop').first().evaluate(x => x.getBoundingClientRect().height)
    console.log(`${name} ${label}: board ${Math.round(c.width)}×${Math.round(c.height)}, picture ${Math.round(sv.width)}×${Math.round(sv.height)}, ${blocks.length} blocks all inside: ${inside}, scrolls: ${scroll}, text ${font.toFixed(1)}px`)
  }
  await t.scrollIntoViewIfNeeded()
  await check('empty')
  for (const r of ['impI', 'disjE', 'TND', 'impE', 'impI', 'falseE', 'impE', 'conjI', 'conjE', 'disjI1', 'disjI2', 'impE'])
    await t.locator(`.ipm-menu-item[data-rule="${r}"]`).dispatchEvent('click')
  await page.waitForTimeout(200)
  await check('12 blocks')
  // drag a block far below the board
  const b = await t.locator('.ipm-canvas .ipm-rule rect').first().boundingBox()
  await page.mouse.move(b.x + 10, b.y + 10); await page.mouse.down(); await page.mouse.move(b.x + 10, b.y + 900, { steps: 8 }); await page.mouse.up()
  await page.waitForTimeout(200)
  await check('a block dragged down')
  if (process.env.SHOTDIR) await t.locator('.ipm-board').screenshot({ path: `${process.env.SHOTDIR}/fit-${name}.png` })
}
await browser.close()
