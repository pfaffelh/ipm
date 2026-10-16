import VersoManual
import Ipm.Task

open Verso.Genre Manual
open Ipm
open Verso.Genre.Manual.InlineLean

/-
Session 2 of the Incredible Proof Machine (https://incredible.pm, Joachim Breitner, MIT license):
implication. Lean's conventions: `→` groups to the right, so `A → B → C` is `A → (B → C)`.
Each task carries a Lean proof, checked when the site is built.
-/

#doc (Manual) "Session 2: Implication" =>

Two new rules, for implication:

* *→-elimination* (→E) uses `A → B` together with `A` to get `B`.
* *→-introduction* (→I) proves `A → B`. It gives you a *local hypothesis* `A` (the purple dot on
  top of the block), which you may use to prove the block's own input `B`. Everything that uses
  the hypothesis must lead back into that input; a dashed box shows this region. Using the
  hypothesis for anything outside the box is not allowed (⚠).

::::task (assumptions := "A, A → B") (conclusions := "B")
Your first →E: from `A → B` and `A` you get `B`.

```lean -show
example (A B : Prop) (a : A) (f : A → B) : B := f a
```
::::

::::task (assumptions := "A, A → B, B → C") (conclusions := "C")
Two steps.

```lean -show
example (A B C : Prop) (a : A) (f : A → B) (g : B → C) : C := g (f a)
```
::::

::::task (assumptions := "A, A → B, A → C, B → D, C → D") (conclusions := "D")
More assumptions than you need.

```lean -show
example (A B C D : Prop) (a : A) (f : A → B) (_ : A → C) (g : B → D) (_ : C → D) : D := g (f a)
```
::::

::::task (assumptions := "A, A → A") (conclusions := "A")
Is the implication needed at all?

```lean -show
example (A : Prop) (a : A) (_ : A → A) : A := a
```
::::

::::task (assumptions := "A → B, B → C") (conclusions := "A → C")
Your first →I. Add an →I block for the goal; then use its purple hypothesis `A`, and lead what
you get from it into the block's input.

```lean -show
example (A B C : Prop) (f : A → B) (g : B → C) : A → C := fun a => g (f a)
```
::::

::::task (assumptions := "A → B, A → B → C") (conclusions := "A → C")
The hypothesis `A` may be used more than once.

```lean -show
example (A B C : Prop) (f : A → B) (g : A → B → C) : A → C := fun a => g a (f a)
```
::::

::::task (conclusions := "A → A") (assumptions := "")
No assumptions at all.

```lean -show
example (A : Prop) : A → A := fun a => a
```
::::

::::task (assumptions := "A → C, B → C, A ∧ B") (conclusions := "C")
Combine ∧ and →.

```lean -show
example (A B C : Prop) (f : A → C) (_ : B → C) (h : A ∧ B) : C := f h.1
```
::::

::::task (assumptions := "A → C, B → C") (conclusions := "A ∧ B → C")
In Lean, `A ∧ B → C` means `(A ∧ B) → C`.

```lean -show
example (A B C : Prop) (f : A → C) (_ : B → C) : A ∧ B → C := fun h => f h.1
```
::::

::::task (assumptions := "B") (conclusions := "A → B")
The hypothesis need not be used.

```lean -show
example (A B : Prop) (b : B) : A → B := fun _ => b
```
::::

::::task (assumptions := "A ∧ B → C") (conclusions := "A → B → C")
Two →I blocks, one inside the other. `A → B → C` means `A → (B → C)`.

```lean -show
example (A B C : Prop) (f : A ∧ B → C) : A → B → C := fun a b => f ⟨a, b⟩
```
::::

::::task (assumptions := "A → B → C") (conclusions := "A ∧ B → C")
And back.

```lean -show
example (A B C : Prop) (f : A → B → C) : A ∧ B → C := fun h => f h.1 h.2
```
::::

::::task (assumptions := "(A → B) ∧ (A → C)") (conclusions := "A → B ∧ C")
Take apart, apply, put together.

```lean -show
example (A B C : Prop) (h : (A → B) ∧ (A → C)) : A → B ∧ C := fun a => ⟨h.1 a, h.2 a⟩
```
::::

::::task (assumptions := "A → A → B, (A → B) → A") (conclusions := "B")
The final task of the session.

```lean -show
example (A B : Prop) (f : A → A → B) (g : (A → B) → A) : B :=
  have h : A → B := fun a => f a a
  h (g h)
```
::::
