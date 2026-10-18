# Hunting bugs

The game must never accept a wrong proof, never crash, and every proof it accepts must be a proof
in Lean too. Lean is the referee: the fuzzers below collect every proof the game accepts and
`lake env lean` checks the Lean proofs the game writes for them.

| Tool | What it does |
|---|---|
| `tests/fuzz.mjs` (node) | Builds random proof graphs for every level, also along ways that must not work: a local hypothesis outside its box, an eigenvariable outside its scope, lines that do not fit, a third of them goal-directed. Writes `fuzz-out/accepted.lean`. |
| `tests/mutate.mjs` (node) | Starts from correct proofs (`tactics-only.mjs` with `SNAPOUT=…`) and moves lines to other outputs that fit, takes blocks out, forgets fixed objects. Writes `fuzz-out/mutated.lean`. |
| `tests/tactics-only.mjs` | Solves the levels with the tactic buttons alone (search, as Lean would: at the newest goal, with what one has there). `SNAPOUT=…` keeps the proofs. |
| `tests/fuzz-tactics.mjs` | Taps random tactic buttons; a button must never draw a line with ☠ or ⚠ or cause an eigenvariable ⚠. Writes `fuzz-out/tactics.lean`. |
| `tests/lemma-fuzz.mjs` | Solves the levels with the proofs of `tactics-only.mjs` (so the lemma levels become lemmas), then adds lemma blocks in later levels and connects at random. Writes `lemma.lean` (check each proof in a `namespace` of its own: they bring the lemma theorems along). |
| `tests/ui-fuzz.mjs` | Taps at random what a player can tap, in both modes; collects page errors and lines between ports that do not exist. Writes `fuzz-out/ui.lean`. |

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
* The tactic buttons tried their lines out without the eigenvariable check (`exact` could close an
  ∃E with its own hypothesis); `use`/`specialize` offered eigenvariables outside their block.
* The tactic buttons did not see the statement below ∀I (still a delayed substitution): no
  `constructor` for `A ∧ P c₁`. `apply h₁` was missing for `h₁ : ∀ x, P x`.
* Lean output that Lean rejects: `⟨a, b⟩.1`, `Or.elim (Or.inl a) …`, `(fun _ => h) default`
  (detours like ∧I then ∧E: now with the type, `(⟨a, b⟩ : A ∧ B).1`), `Classical.em _` (now with the
  statement), statements still undetermined (now `True`, objects `default`), eigenvariables outside
  their block (`default`).

## Found and fixed (2026-10-18, second run)

* Lean output with lemmas: statements of a lemma that nothing determines (`(Q := True)`), and all
  statements when an argument does not tell its type (`fun _ => …`), are now given by name.
