# The Incredible Proof Machine in Lean

Proofs as pictures, after the [Incredible Proof Machine](https://incredible.pm) by Joachim Breitner,
redone to be played by tapping — on a phone as well as with a mouse.

**Play:** https://pfaffelh.github.io/ipm/

Assumptions are at the top, goals at the bottom; a proof connects them through rule blocks of
natural deduction. The site has the first five sessions of the Incredible Proof Machine, here called *worlds*: conjunction (12 tasks),
implication (14), disjunction (12), falsity and negation (15) and classical logic (9). Two more
sessions take tasks from the logic exercises of the [Lean course](https://pfaffelh.github.io/leancourse/)
that the Proof Machine does not have: session 6 with the rules so far (28 tasks), session 7 with
equivalence `↔` and truth `⊤` and their rules ↔I, ↔E₁, ↔E₂, ⊤I (24 tasks). Sessions 8 and 9 are the Proof
Machine's quantifier sessions: ∀I, ∀E, ∃I, ∃E (17 tasks), and two puzzles. Session 10 adds
induction over the natural numbers (6 tasks), which the Proof Machine does not have.

## How it is played

* Tap a red circle (something to prove): everything in the picture that fits glows green; tap it to
  draw the line. It also works the other way round (tap an output first).
* The button ＋ below the picture opens a menu with the rules (and the lemmas), drawn as the very
  blocks they add, with `?1`, `?2` for arbitrary statements; tapping one adds the block (or drag it
  onto the board), and the menu closes again. You then connect the block.
  Unification fills in `?1`, `?2`. Rule blocks you no longer need go into the trash can 🗑, which
  appears while you drag a block.
* Tactics, earned: a task marked `(unlocks := "intro")` unlocks the tactic `intro` once solved (the
  settings ⚙ in the header switch tactics off, to earned, or to all; and whether tasks come in
  order). A selected port offers the block that fits its statement, named after the Lean
  command (goal `A → B`: `intro h`; `A ∧ B`, `A ↔ B`: `constructor`; `A ∨ B`: `left`/`right`; `⊤`:
  `trivial`; assumption `h₁ : A ∧ B`: `obtain ⟨ha, hb⟩ := h₁`; `A ∨ B`: `obtain (ha | hb) := h₁`;
  `A → B`: `apply h₁`; `⊥`: `exact h₁.elim`; `A ↔ B`: `apply h₁.mp`/`apply h₁.mpr`). One tap adds
  the block, already connected. A goal also offers `exact h₁` for an assumption that fits it, and
  `apply h₁` for an assumption `h₁ : A → B` whose `B` fits it.
* A line that does not fit gets a ☠, a local hypothesis used outside its box a ⚠; tap them for an
  explanation.
* Red circles are inputs (still to be proved), blue dots outputs (what you have).
* Each rule block carries the name of its rule (∧I, →E, …) small in its corner, so that one still sees
  which rule it is once its statements are filled in.
* →-introduction provides a local hypothesis (a blue dot with a purple ring, on top of the block); a dashed box shows the part of the proof
  that uses it, which must lead back into the block's own input.
* Blocks can be dragged with mouse or
  finger; tap a line to select it and ✕ to remove it. Undo, Start over, Tidy up (automatic layout).
  The board is about as high as the screen and always shows the whole picture, scaled to fit
  (nothing to scroll in it); layers wider than the board are broken into several lines.
* Below the board, the same proof is shown in Lean, updated with every change (`sorry` marks what
  is still missing); a complete proof can be opened in the Lean web editor.
* A world's page is a stage as high as the screen: one level (task) at a time, a tool bar below the board
  (＋, Undo, Start over, Tidy up, Lean, Next ›), a dot per task above on the right (← → also go to
  the previous and next level), and at its foot “About this level”: the level's tip and the rules of
  the world. The tip of a level (`:::tip (lang := "en")` in the task; for the first level of a world
  its rules) also appears once, when the level is played for the first time. Nothing scrolls while one plays; the
  task is in the address (`#task-3`). The start page has a big Start (or Continue) button.
* Tasks come one after another; the ones not yet playable are shown greyed out.
* Solved tasks marked `(lemma := true)` become lemmas, offered only in the tasks after them (no circles): in the menu of ＋, “Lemmas from solved tasks” offers each solved task as a
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
* Quantifiers: statements are written as in Lean (`∀ x, P x → Q (f x)`). The body of a quantifier
  rule is a placeholder shown applied to a term (`∀ x, ?1 x` gives `?1 ?2` by ∀E). Unification is
  first order, with delayed substitutions: a connection that cannot be decided yet is put back and
  tried again once others have determined more (the Proof Machine uses higher-order pattern
  unification instead). ∀I and ∃E have eigenvariables `c₁`, `c₂`, …; after unification it is
  checked that they do not escape (not in the conclusion, nor in an assumption the proof uses),
  otherwise the block gets a ⚠. When nothing else can be decided, an undetermined object of a
  block in the scope of an eigenvariable is taken to be it (this makes e.g. the drinker paradox
  work without higher-order unification).
* Induction is a block like ∀I with a local hypothesis: `?1 0` and `?1 c₁ ⇒ ?1 (c₁ + 1)` give
  `∀ n, ?1 n`; in Lean `Nat.rec (motive := fun n => …)`. In Lean, objects have a type `α`; an undetermined object is
  `default` (with `[Inhabited α]`).
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

Tests (they show all tasks of a page one below the other, see `tests/all-tasks.mjs`; `stage.mjs`
and `start.mjs` test the stage and the start page): `cd tests && npm install && BASE=http://localhost:8002/ node session1.mjs` (and
`session2.mjs`, `locked.mjs`, …); they need a Chrome or Chromium (`CHROME=…`).
`LEANOUT=proofs.lean node lean-proofs.mjs` writes the Lean proofs of some solved tasks;
`lake env lean proofs.lean` checks them.
`node checker.mjs` tests the proof checker without a browser (wrong proofs, the drinker paradox).

Pushing to `main` builds the site and publishes it on GitHub Pages
(`.github/workflows/deploy.yml`); `redirects.sh` adds pages at the old addresses `Session-N___-…/`, which forward to `World-N___-…/`.

## License

MIT (see `LICENSE`). The tasks and the design of the proof graphs come from the Incredible Proof
Machine by Joachim Breitner, also MIT licensed.
