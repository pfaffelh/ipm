// Plays the Lean tactic proofs of tactic-proofs.lean in the game, with the tactic buttons alone
// (as on a level of the tactic trainer): each line becomes the button of the same command
// (`rcases Classical.em P with h | h'` is `by_cases h : P`, `apply Classical.byContradiction` +
// `intro h` is `by_contra h`, `refine ⟨x, ?_⟩` is `use x`); where a button fits at several goals,
// the ways are tried one after the other. LEANOUT=file writes the Lean proofs the game makes.
// Usage: BASE=http://localhost:8002/ node tactic-proofs.mjs [level …]
import fs from 'node:fs'
import { chromium } from 'playwright-core'
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const src = fs.readFileSync(new URL('tactic-proofs.lean', import.meta.url), 'utf8')
const only = process.argv.slice(2)
// the levels and their buttons: each step is a list of button texts that do it
const levels = []
for (const part of src.split(/^-- level /m).slice(1)) {
  const name = part.split('\n')[0].trim()
  const lines = part.split(':= by\n')[1].split('\n').map(l => l.trim().replace(/^· /, '')).filter(l => l && !/^\| .* =>$/.test(l))
  const steps = []
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i], next = lines[i + 1] ?? ''
    let m
    if (l === 'intro n' && next.startsWith('induction n')) { steps.push(['intro n; induction n']); i++ }
    else if (l === 'apply Classical.byContradiction' && (m = /^intro (\S+)$/.exec(next))) { steps.push([`by_contra ${m[1]}`]); i++ }
    else if ((m = /^rcases Classical\.em (.*) with (\S+) \| \S+$/.exec(l))) {
      const p = m[1].replace(/^\((.*)\)$/, '$1')
      steps.push([`by_cases ${m[2]} : ${p}`, `by_cases ${m[2]} : …`])
    } else if ((m = /^refine ⟨(.*), \?_⟩$/.exec(l))) steps.push([`use ${m[1]}`, 'use _'])
    // `have h₄ := h₁ c₁` with an object is one step (∀E); `have h₄ := h₁ h₂` is a step forwards on h₁
    // (`have h₄ := h₁ ?_`) and h₂ for what it needs
    else if ((m = /^have (\S+) := (\S+) ([^h\s]\S*)$/.exec(l))) steps.push([l])
    else if ((m = /^have (\S+) := (\S+) (\S+)$/.exec(l))) { steps.push([`have ${m[1]} := ${m[2]} ?_`]); steps.push([`exact ${m[3]}`]) }
    else steps.push([l])
  }
  levels.push({ name, steps })
}
const pages = { 3: 'World-3___-Disjunction/', 4: 'World-4___-Falsity-and-Negation/', 5: 'World-5___-Classical-Logic/',
  6: 'World-6___-Equivalence-and-Truth/', 7: 'World-7___-Rewriting/', 8: 'World-8___-Quantifiers/', 9: 'World-9___-Puzzles/', 10: 'World-10___-Induction/' }
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const page = await (await browser.newContext({ viewport: { width: 1300, height: 900 } })).newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
const proofs = []
let ok = 0
for (const lv of levels.filter(l => !only.length || only.includes(l.name))) {
  const [w, n] = lv.name.split('.').map(Number)
  await page.goto(base + pages[w])
  await page.evaluate(() => { localStorage.setItem('ipm-verso:in-order', 'off') }); await page.reload()
  const r = await page.evaluate(([i, steps]) => {
    const t = window.ipmTasks[i], render = t.render
    t.tacticsOnly = true
    t.render = function () { this.analysis = this.proof.analyze() }
    t.closeSheet = () => {}
    t.proof = new t.proof.constructor(t.assumptions, t.conclusions); t.render()
    let tries = 0, deepest = 0, stuck = ''
    const strip = x => x.split(' · ').pop()
    const play = k => {
      if (k === steps.length) return t.analysis.qed
      if (++tries > 20000) return false
      const places = [...t.analysis.openInputs.map(o => ({ kind: 'in', ...o })),
        ...t.proof.blocks.flatMap(b => b.kind === 'conclusion' ? [] : b.outputs.map((_, j) => ({ kind: 'out', block: b.id, port: j })))]
      const offered = new Set()
      for (const sel of places) {
        t.selected = sel
        for (const s of t.steps()) {
          offered.add(strip(s.text))
          if (!steps[k].includes(strip(s.text))) continue
          const snap = t.proof.snapshot()
          t.selected = sel
          s.act(); t.render()
          if (play(k + 1)) return true
          t.proof.restore(snap); t.render()
          t.selected = sel
        }
      }
      if (k >= deepest) { deepest = k; stuck = `step ${k + 1} "${steps[k][0]}" not offered; offered: ${[...offered].join(', ')}` }
      return false
    }
    const solved = play(0)
    t.render = render; t.render()
    return { solved, stuck, lean: t.leanCode.textContent }
  }, [n - 1, lv.steps])
  console.log(`${lv.name}: ${r.solved ? 'solved' : 'NOT SOLVED — ' + r.stuck}`)
  if (r.solved) { ok++; proofs.push(`-- level ${lv.name}\n${r.lean}`) }
}
console.log(`${ok} of ${levels.filter(l => !only.length || only.includes(l.name)).length} played with the tactic buttons alone`)
if (process.env.LEANOUT) fs.writeFileSync(process.env.LEANOUT, proofs.join('\n\n') + '\n')
await browser.close()
