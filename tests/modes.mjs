// The two modes: the Proof Machine (blocks and lines) and the tactic mode (only tactic buttons, boards).
// The switch above each level, the start in the tactic mode, the tips of the tactics (once each), the
// tactics of a level are those of its blocks; the lexica. Usage: BASE=http://localhost:8002/ node modes.mjs (SHOT=dir)
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const page = await (await browser.newContext({ viewport: { width: 1300, height: 800 } })).newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
const tap = async l => { await l.dispatchEvent('click'); await page.waitForTimeout(150) }
await page.goto(base)
await page.evaluate(() => localStorage.clear()); await page.reload()
console.log('start page:', JSON.stringify(await page.locator('.ipm-start a').allTextContents()))
await page.locator('.ipm-start-tactics').click(); await page.waitForTimeout(600)
console.log('mode:', await page.evaluate(() => localStorage.getItem('ipm-verso:mode')), '| at', new URL(page.url()).pathname)
console.log('tip:', JSON.stringify(await page.locator('.ipm-tip-card .ipm-lexicon-cmd').allTextContents()))
if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/mode-tip.png' })
await page.locator('.ipm-tip-ok').click()
const t = page.locator('.ipm-task.ipm-current')
console.log('palette visible:', await t.locator('.ipm-palette').isVisible(), '| switch:', JSON.stringify(await page.locator('.ipm-mode-switch .ipm-mode-current').allTextContents()))
await tap(t.locator('.ipm-conclusion .ipm-port.ipm-in'))
console.log('1.1 goal buttons:', JSON.stringify(await t.locator('.ipm-step text').allTextContents()), '| names:', JSON.stringify(await t.locator('.ipm-hyp-name').allTextContents()))
// the switch: blocks, no buttons, no names; back
await page.locator('.ipm-mode-switch button').first().click(); await page.waitForTimeout(200)
// (now the tip of the blocks, not seen yet)
console.log('blocks mode tip:', await page.locator('.ipm-tip-card').count())
await page.locator('.ipm-tip-ok').click().catch(() => {})
await tap(t.locator('.ipm-conclusion .ipm-port.ipm-in'))
console.log('blocks mode: palette visible:', await t.locator('.ipm-palette').isVisible(), '| buttons:', await t.locator('.ipm-step').count(), '| names:', await t.locator('.ipm-hyp-name').count())
await page.locator('.ipm-mode-switch button').nth(1).click(); await page.waitForTimeout(200)
// a later level: tactics only of its blocks, tip once
await page.goto(base + 'World-2___-Implication/#level-1'); await page.reload(); await page.waitForTimeout(500)
console.log('2.1 tip:', JSON.stringify(await page.locator('.ipm-tip-card .ipm-lexicon-cmd').allTextContents()))
await page.locator('.ipm-tip-ok').click().catch(() => {})
await page.goto(base + 'World-2___-Implication/#level-5'); await page.reload(); await page.waitForTimeout(500)
console.log('2.5 tip (intro already seen at 2.1):', JSON.stringify(await page.locator('.ipm-tip-card .ipm-lexicon-cmd').allTextContents()))
// the lexica
for (const lex of ['Tactic-Lexicon/', 'Block-Lexicon/']) {
  await page.goto(base + lex); await page.waitForTimeout(300)
  console.log(lex, 'entries:', await page.locator('.ipm-lexicon-entry').count(), '| first:', (await page.locator('.ipm-lexicon-entry').first().innerText()).replace(/\s+/g, ' ').slice(0, 90))
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + `/${lex.replace('/', '')}.png` })
}
console.log('map links:', JSON.stringify(await page.locator('.ipm-map-trainer').allTextContents()))
await browser.close()
