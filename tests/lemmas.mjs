// Solved tasks become lemmas: solves a task, uses it twice as a block in the next task, reloads,
// and prints the Lean proof (with LEANOUT=file it is written there, for `lake env lean file`).
// Usage: BASE=http://localhost:8002/ node lemmas.mjs
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 })
const page = await ctx.newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const tap = async l => { await l.dispatchEvent('click'); await page.waitForTimeout(120) }
const rule = (t, n) => t.locator('.ipm-canvas .ipm-rule').nth(n)
const out = (b, n = 0) => b.locator('.ipm-port.ipm-out:not(.ipm-local)').nth(n)
const inp = (b, n = 0) => b.locator('.ipm-port.ipm-in').nth(n)
const goal = t => t.locator('.ipm-conclusion .ipm-port.ipm-in')
const hyp = (t, n) => t.locator('.ipm-assumption .ipm-port.ipm-out').nth(n)
const link = async (i, o) => { await tap(i); await tap(o) }
const lemmaHead = t => t.locator('.ipm-lemmas-head')

// Session 1, task 4 (A, B ⊢ A ∧ B), so that a lemma from another page exists
await page.goto(base + 'Session-1___-Conjunction/')
await page.evaluate(() => localStorage.clear()); await page.reload()
await page.evaluate(() => document.querySelectorAll('.ipm-task').forEach(x => { x.classList.remove('ipm-locked'); x.inert = false }))
let t = page.locator('.ipm-task').nth(3)
await tap(t.locator(`.ipm-menu-item[data-rule="conjI"]`))
await link(goal(t), out(rule(t, 0))); await link(inp(rule(t, 0), 0), hyp(t, 0)); await link(inp(rule(t, 0), 1), hyp(t, 1))
console.log('S1 T4:', await t.locator('.ipm-status').innerText())

await page.goto(base + 'Session-2___-Implication/')
t = page.locator('.ipm-task').nth(1)
console.log('S2 T2 before solving T1:', await lemmaHead(t).innerText(), '| shown:', await lemmaHead(t).isVisible())
// Task 1: A, A → B ⊢ B
const t1 = page.locator('.ipm-task').nth(0)
await tap(t1.locator(`.ipm-menu-item[data-rule="impE"]`))
await link(goal(t1), out(rule(t1, 0))); await link(inp(rule(t1, 0), 0), hyp(t1, 1)); await link(inp(rule(t1, 0), 1), hyp(t1, 0))
console.log('S2 T1:', await t1.locator('.ipm-status').innerText())
await page.waitForTimeout(1500)
console.log('S2 T2 after:', await lemmaHead(t).innerText())
await tap(lemmaHead(t))
console.log('  lemmas:', await t.locator('.ipm-lemma-item').evaluateAll(xs => xs.map(x => x.title)))
// Task 2: A, A → B, B → C ⊢ C with the lemma twice
const L = t.locator('.ipm-lemma-item[data-rule$=":0"]').first()
await tap(L); await tap(L)
await link(goal(t), out(rule(t, 0)))
await link(inp(rule(t, 0), 0), out(rule(t, 1))); await link(inp(rule(t, 0), 1), hyp(t, 2))
await link(inp(rule(t, 1), 0), hyp(t, 0)); await link(inp(rule(t, 1), 1), hyp(t, 1))
console.log('S2 T2:', await t.locator('.ipm-status').innerText())
await page.reload()
t = page.locator('.ipm-task').nth(1)
console.log('S2 T2 after reload:', await t.locator('.ipm-status').innerText(), '| lemma blocks:', await t.locator('.ipm-canvas .ipm-rule').count())
const code = await t.locator('.ipm-lean-code').innerText()
console.log(code)
if (process.env.SHOT) { await t.scrollIntoViewIfNeeded(); await t.screenshot({ path: process.env.SHOT }) }
if (process.env.LEANOUT) (await import('node:fs')).writeFileSync(process.env.LEANOUT, code + '\n')
await browser.close()
