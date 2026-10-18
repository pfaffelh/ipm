// The tactics added later: exfalso on a goal, intro with the name the Lean proof uses, by_cases and
// by_contra on a goal (world 5), specialize h₁ a and use a with the object named (world 7).
// Usage: BASE=http://localhost:8002/ node tactics2.mjs   (LEANOUT=file for the Lean proofs)
import { chromium } from 'playwright-core'
import { allTasks } from './all-tasks.mjs'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const page = await (await browser.newContext({ viewport: { width: 1300, height: 900 } })).newPage()
await allTasks(page)
page.on('pageerror', e => console.log('PAGEERROR', e.message))
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const tap = async l => { await l.dispatchEvent('click'); await page.waitForTimeout(100) }
const goal = t => t.locator('.ipm-conclusion .ipm-port.ipm-in')
const hyp = (t, n) => t.locator('.ipm-assumption .ipm-port.ipm-out').nth(n)
const rule = (t, n) => t.locator('.ipm-canvas .ipm-rule').nth(n)
const steps = async t => (await t.locator('.ipm-step text').allTextContents()).join(', ') || '(none)'
const step = (t, text) => tap(t.locator('.ipm-step', { hasText: text }))
const proofs = []
const done = async (name, t) => { const code = await t.locator('.ipm-lean-code').innerText(); console.log(`${name}: ${await t.locator('.ipm-status').innerText()}\n${code}`); proofs.push(code) }
const open = async (path, n) => {
  await page.goto(base + path)
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('ipm-verso:mode', 'tactics'); localStorage.setItem('ipm-verso:in-order', 'off') }); await page.reload()
  return page.locator('.ipm-task').nth(n - 1)
}
// 4.1 ⊥ ⊢ A with exfalso
let t = await open('World-4___-Falsity-and-Negation/', 1)
await tap(goal(t)); console.log('4.1 goal A:', await steps(t))
await step(t, 'exfalso'); await tap(t.locator('.ipm-canvas .ipm-rule .ipm-port.ipm-in').first()); await tap(hyp(t, 0))
await done('4.1', t)
// 2.5 A → B, B → C ⊢ A → C: intro with the name of the Lean proof
t = await open('World-2___-Implication/', 5)
await tap(goal(t)); console.log('2.5 goal A → C:', await steps(t))
// 5.5 A → B ⊢ (A → ⊥) ∨ B: by_cases and by_contra on the goal
t = await open('World-5___-Classical-Logic/', 5)
await tap(goal(t)); console.log('5.5 goal:', await steps(t))
await step(t, 'by_cases h₂ : A'); console.log('   after by_cases h₂ : A:', (await t.locator('.ipm-canvas .ipm-rule').allTextContents()).join(' / '))
// 7.1 ∀ x, P x ⊢ P a: specialize h₁ a
t = await open('World-7___-Quantifiers/', 1)
await tap(hyp(t, 0)); console.log('7.1 assumption ∀ x, P x:', await steps(t))
await step(t, 'specialize h₁ a'); await tap(goal(t)); await tap(rule(t, 0).locator('.ipm-port.ipm-out'))
await done('7.1', t)
// 7.3 P a ⊢ ∃ x, P x: use a
t = await open('World-7___-Quantifiers/', 3)
await tap(goal(t)); console.log('7.3 goal ∃ x, P x:', await steps(t))
await step(t, 'use a'); await tap(rule(t, 0).locator('.ipm-port.ipm-in')); await tap(hyp(t, 0))
await done('7.3', t)
// 7.4 ∀ x, P x ⊢ ∃ x, P x: no object named, so `default`
t = await open('World-7___-Quantifiers/', 4)
await tap(goal(t)); console.log('7.4 goal ∃ x, P x:', await steps(t))
if (process.env.LEANOUT) (await import('node:fs')).writeFileSync(process.env.LEANOUT, proofs.join('\n\n') + '\n')
await browser.close()
