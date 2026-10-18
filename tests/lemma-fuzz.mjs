// Lemmas: solves the levels with the proofs of the tactic search (so the lemma levels become lemmas),
// then in every later level adds lemma blocks and connects at random, also wrongly. Every proof the
// game accepts goes to Lean, with the theorems of the lemmas it uses.
// Usage: BASE=… node lemma-fuzz.mjs sol1.json sol2.json [seconds per level] → lemma.lean
import fs from 'node:fs'
import { chromium } from 'playwright-core'
const [s1, s2, secs] = process.argv.slice(2)
const sols = [...JSON.parse(fs.readFileSync(s1)), ...JSON.parse(fs.readFileSync(s2))]
const seconds = Number(secs ?? 4)
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const page = await (await browser.newContext({ viewport: { width: 1300, height: 900 } })).newPage()
const errors = []
page.on('pageerror', e => errors.push(e.message))
const worlds = ['World-1___-Conjunction/', 'World-2___-Implication/', 'World-3___-Disjunction/', 'World-4___-Falsity-and-Negation/',
  'World-5___-Classical-Logic/', 'World-6___-Equivalence-and-Truth/', 'World-7___-Rewriting/', 'World-8___-Quantifiers/', 'World-9___-Puzzles/', 'World-10___-Induction/']
await page.goto(base + worlds[0]); await page.evaluate(() => { localStorage.clear(); localStorage.setItem('ipm-verso:in-order', 'off') })
// 1. solve what the search solved: the lemmas are registered when a solved level is drawn
let solved = 0
for (const w of worlds) {
  await page.goto(base + w); await page.reload()
  const n = await page.evaluate(() => window.ipmTasks.length)
  for (let i = 0; i < n; i++) {
    const sol = sols.find(x => x.level === `${w.match(/World-(\d+)/)[1]}.${i + 1}`)
    if (!sol) continue
    solved += await page.evaluate(([i, g]) => { const t = window.ipmTasks[i]; t.proof.restore(g); t.render(); return t.analysis.qed ? 1 : 0 }, [i, sol.graph])
  }
}
const nLemmas = await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('ipm-verso:lemmas') ?? '{}')).length)
console.log(`solved ${solved}, lemmas ${nLemmas}`)
// 2. in every level: lemma blocks, connected at random to what fits and what does not
const proofs = new Map()
for (const w of worlds) {
  await page.goto(base + w); await page.reload()
  const n = await page.evaluate(() => window.ipmTasks.length)
  for (let i = 0; i < n; i++) {
    const r = await page.evaluate(([i, seconds]) => {
      const t = window.ipmTasks[i], render = t.render, found = []
      const lemmas = [...t.lemmaList.querySelectorAll('[data-rule]')].map(e => e.dataset.rule)
      if (!lemmas.length) return { found, lemmas: 0 }
      t.render = function () { this.analysis = this.proof.analyze() }
      const pick = xs => xs[Math.floor(Math.random() * xs.length)]
      const end = Date.now() + seconds * 1000
      while (Date.now() < end) {
        t.proof = new t.proof.constructor(t.assumptions, t.conclusions); t.render()
        for (let k = 0; k < 14 && !t.analysis.qed; k++) {
          const open = t.analysis.openInputs
          if (!open.length) break
          const to = pick(open)
          const outs = t.proof.blocks.flatMap(b => b.outputs.map((_, j) => ({ block: b.id, port: j })))
          if (Math.random() < 0.45) { const nb = t.proof.addRule(Math.random() < 0.7 ? pick(lemmas) : pick(t.rules)); t.proof.connect({ block: nb.id, port: 0 }, to) }
          else if (outs.length) { const o = pick(outs); if (o.block !== to.block && !t.proof.createsCycle(o.block, to.block)) t.proof.connect(o, to) }
          t.render()
        }
        if (t.analysis.qed && t.proof.blocks.some(b => b.rule?.startsWith('lemma:'))) { render.call(t); found.push(t.leanCode.textContent); t.render = function () { this.analysis = this.proof.analyze() } }
      }
      t.render = render
      return { found: [...new Set(found)], lemmas: lemmas.length }
    }, [i, seconds])
    for (const f of r.found) proofs.set(f, `${w}${i + 1}`)
  }
  process.stdout.write(`${w}: ${proofs.size}  `)
}
fs.writeFileSync('lemma.lean', [...proofs].map(([l, n], k) => `-- #${k} ${n}\n${l}`).join('\n\n') + '\n')
console.log(`\n${proofs.size} accepted proofs with lemmas, ${new Set(errors).size} page errors`, [...new Set(errors)].slice(0, 3))
await browser.close()
