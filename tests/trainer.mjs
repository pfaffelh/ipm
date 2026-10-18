// The tactic trainer: levels played with tactics only. No blocks to add, no lines to draw; a tapped
// goal shows what one has there. Each lesson is solved with its tactic buttons.
// Usage: BASE=http://localhost:8002/ node trainer.mjs   (LEANOUT=file for the Lean proofs; SHOT=dir)
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const page = await (await browser.newContext({ viewport: { width: 1300, height: 900 } })).newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
await page.goto(base + 'Tactic-Trainer/')
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('ipm-verso:in-order', 'off') }); await page.reload()
await page.waitForTimeout(300)
await page.locator('.ipm-tip-overlay button').click().catch(() => {})
const t = page.locator('.ipm-task.ipm-current')
const tap = async l => { await l.dispatchEvent('click'); await page.waitForTimeout(120) }
console.log('levels:', await page.locator('.ipm-task').count(), '| palette shown:', await t.locator('.ipm-palette').count(), '| ＋ shown:', await t.locator('.ipm-add').count())
// level 1: tapping a dot and then the goal draws no line; the goal offers exact h₂
await tap(t.locator('.ipm-assumption .ipm-port.ipm-out').nth(1)); await tap(t.locator('.ipm-conclusion .ipm-port.ipm-in'))
console.log('lines after dot + goal:', await t.locator('.ipm-canvas .ipm-wire, .ipm-canvas path.ipm-line').count(), '| context:', (await t.locator('.ipm-context span').allTextContents()).join('  '), '| steps:', (await t.locator('.ipm-step text').allTextContents()).join(', '))
// every lesson, solved with the tactic buttons by the search of tactics-only.mjs
const proofs = []
const n = await page.locator('.ipm-task').count()
for (let i = 0; i < n; i++) {
  const r = await page.evaluate(i => {
    const t = window.ipmTasks[i], render = t.render
    t.render = function () { this.analysis = this.proof.analyze() }
    t.closeSheet = () => {}
    t.render()
    const moves = () => {
      const out = [], goal = t.analysis.openInputs[0]
      if (!goal) return out
      t.selected = { kind: 'in', ...goal }
      for (const s of t.steps()) out.push({ sel: { kind: 'in', ...goal }, s })
      for (const b of t.proof.blocks) b.outputs.forEach((_, j) => {
        if (b.kind === 'conclusion' || t.proof.connections.some(c => c.from.block === b.id && c.from.port === j)) return
        t.selected = { kind: 'out', block: b.id, port: j }
        for (const s of t.steps()) out.push({ sel: { kind: 'out', block: b.id, port: j }, s })
      })
      t.selected = null
      return out
    }
    const search = d => {
      if (t.analysis.qed) return []
      if (!d) return null
      for (const m of moves()) {
        const snap = t.proof.snapshot()
        t.selected = m.sel
        const s = t.steps().find(x => x.text === m.s.text)
        if (!s) continue
        s.act(); t.render()
        const r = search(d - 1)
        if (r) return [m.s.text, ...r]
        t.proof.restore(snap); t.render()
      }
      return null
    }
    let r = null
    for (let d = 1; d <= 8 && !r; d++) r = search(d)
    t.render = render; t.render()
    return { steps: r, lean: t.leanCode.textContent, qed: t.analysis.qed }
  }, i)
  console.log(`lesson ${i + 1}:`, r.qed ? r.steps.join(' ; ') : 'NOT SOLVED')
  proofs.push(r.lean)
}
if (process.env.LEANOUT) (await import('node:fs')).writeFileSync(process.env.LEANOUT, proofs.join('\n\n') + '\n')
if (process.env.SHOT) { await page.goto(base + 'Tactic-Trainer/#level-8'); await page.waitForTimeout(400); await page.screenshot({ path: process.env.SHOT + '/trainer-lesson.png' }) }
await browser.close()
