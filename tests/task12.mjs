// Session 1, task 12: (A ∧ B) ∧ C ⊢ A ∧ B ∧ C. Builds the proof from the screenshot and checks that
// connecting B to an input B ∧ C is refused (☠).
import { chromium } from 'playwright-core'
import { allTasks } from './all-tasks.mjs'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const page = await (await browser.newContext({ viewport: { width: 1300, height: 1000 } })).newPage()
await allTasks(page)
page.on('pageerror', e => console.log('PAGEERROR', e.message))
await page.goto((process.env.BASE ?? 'http://127.0.0.1:8002/') + 'World-1___-Conjunction/')
await page.evaluate(() => localStorage.clear()); await page.reload()
await page.evaluate(() => document.querySelectorAll('.ipm-task').forEach(x => { x.classList.remove('ipm-locked'); x.inert = false }))
const t = page.locator('.ipm-task').nth(11)
const tap = async l => { await l.dispatchEvent('click'); await page.waitForTimeout(100) }
const rule = n => t.locator('.ipm-canvas .ipm-rule').nth(n)
const out = (b, n) => b.locator('.ipm-port.ipm-out').nth(n)
const inp = (b, n) => b.locator('.ipm-port.ipm-in').nth(n)
const add = async name => tap(t.locator(`.ipm-menu-item[title^="${name}"]`))
await add('∧E'); await add('∧E'); await add('∧I'); await add('∧I')   // blocks 0,1: ∧E; 2,3: ∧I
await tap(out(t.locator('.ipm-assumption'), 0)); await tap(inp(rule(0), 0))   // (A∧B)∧C → ∧E₀
await tap(out(rule(0), 0)); await tap(inp(rule(1), 0))                          // A∧B → ∧E₁
await tap(out(rule(1), 0)); await tap(inp(rule(2), 0))                          // A → ∧I₂ (first)
await tap(out(rule(1), 1)); await tap(inp(rule(3), 0))                          // B → ∧I₃ (first)
await tap(out(rule(0), 1)); await tap(inp(rule(3), 1))                          // C → ∧I₃ (second)
await tap(out(rule(3), 0)); await tap(inp(rule(2), 1))                          // B∧C → ∧I₂ (second)
await tap(out(rule(2), 0)); await tap(t.locator('.ipm-conclusion .ipm-port.ipm-in'))
console.log('proof from the screenshot:', await t.locator('.ipm-status').innerText(), '| ☠:', await t.locator('.ipm-skull').count())
if (process.env.SHOT) {
  // arrange the blocks roughly as in the screenshot and take a picture
  const drag = async (l, dx, dy) => { const b = await l.boundingBox(); await page.mouse.move(b.x + b.width / 2, b.y + 10); await page.mouse.down(); await page.mouse.move(b.x + b.width / 2 + dx, b.y + 10 + dy, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(100) }
  await t.locator('.ipm-board').scrollIntoViewIfNeeded()
  await drag(rule(3).locator('rect'), 150, -110)
  await t.locator('.ipm-canvas').screenshot({ path: process.env.SHOT })
}
// now connect B (∧E₁, second output) to the input B ∧ C of ∧I₂
await tap(out(rule(1), 1)); await tap(inp(rule(2), 1))
console.log('B into B ∧ C:', await t.locator('.ipm-status').innerText(), '| ☠:', await t.locator('.ipm-skull').count())
await browser.close()
