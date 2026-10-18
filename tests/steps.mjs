// Tactics: exact and apply from a goal; in the Lean tactic mode, steps appear beside a selected port, as in Lean: tapping the goal A → C offers "→I · intro", which puts
// the block in and connects it; an assumption B → C offers "→E · apply"; and so on.
// Usage: BASE=http://localhost:8002/ node steps.mjs   (LEANOUT=file for the Lean proof, SHOT=file)
import { chromium } from 'playwright-core'
import { allTasks } from './all-tasks.mjs'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 })
const page = await ctx.newPage()
await allTasks(page)
page.on('pageerror', e => console.log('PAGEERROR', e.message))
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const tap = async l => { await l.dispatchEvent('click'); await page.waitForTimeout(120) }
const rule = (t, n) => t.locator('.ipm-canvas .ipm-rule').nth(n)
const out = (b, n = 0) => b.locator('.ipm-port.ipm-out:not(.ipm-local)').nth(n)
const inp = (b, n = 0) => b.locator('.ipm-port.ipm-in').nth(n)
const local = (b, n = 0) => b.locator('.ipm-port.ipm-local').nth(n)
const goal = t => t.locator('.ipm-conclusion .ipm-port.ipm-in')
const hyp = (t, n) => t.locator('.ipm-assumption .ipm-port.ipm-out').nth(n)
const steps = async t => (await t.locator('.ipm-step text').allTextContents()).join(', ') || '(none)'
const open = async (path, tactics = true) => {
  await page.goto(base + path)
  await page.evaluate(on => { localStorage.clear(); if (on) localStorage.setItem('ipm-verso:mode', 'tactics') }, tactics); await page.reload()
  await page.evaluate(() => document.querySelectorAll('.ipm-task').forEach(x => { x.classList.remove('ipm-locked'); x.inert = false }))
}

await open('World-2___-Implication/', false)
// A → B, B → C ⊢ A → C, with steps
let t = page.locator('.ipm-task').nth(4)
await tap(goal(t))
console.log('blocks mode, goal A → C:', await steps(t))
// the tactic mode (the switch above a level; kept in the browser)
await page.evaluate(() => localStorage.setItem('ipm-verso:mode', 'tactics'))
await page.reload()
await page.evaluate(() => document.querySelectorAll('.ipm-task').forEach(x => { x.classList.remove('ipm-locked'); x.inert = false }))
t = page.locator('.ipm-task').nth(4)
await tap(goal(t))
console.log('after reload:', await steps(t))
await tap(t.locator('.ipm-step').first())
console.log('after intro: blocks', await t.locator('.ipm-canvas .ipm-rule').count(), '| lines', await t.locator('.ipm-conn').count(), '|', await t.locator('.ipm-status').innerText())
await tap(local(rule(t, 0)))
console.log('local hypothesis A:', await steps(t))
await tap(local(rule(t, 0)))  // deselect
await tap(hyp(t, 1))
console.log('assumption B → C:', await steps(t))
await tap(t.locator('.ipm-step').first())
console.log('after apply: blocks', await t.locator('.ipm-canvas .ipm-rule').count(), '| lines', await t.locator('.ipm-conn').count())
await tap(hyp(t, 0))
await tap(t.locator('.ipm-step').first())  // apply A → B
// connect: →E(B → C) gives C into →I; →E(A → B) gives B into →E(B → C); local A into →E(A → B)
await tap(inp(rule(t, 0))); await tap(out(rule(t, 1)))
await tap(inp(rule(t, 1), 1)); await tap(out(rule(t, 2)))
await tap(inp(rule(t, 2), 1)); await tap(local(rule(t, 0)))
console.log('S2 T5 with steps:', await t.locator('.ipm-status').innerText())
const code = await t.locator('.ipm-lean-code').innerText()
console.log(code)
if (process.env.SHOT) { await t.scrollIntoViewIfNeeded(); await t.screenshot({ path: process.env.SHOT }) }

await open('World-3___-Disjunction/')
t = page.locator('.ipm-task').nth(0)
await tap(goal(t)); console.log('goal A ∨ B:', await steps(t))
t = page.locator('.ipm-task').nth(4)
await tap(hyp(t, 0)); console.log('assumption A ∨ B:', await steps(t))
await open('World-6___-Equivalence-and-Truth/')
t = page.locator('.ipm-task').nth(6)
await tap(goal(t)); console.log('goal (P ↔ Q) ↔ …:', await steps(t))
await tap(t.locator('.ipm-step').first())
await tap(inp(rule(t, 0), 0)); console.log('its first input P ↔ Q → …:', await steps(t))
t = page.locator('.ipm-task').nth(9)
await tap(goal(t)); await tap(t.locator('.ipm-step').first())
await tap(inp(rule(t, 0))); console.log('goal ⊤ inside P → ⊤:', await steps(t))
await tap(t.locator('.ipm-step').first()); console.log('P → ⊤ with steps only:', await t.locator('.ipm-status').innerText())
// exact and apply from the goal: A, A → B ⊢ B in two taps
await open('World-2___-Implication/')
t = page.locator('.ipm-task').nth(0)
await tap(goal(t)); console.log('goal B:', await steps(t))
await tap(t.locator('.ipm-step', { hasText: 'apply' }))
await tap(inp(rule(t, 0), 1)); console.log('then the open A:', await steps(t))
await tap(t.locator('.ipm-step', { hasText: 'exact' }))
console.log('A, A → B ⊢ B with apply and exact:', await t.locator('.ipm-status').innerText())
const code2 = await t.locator('.ipm-lean-code').innerText()
console.log(code2)
if (process.env.LEANOUT) (await import('node:fs')).writeFileSync(process.env.LEANOUT, code + '\n\n' + code2 + '\n')
await browser.close()
