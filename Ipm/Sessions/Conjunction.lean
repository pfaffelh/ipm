import VersoManual
import Ipm.Task

open Verso.Genre Manual
open Ipm
open Verso.Genre.Manual.InlineLean

/-
Session 1 of the Incredible Proof Machine (https://incredible.pm, Joachim Breitner, MIT license),
with Lean's conventions: `∧` groups to the right, so the Proof Machine's `A∧B∧C` is `(A ∧ B) ∧ C`.
Each task carries a Lean proof, checked when the site is built.
-/

#doc (Manual) "Session 1: Conjunction" =>

Two rules, for conjunction (`∧`, “and”):

* *∧-introduction* (∧I) makes `A ∧ B` from `A` and `B`,
* *∧-elimination* (∧E) takes `A ∧ B` apart into `A` and `B`.

::::task (rules := "conjI, conjE") (assumptions := "A") (conclusions := "A")
Tap the red circle on top of the goal `A`; the assumption `A` glows green. Tap it.

```lean -show
example (A : Prop) (a : A) : A := a
```
::::

::::task (rules := "conjI, conjE") (assumptions := "A, B") (conclusions := "A")
Not every assumption has to be used.

```lean -show
example (A B : Prop) (a : A) (_ : B) : A := a
```
::::

::::task (rules := "conjI, conjE") (assumptions := "A, B") (conclusions := "B, A")
Two goals.

```lean -show
example (A B : Prop) (a : A) (b : B) : B ∧ A := ⟨b, a⟩
```
::::

::::task (rules := "conjI, conjE") (assumptions := "A, B") (conclusions := "A ∧ B")
Your first rule. Tap the red circle of the goal, unfold the list of rules below the picture and
add *∧I*. A new block appears: connect its output to the goal, then fill its two red circles.

```lean -show
example (A B : Prop) (a : A) (b : B) : A ∧ B := ⟨a, b⟩
```
::::

::::task (rules := "conjI, conjE") (assumptions := "A") (conclusions := "A ∧ A")
An assumption can be used more than once.

```lean -show
example (A : Prop) (a : A) : A ∧ A := ⟨a, a⟩
```
::::

::::task (rules := "conjI, conjE") (assumptions := "A ∧ B") (conclusions := "A")
Now take a conjunction apart. Add an *∧E* block from the list of rules, feed `A ∧ B` into it and
connect the right one of its outputs to the goal.

```lean -show
example (A B : Prop) (h : A ∧ B) : A := h.1
```
::::

::::task (rules := "conjI, conjE") (assumptions := "A ∧ B") (conclusions := "A, B")
One ∧-elimination gives both parts.

```lean -show
example (A B : Prop) (h : A ∧ B) : A ∧ B := ⟨h.1, h.2⟩
```
::::

::::task (rules := "conjI, conjE") (assumptions := "A ∧ B") (conclusions := "A ∧ B")
The shortest way is the best.

```lean -show
example (A B : Prop) (h : A ∧ B) : A ∧ B := h
```
::::

::::task (rules := "conjI, conjE") (assumptions := "A ∧ B") (conclusions := "B ∧ A")
Take apart, then put together again.

```lean -show
example (A B : Prop) (h : A ∧ B) : B ∧ A := ⟨h.2, h.1⟩
```
::::

::::task (rules := "conjI, conjE") (assumptions := "(A ∧ B) ∧ C") (conclusions := "A, B, C")
Three goals from one assumption.

```lean -show
example (A B C : Prop) (h : (A ∧ B) ∧ C) : A ∧ B ∧ C := ⟨h.1.1, h.1.2, h.2⟩
```
::::

::::task (rules := "conjI, conjE") (assumptions := "(A ∧ B) ∧ C") (conclusions := "A ∧ C")
Pick the parts you need.

```lean -show
example (A B C : Prop) (h : (A ∧ B) ∧ C) : A ∧ C := ⟨h.1.1, h.2⟩
```
::::

::::task (rules := "conjI, conjE") (assumptions := "(A ∧ B) ∧ C") (conclusions := "A ∧ B ∧ C")
Regroup. In Lean, `A ∧ B ∧ C` means `A ∧ (B ∧ C)`.

```lean -show
example (A B C : Prop) (h : (A ∧ B) ∧ C) : A ∧ B ∧ C := ⟨h.1.1, h.1.2, h.2⟩
```
::::
