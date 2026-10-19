import VersoManual
import Ipm.Task

open Verso.Genre Manual
open Ipm
open Verso.Genre.Manual.InlineLean

/-
Session 7 of the Incredible Proof Machine (https://incredible.pm, Joachim Breitner, MIT license):
two puzzles of predicate logic, and one of Raymond Smullyan.
Each task carries a Lean proof, checked when the site is built.
-/

#doc (Manual) "World 9: Puzzles" =>

:::en
Three puzzles. All need classical logic, and all need some planning: think about the proof first,
then build it.
:::

:::de
Drei Rätsel. Alle brauchen klassische Logik, und alle brauchen etwas Planung: Überlege dir den
Beweis zuerst, dann baue ihn.
:::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, allI, allE, exI, exE") (assumptions := "") (conclusions := "∃ x, P x → ∀ y, P y")
:::en
The drinker paradox: in every pub there is someone such that, if they drink (`P`), everybody drinks. Classical, with TND.
The lemma of level 8.20 helps: from `(∀ x, P x) → ⊥` it gives `∃ x, P x → ⊥` (in Lean `push_neg`).
:::

:::de
Das Trinker-Paradox: In jeder Kneipe gibt es jemanden, für den gilt: Wenn er trinkt (`P`), trinken alle. Klassisch, mit TND.
Dabei hilft der Hilfssatz aus Level 8.20: Aus `(∀ x, P x) → ⊥` macht er `∃ x, P x → ⊥` (in Lean `push_neg`).
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

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "A ↔ (A → ⊥) ∧ (B → ⊥)") (conclusions := "(A → ⊥) ∧ B")
:::en
The final level, a puzzle of propositional logic by Raymond Smullyan. On an island, knights always tell the truth and
knaves always lie. A says: “We are both knaves.” Let `A` stand for “A is a knight” and `B` for “B is
a knight”. That A says it means: `A` holds exactly when what A says is true, `A ↔ (A → ⊥) ∧ (B → ⊥)`.
Show: A is a knave and B is a knight. First show `A → ⊥`.
:::

:::de
Das letzte Level, ein Rätsel der Aussagenlogik von Raymond Smullyan. Auf einer Insel sagen Ritter immer die Wahrheit,
und Schurken lügen immer. A sagt: „Wir sind beide Schurken.“ `A` steht für „A ist ein Ritter“, `B`
für „B ist ein Ritter“. Dass A das sagt, bedeutet: `A` gilt genau dann, wenn wahr ist, was A sagt,
`A ↔ (A → ⊥) ∧ (B → ⊥)`. Zeige: A ist ein Schurke und B ein Ritter. Zeige zuerst `A → ⊥`.
:::

```lean -show
example (A B : Prop) (h : A ↔ (A → False) ∧ (B → False)) : (A → False) ∧ B :=
  have na : A → False := fun a => (h.mp a).1 a
  ⟨na, (Classical.em B).elim id (fun nb => (na (h.mpr ⟨na, nb⟩)).elim)⟩
```
::::
