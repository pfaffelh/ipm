# The Incredible Proof Machine in Lean

Proofs as pictures, after the [Incredible Proof Machine](https://incredible.pm) by Joachim Breitner,
redone to be played by tapping — on a phone as well as with a mouse.

**Play:** https://pfaffelh.github.io/ipm/

Assumptions are at the top, goals at the bottom; a proof connects them through rule blocks of
natural deduction, in 9 *worlds* of *levels*: the first five sessions of the Incredible Proof Machine
(conjunction, implication, disjunction, falsity and negation, classical logic), each with the levels
of the logic exercises of the [Lean course](https://pfaffelh.github.io/leancourse/) that need its
rules; equivalence `↔` and truth `⊤`; the Proof Machine's quantifier session and its two puzzles,
with a puzzle by Smullyan; and induction. Beyond the Proof Machine there are some classical
classics: tertium non datur from proof by contradiction, `→` over `∨`, the duals `¬∃ ↔ ∀¬` and
`¬∃¬ → ∀`, `¬∀¬ → ∃`, and two about `↔`. `docs/levels.md` lists all levels with what they need and give (lemmas, tactics, tips);
`python3 docs/levels.py` writes it and checks that the dependencies fit.

## How it is played

* Tap a red circle (something to prove): everything in the picture that fits glows green; tap it to
  draw the line. It also works the other way round (tap an output first).
* The button ＋ below the picture opens a menu with the rules (and the lemmas), drawn as the very
  blocks they add, with `?1`, `?2` for arbitrary statements; tapping one adds the block (or drag it
  onto the board), and the menu closes again. You then connect the block.
  Unification fills in `?1`, `?2`. Rule blocks you no longer need go into the trash can 🗑, which
  appears while you drag a block.
* Two modes, switched above each level (the choice is kept; the start page has “Start” and, less
  prominent, “Start in the tactic mode”): the Proof Machine (blocks and lines) and the **tactic
  mode**, where one plays only with tactic buttons. A tapped circle or dot offers the tactics that
  fit, named as in Lean, with the names of the Lean proof (`intro h₃`, `constructor`,
  `obtain ⟨h₃, h₄⟩ := h₁`, `apply h₁`, `left`/`right`, `exfalso`, `by_contra h₃`, `by_cases h₃ : A`,
  `apply h₁.mp`, `trivial`, `intro c₁`, `specialize h₁ a`, `use a`, `obtain ⟨c₁, h₂⟩ := h₁`,
  `intro n; induction n`, and `exact h₁` for what fits); one tap puts the block in, already
  connected. A level offers the tactics of its blocks, so they come one by one as the blocks do;
  a tactic's tip appears when its button is offered for the first time. Below the board, the
  Lean proof is the tactic script one has played (`refine ⟨a, ?_⟩  -- use a` for `use`, whose
  automation could close a goal early). The names h₁, h₂, …
  stand beside the blue dots. Goals with different hypotheses (the two cases of `obtain (h₂ | h₃)`)
  each get a **board** of their own, as tabs above the picture; local hypotheses stand on top as
  blocks of their own (dashed), so there are no compartments and boxes; “Whole proof” shows the
  usual picture. Both modes build the same proof, so one can switch in the middle of a level.
* No tip is lost when the mode is switched: a tactic explains itself when first offered, and a level
  in the block mode shows the blocks of its own never met (missed in the tactic mode).
* A finished proof turns the board green (in the tactic mode each board, once its goals are done);
  the world map counts at once, and the last level of a world leads on to the next world.
* The browser tab shows a block of the game (its input on top, its output below) as its icon.
* Two lexica, below the world map: the tactics and the blocks, with pictures (the same texts as the
  tips of the tactic mode).
* Proof by contradiction (RAA, from world 5 level 5 on): from `?1 ⇒ ⊥` get `?1`; in Lean
  `Classical.byContradiction`.
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
* A world's page is a stage as high as the screen: one level (task) at a time, no text above the board
  (it is under “Tips”), on a large screen the blocks in a column left of the board (the line
  between them can be dragged), and a tool bar below (＋ on phones, Undo, Start over, Tidy up, Lean;
  Tips, Next ›), a dot per task above on the right (← → also go to
  the previous and next level), and at its foot “Tips”: the level's tip and the rules of
  the world. The tip of a level (`:::tip (lang := "en")` in the task; for the first level of a world
  its rules) also appears once, when the level is played for the first time. Nothing scrolls while one plays; the
  task is in the address (`#task-3`). The start page has a big Start (or Continue) button.
* The worlds are a map (instead of the list in the table of contents; ☰ on phones): a circle per
  world with its levels solved, lines from the worlds it builds on.
* On phones the tool bar is one row at the bottom (a symbol over a short word), and Tips
  and Lean are sheets over the board, which scroll.
* Tasks come one after another; the ones not yet playable are shown greyed out (⚙ in the header
  switches this off).
* Solved tasks marked `(lemma := true)` become lemmas, offered only in the tasks after them (no circles): in the menu of ＋, “Lemmas from solved tasks” offers each solved task as a
  block of its own (assumptions as inputs, goals as outputs, `?1`, `?2` for the statements). In the
  Lean proof, a lemma is a `theorem` that the proof applies.
* Tactic trainer: a page of its own (from the start page and below the world map), ten lessons
  always played in the tactic mode (`(tactics := true)`), each on one tactic (exact, constructor,
  obtain, intro, apply, left/right, obtain on ∨, exfalso, by_contra).
* A tapped goal shows, below the board, what one has there, as Lean shows it
  (`h₁ : A ∨ B   h₃ : B ⊢ B ∨ A`); what cannot be used there is dimmed.
* Bugs are hunted with fuzzers, with Lean as the referee (`docs/fuzzing.md`).
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
