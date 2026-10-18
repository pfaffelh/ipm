// In the world Rewriting (Lean tactic mode): every goal X ↔ X is offered rfl. Plays all sequences of
// tactic buttons up to a depth on each level and reports the goals X ↔ X without rfl (after rw the
// sides of a goal are metavariables, which must be resolved before they are compared).
// Usage: BASE=http://localhost:8002/ node rfl.mjs [depth] [level …]   (default: depth 3, all levels)
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const page = await (await browser.newContext({ viewport: { width: 1300, height: 900 } })).newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
const depth = Number(process.argv[2] ?? 3)
await page.goto(base + 'World-7___-Rewriting/')
await page.evaluate(() => localStorage.setItem('ipm-verso:in-order', 'off')); await page.reload()
const n = await page.locator('.ipm-task').count()
const levels = process.argv.slice(3).map(Number)
let bad = 0
for (let k = 1; k <= n; k++) {
  if (levels.length && !levels.includes(k)) continue
  const r = await page.evaluate(([i, depth]) => {
    const t = window.ipmTasks[i], render = t.render
    t.tacticsOnly = true
    t.render = function () { this.analysis = this.proof.analyze() }
    t.closeSheet = () => {}
    t.proof = new t.proof.constructor(t.assumptions, t.conclusions); t.render()
    const found = new Set()
    let tries = 0
    const strip = x => x.split(' · ').pop()
    const walk = (path, d) => {
      if (++tries > 3000) return
      for (const o of t.analysis.openInputs) {
        const sel = { kind: 'in', ...o }
        render.call(t); t.selected = sel; render.call(t)
        const goal = (t.context.querySelector('.ipm-ctx-goal')?.textContent ?? '').replace(/^⊢ /, '')
        const steps = t.steps(), [a, b] = goal.split(' ↔ ')
        if (b !== undefined && a === b && !steps.some(s => strip(s.text) === 'rfl')) found.add(`${path.join(' ; ') || '(start)'} ⇒ ⊢ ${goal}`)
        if (d === 0) continue
        for (const s of steps) {
          const snap = t.proof.snapshot()
          t.selected = sel; s.act(); t.render()
          walk([...path, strip(s.text)], d - 1)
          t.proof.restore(snap); t.render()
        }
      }
    }
    walk([], depth)
    t.render = render; t.selected = null; t.render()
    return [...found]
  }, [k - 1, depth])
  bad += r.length
  console.log(`7.${k}: ${r.length ? `${r.length} goals X ↔ X without rfl, e.g. ${r[0]}` : 'ok'}`)
}
console.log(bad ? `FAIL: ${bad} goals X ↔ X without rfl` : 'every goal X ↔ X is offered rfl')
await browser.close()
