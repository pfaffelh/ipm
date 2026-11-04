# Hunting bugs

The game must never accept a wrong proof, never crash, and every proof it accepts must be a proof
in Lean too. Lean is the referee: the fuzzers below collect every proof the game accepts and
`lake env lean` checks the Lean proofs the game writes for them.

| Tool | What it does |
|---|---|
| `tests/fuzz.mjs` (node) | Builds random proof graphs for every level, also along ways that must not work: a local hypothesis outside its box, an eigenvariable outside its scope, lines that do not fit, a third of them goal-directed. Writes `fuzz-out/accepted.lean`. |
| `tests/mutate.mjs` (node) | Starts from correct proofs and moves lines to other outputs that fit, takes blocks out, forgets fixed objects. Writes `fuzz-out/mutated.lean`. It takes a file of solved graphs (`[{level, graph}]`, e.g. the `accepted` list of `fuzz-out/index.json`). |
| `tests/lemma-fuzz.mjs` | Plays solved proofs (the same kind of file, two of them), so that the lemma levels become lemmas, then adds lemma blocks in later levels and connects at random. Writes `lemma.lean` (check each proof in a `namespace` of its own: they bring the lemma theorems along). |
| `tests/ui-fuzz.mjs` | Taps at random what a player can tap; collects page errors and lines between ports that do not exist. Writes `fuzz-out/ui.lean`. |

```bash
cd tests && node fuzz.mjs 4 1 && cd .. && lake env lean tests/fuzz-out/accepted.lean
```

## Found and fixed (2026-10-18)

* A rule block without inputs (⊤I) tapped while an output was selected got a line to an input that
  does not exist; every check after it crashed.
* The checker did not reject circles itself (only the interface avoided them). `obtain` on `A ∨ B`
  could connect ∨E to a goal inside its own case, a circular proof that was accepted.
* A local hypothesis counted as usable at a goal that leads into its box on one way but to the main
  goal on another (an output used twice); `obtain` then drew ⚠ lines.
* Lean output that Lean rejects: `⟨a, b⟩.1`, `Or.elim (Or.inl a) …`, `(fun _ => h) default`
  (detours like ∧I then ∧E: now with the type, `(⟨a, b⟩ : A ∧ B).1`), `Classical.em _` (now with the
  statement), statements still undetermined (now `True`, objects `default`), eigenvariables outside
  their block (`default`).

## Found and fixed (2026-10-18, second run)

* Lean output with lemmas: statements of a lemma that nothing determines (`(Q := True)`), and all
  statements when an argument does not tell its type (`fun _ => …`), are now given by name.
