// Settings (⚙) and tactics earned by solving tasks: at first no tactic; solving ⊢ A → A (2.7)
// unlocks intro; "All" shows every tactic; "Tasks in order" off makes every task playable.
// Usage: BASE=http://localhost:8002/ node settings.mjs   (SHOTDIR=dir for screenshots)
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
const steps = async t => (await t.locator('.ipm-step text').allTextContents()).join(', ') || '(none)'
const task = n => page.locator('.ipm-task').nth(n)
const locked = () => page.locator('.ipm-task.ipm-locked').count()

await page.goto(base + 'World-2___-Implication/')
await page.evaluate(() => localStorage.clear()); await page.reload()
console.log('locked tasks at first:', await locked(), '| note at 2.7:', await task(6).locator('.ipm-unlock').innerText())
await page.evaluate(() => document.querySelectorAll('.ipm-task').forEach(x => { x.classList.remove('ipm-locked'); x.inert = false }))
await tap(goal(task(4))); console.log('2.5, goal A → C, no tactic earned:', await steps(task(4))); await tap(goal(task(4)))
// 2.7 by hand: ⊢ A → A
let t = task(6)
await tap(t.locator('.ipm-menu-item[data-rule="impI"]'))
await tap(goal(t)); await tap(out(rule(t, 0))); await tap(inp(rule(t, 0))); await tap(local(rule(t, 0)))
console.log('2.7:', await t.locator('.ipm-status').innerText(), '| note:', await t.locator('.ipm-unlock').innerText())
await tap(goal(task(4))); console.log('2.5, goal A → C, intro earned:', await steps(task(4))); await tap(goal(task(4)))
await tap(hyp(task(4), 1)); console.log('2.5, assumption B → C (apply not earned):', await steps(task(4))); await tap(hyp(task(4), 1))
// ⚙: all tactics, and tasks not in order
await page.locator('.ipm-settings-button').click()
if (process.env.SHOTDIR) await page.screenshot({ path: process.env.SHOTDIR + '/settings-phone.png' })
await page.locator('.ipm-settings input[value="all"]').check()
await page.locator('.ipm-settings input[name="ipm-in-order"]').uncheck()
await page.waitForTimeout(200)
await tap(hyp(task(4), 1)); console.log('after "All": assumption B → C:', await steps(task(4)))
await page.reload()
console.log('after reload: locked tasks', await locked(), '| tactics setting:', await page.evaluate(() => localStorage.getItem('ipm-verso:tactics')))
await browser.close()
