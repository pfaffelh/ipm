# The Incredible Proof Machine in Lean

Proofs as pictures, after the [Incredible Proof Machine](https://incredible.pm) by Joachim Breitner,
redone to be played by tapping — on a phone as well as with a mouse.

**Play:** https://pfaffelh.github.io/ipm/

Assumptions are at the top, goals at the bottom; a proof connects them through rule blocks of
natural deduction. So far the site has the first five sessions of the Incredible Proof Machine:
conjunction (12 tasks), implication (14), disjunction (12), falsity and negation (15) and classical
logic (9).

## How it is played

* Tap a red circle (something to prove): everything in the picture that fits glows green; tap it to
  draw the line. It also works the other way round (tap an output first).
* The rules are always available in a menu below the picture (on phones by name only; “Show blocks”
  unfolds the pictures), drawn as the very blocks they add,
  with `?1`, `?2` for arbitrary statements; tapping one adds the block, which you then connect.
  Unification fills in `?1`, `?2`. Rule blocks you no longer need go into the trash can 🗑, which
  appears while you drag a block.
* A line that does not fit gets a ☠, a local hypothesis used outside its box a ⚠; tap them for an
  explanation.
* Red circles are inputs (still to be proved), blue dots outputs (what you have).
* →-introduction provides a local hypothesis (a blue dot with a purple ring, on top of the block); a dashed box shows the part of the proof
  that uses it, which must lead back into the block's own input.
* Rules are dragged from the menu onto the board (or tapped). Blocks can be dragged with mouse or
  finger; tap a line to select it and ✕ to remove it. Undo, Start over, Tidy up (automatic layout)
  and zoom (−, +, Fit; a larger picture scrolls inside the board).
* Below the board, the same proof is shown in Lean, updated with every change (`sorry` marks what
  is still missing); a complete proof can be opened in the Lean web editor.
* Tasks come one after another; the ones not yet playable are shown greyed out.
* Solved tasks become lemmas: in the menu, “Lemmas from solved tasks” offers each solved task as a
  block of its own (assumptions as inputs, goals as outputs, `?1`, `?2` for the statements). In the
  Lean proof, a lemma is a `theorem` that the proof applies.
* Progress is kept in the browser.

## How it works

* The site is a static [Verso](https://github.com/leanprover/verso) document; no server is needed.
* Proofs are checked in the browser (`Ipm/ipm.js`): every connection is checked by unification in
  the order the connections were made, so a conflict is blamed on the newest one; local
  hypotheses must not escape their box; cycles are not allowed. Any correct graph is accepted.
* Each task is written with the directive `::::task (assumptions := …) (conclusions := …)`
  (`Ipm/Task.lean`) and contains a Lean proof of the task in a hidden `lean` block. Building the
  site checks all these proofs, so every task is known to be provable.
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
