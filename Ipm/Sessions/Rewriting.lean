import VersoManual
import Ipm.Task

open Verso.Genre Manual
open Ipm
open Verso.Genre.Manual.InlineLean

/-
Rewriting with ↔, as Lean's `rw` does: equivalent statements may replace each other. Not part of the
Incredible Proof Machine; it stays with statements (Prop), before objects come with the quantifiers.
Each task carries a Lean proof, checked when the site is built.
-/

#doc (Manual) "World 7: Rewriting" =>

:::en
Equivalent statements may replace each other: from `A ↔ B`, a statement with `A` in it is equivalent
to the same statement with `B` there. In Lean this is `rw`. Four new blocks:

* *↔rfl*: `A ↔ A`.
* *↔sym*: from `A ↔ B`, `B ↔ A`.
* *rw*: from `A ↔ B` and a statement with `B` (`?3 ?2`), the same statement with `A` (`?3 ?1`). `?3` is
  the goal with a hole: the block finds it when you connect it to a goal.
* *rw←*: the same backwards, from a statement with `A`, the one with `B`.
:::

:::de
Äquivalente Aussagen dürfen einander ersetzen: Aus `A ↔ B` folgt, dass eine Aussage mit `A` darin
äquivalent ist zu derselben Aussage mit `B` an dieser Stelle. In Lean ist das `rw`. Vier neue Bausteine:

* *↔rfl*: `A ↔ A`.
* *↔sym*: aus `A ↔ B` folgt `B ↔ A`.
* *rw*: aus `A ↔ B` und einer Aussage mit `B` (`?3 ?2`) dieselbe Aussage mit `A` (`?3 ?1`). `?3` ist das
  Ziel mit einem Loch: Der Baustein findet es, wenn du ihn mit einem Ziel verbindest.
* *rw←*: dasselbe rückwärts, aus einer Aussage mit `A` die mit `B`.
:::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI, refl, symm, rw, rwr") (assumptions := "") (conclusions := "A ↔ A")
:::en
A statement is equivalent to itself: `rfl`. In world 6 this took ↔I (in Lean `constructor`) and two →I.
:::

:::de
Eine Aussage ist zu sich selbst äquivalent: `rfl`. In Welt 6 brauchte das noch ↔I (in Lean `constructor`) und zwei →I.
:::

:::tip (lang := "en") (rules := "refl")
*rfl* (↔rfl): `A ↔ A`, for any statement `A`.
:::

:::tip (lang := "de") (rules := "refl")
*rfl* (↔rfl): `A ↔ A`, für jede Aussage `A`.
:::

```lean -show
example (A : Prop) : A ↔ A := by
  rfl
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI, refl, symm, rw, rwr") (assumptions := "A ↔ B") (conclusions := "B ↔ A")
:::en
Turn it round: `symm`.
:::

:::de
Umdrehen: `symm`.
:::

:::tip (lang := "en") (rules := "symm")
*symm* (↔sym): from `A ↔ B`, `B ↔ A`. For a goal `B ↔ A` it leaves the goal `A ↔ B`.
:::

:::tip (lang := "de") (rules := "symm")
*symm* (↔sym): aus `A ↔ B` folgt `B ↔ A`. Bei einem Ziel `B ↔ A` bleibt das Ziel `A ↔ B`.
:::

```lean -show
example (A B : Prop) (h : A ↔ B) : B ↔ A := by
  symm
  exact h
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI, refl, symm, rw, rwr") (assumptions := "A ↔ B; B") (conclusions := "A")
:::en
Rewriting: equivalent statements may replace each other. `rw [h₁]` makes the goal `A` into `B`.
:::

:::de
Umschreiben: Äquivalente Aussagen dürfen einander ersetzen. `rw [h₁]` macht aus dem Ziel `A` das Ziel `B`.
:::

:::tip (lang := "en") (rules := "rw")
`rw [h]` (rw), for `h : A ↔ B`: in the goal, every `A` becomes `B`. As a block: from `A ↔ B` and the statement with `B` (`?3 ?2`), the statement with `A` (`?3 ?1`); `?3` is the goal with a hole.
:::

:::tip (lang := "de") (rules := "rw")
`rw [h]` (rw), für `h : A ↔ B`: Im Ziel wird jedes `A` zu `B`. Als Baustein: aus `A ↔ B` und der Aussage mit `B` (`?3 ?2`) die Aussage mit `A` (`?3 ?1`); `?3` ist das Ziel mit einem Loch.
:::

```lean -show
example (A B : Prop) (h : A ↔ B) (b : B) : A := by
  rw [h]
  exact b
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI, refl, symm, rw, rwr") (assumptions := "A ↔ B; A") (conclusions := "B")
:::en
Backwards: `rw [← h₁]` makes every `B` into `A`.
:::

:::de
Rückwärts: `rw [← h₁]` macht aus jedem `B` ein `A`.
:::

:::tip (lang := "en") (rules := "rwr")
`rw [← h]` (rw←), for `h : A ↔ B`: in the goal, every `B` becomes `A`.
:::

:::tip (lang := "de") (rules := "rwr")
`rw [← h]` (rw←), für `h : A ↔ B`: Im Ziel wird jedes `B` zu `A`.
:::

```lean -show
example (A B : Prop) (h : A ↔ B) (a : A) : B := by
  rw [← h]
  exact a
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI, refl, symm, rw, rwr") (assumptions := "A ↔ B") (conclusions := "A ∧ C ↔ B ∧ C")
:::en
`rw` also works inside a statement. A goal that becomes `X ↔ X` is done at once.
:::

:::de
`rw` wirkt auch innerhalb einer Aussage. Ein Ziel, das dabei zu `X ↔ X` wird, ist sofort erledigt.
:::

```lean -show
example (A B C : Prop) (h : A ↔ B) : A ∧ C ↔ B ∧ C := by
  rw [h]
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI, refl, symm, rw, rwr") (assumptions := "A ↔ B") (conclusions := "(C → A) ↔ (C → B)")
:::en
The same behind an implication.
:::

:::de
Dasselbe hinter einer Implikation.
:::

```lean -show
example (A B C : Prop) (h : A ↔ B) : (C → A) ↔ (C → B) := by
  rw [h]
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI, refl, symm, rw, rwr") (lemma := true) (assumptions := "A ↔ B; B ↔ C") (conclusions := "A ↔ C")
:::en
Two steps: rewrite, then what is left.
:::

:::de
Zwei Schritte: umschreiben, dann den Rest.
:::

```lean -show
example (A B C : Prop) (h₁ : A ↔ B) (h₂ : B ↔ C) : A ↔ C := by
  rw [h₁]
  exact h₂
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI, refl, symm, rw, rwr") (assumptions := "A ↔ B; C ∨ A") (conclusions := "C ∨ B")
:::en
Make the goal fit what you have.
:::

:::de
Bring das Ziel in die Form dessen, was du hast.
:::

```lean -show
example (A B C : Prop) (h₁ : A ↔ B) (h₂ : C ∨ A) : C ∨ B := by
  rw [← h₁]
  exact h₂
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI, refl, symm, rw, rwr") (assumptions := "A ↔ B") (conclusions := "(A → ⊥) ↔ (B → ⊥)")
:::en
Equivalent statements have equivalent negations.
:::

:::de
Äquivalente Aussagen haben äquivalente Verneinungen.
:::

```lean -show
example (A B : Prop) (h : A ↔ B) : (A → False) ↔ (B → False) := by
  rw [h]
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI, refl, symm, rw, rwr") (assumptions := "A ↔ B; B ↔ C; C ↔ D") (conclusions := "A ↔ D")
:::en
A chain of equivalences.
:::

:::de
Eine Kette von Äquivalenzen.
:::

```lean -show
example (A B C D : Prop) (h₁ : A ↔ B) (h₂ : B ↔ C) (h₃ : C ↔ D) : A ↔ D := by
  rw [h₁, h₂]
  exact h₃
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI, refl, symm, rw, rwr") (assumptions := "A ↔ B ∧ C; B; C") (conclusions := "A")
:::en
After the rewriting, the goal is a conjunction.
:::

:::de
Nach dem Umschreiben ist das Ziel eine Konjunktion.
:::

```lean -show
example (A B C : Prop) (h₁ : A ↔ B ∧ C) (h₂ : B) (h₃ : C) : A := by
  rw [h₁]
  exact ⟨h₂, h₃⟩
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI, refl, symm, rw, rwr") (assumptions := "A ↔ B; (A → C) ∧ (C → A)") (conclusions := "(B → C) ∧ (C → B)")
:::en
Every `B` at once.
:::

:::de
Jedes `B` auf einmal.
:::

```lean -show
example (A B C : Prop) (h₁ : A ↔ B) (h₂ : (A → C) ∧ (C → A)) : (B → C) ∧ (C → B) := by
  rw [← h₁]
  exact h₂
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI, refl, symm, rw, rwr") (assumptions := "A ↔ B") (conclusions := "A ∨ (A → ⊥) ↔ B ∨ (B → ⊥)")
:::en
The final level: one rewriting replaces every `A`.
:::

:::de
Das letzte Level: Ein Umschreiben ersetzt jedes `A`.
:::

```lean -show
example (A B : Prop) (h : A ↔ B) : A ∨ (A → False) ↔ B ∨ (B → False) := by
  rw [h]
```
::::
