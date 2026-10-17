// A fuzzer that starts from correct proofs (from tactics-only.mjs, SNAPOUT=…) and changes them: a
// line is moved to another output whose statement fits, whatever box or scope it is in; a block is
// taken out; lines are added. Every graph the checker still accepts goes to Lean.
// Usage: node mutate.mjs solutions.json [seconds per level] [seed]  → fuzz-out/mutated.lean
import fs from 'node:fs'
const src = fs.readFileSync(new URL('../Ipm/ipm.js', import.meta.url), 'utf8')
const code = src.slice(src.indexOf('  // Formulas:'), src.indexOf('  // ---------------------------------------------------------------- rendering'))
globalThis.localStorage = { getItem: () => null, setItem: () => {} }
const { Proof, leanProof, isLocal, unify } = new Function(code + '; return { Proof, leanProof, isLocal, unify }')()
const solutions = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const seconds = Number(process.argv[3] ?? 5)
let seed = Number(process.argv[4] ?? 1)
const rand = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648 }
const pick = xs => xs[Math.floor(rand() * xs.length)]
const accepted = new Map()
let graphs = 0, exceptions = 0
for (const { level, graph } of solutions) {
  const end = Date.now() + seconds * 1000
  let n0 = accepted.size
  while (Date.now() < end) {
    const p = new Proof([], [])
    p.restore(graph)
    try {
      for (let k = 1 + Math.floor(rand() * 3); k > 0; k--) {
        const a = p.analyze()
        const outs = p.blocks.flatMap(b => b.outputs.map((_, j) => ({ block: b.id, port: j })))
        const r = rand()
        if (r < 0.7 && p.connections.length) {
          const c = pick(p.connections)
          const fit = outs.filter(o => !(o.block === c.from.block && o.port === c.from.port) &&
            (isLocal(p.block(o.block), o.port) || (o.block !== c.to.block && !p.createsCycle(o.block, c.to.block))) &&
            unify(p.block(o.block).outputs[o.port], p.block(c.to.block).inputs[c.to.port], a.s))
          if (fit.length) p.connect(pick(fit), c.to)
        } else if (r < 0.85) {
          const rules = p.blocks.filter(b => b.kind === 'rule')
          if (rules.length) p.removeBlock(pick(rules).id)
        } else {
          // forget what was fixed (objects of ∀E/∃I, the statement of TND)
          for (const b of p.blocks) if (b.fix && rand() < 0.5) delete b.fix
        }
      }
      const a = p.analyze()
      graphs++
      if (a.qed) { const lean = leanProof(p, a); if (!accepted.has(lean)) accepted.set(lean, { level, graph: p.snapshot() }) }
    } catch (e) { exceptions++; if (exceptions < 5) console.log('EXCEPTION', level, String(e).slice(0, 200)) }
  }
  process.stdout.write(`${level}: ${accepted.size - n0}  `)
}
fs.mkdirSync(new URL('fuzz-out/', import.meta.url), { recursive: true })
const list = [...accepted.entries()]
fs.writeFileSync(new URL('fuzz-out/mutated.lean', import.meta.url), list.map(([lean, x], k) => `-- #${k} level ${x.level}\n${lean}`).join('\n\n') + '\n')
fs.writeFileSync(new URL('fuzz-out/mutated.json', import.meta.url), JSON.stringify(list.map(([lean, x]) => ({ ...x, lean })), null, 1))
console.log(`\ngraphs ${graphs}, ${list.length} different accepted proofs, exceptions ${exceptions}`)
