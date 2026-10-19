// The picture stays still in the Lean tactic mode: plays the proofs of tactic-proofs.lean with the
// tactic buttons, as tactic-proofs.mjs does, and measures after each step where the blocks are on the
// screen. On the same board no block may move, except when the whole picture zooms out because it has
// to grow (a step that changes the board shows another picture).
// Usage: BASE=http://localhost:8002/ node still.mjs [level …]
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
let ok = 0, total = 0, same = 0, quiet = 0, bad = 0
for (const lv of levels.filter(l => !only.length || only.includes(l.name))) {
  const [w, n] = lv.name.split('.').map(Number)
  await page.goto(base + pages[w] + '#level-' + n)
  await page.evaluate(() => { localStorage.setItem('ipm-verso:in-order', 'off'); localStorage.setItem('ipm-verso:mode', 'tactics'); localStorage.setItem('ipm-verso:anim', '0') }); await page.reload(); await page.waitForTimeout(300); await page.evaluate(() => document.querySelectorAll('.ipm-tip-overlay').forEach(o => o.remove()))
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
    const path = []
    const play2 = k => {
      if (k === steps.length) return t.analysis.qed
      if (++tries > 40000) return false
      const places = [...t.analysis.openInputs.map(o => ({ kind: 'in', ...o })),
        ...t.proof.blocks.flatMap(b => b.kind === 'conclusion' ? [] : b.outputs.map((_, j) => ({ kind: 'out', block: b.id, port: j })))]
      for (const sel of places) {
        t.selected = sel
        for (const s of t.steps()) {
          if (!steps[k].includes(strip(s.text))) continue
          const snap = t.proof.snapshot()
          t.selected = sel; s.act(); t.render()
          path.push({ sel, text: s.text })
          if (play2(k + 1)) return true
          path.pop()
          t.proof.restore(snap); t.render(); t.selected = sel
        }
      }
      return false
    }
    t.proof = new t.proof.constructor(t.assumptions, t.conclusions); t.render(); tries = 0
    const solved = play2(0)
    // replay with the real drawing; measure where the blocks are on the screen
    t.render = render
    t.proof = new t.proof.constructor(t.assumptions, t.conclusions); t.places = {}; t.board = null; t.selected = null; t.render()
    const where = () => Object.fromEntries([...t.canvas.querySelectorAll('.ipm-block[data-id]')].map(g => { const r = g.querySelector('rect').getBoundingClientRect(); return [g.dataset.id, { x: r.left, y: r.top }] }))
    const moves = []
    for (const { sel, text } of path) {
      const board = t.board
      t.selected = sel; t.render()
      const before = where(), sb = JSON.stringify([t.places?.[`#scale:${t.board ?? ''}`]?.scale?.toFixed(2), t.view.box.map(Math.round)])
      const s = t.steps().find(s => s.text === text)
      if (!s) { moves.push(`(${text} not offered)`); break }
      s.act()
      const after = where()
      const same = t.board === board
      let worst = 0, n = 0; const ids = []
      for (const [id, a] of Object.entries(before)) if (after[id]) { const d = Math.hypot(after[id].x - a.x, after[id].y - a.y); if (d > 3) { n++; ids.push(id) } worst = Math.max(worst, d) }
      const sa = JSON.stringify([t.places?.[`#scale:${t.board ?? ''}`]?.scale?.toFixed(2), t.view.box.map(Math.round)])
      // moved on the same board, with the same scale and corner of the picture: rearranged
      const zoom = JSON.parse(sb)[0] !== JSON.parse(sa)[0] || JSON.parse(sb)[1][0] !== JSON.parse(sa)[1][0] || JSON.parse(sb)[1][1] !== JSON.parse(sa)[1][1]
      moves.push({ text: text.split(' · ').pop(), same, moved: n, worst: Math.round(worst), zoom, ids })
    }
    return { solved, stuck, moves }
  }, [n - 1, lv.steps])
  const steps = r.moves ?? [], still = steps.filter(m => m.same && m.worst <= 3).length
  const rearranged = steps.filter(m => m.same && m.worst > 3 && !m.zoom)
  total += steps.length; same += steps.filter(m => m.same).length; quiet += still; bad += rearranged.length
  console.log(`${lv.name}: ${r.solved ? '' : 'NOT SOLVED — ' + r.stuck + ' '}${steps.length} steps, ${still} still${rearranged.length ? `, REARRANGED: ${rearranged.map(m => `${m.text} (${m.ids.join(',')})`).join('; ')}` : ''}`)
  if (r.solved) ok++
}
console.log(`${ok} of ${levels.filter(l => !only.length || only.includes(l.name)).length} played; ${total} steps, ${same} on the same board, ${quiet} of them still`)
console.log(bad ? `FAIL: ${bad} steps rearranged blocks` : 'no step rearranged blocks (only a zoom, where the picture had to grow)')
await browser.close()
