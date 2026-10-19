// Smooth changes: after a tactic, a block that moves on the screen glides there in a second (it
// starts where it was), a new block fades in, and the lines fade in once the blocks are there.
// With 'ipm-verso:anim' 0 (the tests that measure places) nothing is animated.
// Usage: BASE=http://localhost:8002/ node glide.mjs
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const page = await (await browser.newContext({ viewport: { width: 1300, height: 850 } })).newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
const wait = ms => page.waitForTimeout(ms)
for (const anim of ['1', '0']) {
  await page.goto(base + 'World-3___-Disjunction/'); await page.evaluate(a => { localStorage.clear(); localStorage.setItem('ipm-verso:mode', 'tactics'); localStorage.setItem('ipm-verso:in-order', 'off'); localStorage.setItem('ipm-verso:anim', a); localStorage.setItem('ipm-verso:hold', '0') }, anim)
  await page.goto(base + 'World-3___-Disjunction/#level-5'); await page.reload(); await wait(600)
  while (await page.locator('.ipm-tip-overlay').count()) { await page.locator('.ipm-tip-ok').click(); await wait(150) }
  const t = page.locator('.ipm-task.ipm-current')
  // a step that changes the board (the cases of obtain): the blocks move on the screen
  await t.locator('.ipm-assumption .ipm-port.ipm-out').first().dispatchEvent('click'); await wait(200)
  await t.locator('.ipm-step').filter({ hasText: 'obtain' }).first().dispatchEvent('click')
  await wait(100)
  const r = await page.evaluate(() => {
    const blocks = [...document.querySelectorAll('.ipm-task.ipm-current .ipm-block[data-id]')]
    return { gliding: blocks.filter(g => g.style.transition.includes('transform')).length,
      fading: blocks.filter(g => g.style.transition.includes('opacity')).length,
      lines: [...document.querySelectorAll('.ipm-task.ipm-current .ipm-conn')].filter(l => l.style.transition.includes('opacity')).length,
      moving: blocks.filter(g => getComputedStyle(g).transform !== 'none').length }
  })
  await wait(1400)
  const after = await page.evaluate(() => [...document.querySelectorAll('.ipm-task.ipm-current .ipm-block[data-id]')].filter(g => getComputedStyle(g).transform !== 'none').length)
  console.log(`anim ${anim}: a tenth of a second after the step: ${r.gliding} blocks glide (${r.moving} on their way), ${r.fading} fade in, ${r.lines} lines wait | after 1.4 s: ${after} still on their way`)
  if (anim === '1' && !(r.gliding + r.fading)) console.log('FAIL: nothing animated')
  if (anim === '0' && (r.gliding + r.fading)) console.log('FAIL: animated although switched off')
  if (after) console.log('FAIL: blocks not arrived')
}
await browser.close()
