# The Incredible Proof Machine in Lean

Proofs as pictures, after the [Incredible Proof Machine](https://incredible.pm) by Joachim Breitner,
redone to be played by tapping — on a phone as well as with a mouse.

**Play:** https://pfaffelh.github.io/ipm/

Assumptions are at the top, goals at the bottom; a proof connects them through rule blocks of
natural deduction. The site has the first five sessions of the Incredible Proof Machine: conjunction (12 tasks),
implication (14), disjunction (12), falsity and negation (15) and classical logic (9). Two more
sessions take tasks from the logic exercises of the [Lean course](https://pfaffelh.github.io/leancourse/)
that the Proof Machine does not have: session 6 with the rules so far (28 tasks), session 7 with
equivalence `↔` and truth `⊤` and their rules ↔I, ↔E₁, ↔E₂, ⊤I (24 tasks).

## How it is played

* Tap a red circle (something to prove): everything in the picture that fits glows green; tap it to
  draw the line. It also works the other way round (tap an output first).
* The button ＋ below the picture opens a menu with the rules (and the lemmas), drawn as the very
  blocks they add, with `?1`, `?2` for arbitrary statements; tapping one adds the block (or drag it
  onto the board), and the menu closes again. You then connect the block.
  Unification fills in `?1`, `?2`. Rule blocks you no longer need go into the trash can 🗑, which
  appears while you drag a block.
* Tactics (switched on with “Allow tactics” below a board; off by default): a selected port offers the block that fits its statement, named after the Lean
  command (goal `A → B`: `intro h`; `A ∧ B`, `A ↔ B`: `constructor`; `A ∨ B`: `left`/`right`; `⊤`:
  `trivial`; assumption `h₁ : A ∧ B`: `obtain ⟨ha, hb⟩ := h₁`; `A ∨ B`: `obtain (ha | hb) := h₁`;
  `A → B`: `apply h₁`; `⊥`: `exact h₁.elim`; `A ↔ B`: `apply h₁.mp`/`apply h₁.mpr`). One tap adds
  the block, already connected.
* A line that does not fit gets a ☠, a local hypothesis used outside its box a ⚠; tap them for an
  explanation.
* Red circles are inputs (still to be proved), blue dots outputs (what you have).
* →-introduction provides a local hypothesis (a blue dot with a purple ring, on top of the block); a dashed box shows the part of the proof
  that uses it, which must lead back into the block's own input.
* Blocks can be dragged with mouse or
  finger; tap a line to select it and ✕ to remove it. Undo, Start over, Tidy up (automatic layout)
  and zoom (−, +, Fit; a larger picture scrolls inside the board).
* Below the board, the same proof is shown in Lean, updated with every change (`sorry` marks what
  is still missing); a complete proof can be opened in the Lean web editor.
* Tasks come one after another; the ones not yet playable are shown greyed out.
* Solved tasks become lemmas: in the menu of ＋, “Lemmas from solved tasks” offers each solved task as a
  block of its own (assumptions as inputs, goals as outputs, `?1`, `?2` for the statements). In the
  Lean proof, a lemma is a `theorem` that the proof applies.
* English or German: the switch EN | DE in the header (the choice is kept).
* Progress is kept in the browser.

## How it works

* The site is a static [Verso](https://github.com/leanprover/verso) document; no server is needed.
* Proofs are checked in the browser (`Ipm/ipm.js`): every connection is checked by unification in
  the order the connections were made, so a conflict is blamed on the newest one; local
  hypotheses must not escape their box; cycles are not allowed. Any correct graph is accepted.
* Each task is written with the directive `::::task (assumptions := …) (conclusions := …)`
  (`Ipm/Task.lean`) and contains a Lean proof of the task in a hidden `lean` block. Building the
  site checks all these proofs, so every task is known to be provable.
* Texts come in both languages: `:::en` and `:::de` blocks (`Ipm/Task.lean`); `ipm.js` shows the
  chosen one and translates its own texts and the headings.
* Formulas follow Lean's conventions: `∧`, `∨` and `→` group to the right. The Incredible Proof
  Machine groups `∧` to the left, so its `A∧B∧C` is written `(A ∧ B) ∧ C` here.

```
Ipm.lean                 start page
Ipm/Task.lean            the task directive
Ipm/ipm.js, Ipm/ipm.css  the proof graph editor
Ipm/Sessions/*.lean      the sessions
tests/                   end-to-end tests on a simulated phone (Playwright)
```

## Building

```bash
lake build              # checks the Lean proof of every task
lake exe ipm            # writes the site to _out/html-multi
cd _out/html-multi && python3 -m http.server 8002
```

Tests: `cd tests && npm install && BASE=http://localhost:8002/ node session1.mjs` (and
`session2.mjs`, `locked.mjs`, …); they need a Chrome or Chromium (`CHROME=…`).
`LEANOUT=proofs.lean node lean-proofs.mjs` writes the Lean proofs of some solved tasks;
`lake env lean proofs.lean` checks them.

Pushing to `main` builds the site and publishes it on GitHub Pages
(`.github/workflows/deploy.yml`).

## License

MIT (see `LICENSE`). The tasks and the design of the proof graphs come from the Incredible Proof
Machine by Joachim Breitner, also MIT licensed.
