import VersoManual
import Ipm.Task

open Verso.Genre Manual
open Ipm
open Verso.Genre.Manual.InlineLean

/-
Session 5 of the Incredible Proof Machine (https://incredible.pm, Joachim Breitner, MIT license):
classical logic, with the law of the excluded middle. Each task carries a Lean proof, checked when
the site is built.
-/

#doc (Manual) "World 5: Classical Logic" =>

:::en
One more rule, which is different from all the others: it has no input.

* *Tertium non datur* (TND, “a third is not given”, the law of the excluded middle): for every
  statement `A`, you may use `A ∨ (A → ⊥)`, “`A` is true or it is false”.

With the rules so far, this cannot be proved. Logic without it is called *intuitionistic*, logic
with it *classical*. In Lean, TND is `Classical.em`; Lean's proofs then use classical logic.
Usually you use TND together with ∨E: “Either `A` holds, or it does not. In the first case …”
:::

:::de
Noch eine Regel, die anders ist als alle anderen: Sie hat keinen Eingang.

* *Tertium non datur* (TND, „ein Drittes gibt es nicht“, der Satz vom ausgeschlossenen Dritten):
  Für jede Aussage `A` darfst du `A ∨ (A → ⊥)` verwenden, „`A` ist wahr oder falsch“.

Mit den bisherigen Regeln lässt sich das nicht beweisen. Logik ohne diese Regel heißt
*intuitionistisch*, Logik mit ihr *klassisch*. In Lean heißt TND `Classical.em`; Leans Beweise
verwenden dann klassische Logik. Meist verwendest du TND zusammen mit ∨E: „Entweder gilt `A`, oder
nicht. Im ersten Fall …“
:::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (conclusions := "A ∨ (A → ⊥)") (assumptions := "")
:::en
Just the new rule.
:::

:::de
Nur die neue Regel.
:::

```lean -show
example (A : Prop) : A ∨ (A → False) := Classical.em A
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "(B → ⊥) → A → ⊥") (conclusions := "A → B")
:::en
The converse of level 7 of the previous world. Distinguish the cases `B` and `B → ⊥`.
:::

:::de
Die Umkehrung von Level 7 der letzten Welt. Unterscheide die Fälle `B` und `B → ⊥`.
:::

```lean -show
example (A B : Prop) (h : (B → False) → A → False) : A → B :=
  fun a => (Classical.em B).elim (fun b => b) (fun nb => (h nb a).elim)
```
::::

::::task (lemma := true) (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "A ∧ B → ⊥") (conclusions := "(A → ⊥) ∨ (B → ⊥)")
:::en
If not both are true, then one of them is false.
:::

:::de
Wenn nicht beide wahr sind, ist eine von beiden falsch.
:::

```lean -show
example (A B : Prop) (h : A ∧ B → False) : (A → False) ∨ (B → False) :=
  (Classical.em A).elim (fun a => Or.inr (fun b => h ⟨a, b⟩)) (fun na => Or.inl na)
```
::::

::::task (lemma := true) (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "(A → ⊥) → ⊥") (conclusions := "A")
:::en
Double negation: if `A` is not false, it is true.
:::

:::de
Doppelte Negation: Wenn `A` nicht falsch ist, ist es wahr.
:::

```lean -show
example (A : Prop) (h : (A → False) → False) : A :=
  (Classical.em A).elim (fun a => a) (fun na => (h na).elim)
```
::::

::::task (lemma := true) (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "A → B") (conclusions := "(A → ⊥) ∨ B")
:::en
An implication as an “or”.
:::

:::de
Eine Implikation als „oder“.
:::

```lean -show
example (A B : Prop) (f : A → B) : (A → False) ∨ B :=
  (Classical.em A).elim (fun a => Or.inr (f a)) (fun na => Or.inl na)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "A → B, B → C") (conclusions := "(A → ⊥) ∨ C")
:::en
Two implications.
:::

:::de
Zwei Implikationen.
:::

```lean -show
example (A B C : Prop) (f : A → B) (g : B → C) : (A → False) ∨ C :=
  (Classical.em A).elim (fun a => Or.inr (g (f a))) (fun na => Or.inl na)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (conclusions := "((A → B) → A) → A") (assumptions := "")
:::en
Peirce's law: no `⊥` in it, and still it needs TND.
:::

:::de
Das Gesetz von Peirce: kein `⊥` darin, und trotzdem braucht es TND.
:::

```lean -show
example (A B : Prop) : ((A → B) → A) → A :=
  fun h => (Classical.em A).elim (fun a => a) (fun na => h (fun a => (na a).elim))
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "A ∧ B ∧ C → ⊥") (conclusions := "(A → ⊥) ∨ (B → ⊥) ∨ (C → ⊥)")
:::en
Level 3, with three parts.
:::

:::de
Level 3, mit drei Teilen.
:::

```lean -show
example (A B C : Prop) (h : A ∧ B ∧ C → False) : (A → False) ∨ (B → False) ∨ (C → False) :=
  (Classical.em A).elim
    (fun a => (Classical.em B).elim (fun b => Or.inr (Or.inr (fun c => h ⟨a, b, c⟩)))
      (fun nb => Or.inr (Or.inl nb)))
    (fun na => Or.inl na)
```
::::

::::task (lemma := true) (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "(A → B) → ⊥") (conclusions := "A ∧ (B → ⊥)")
:::en
The final level: if the implication is false, then `A` is true and `B` is false.
:::

:::de
Das letzte Level: Wenn die Implikation falsch ist, ist `A` wahr und `B` falsch.
:::

```lean -show
example (A B : Prop) (h : (A → B) → False) : A ∧ (B → False) :=
  ⟨(Classical.em A).elim (fun a => a) (fun na => (h (fun a => (na a).elim)).elim), fun b => h (fun _ => b)⟩
```
::::
