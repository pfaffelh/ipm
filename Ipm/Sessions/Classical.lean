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

#doc (Manual) "Session 5: Classical Logic" =>

One more rule, which is different from all the others: it has no input.

* *Tertium non datur* (TND, “a third is not given”, the law of the excluded middle): for every
  statement `A`, you may use `A ∨ (A → ⊥)`, “`A` is true or it is false”.

With the rules so far, this cannot be proved. Logic without it is called *intuitionistic*, logic
with it *classical*. In Lean, TND is `Classical.em`; Lean's proofs then use classical logic.
Usually you use TND together with ∨E: “Either `A` holds, or it does not. In the first case …”

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (conclusions := "A ∨ (A → ⊥)") (assumptions := "")
Just the new rule.

```lean -show
example (A : Prop) : A ∨ (A → False) := Classical.em A
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "(B → ⊥) → A → ⊥") (conclusions := "A → B")
The converse of task 7 of the previous session. Distinguish the cases `B` and `B → ⊥`.

```lean -show
example (A B : Prop) (h : (B → False) → A → False) : A → B :=
  fun a => (Classical.em B).elim (fun b => b) (fun nb => (h nb a).elim)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "A ∧ B → ⊥") (conclusions := "(A → ⊥) ∨ (B → ⊥)")
If not both are true, then one of them is false.

```lean -show
example (A B : Prop) (h : A ∧ B → False) : (A → False) ∨ (B → False) :=
  (Classical.em A).elim (fun a => Or.inr (fun b => h ⟨a, b⟩)) (fun na => Or.inl na)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "(A → ⊥) → ⊥") (conclusions := "A")
Double negation: if `A` is not false, it is true.

```lean -show
example (A : Prop) (h : (A → False) → False) : A :=
  (Classical.em A).elim (fun a => a) (fun na => (h na).elim)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "A → B") (conclusions := "(A → ⊥) ∨ B")
An implication as an “or”.

```lean -show
example (A B : Prop) (f : A → B) : (A → False) ∨ B :=
  (Classical.em A).elim (fun a => Or.inr (f a)) (fun na => Or.inl na)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "A → B, B → C") (conclusions := "(A → ⊥) ∨ C")
Two implications.

```lean -show
example (A B C : Prop) (f : A → B) (g : B → C) : (A → False) ∨ C :=
  (Classical.em A).elim (fun a => Or.inr (g (f a))) (fun na => Or.inl na)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (conclusions := "((A → B) → A) → A") (assumptions := "")
Peirce's law: no `⊥` in it, and still it needs TND.

```lean -show
example (A B : Prop) : ((A → B) → A) → A :=
  fun h => (Classical.em A).elim (fun a => a) (fun na => h (fun a => (na a).elim))
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "A ∧ B ∧ C → ⊥") (conclusions := "(A → ⊥) ∨ (B → ⊥) ∨ (C → ⊥)")
Task 3, with three parts.

```lean -show
example (A B C : Prop) (h : A ∧ B ∧ C → False) : (A → False) ∨ (B → False) ∨ (C → False) :=
  (Classical.em A).elim
    (fun a => (Classical.em B).elim (fun b => Or.inr (Or.inr (fun c => h ⟨a, b, c⟩)))
      (fun nb => Or.inr (Or.inl nb)))
    (fun na => Or.inl na)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "(A → B) → ⊥") (conclusions := "A ∧ (B → ⊥)")
The final task: if the implication is false, then `A` is true and `B` is false.

```lean -show
example (A B : Prop) (h : (A → B) → False) : A ∧ (B → False) :=
  ⟨(Classical.em A).elim (fun a => a) (fun na => (h (fun a => (na a).elim)).elim), fun b => h (fun _ => b)⟩
```
::::
