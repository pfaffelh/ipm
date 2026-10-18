// A fuzzer for the proof checker: builds random proof graphs for every level, also along ways that
// must not work (a local hypothesis outside its box, an eigenvariable outside its scope, lines that do
// not fit), and keeps every graph the checker accepts. Lean then checks the Lean proofs of all of
// them: one that Lean rejects is a wrong proof that the game let through.
// Usage: node fuzz.mjs [seconds per level] [seed] [filter]   → writes fuzz-out/accepted.lean, fuzz-out/index.json
import fs from 'node:fs'
const src = fs.readFileSync(new URL('../Ipm/ipm.js', import.meta.url), 'utf8')
const code = src.slice(src.indexOf('  // Formulas:'), src.indexOf('  // ---------------------------------------------------------------- rendering'))
globalThis.localStorage = { getItem: () => null, setItem: () => {} }
const { Proof, leanProof, isLocal, unify, RULES } = new Function(code + '; return { Proof, leanProof, isLocal, unify, RULES }')()
const seconds = Number(process.argv[2] ?? 3)
let seed = Number(process.argv[3] ?? 1)
const filter = process.argv[4] ?? ''
const rand = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648 }
const pick = xs => xs[Math.floor(rand() * xs.length)]

// the levels, from the Lean files
const items = s => (s.includes(';') ? s.split(';') : /[∀∃]/.test(s) ? [s] : s.split(',')).map(x => x.trim()).filter(x => x)
const levels = []
for (const f of fs.readdirSync(new URL('../Ipm/Sessions/', import.meta.url)).sort()) {
  const text = fs.readFileSync(new URL('../Ipm/Sessions/' + f, import.meta.url), 'utf8')
  const world = /World (\d+)/.exec(text)?.[1] ?? f
  let n = 0
  for (const m of text.matchAll(/^::::task (.*)$/gm)) {
    n++
    const arg = k => new RegExp(`\\(${k} := "([^"]*)"\\)`).exec(m[1])?.[1]
    levels.push({ name: `${world}.${n}`, assumptions: items(arg('assumptions') ?? ''), conclusions: items(arg('conclusions')),
      rules: (arg('rules') ?? 'conjI, conjE, impI, impE').split(',').map(x => x.trim()) })
  }
}

const accepted = new Map()  // Lean text → level
const stats = { graphs: 0, qed: 0, errors: 0 }
const errors = []
for (const lv of levels.filter(l => l.name.startsWith(filter))) {
  const end = Date.now() + seconds * 1000
  while (Date.now() < end) {
    const p = new Proof(lv.assumptions, lv.conclusions)
    const goalDirected = rand() < 0.7
    try {
      for (let step = 0; step < 40; step++) {
        const a = p.analyze()
        stats.graphs++
        if (a.qed) {
          stats.qed++
          const lean = leanProof(p, a)
          if (!accepted.has(lean)) accepted.set(lean, { level: lv.name, graph: p.snapshot() })
          break
        }
        const open = a.openInputs
        if (!open.length) break
        const to = rand() < 0.7 ? open[0] : pick(open)
        const outs = p.blocks.flatMap(b => b.outputs.map((_, j) => ({ block: b.id, port: j })))
        const r = rand()
        if (goalDirected) {
          // only what fits the statement, but anywhere: local hypotheses outside their box,
          // eigenvariables outside their scope; new blocks whose output fits
          const fit = outs.filter(o => (isLocal(p.block(o.block), o.port) || (o.block !== to.block && !p.createsCycle(o.block, to.block))) &&
            unify(p.block(o.block).outputs[o.port], p.block(to.block).inputs[to.port], a.s))
          const news = lv.rules.filter(name => { const q = new Proof([], []); q.next = p.next + 1000; const nb = q.addRule(name); return unify(nb.outputs[0], p.block(to.block).inputs[to.port], a.s) })
          if (fit.length && (rand() < 0.6 || !news.length || p.blocks.length >= 16)) p.connect(pick(fit), to)
          else if (news.length && p.blocks.length < 16) { const nb = p.addRule(pick(news)); p.connect({ block: nb.id, port: 0 }, to) }
          else break
        } else if (r < 0.55 && outs.length) {
          // a line from anything (also a local hypothesis anywhere): the checker must catch what is wrong
          const o = pick(outs)
          if (!isLocal(p.block(o.block), o.port) && (o.block === to.block || p.createsCycle(o.block, to.block))) continue
          p.connect(o, to)
          // a line that does not fit is taken out again most of the time (as a player would)
          const a2 = p.analyze()
          const c = p.connections.at(-1)
          if (a2.status[c.id] === 'fail' && rand() < 0.9) p.connections.pop()
        } else if (p.blocks.length < 16) {
          const nb = p.addRule(pick(lv.rules))
          if (rand() < 0.75) p.connect({ block: nb.id, port: 0 }, to)
          else if (outs.length && nb.inputs.length) {  // forwards: something one has into the new block
            const o = pick(outs)
            if (isLocal(p.block(o.block), o.port) || !p.createsCycle(o.block, nb.id)) p.connect(o, { block: nb.id, port: 0 })
          }
        }
      }
    } catch (e) {
      stats.errors++
      if (errors.length < 30) errors.push({ level: lv.name, error: String(e.stack ?? e).split('\n').slice(0, 3).join(' | '), graph: p.snapshot() })
    }
  }
  process.stdout.write(`${lv.name}: ${[...accepted.values()].filter(x => x.level === lv.name).length} accepted  `)
}
fs.mkdirSync(new URL('fuzz-out/', import.meta.url), { recursive: true })
const list = [...accepted.entries()]
fs.writeFileSync(new URL('fuzz-out/accepted.lean', import.meta.url), list.map(([lean, x], k) => `-- #${k} level ${x.level}\n${lean}`).join('\n\n') + '\n')
fs.writeFileSync(new URL('fuzz-out/index.json', import.meta.url), JSON.stringify({ stats, errors, accepted: list.map(([lean, x]) => ({ ...x, lean })) }, null, 1))
console.log(`\ngraphs ${stats.graphs}, accepted ${stats.qed} (${list.length} different Lean proofs), exceptions ${stats.errors}`)
for (const e of errors.slice(0, 5)) console.log('EXCEPTION', e.level, e.error)
