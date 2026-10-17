// Plays tasks of sessions 6 and 7 (↔ and ⊤) and checks that a lemma with the statements P, Q is
// shown with ?1, ?2. With LEANOUT=file the Lean proofs are written there, for `lake env lean file`.
// Usage: BASE=http://localhost:8002/ node session67.mjs
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 })
const page = await ctx.newPage()
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
const proofs = []
const done = async (name, t) => {
  const code = await t.locator('.ipm-lean-code').innerText()
  console.log(`${name}: ${await t.locator('.ipm-status').innerText()}\n${code}\n`)
  proofs.push(code)
}
const open = async (path, clear = true) => {
  await page.goto(base + path)
  if (clear) { await page.evaluate(() => localStorage.clear()); await page.reload() }
  await page.evaluate(() => document.querySelectorAll('.ipm-task').forEach(x => { x.classList.remove('ipm-locked'); x.inert = false }))
}

// A lemma about P, Q (as from a solved, marked task of session 6) is shown with ?1, ?2
await open('Session-6___-From-the-Lean-Course/')
await page.evaluate(() => localStorage.setItem('ipm-verso:lemmas', JSON.stringify({ 'ipm-verso:/Session-6___-From-the-Lean-Course/:1': {
  v: 2, label: 'L6.2', session: 6, task: 2, statement: '⊢ P → Q → P', atoms: ['P', 'Q'], assumptions: [], conclusions: ['P → Q → P'],
  leanNames: ['lemma_6_2'], uses: [], theorems: ['theorem lemma_6_2 {P Q : Prop} : P → Q → P :=\n  fun x _ => x'] } })))

await open('Session-7___-Equivalence-and-Truth/', false)
let t = page.locator('.ipm-task').nth(0)
const lemma = t.locator('.ipm-lemma-item').first()
console.log('lemma from session 6:', await lemma.getAttribute('title'), '| picture:', (await lemma.locator('svg').textContent()).replace(/\s+/g, ' '))
// P → Q, Q → P ⊢ P ↔ Q
await add(t, 'iffI')
await link(goal(t), out(rule(t, 0))); await link(inp(rule(t, 0), 0), hyp(t, 0)); await link(inp(rule(t, 0), 1), hyp(t, 1))
await done('S7 T1', t)
// P, P ↔ Q ⊢ Q
t = page.locator('.ipm-task').nth(1)
await add(t, 'iffE1')
await link(goal(t), out(rule(t, 0))); await link(inp(rule(t, 0), 0), hyp(t, 1)); await link(inp(rule(t, 0), 1), hyp(t, 0))
await done('S7 T2', t)
// ⊢ P → ⊤
t = page.locator('.ipm-task').nth(9)
await add(t, 'impI', 'trueI')
await link(goal(t), out(rule(t, 0))); await link(inp(rule(t, 0)), out(rule(t, 1)))
await done('S7 T10', t)
// ⊢ (⊤ → ⊥) ↔ ⊥
t = page.locator('.ipm-task').nth(11)
await add(t, 'iffI', 'impI', 'impE', 'trueI', 'impI', 'impI')
await link(goal(t), out(rule(t, 0)))
await link(inp(rule(t, 0), 0), out(rule(t, 1)))
await link(inp(rule(t, 1)), out(rule(t, 2)))
await link(inp(rule(t, 2), 0), local(rule(t, 1)))
await link(inp(rule(t, 2), 1), out(rule(t, 3)))
await link(inp(rule(t, 0), 1), out(rule(t, 4)))
await link(inp(rule(t, 4)), out(rule(t, 5)))
await link(inp(rule(t, 5)), local(rule(t, 4)))
await done('S7 T12', t)
if (process.env.SHOT) { await t.scrollIntoViewIfNeeded(); await t.screenshot({ path: process.env.SHOT }) }

if (process.env.LEANOUT) (await import('node:fs')).writeFileSync(process.env.LEANOUT, proofs.join('\n\n') + '\n')
await browser.close()
