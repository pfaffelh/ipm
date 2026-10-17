// Plays tasks of sessions 3–5 (disjunction, falsity, classical logic) on a simulated phone and
// prints their Lean proofs; with LEANOUT=file they are written there, for `lake env lean file`.
// Usage: BASE=http://localhost:8002/ node session345.mjs
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
const add = async (t, ...labels) => { for (const l of labels) await tap(t.locator(`.ipm-menu-item[data-rule="${l}"]`)) }
const link = async (i, o) => { await tap(i); await tap(o) }
const state = async t => `${await t.locator('.ipm-status').innerText()} | boxes: ${await t.locator('.ipm-box').count()} | ⚠/☠: ${await t.locator('.ipm-skull').count()}`
const proofs = []
const done = async (name, t) => {
  const code = await t.locator('.ipm-lean-code').innerText()
  console.log(`${name}: ${await state(t)}\n${code}\n`)
  proofs.push(code)
}
const open = async path => {
  await page.goto(base + path)
  await page.evaluate(() => localStorage.clear()); await page.reload()
  await page.evaluate(() => document.querySelectorAll('.ipm-task').forEach(x => { x.classList.remove('ipm-locked'); x.inert = false }))
}

await open('World-3___-Disjunction/')
// A ∨ B ⊢ B ∨ A
let t = page.locator('.ipm-task').nth(4)
await add(t, 'disjE', 'disjI2', 'disjI1')
await link(goal(t), out(rule(t, 0)))
await link(inp(rule(t, 0), 0), hyp(t, 0))
await link(inp(rule(t, 0), 1), out(rule(t, 1))); await link(inp(rule(t, 1)), local(rule(t, 0), 0))
await link(inp(rule(t, 0), 2), out(rule(t, 2))); await link(inp(rule(t, 2)), local(rule(t, 0), 1))
await done('S3 T5', t)
// The hypothesis of the second case used in the first case: ⚠
t = page.locator('.ipm-task').nth(5)
await add(t, 'disjE')
await link(goal(t), out(rule(t, 0)))
await link(inp(rule(t, 0), 1), local(rule(t, 0), 1))
console.log('S3 T6, hypothesis in the wrong case:', await state(t), '\n')

await open('World-4___-Falsity-and-Negation/')
// ⊥ ∨ A ⊢ A
t = page.locator('.ipm-task').nth(3)
await add(t, 'disjE', 'falseE')
await link(goal(t), out(rule(t, 0)))
await link(inp(rule(t, 0), 0), hyp(t, 0))
await link(inp(rule(t, 0), 1), out(rule(t, 1))); await link(inp(rule(t, 1)), local(rule(t, 0), 0))
await link(inp(rule(t, 0), 2), local(rule(t, 0), 1))
await done('S4 T4', t)
// ⊢ (A ∨ (A → ⊥) → ⊥) → ⊥
t = page.locator('.ipm-task').nth(14)
await add(t, 'impI', 'impE', 'disjI2', 'impI', 'impE', 'disjI1')
await link(goal(t), out(rule(t, 0)))
await link(inp(rule(t, 0)), out(rule(t, 1)))
await link(inp(rule(t, 1), 0), local(rule(t, 0)))
await link(inp(rule(t, 1), 1), out(rule(t, 2)))
await link(inp(rule(t, 2)), out(rule(t, 3)))
await link(inp(rule(t, 3)), out(rule(t, 4)))
await link(inp(rule(t, 4), 0), local(rule(t, 0)))
await link(inp(rule(t, 4), 1), out(rule(t, 5)))
await link(inp(rule(t, 5)), local(rule(t, 3)))
await done('S4 T15', t)

await open('World-5___-Classical-Logic/')
// Peirce: ⊢ ((A → B) → A) → A
t = page.locator('.ipm-task').nth(6)
await add(t, 'impI', 'disjE', 'TND', 'impE', 'impI', 'falseE', 'impE')
await link(goal(t), out(rule(t, 0)))
await link(inp(rule(t, 0)), out(rule(t, 1)))
await link(inp(rule(t, 1), 0), out(rule(t, 2)))
await link(inp(rule(t, 1), 1), local(rule(t, 1), 0))
await link(inp(rule(t, 1), 2), out(rule(t, 3)))
await link(inp(rule(t, 3), 0), local(rule(t, 0)))
await link(inp(rule(t, 3), 1), out(rule(t, 4)))
await link(inp(rule(t, 4)), out(rule(t, 5)))
await link(inp(rule(t, 5)), out(rule(t, 6)))
await link(inp(rule(t, 6), 0), local(rule(t, 1), 1))
await link(inp(rule(t, 6), 1), local(rule(t, 4)))
await done('S5 T7', t)
if (process.env.SHOT) { await t.scrollIntoViewIfNeeded(); await t.screenshot({ path: process.env.SHOT }) }

if (process.env.LEANOUT) (await import('node:fs')).writeFileSync(process.env.LEANOUT, proofs.join('\n\n') + '\n')
await browser.close()
