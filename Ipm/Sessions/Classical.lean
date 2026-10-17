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

::::task (unlocks := "by_cases") (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (conclusions := "A ∨ (A → ⊥)") (assumptions := "")
:::en
Just the new rule.
:::

:::de
Nur die neue Regel.
:::


:::tip (rules := "TND")
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

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (lemma := true) (assumptions := "A ∧ B → ⊥") (conclusions := "(A → ⊥) ∨ (B → ⊥)")
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

::::task (unlocks := "by_contra") (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (lemma := true) (assumptions := "(A → ⊥) → ⊥") (conclusions := "A")
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

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa") (lemma := true) (assumptions := "A → B") (conclusions := "(A → ⊥) ∨ B")
:::en
An implication as an “or”.
:::

:::de
Eine Implikation als „oder“.
:::


:::tip (lang := "en") (rules := "raa")
New: a proof by contradiction (RAA, in Lean `by_contra h`). To prove `A`, assume `A → ⊥` (the purple
hypothesis) and derive `⊥`. It is what you just proved by hand with TND: from `(A → ⊥) → ⊥`
follows `A`.
:::

:::tip (lang := "de")
Neu: ein Widerspruchsbeweis (RAA, in Lean `by_contra h`). Um `A` zu beweisen, nimm `A → ⊥` an (die lila
Annahme) und leite `⊥` her. Das ist, was du gerade von Hand mit TND bewiesen hast: Aus `(A → ⊥) → ⊥`
folgt `A`.
:::

```lean -show
example (A B : Prop) (f : A → B) : (A → False) ∨ B :=
  (Classical.em A).elim (fun a => Or.inr (f a)) (fun na => Or.inl na)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa") (assumptions := "A → B, B → C") (conclusions := "(A → ⊥) ∨ C")
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

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa") (conclusions := "((A → B) → A) → A") (assumptions := "")
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

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa") (assumptions := "A ∧ B ∧ C → ⊥") (conclusions := "(A → ⊥) ∨ (B → ⊥) ∨ (C → ⊥)")
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

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa") (assumptions := "P → Q, (P → ⊥) → Q") (conclusions := "Q")
:::en
Sheet 01-e. Classical: distinguish the cases `P` and `¬P`.
:::

:::de
Blatt 01-e. Klassisch: Unterscheide die Fälle `P` und `¬P`.
:::

```lean -show
example (P Q : Prop) (f : P → Q) (g : (P → False) → Q) : Q := (Classical.em P).elim f g
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa") (assumptions := "") (conclusions := "((P → ⊥) → P) → P")
:::en
A statement that follows from its own negation holds.
:::

:::de
Eine Aussage, die aus ihrer eigenen Negation folgt, gilt.
:::

```lean -show
example (P : Prop) : ((P → False) → P) → P := fun h => (Classical.em P).elim (fun p => p) (fun np => h np)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa") (assumptions := "P → Q") (conclusions := "Q ∨ (P → ⊥)")
:::en
An implication as a disjunction.
:::

:::de
Eine Implikation als Disjunktion.
:::

```lean -show
example (P Q : Prop) (f : P → Q) : Q ∨ (P → False) := (Classical.em P).elim (fun p => Or.inl (f p)) Or.inr
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa") (assumptions := "") (conclusions := "(P → Q) ∨ (Q → P)")
:::en
The final level: one of the two implications always holds. Distinguish the cases for `Q`.
:::

:::de
Das letzte Level: Eine der beiden Implikationen gilt immer. Unterscheide die Fälle für `Q`.
:::

```lean -show
example (P Q : Prop) : (P → Q) ∨ (Q → P) :=
  (Classical.em Q).elim (fun q => Or.inl (fun _ => q)) (fun nq => Or.inr (fun q => (nq q).elim))
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa") (lemma := true) (assumptions := "(A → B) → ⊥") (conclusions := "A ∧ (B → ⊥)")
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
