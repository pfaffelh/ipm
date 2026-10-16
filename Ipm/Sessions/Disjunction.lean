import VersoManual
import Ipm.Task

open Verso.Genre Manual
open Ipm
open Verso.Genre.Manual.InlineLean

/-
Session 3 of the Incredible Proof Machine (https://incredible.pm, Joachim Breitner, MIT license):
disjunction. Lean's conventions: `∨` groups to the right, so `A ∨ B ∨ C` is `A ∨ (B ∨ C)`.
Each task carries a Lean proof, checked when the site is built.
-/

#doc (Manual) "Session 3: Disjunction" =>

Three new rules, for disjunction (`∨`, “or”):

* *∨-introduction* comes in two forms: ∨I₁ makes `A ∨ B` from `A`, ∨I₂ makes `A ∨ B` from `B`.
* *∨-elimination* (∨E) is a case distinction. From `A ∨ B` you may conclude `C` if you can prove `C`
  twice: once using the local hypothesis `A`, once using `B`. Each hypothesis (a blue dot with a
  purple ring) sits next to the input it belongs to, and may only be used to prove that input.

In Lean, ∨I₁ and ∨I₂ are `Or.inl` and `Or.inr`, and ∨E is `Or.elim`.

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "A, B") (conclusions := "A ∨ B")
Your first `∨`. One of the two assumptions is enough.

```lean -show
example (A B : Prop) (a : A) (_ : B) : A ∨ B := Or.inl a
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "A") (conclusions := "A ∨ B")
`B` need not be true at all.

```lean -show
example (A B : Prop) (a : A) : A ∨ B := Or.inl a
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "B") (conclusions := "A ∨ B")
And from the other side.

```lean -show
example (A B : Prop) (b : B) : A ∨ B := Or.inr b
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "A") (conclusions := "A ∨ A")
Either way.

```lean -show
example (A : Prop) (a : A) : A ∨ A := Or.inl a
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "A ∨ B") (conclusions := "B ∨ A")
Your first ∨E: prove `B ∨ A` in the case `A` and in the case `B`.

```lean -show
example (A B : Prop) (h : A ∨ B) : B ∨ A := h.elim (fun a => Or.inr a) (fun b => Or.inl b)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "A ∨ B ∨ C") (conclusions := "(A ∨ B) ∨ C")
`A ∨ B ∨ C` means `A ∨ (B ∨ C)`. One case distinction inside another.

```lean -show
example (A B C : Prop) (h : A ∨ B ∨ C) : (A ∨ B) ∨ C :=
  h.elim (fun a => Or.inl (Or.inl a)) (fun h => h.elim (fun b => Or.inl (Or.inr b)) (fun c => Or.inr c))
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "A ∧ B") (conclusions := "A ∨ B")
“And” is stronger than “or”.

```lean -show
example (A B : Prop) (h : A ∧ B) : A ∨ B := Or.inl h.1
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "A ∧ B ∨ C") (conclusions := "(A ∨ C) ∧ (B ∨ C)")
In Lean, `∧` binds more strongly than `∨`: `A ∧ B ∨ C` is `(A ∧ B) ∨ C`.

```lean -show
example (A B C : Prop) (h : A ∧ B ∨ C) : (A ∨ C) ∧ (B ∨ C) :=
  h.elim (fun ab => ⟨Or.inl ab.1, Or.inl ab.2⟩) (fun c => ⟨Or.inr c, Or.inr c⟩)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "(A ∨ B) ∧ C") (conclusions := "A ∧ C ∨ B ∧ C")
Distribute `C`.

```lean -show
example (A B C : Prop) (h : (A ∨ B) ∧ C) : A ∧ C ∨ B ∧ C :=
  h.1.elim (fun a => Or.inl ⟨a, h.2⟩) (fun b => Or.inr ⟨b, h.2⟩)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "(A → C) ∧ (B → C)") (conclusions := "A ∨ B → C")
`A ∨ B → C` means `(A ∨ B) → C`.

```lean -show
example (A B C : Prop) (h : (A → C) ∧ (B → C)) : A ∨ B → C :=
  fun hab => hab.elim h.1 h.2
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "A ∨ B → C") (conclusions := "(A → C) ∧ (B → C)")
And back.

```lean -show
example (A B C : Prop) (h : A ∨ B → C) : (A → C) ∧ (B → C) :=
  ⟨fun a => h (Or.inl a), fun b => h (Or.inr b)⟩
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "(A → B) ∨ (A → C)") (conclusions := "A → B ∨ C")
The final task of the session.

```lean -show
example (A B C : Prop) (h : (A → B) ∨ (A → C)) : A → B ∨ C :=
  fun a => h.elim (fun f => Or.inl (f a)) (fun g => Or.inr (g a))
```
::::
