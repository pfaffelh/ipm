// Plays levels of world 10 (induction) on a simulated phone and prints their Lean proofs; with
// LEANOUT=file they are written there, for `lake env lean file`.
// Usage: BASE=http://localhost:8002/ node session10.mjs
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
const state = async t => `${await t.locator('.ipm-status').innerText()} | ☠/⚠: ${await t.locator('.ipm-skull').count()} | pending: ${await t.locator('.ipm-conn.ipm-pending').count()}`
const proofs = []
const done = async (name, t) => {
  const code = await t.locator('.ipm-lean-code').innerText()
  console.log(`${name}: ${await state(t)}\n${code}\n`)
  proofs.push(code)
}
await page.goto(base + 'World-10___-Induction/')
await page.evaluate(() => localStorage.clear()); await page.reload()
await page.evaluate(() => document.querySelectorAll('.ipm-task').forEach(x => { x.classList.remove('ipm-locked'); x.inert = false }))
const task = n => page.locator('.ipm-task').nth(n)

// 1: P 0; ∀ n, P n → P (n + 1) ⊢ ∀ n, P n
let t = task(0)
await add(t, 'ind', 'impE', 'allE')
console.log('Ind block:', (await rule(t, 0).locator('text').allTextContents()).join(' '))
await link(goal(t), out(rule(t, 0)))
console.log('Ind after the goal:', (await rule(t, 0).locator('text').allTextContents()).join(' '))
await link(inp(rule(t, 0), 0), hyp(t, 0))
await link(inp(rule(t, 0), 1), out(rule(t, 1)))
await link(inp(rule(t, 1), 0), out(rule(t, 2)))
await link(inp(rule(t, 2)), hyp(t, 1))
await link(inp(rule(t, 1), 1), local(rule(t, 0)))
await done('S10 T1', t)

// 4: E 0; ∀ n, E n → O (n + 1); ∀ n, O n → E (n + 1) ⊢ ∀ n, E n ∨ O n
t = task(3)
await add(t, 'ind', 'disjE', 'disjI2', 'impE', 'allE', 'disjI1', 'impE', 'allE', 'disjI1')
await link(goal(t), out(rule(t, 0)))
await link(inp(rule(t, 0), 0), out(rule(t, 8))); await link(inp(rule(t, 8)), hyp(t, 0))
await link(inp(rule(t, 0), 1), out(rule(t, 1))); await link(inp(rule(t, 1), 0), local(rule(t, 0)))
await link(inp(rule(t, 1), 1), out(rule(t, 2))); await link(inp(rule(t, 2)), out(rule(t, 3)))
await link(inp(rule(t, 3), 0), out(rule(t, 4))); await link(inp(rule(t, 4)), hyp(t, 1)); await link(inp(rule(t, 3), 1), local(rule(t, 1), 0))
await link(inp(rule(t, 1), 2), out(rule(t, 5))); await link(inp(rule(t, 5)), out(rule(t, 6)))
await link(inp(rule(t, 6), 0), out(rule(t, 7))); await link(inp(rule(t, 7)), hyp(t, 2)); await link(inp(rule(t, 6), 1), local(rule(t, 1), 1))
await done('S10 T4', t)
if (process.env.SHOT) { await t.scrollIntoViewIfNeeded(); await t.screenshot({ path: process.env.SHOT }) }

if (process.env.LEANOUT) (await import('node:fs')).writeFileSync(process.env.LEANOUT, proofs.join('\n\n') + '\n')
await browser.close()
