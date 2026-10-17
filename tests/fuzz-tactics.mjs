// A fuzzer for the tactic buttons: in every level (played with tactics only), taps random buttons at
// random goals and at random things one has. A button must never draw a line that does not fit (☠),
// let a hypothesis escape (⚠), or give an eigenvariable ⚠; every proof the game accepts goes to Lean.
// Usage: BASE=http://localhost:8002/ node fuzz-tactics.mjs [seconds per level] → fuzz-out/tactics.lean, tactics.json
import fs from 'node:fs'
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const seconds = Number(process.argv[2] ?? 3)
const page = await (await browser.newContext({ viewport: { width: 1300, height: 900 } })).newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
const pages = ['World-1___-Conjunction/', 'World-2___-Implication/', 'World-3___-Disjunction/', 'World-4___-Falsity-and-Negation/',
  'World-5___-Classical-Logic/', 'World-6___-Equivalence-and-Truth/', 'World-7___-Quantifiers/', 'World-8___-Two-Puzzles/',
  'World-9___-Induction/', 'Tactic-Trainer/']
const proofs = new Map(), bugs = []
for (const w of pages) {
  await page.goto(base + w)
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('ipm-verso:in-order', 'off') }); await page.reload()
  const n = await page.evaluate(() => window.ipmTasks.length)
  for (let i = 0; i < n; i++) {
    const r = await page.evaluate(([i, seconds]) => {
      const t = window.ipmTasks[i], render = t.render, found = [], bad = []
      t.tacticsOnly = true
      t.render = function () { this.analysis = this.proof.analyze() }
      t.closeSheet = () => {}
      const start = t.proof.snapshot()
      const end = Date.now() + seconds * 1000
      const pick = xs => xs[Math.floor(Math.random() * xs.length)]
      while (Date.now() < end) {
        t.proof.restore(start); t.render()
        for (let step = 0; step < 25 && !t.analysis.qed; step++) {
          const open = t.analysis.openInputs
          const outs = t.proof.blocks.flatMap(b => b.kind === 'conclusion' ? [] : b.outputs.map((_, j) => ({ kind: 'out', block: b.id, port: j })))
          const sel = Math.random() < 0.6 && open.length ? { kind: 'in', ...pick(open) } : pick(outs)
          if (!sel) break
          t.selected = sel
          const steps = t.steps()
          if (!steps.length) continue
          const s = pick(steps)
          const before = new Set(t.proof.connections.map(c => c.id))
          try { s.act() } catch (e) { bad.push(`exception in ${s.text}: ${e}`); break }
          t.render()
          const a = t.analysis
          const wrong = t.proof.connections.filter(c => !before.has(c.id) && !['ok', 'pending'].includes(a.status[c.id]))
          if (wrong.length || Object.keys(a.eigen).length)
            bad.push(`${s.text} → ${wrong.map(c => a.status[c.id]).join(',')}${Object.keys(a.eigen).length ? ' eigen⚠' : ''} | ${t.proof.snapshot()}`)
        }
        if (t.analysis.qed) { render.call(t); found.push(t.leanCode.textContent); t.render = function () { this.analysis = this.proof.analyze() } }
      }
      t.render = render
      return { found: [...new Set(found)], bad: [...new Set(bad)].slice(0, 5) }
    }, [i, seconds])
    const name = `${w.replace(/___.*|\//g, '')}.${i + 1}`
    for (const f of r.found) if (!proofs.has(f)) proofs.set(f, name)
    for (const b of r.bad) bugs.push(`${name}: ${b}`)
    process.stdout.write(`${name}: ${r.found.length}${r.bad.length ? ' BAD ' + r.bad.length : ''}  `)
  }
}
fs.mkdirSync(new URL('fuzz-out/', import.meta.url), { recursive: true })
fs.writeFileSync(new URL('fuzz-out/tactics.lean', import.meta.url), [...proofs].map(([lean, name], k) => `-- #${k} ${name}\n${lean}`).join('\n\n') + '\n')
fs.writeFileSync(new URL('fuzz-out/tactics.json', import.meta.url), JSON.stringify({ bugs }, null, 1))
console.log(`\n${proofs.size} different accepted proofs, ${bugs.length} bad buttons`)
for (const b of bugs.slice(0, 15)) console.log('BAD', b.slice(0, 300))
await browser.close()
