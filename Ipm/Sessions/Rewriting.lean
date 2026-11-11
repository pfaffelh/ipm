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
Equivalent statements may replace each other: from `?1 ↔ ?2`, a statement with `?1` in it is equivalent
to the same statement with `?2` there. Four new blocks:

* *↔rfl*: `?1 ↔ ?1`.
* *↔sym*: from `?1 ↔ ?2`, `?2 ↔ ?1`.
* *rw*: from `?1 ↔ ?2` and a statement with `?2` (`?3 ?2`), the same statement with `?1` (`?3 ?1`). `?3` is
  the goal with a hole: the block finds it when you connect it to a goal.
* *rw←*: the same backwards, from a statement with `?1`, the one with `?2`.
:::

:::de
Äquivalente Aussagen dürfen einander ersetzen: Aus `?1 ↔ ?2` folgt, dass eine Aussage mit `?1` darin
äquivalent ist zu derselben Aussage mit `?2` an dieser Stelle. Vier neue Bausteine:

* *↔rfl*: `?1 ↔ ?1`.
* *↔sym*: aus `?1 ↔ ?2` folgt `?2 ↔ ?1`.
* *rw*: aus `?1 ↔ ?2` und einer Aussage mit `?2` (`?3 ?2`) dieselbe Aussage mit `?1` (`?3 ?1`). `?3` ist das
  Ziel mit einem Loch: Der Baustein findet es, wenn du ihn mit einem Ziel verbindest.
* *rw←*: dasselbe rückwärts, aus einer Aussage mit `?1` die mit `?2`.
:::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI, refl, symm, rw, rwr") (assumptions := "") (conclusions := "A ↔ A")
:::en
A statement is equivalent to itself: ↔rfl. In world 6 this took ↔I and two →I.
:::

:::de
Eine Aussage ist zu sich selbst äquivalent: ↔rfl. In Welt 6 brauchte das noch ↔I und zwei →I.
:::

:::tip (lang := "en") (rules := "refl")
*↔rfl*: `?1 ↔ ?1`, for any statement `?1`. In Lean: `Iff.rfl`.
:::

:::tip (lang := "de") (rules := "refl")
*↔rfl*: `?1 ↔ ?1`, für jede Aussage `?1`. In Lean: `Iff.rfl`.
:::

```lean -show
example (A : Prop) : A ↔ A := by
  rfl
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI, refl, symm, rw, rwr") (assumptions := "A ↔ B") (conclusions := "B ↔ A")
:::en
Turn it round: ↔sym.
:::

:::de
Umdrehen: ↔sym.
:::

:::tip (lang := "en") (rules := "symm")
*↔sym*: from `?1 ↔ ?2`, `?2 ↔ ?1`. In Lean: `Iff.symm`.
:::

:::tip (lang := "de") (rules := "symm")
*↔sym*: aus `?1 ↔ ?2` folgt `?2 ↔ ?1`. In Lean: `Iff.symm`.
:::

```lean -show
example (A B : Prop) (h : A ↔ B) : B ↔ A := by
  symm
  exact h
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI, refl, symm, rw, rwr") (assumptions := "A ↔ B; B") (conclusions := "A")
:::en
Rewriting: equivalent statements may replace each other. With rw, `A ↔ B` makes the goal `A` into `B`.
:::

:::de
Umschreiben: Äquivalente Aussagen dürfen einander ersetzen. Mit rw macht `A ↔ B` aus dem Ziel `A` das Ziel `B`.
:::

:::tip (lang := "en") (rules := "rw")
*rw*: from `?1 ↔ ?2` and the statement with `?2` (`?3 ?2`), the statement with `?1` (`?3 ?1`); `?3` is the goal with a hole.
:::

:::tip (lang := "de") (rules := "rw")
*rw*: aus `?1 ↔ ?2` und der Aussage mit `?2` (`?3 ?2`) die Aussage mit `?1` (`?3 ?1`); `?3` ist das Ziel mit einem Loch.
:::

```lean -show
example (A B : Prop) (h : A ↔ B) (b : B) : A := by
  rw [h]
  exact b
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI, refl, symm, rw, rwr") (assumptions := "A ↔ B; A") (conclusions := "B")
:::en
Backwards: With rw←, `A ↔ B` makes the goal `B` into `A`.
:::

:::de
Rückwärts: Mit rw← macht `A ↔ B` aus dem Ziel `B` das Ziel `A`.
:::

:::tip (lang := "en") (rules := "rwr")
*rw←*: from `?1 ↔ ?2` and the statement with `?1` (`?3 ?1`), the statement with `?2` (`?3 ?2`).
:::

:::tip (lang := "de") (rules := "rwr")
*rw←*: aus `?1 ↔ ?2` und der Aussage mit `?1` (`?3 ?1`) die Aussage mit `?2` (`?3 ?2`).
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
