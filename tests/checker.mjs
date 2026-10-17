// Tests the proof checker of ipm.js without a browser: builds proofs block by block and analyses
// them (wrong proofs with quantifiers, the drinker paradox).
// Usage: node checker.mjs   (LEANOUT=file writes the Lean proof of the drinker paradox there)
import fs from 'node:fs'
const src = fs.readFileSync(new URL('../Ipm/ipm.js', import.meta.url), 'utf8')
const code = src.slice(src.indexOf('  // Formulas:'), src.indexOf('  // ---------------------------------------------------------------- rendering'))
globalThis.localStorage = { getItem: () => null, setItem: () => {} }
const api = new Function(code + '; return { Proof, leanProof, show }')()
const { Proof, leanProof } = api
const run = (name, assumptions, goals, build) => {
  const p = new Proof(assumptions, goals)
  const B = id => p.blocks.find(b => b.id === id)
  const ids = { goal: k => p.blocks.filter(b => b.kind === 'conclusion')[k ?? 0].id, hyp: k => p.blocks.filter(b => b.kind === 'assumption')[k ?? 0].id }
  build(p, ids)
  const a = p.analyze()
  console.log(`${name}: qed ${a.qed} | eigen ⚠ at ${JSON.stringify(Object.keys(a.eigen).map(id => B(id).rule))} | ${JSON.stringify(Object.values(a.status))}`)
  return { a, lean: leanProof(p, a) }
}
const L = (p, o, oport, i, iport) => p.connect({ block: o, port: oport }, { block: i, port: iport })
// The classic wrong proof: ∀ x, ∃ y, R x y ⊢ ∃ y, ∀ x, R x y
run('∀∃ ⊢ ∃∀ (wrong)', ['∀ x, ∃ y, R x y'], ['∃ y, ∀ x, R x y'], (p, h) => {
  const exI = p.addRule('exI').id, allI = p.addRule('allI').id, exE = p.addRule('exE').id, allE = p.addRule('allE').id
  L(p, exI, 0, h.goal(), 0); L(p, allI, 0, exI, 0); L(p, exE, 0, allI, 0)
  L(p, allE, 0, exE, 0); L(p, h.hyp(), 0, allE, 0); L(p, exE, 1, exE, 1)
})
// Forward first: ∀ x, R x x ⊢ ∀ y, R y y, the goal connected last
const r = run('∀ x, R x x ⊢ ∀ y, R y y (forward)', ['∀ x, R x x'], ['∀ y, R y y'], (p, h) => {
  const allI = p.addRule('allI').id, allE = p.addRule('allE').id
  L(p, allE, 0, allI, 0); L(p, h.hyp(), 0, allE, 0); L(p, allI, 0, h.goal(), 0)
})
console.log(r.lean)
// Without the goal: pending, no ☠
run('… without the goal', ['∀ x, R x x'], ['∀ y, R y y'], (p, h) => {
  const allI = p.addRule('allI').id, allE = p.addRule('allE').id
  L(p, allE, 0, allI, 0); L(p, h.hyp(), 0, allE, 0)
})
// ∃ x, P x ⊢ ∀ x, P x is wrong: the two eigenvariables do not fit (☠)
run('∃ ⊢ ∀ (wrong)', ['∃ x, P x'], ['∀ x, P x'], (p, h) => {
  const allI = p.addRule('allI').id, exE = p.addRule('exE').id
  L(p, allI, 0, h.goal(), 0); L(p, exE, 0, allI, 0); L(p, h.hyp(), 0, exE, 0); L(p, exE, 1, exE, 1)
})
// An eigenvariable inside an →I hypothesis that is discharged within its scope
run('→I hypothesis with c inside (fine)', [], ['∀ x, P x → P x'], (p, h) => {
  const allI = p.addRule('allI').id, impI = p.addRule('impI').id
  L(p, allI, 0, h.goal(), 0); L(p, impI, 0, allI, 0); L(p, impI, 1, impI, 0)
})
run('(∃ x, P x) → ∀ x, P x (wrong)', [], ['(∃ x, P x) → ∀ x, P x'], (p, h) => {
  const impI = p.addRule('impI').id, allI = p.addRule('allI').id, exE = p.addRule('exE').id
  L(p, impI, 0, h.goal(), 0); L(p, allI, 0, impI, 0); L(p, exE, 0, allI, 0); L(p, impI, 1, exE, 0); L(p, exE, 1, exE, 1)
})
// Proof by contradiction: (A → ⊥) → ⊥ ⊢ A
const raa = run('by contradiction', ['(A → ⊥) → ⊥'], ['A'], (p, h) => {
  const r = p.addRule('raa').id, e = p.addRule('impE').id
  L(p, r, 0, h.goal(), 0); L(p, e, 0, r, 0); L(p, h.hyp(), 0, e, 0); L(p, r, 1, e, 1)
})
console.log(raa.lean)
// The drinker paradox: ⊢ ∃ x, D x → ∀ y, D y, with TND, both quantifiers and two eigenvariables
const d = run('drinker paradox', [], ['∃ x, D x → ∀ y, D y'], (p, h) => {
  const n = r => p.addRule(r).id
  const B = ['TND', 'disjE', 'exI', 'impI', 'TND', 'disjE', 'exE', 'exI', 'impI', 'falseE', 'impE',
             'falseE', 'impE', 'allI', 'TND', 'disjE', 'falseE', 'impE', 'exI'].map(n)
  L(p, B[1], 0, h.goal(), 0); L(p, B[0], 0, B[1], 0)
  // case ∀ y, D y
  L(p, B[2], 0, B[1], 1); L(p, B[3], 0, B[2], 0); L(p, B[1], 1, B[3], 0)
  // case ¬∀ y, D y: TND on ∃ x, ¬D x
  L(p, B[5], 0, B[1], 2); L(p, B[4], 0, B[5], 0)
  //   ∃ x, ¬D x
  L(p, B[6], 0, B[5], 1); L(p, B[5], 1, B[6], 0); L(p, B[7], 0, B[6], 1); L(p, B[8], 0, B[7], 0)
  L(p, B[9], 0, B[8], 0); L(p, B[10], 0, B[9], 0); L(p, B[6], 1, B[10], 0); L(p, B[8], 1, B[10], 1)
  //   ¬∃ x, ¬D x: then ∀ y, D y, a contradiction
  L(p, B[11], 0, B[5], 2); L(p, B[12], 0, B[11], 0); L(p, B[1], 2, B[12], 0); L(p, B[13], 0, B[12], 1)
  L(p, B[15], 0, B[13], 0); L(p, B[14], 0, B[15], 0); L(p, B[15], 1, B[15], 1)
  L(p, B[16], 0, B[15], 2); L(p, B[17], 0, B[16], 0); L(p, B[5], 2, B[17], 0); L(p, B[18], 0, B[17], 1); L(p, B[15], 2, B[18], 0)
})
if (process.env.LEANOUT) fs.writeFileSync(process.env.LEANOUT, raa.lean + '\n\n' + d.lean + '\n')
console.log(d.lean)
