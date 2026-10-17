import VersoManual
import Ipm.Task

open Verso.Genre Manual
open Ipm
open Verso.Genre.Manual.InlineLean

/-
Session 7 of the Incredible Proof Machine (https://incredible.pm, Joachim Breitner, MIT license):
two puzzles of predicate logic.
Each task carries a Lean proof, checked when the site is built.
-/

#doc (Manual) "World 8: Two Puzzles" =>

:::en
Two puzzles of predicate logic, with all the rules so far. Both need TND, and both need some
planning: think about the proof first, then build it.
:::

:::de
Zwei Rätsel der Prädikatenlogik, mit allen bisherigen Regeln. Beide brauchen TND, und beide brauchen
etwas Planung: Überlege dir den Beweis zuerst, dann baue ihn.
:::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, allI, allE, exI, exE") (assumptions := "") (conclusions := "∃ x, P x → ∀ y, P y")
:::en
The drinker paradox: in every pub there is someone such that, if they drink (`P`), everybody drinks. Classical, with TND.
:::

:::de
Das Trinker-Paradox: In jeder Kneipe gibt es jemanden, für den gilt: Wenn er trinkt (`P`), trinken alle. Klassisch, mit TND.
:::

```lean -show
example (α : Type) [Inhabited α] (P : α → Prop) : ∃ x, P x → ∀ y, P y :=
  (Classical.em (∀ y, P y)).elim (fun hall => ⟨default, fun _ => hall⟩)
    (fun hn => (Classical.em (∃ x, P x → False)).elim (fun ⟨x, nd⟩ => ⟨x, fun d => (nd d).elim⟩)
      (fun hne => (hn (fun x => (Classical.em (P x)).elim id (fun nd => (hne ⟨x, nd⟩).elim))).elim))
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, allI, allE, exI, exE") (assumptions := "∀ x, (R x → ⊥) → R (f x)") (conclusions := "∃ x, R x ∧ R (f (f x))")
:::en
The hardest level of the Proof Machine. Find an object `b` with `R b` first; then look at `R (f (f b))`.
:::

:::de
Das schwerste Level der Proof Machine. Finde zuerst ein Objekt `b` mit `R b`; dann schau dir `R (f (f b))` an.
:::

```lean -show
example (α : Type) [Inhabited α] (R : α → Prop) (f : α → α) (h : ∀ x, (R x → False) → R (f x)) :
    ∃ x, R x ∧ R (f (f x)) :=
  have hb : ∃ b, R b := (Classical.em (R default)).elim (fun r => ⟨default, r⟩) (fun nr => ⟨f default, h default nr⟩)
  hb.elim fun b rb => (Classical.em (R (f (f b)))).elim (fun r2 => ⟨b, rb, r2⟩)
    (fun nr2 => ⟨f b, (Classical.em (R (f b))).elim id (fun nr1 => (nr2 (h (f b) nr1)).elim), h (f (f b)) nr2⟩)
```
::::
