// Solves some of the harder tasks and prints the Lean proofs shown below the boards.
// With LEANOUT=file they are written there; `lake env lean file` then checks them.
// Usage: BASE=http://localhost:8002/ LEANOUT=proofs.lean node lean-proofs.mjs
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
const local = b => b.locator('.ipm-port.ipm-local')
const goal = t => t.locator('.ipm-conclusion .ipm-port.ipm-in')
const hyp = (t, n) => t.locator('.ipm-assumption .ipm-port.ipm-out').nth(n)
const add = async (t, label) => tap(t.locator(`.ipm-menu-item[title^="${label}"]`))
const link = async (i, o) => { await tap(i); await tap(o) }
const proofs = []
const done = async (name, t) => {
  const status = await t.locator('.ipm-status').innerText()
  const code = await t.locator('.ipm-lean-code').innerText()
  console.log(`${name}: ${status}\n${code}\n`)
  proofs.push(code)
}
const open = async path => {
  await page.goto(base + path)
  await page.evaluate(() => localStorage.clear()); await page.reload()
  await page.evaluate(() => document.querySelectorAll('.ipm-task').forEach(x => { x.classList.remove('ipm-locked'); x.inert = false }))
}

await open('Session-1___-Conjunction/')
// (A ∧ B) ∧ C ⊢ A ∧ C, using one ∧E block twice
let t = page.locator('.ipm-task').nth(10)
await add(t, '∧I'); await add(t, '∧E'); await add(t, '∧E')
await link(goal(t), out(rule(t, 0)))
await link(inp(rule(t, 0), 0), out(rule(t, 1), 0))
await link(inp(rule(t, 1)), out(rule(t, 2), 0))
await link(inp(rule(t, 2)), hyp(t, 0))
await link(inp(rule(t, 0), 1), out(rule(t, 2), 1))
await done('S1 T11', t)

await open('Session-2___-Implication/')
// B ⊢ A → B: the hypothesis is not used
t = page.locator('.ipm-task').nth(9)
await add(t, '→I')
await link(goal(t), out(rule(t, 0))); await link(inp(rule(t, 0)), hyp(t, 0))
await done('S2 T10', t)

// A ∧ B → C ⊢ A → B → C: two →I blocks, one inside the other
t = page.locator('.ipm-task').nth(10)
await add(t, '→I'); await add(t, '→I'); await add(t, '→E'); await add(t, '∧I')
await link(goal(t), out(rule(t, 0)))
await link(inp(rule(t, 0)), out(rule(t, 1)))
await link(inp(rule(t, 1)), out(rule(t, 2)))
await link(inp(rule(t, 2), 0), hyp(t, 0))
await link(inp(rule(t, 2), 1), out(rule(t, 3)))
await link(inp(rule(t, 3), 0), local(rule(t, 0)))
await link(inp(rule(t, 3), 1), local(rule(t, 1)))
await done('S2 T11', t)

// (A → B) ∧ (A → C) ⊢ A → B ∧ C
t = page.locator('.ipm-task').nth(12)
await add(t, '→I'); await add(t, '∧I'); await add(t, '→E'); await add(t, '∧E'); await add(t, '→E')
await link(goal(t), out(rule(t, 0)))
await link(inp(rule(t, 0)), out(rule(t, 1)))
await link(inp(rule(t, 1), 0), out(rule(t, 2)))
await link(inp(rule(t, 2), 0), out(rule(t, 3), 0))
await link(inp(rule(t, 3)), hyp(t, 0))
await link(inp(rule(t, 2), 1), local(rule(t, 0)))
await link(inp(rule(t, 1), 1), out(rule(t, 4)))
await link(inp(rule(t, 4), 0), out(rule(t, 3), 1))
await link(inp(rule(t, 4), 1), local(rule(t, 0)))
await done('S2 T13', t)

// A → A → B, (A → B) → A ⊢ B: the →I block is used twice
t = page.locator('.ipm-task').nth(13)
await add(t, '→I'); await add(t, '→E'); await add(t, '→E'); await add(t, '→E'); await add(t, '→E')
await link(inp(rule(t, 0)), out(rule(t, 1)))
await link(inp(rule(t, 1), 0), out(rule(t, 2)))
await link(inp(rule(t, 2), 0), hyp(t, 0))
await link(inp(rule(t, 2), 1), local(rule(t, 0)))
await link(inp(rule(t, 1), 1), local(rule(t, 0)))
await link(goal(t), out(rule(t, 3)))
await link(inp(rule(t, 3), 0), out(rule(t, 0)))
await link(inp(rule(t, 3), 1), out(rule(t, 4)))
await link(inp(rule(t, 4), 0), hyp(t, 1))
await link(inp(rule(t, 4), 1), out(rule(t, 0)))
await done('S2 T14', t)

if (process.env.LEANOUT) (await import('node:fs')).writeFileSync(process.env.LEANOUT, proofs.join('\n\n') + '\n')
await browser.close()
