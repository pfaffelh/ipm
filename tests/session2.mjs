// Plays tasks of session 2 (implication) on a simulated phone, by tapping.
// Usage: BASE=http://localhost:8002/ CHROME=/usr/bin/google-chrome node session2.mjs
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 })
const page = await ctx.newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
await page.goto((process.env.BASE ?? 'http://127.0.0.1:8002/') + 'Session-2___-Implication/')
await page.evaluate(() => localStorage.clear()); await page.reload()
await page.evaluate(() => document.querySelectorAll('.ipm-task').forEach(x => { x.classList.remove('ipm-locked'); x.inert = false }))
const tap = async l => { await l.dispatchEvent('click'); await page.waitForTimeout(120) }
const state = async t => `${await t.locator('.ipm-status').innerText()} | boxes: ${await t.locator('.ipm-box').count()} | ⚠/☠: ${await t.locator('.ipm-skull').count()}`
const addRule = async (t, label) => {
  await tap(t.locator(`.ipm-menu-item[title^="${label}"]`))
}
const rule = (t, n) => t.locator('.ipm-canvas .ipm-rule').nth(n)
const out = (b, n = 0) => b.locator('.ipm-port.ipm-out:not(.ipm-local)').nth(n)
const inp = (b, n = 0) => b.locator('.ipm-port.ipm-in').nth(n)
const local = b => b.locator('.ipm-port.ipm-local')
const goal = t => t.locator('.ipm-conclusion .ipm-port.ipm-in')
const assumption = (t, n) => t.locator('.ipm-assumption').nth(n)

// Task 1: A, A → B ⊢ B
let t = page.locator('.ipm-task').nth(0)
await tap(goal(t)); await addRule(t, '→E'); await tap(out(rule(t, 0)))
await tap(inp(rule(t, 0), 0)); await tap(assumption(t, 1))
await tap(inp(rule(t, 0), 1)); await tap(assumption(t, 0))
console.log('T1:', await state(t))

// Task 4 first wrong: the hypothesis of an →I block straight to the goal escapes
t = page.locator('.ipm-task').nth(3)
await tap(goal(t)); await addRule(t, '→I'); await tap(local(rule(t, 0)))
console.log('T4 hypothesis to the goal:', await state(t))
await tap(t.locator('.ipm-skull').first()); console.log('   says:', (await t.locator('.ipm-bubble text').allTextContents()).join(' '))

// Task 5: A → B, B → C ⊢ A → C
t = page.locator('.ipm-task').nth(4)
await tap(goal(t)); await addRule(t, '→I'); await tap(out(rule(t, 0)))          // →I proves A → C
await tap(inp(rule(t, 0))); await addRule(t, '→E'); await tap(out(rule(t, 1)))  // →E proves C
await tap(inp(rule(t, 1), 0)); await tap(assumption(t, 1))                       // B → C
await tap(inp(rule(t, 1), 1)); await addRule(t, '→E'); await tap(out(rule(t, 2)))  // second →E proves B
await tap(inp(rule(t, 2), 0)); await tap(assumption(t, 0))                       // A → B
await tap(inp(rule(t, 2), 1)); await tap(local(rule(t, 0)))                      // the local hypothesis A
console.log('T5:', await state(t))
await page.evaluate(() => document.querySelectorAll('.ipm-task').forEach(x => { x.classList.remove('ipm-locked'); x.inert = false })); await t.scrollIntoViewIfNeeded(); await t.screenshot({ path: process.env.SHOT ?? 'session2-t5.png' })

// Task 7: ⊢ A → A
t = page.locator('.ipm-task').nth(6)
await tap(goal(t)); await addRule(t, '→I'); await tap(out(rule(t, 0)))
await tap(inp(rule(t, 0))); await tap(local(rule(t, 0)))
console.log('T7:', await state(t))
// The Lean proofs of the solved tasks; with LEANOUT=file they are written there, to check with Lean.
const lean = await page.$$eval('.ipm-task.ipm-solved .ipm-lean-code', xs => xs.map(x => x.textContent))
console.log(lean.join('\n\n'))
if (process.env.LEANOUT) (await import('node:fs')).writeFileSync(process.env.LEANOUT, lean.join('\n\n') + '\n')
await browser.close()
