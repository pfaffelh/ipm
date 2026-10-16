import VersoManual
import Ipm.Task

open Verso.Genre Manual
open Ipm
open Verso.Genre.Manual.InlineLean

/-
Session 4 of the Incredible Proof Machine (https://incredible.pm, Joachim Breitner, MIT license):
falsity and negation. `⊥` is Lean's `False`, and `A → ⊥` is Lean's `¬A`.
Each task carries a Lean proof, checked when the site is built.
-/

#doc (Manual) "Session 4: Falsity and Negation" =>

The statement `⊥` (“falsity”) can never be true; in Lean it is called `False`. One new rule:

* *⊥-elimination* (⊥E): from `⊥` you may conclude anything. (In Lean: `False.elim`.)

There is no extra rule for negation: “not `A`” is written `A → ⊥`, “from `A` follows something
impossible”. Lean writes `¬A` for it, and `¬A` really is defined as `A → False`. So to prove
`A → ⊥` you use →I, and `A → ⊥` together with `A` gives `⊥` by →E.

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "⊥") (conclusions := "A")
From something impossible, anything follows.

```lean -show
example (A : Prop) (h : False) : A := h.elim
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "⊥") (conclusions := "A, B")
Two goals, one assumption.

```lean -show
example (A B : Prop) (h : False) : A ∧ B := ⟨h.elim, h.elim⟩
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "A") (conclusions := "⊥ ∨ A")
An “or” with something impossible.

```lean -show
example (A : Prop) (a : A) : False ∨ A := Or.inr a
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "⊥ ∨ A") (conclusions := "A")
And back: one of the two cases cannot happen.

```lean -show
example (A : Prop) (h : False ∨ A) : A := h.elim (fun f => f.elim) (fun a => a)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "⊥ ∧ A") (conclusions := "⊥")
No new rule needed.

```lean -show
example (A : Prop) (h : False ∧ A) : False := h.1
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (conclusions := "⊥ → A") (assumptions := "")
No assumptions at all.

```lean -show
example (A : Prop) : False → A := fun f => f.elim
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "A → B") (conclusions := "(B → ⊥) → A → ⊥")
If `A` implies `B`, then “not `B`” implies “not `A`”. Here `(B → ⊥) → A → ⊥` means
`(B → ⊥) → (A → ⊥)`.

```lean -show
example (A B : Prop) (f : A → B) : (B → False) → A → False := fun nb a => nb (f a)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "A ∨ B → ⊥") (conclusions := "(A → ⊥) ∧ (B → ⊥)")
If neither `A` nor `B` …

```lean -show
example (A B : Prop) (h : A ∨ B → False) : (A → False) ∧ (B → False) :=
  ⟨fun a => h (Or.inl a), fun b => h (Or.inr b)⟩
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "(A → ⊥) ∧ (B → ⊥)") (conclusions := "A ∨ B → ⊥")
… and back.

```lean -show
example (A B : Prop) (h : (A → False) ∧ (B → False)) : A ∨ B → False :=
  fun hab => hab.elim h.1 h.2
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "(A → ⊥) ∨ (B → ⊥)") (conclusions := "A ∧ B → ⊥")
If one of the two is false, then not both are true.

```lean -show
example (A B : Prop) (h : (A → False) ∨ (B → False)) : A ∧ B → False :=
  fun ab => h.elim (fun na => na ab.1) (fun nb => nb ab.2)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "((A → ⊥) → ⊥) → ⊥") (conclusions := "A → ⊥")
Three negations are as good as one.

```lean -show
example (A : Prop) (h : ((A → False) → False) → False) : A → False :=
  fun a => h (fun na => na a)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "(A → ⊥) ∨ B") (conclusions := "A → B")
Case by case.

```lean -show
example (A B : Prop) (h : (A → False) ∨ B) : A → B :=
  fun a => h.elim (fun na => (na a).elim) (fun b => b)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "A → ⊥, B → A") (conclusions := "B → ⊥")
Chain the implications.

```lean -show
example (A B : Prop) (na : A → False) (f : B → A) : B → False := fun b => na (f b)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "(A → ⊥) ∨ (B → ⊥) ∨ (C → ⊥)") (conclusions := "A ∧ B ∧ C → ⊥")
Three cases this time.

```lean -show
example (A B C : Prop) (h : (A → False) ∨ (B → False) ∨ (C → False)) : A ∧ B ∧ C → False :=
  fun abc => h.elim (fun na => na abc.1) (fun h => h.elim (fun nb => nb abc.2.1) (fun nc => nc abc.2.2))
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (conclusions := "(A ∨ (A → ⊥) → ⊥) → ⊥") (assumptions := "")
The final task of the session: it is impossible that both `A` and “not `A`” are false. Note
`A ∨ (A → ⊥) → ⊥` means `(A ∨ (A → ⊥)) → ⊥`.

```lean -show
example (A : Prop) : (A ∨ (A → False) → False) → False :=
  fun h => h (Or.inr (fun a => h (Or.inl a)))
```
::::
