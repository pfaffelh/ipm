// The tactic trainer: wrong tactics are explained, a detour costs a star, the right ones lead to
// "goals accomplished"; the tactic script at the end is real Lean.
// Usage: BASE=http://localhost:8002/ node trainer.mjs   (LEANOUT=file for the scripts; SHOT=dir for pictures)
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const page = await (await browser.newContext({ viewport: { width: 1300, height: 900 } })).newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
await page.goto(base + 'Tactic-Trainer/')
await page.evaluate(() => localStorage.clear()); await page.reload()
const tap = async t => { await page.locator('.ipm-tr-tactic', { hasText: t }).first().click(); await page.waitForTimeout(50) }
const show = async what => console.log(`${what}\n  buttons: ${(await page.locator('.ipm-tr-tactic').allTextContents()).join(' | ')}\n  message: ${await page.locator('.ipm-tr-msg').innerText()}`)
const scripts = []
const finish = async () => { scripts.push(await page.locator('.ipm-tr-lean pre').innerText()); console.log(scripts.at(-1)) }
// 1.10 A ∧ B ⊢ B ∧ A: exact h₁ is wrong, constructor is a detour, then obtain …
await show('puzzle 1')
await tap('exact h₁'); await show('after exact h₁')
await tap('constructor'); await show('after constructor (a detour)')
await tap('obtain'); await tap('exact h₃'); await tap('obtain'); await tap('exact h₂'); await show('end')
await finish()
if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/trainer-1.png' })
// 2.5 with the hint
await page.locator('.ipm-tr-tool', { hasText: 'Next puzzle' }).click()
await page.locator('.ipm-tr-tool', { hasText: 'Hint' }).click(); console.log('hinted:', await page.locator('.ipm-tr-hint').allTextContents())
await tap('intro'); await tap('apply h₂'); await show('2.5 after apply h₂')
await tap('apply h₁'); await tap('exact h₃'); await show('end'); await finish()
// 3.5: left is a dead end
await page.locator('.ipm-tr-tool', { hasText: 'Next puzzle' }).click()
await tap('obtain'); await show('3.5 after obtain'); await tap('left'); await show('after left (dead end)')
await tap('right'); await tap('exact h₂'); await tap('left'); await tap('exact h₃'); await show('end'); await finish()
console.log('dots done:', await page.locator('.ipm-trainer .ipm-dot-solved').count(), '| address', page.url())
// German and on a phone; the start page has the button
await page.evaluate(() => localStorage.setItem('ipm-verso:lang', 'de')); await page.setViewportSize({ width: 390, height: 844 })
await page.goto(base + 'Tactic-Trainer/#puzzle-3'); await page.reload(); await tap('left'); await show('DE phone')
if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/trainer-phone.png', fullPage: true })
await page.goto(base); console.log('start page:', await page.locator('.ipm-start-trainer').innerText())
if (process.env.LEANOUT) (await import('node:fs')).writeFileSync(process.env.LEANOUT, scripts.join('\n\n') + '\n')
await browser.close()
