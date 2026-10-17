// Lemmas: only tasks marked (lemma := true), and only in tasks after them. Solves an unmarked task
// (never offered), task 2.5 (offered in 2.6 but not in 2.3), then uses lemma 2.5 for task 4.13,
// reloads, and prints the Lean proof (with LEANOUT=file it is written there).
// Usage: BASE=http://localhost:8002/ node lemmas.mjs
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
const local = b => b.locator('.ipm-port.ipm-local')
const goal = t => t.locator('.ipm-conclusion .ipm-port.ipm-in')
const hyp = (t, n) => t.locator('.ipm-assumption .ipm-port.ipm-out').nth(n)
const add = async (t, r) => tap(t.locator(`.ipm-menu-item[data-rule="${r}"]`))
const link = async (i, o) => { await tap(i); await tap(o) }
const lemmas = async t => JSON.stringify(await t.locator('.ipm-lemma-item').evaluateAll(xs => xs.map(x => x.title)))
const unlock = () => page.evaluate(() => document.querySelectorAll('.ipm-task').forEach(x => { x.classList.remove('ipm-locked'); x.inert = false }))
const task = n => page.locator('.ipm-task').nth(n)

// Task 1.4 (A, B ⊢ A ∧ B), not marked as a lemma
await page.goto(base + 'Session-1___-Conjunction/')
await page.evaluate(() => localStorage.clear()); await page.reload(); await unlock()
let t = task(3)
await add(t, 'conjI'); await link(goal(t), out(rule(t, 0))); await link(inp(rule(t, 0), 0), hyp(t, 0)); await link(inp(rule(t, 0), 1), hyp(t, 1))
console.log('1.4:', await t.locator('.ipm-status').innerText())

// Task 2.5 (A → B, B → C ⊢ A → C), a lemma
await page.goto(base + 'Session-2___-Implication/'); await unlock()
t = task(4)
await add(t, 'impI'); await add(t, 'impE'); await add(t, 'impE')
await link(goal(t), out(rule(t, 0))); await link(inp(rule(t, 0)), out(rule(t, 1)))
await link(inp(rule(t, 1), 0), hyp(t, 1)); await link(inp(rule(t, 1), 1), out(rule(t, 2)))
await link(inp(rule(t, 2), 0), hyp(t, 0)); await link(inp(rule(t, 2), 1), local(rule(t, 0)))
console.log('2.5:', await t.locator('.ipm-status').innerText())
await page.waitForTimeout(300)
console.log('lemmas in 2.3:', await lemmas(task(2)), '| in 2.6:', await lemmas(task(5)))

// Task 4.13 (A → ⊥, B → A ⊢ B → ⊥) with lemma 2.5
await page.goto(base + 'Session-4___-Falsity-and-Negation/'); await unlock()
t = task(12)
console.log('lemmas in 4.13:', await lemmas(t))
await tap(t.locator('.ipm-lemma-item').first())
await link(goal(t), out(rule(t, 0))); await link(inp(rule(t, 0), 0), hyp(t, 1)); await link(inp(rule(t, 0), 1), hyp(t, 0))
console.log('4.13 with lemma 2.5:', await t.locator('.ipm-status').innerText())
await page.reload()
t = task(12)
console.log('after reload:', await t.locator('.ipm-status').innerText(), '| lemma blocks:', await t.locator('.ipm-canvas .ipm-rule').count())
const code = await t.locator('.ipm-lean-code').innerText()
console.log(code)
if (process.env.LEANOUT) (await import('node:fs')).writeFileSync(process.env.LEANOUT, code + '\n')
await browser.close()
