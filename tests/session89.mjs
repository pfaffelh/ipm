// Plays levels of world 8 (quantifiers) on a simulated phone and prints their Lean proofs; with
// LEANOUT=file they are written there, for `lake env lean file`.
// Usage: BASE=http://localhost:8002/ node session89.mjs
import { chromium } from 'playwright-core'
import { allTasks } from './all-tasks.mjs'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 })
const page = await ctx.newPage()
await allTasks(page)
page.on('pageerror', e => console.log('PAGEERROR', e.message))
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const tap = async l => { await l.dispatchEvent('click'); await page.waitForTimeout(100) }
const rule = (t, n) => t.locator('.ipm-canvas .ipm-rule').nth(n)
const out = (b, n = 0) => b.locator('.ipm-port.ipm-out:not(.ipm-local)').nth(n)
const inp = (b, n = 0) => b.locator('.ipm-port.ipm-in').nth(n)
const local = (b, n = 0) => b.locator('.ipm-port.ipm-local').nth(n)
const goal = t => t.locator('.ipm-conclusion .ipm-port.ipm-in')
const hyp = (t, n) => t.locator('.ipm-assumption .ipm-port.ipm-out').nth(n)
const add = async (t, ...rules) => { for (const r of rules) await tap(t.locator(`.ipm-menu-item[data-rule="${r}"]`)) }
const link = async (i, o) => { await tap(i); await tap(o) }
const labels = async b => (await b.locator('text').allTextContents()).join(' ')
const state = async t => `${await t.locator('.ipm-status').innerText()} | ☠/⚠: ${await t.locator('.ipm-skull').count()} | pending: ${await t.locator('.ipm-conn.ipm-pending').count()}`
const proofs = []
const done = async (name, t) => {
  const code = await t.locator('.ipm-lean-code').innerText()
  console.log(`${name}: ${await state(t)}\n${code}\n`)
  proofs.push(code)
}
await page.goto(base + 'World-8___-Quantifiers/')
await page.evaluate(() => localStorage.clear()); await page.reload()
await page.evaluate(() => document.querySelectorAll('.ipm-task').forEach(x => { x.classList.remove('ipm-locked'); x.inert = false }))
const task = n => page.locator('.ipm-task').nth(n)

// 1: ∀ x, P x ⊢ P a — the goal first (undecided until the ∀ statement is connected)
let t = task(0)
await add(t, 'allE')
console.log('∀E block:', await labels(rule(t, 0)))
await link(goal(t), out(rule(t, 0)))
console.log('goal first:', await state(t))
await link(inp(rule(t, 0)), hyp(t, 0))
await done('S8 T1', t)

// 3: P a ⊢ ∃ x, P x
t = task(2)
await add(t, 'exI')
await link(goal(t), out(rule(t, 0))); await link(inp(rule(t, 0)), hyp(t, 0))
await done('S8 T3', t)

// 4: ∀ x, P x ⊢ ∃ x, P x — the object is never named: default
t = task(3)
await add(t, 'exI', 'allE')
await link(goal(t), out(rule(t, 0))); await link(inp(rule(t, 0)), out(rule(t, 1))); await link(inp(rule(t, 1)), hyp(t, 0))
await done('S8 T4', t)

// 6: ∃ x, A ⊢ A
t = task(5)
await add(t, 'exE')
console.log('∃E block:', await labels(rule(t, 0)))
await link(goal(t), out(rule(t, 0))); await link(inp(rule(t, 0), 0), hyp(t, 0)); await link(inp(rule(t, 0), 1), local(rule(t, 0)))
await done('S8 T6', t)

// 7: A ∧ (∀ x, P x) ⊢ ∀ x, A ∧ P x
t = task(6)
await add(t, 'allI', 'conjI', 'conjE', 'allE')
console.log('∀I block:', await labels(rule(t, 0)))
await link(goal(t), out(rule(t, 0)))
await link(inp(rule(t, 0)), out(rule(t, 1)))
await link(inp(rule(t, 1), 0), out(rule(t, 2), 0))
await link(inp(rule(t, 2)), hyp(t, 0))
await link(inp(rule(t, 1), 1), out(rule(t, 3)))
await link(inp(rule(t, 3)), out(rule(t, 2), 1))
await done('S8 T7', t)

// 13: ∃ x, ∃ y, P x y ⊢ ∃ y, ∃ x, P x y — two eigenvariables
t = task(12)
await add(t, 'exE', 'exE', 'exI', 'exI')
await link(goal(t), out(rule(t, 0)))
await link(inp(rule(t, 0), 0), hyp(t, 0))
await link(inp(rule(t, 0), 1), out(rule(t, 1)))
await link(inp(rule(t, 1), 0), local(rule(t, 0)))
await link(inp(rule(t, 1), 1), out(rule(t, 2)))
await link(inp(rule(t, 2)), out(rule(t, 3)))
await link(inp(rule(t, 3)), local(rule(t, 1)))
await done('S8 T13', t)
if (process.env.SHOT) { await t.scrollIntoViewIfNeeded(); await t.screenshot({ path: process.env.SHOT }) }

// 14: ∃ x, ∀ y, P x y ⊢ ∀ y, ∃ x, P x y
t = task(13)
await add(t, 'allI', 'exE', 'exI', 'allE')
await link(goal(t), out(rule(t, 0)))
await link(inp(rule(t, 0)), out(rule(t, 1)))
await link(inp(rule(t, 1), 0), hyp(t, 0))
await link(inp(rule(t, 1), 1), out(rule(t, 2)))
await link(inp(rule(t, 2)), out(rule(t, 3)))
await link(inp(rule(t, 3)), local(rule(t, 1)))
await done('S8 T14', t)

if (process.env.LEANOUT) (await import('node:fs')).writeFileSync(process.env.LEANOUT, proofs.join('\n\n') + '\n')
await browser.close()
