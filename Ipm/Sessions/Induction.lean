import VersoManual
import Ipm.Task

open Verso.Genre Manual
open Ipm
open Verso.Genre.Manual.InlineLean

/-
Induction over the natural numbers, a rule that the Incredible Proof Machine does not have.
Each task carries a Lean proof, checked when the site is built.
-/

#doc (Manual) "World 10: Induction" =>

:::en
Statements about natural numbers `0, 1, 2, …`, where `n + 1` is the number after `n`. One new rule:

* *Induction* (Ind): to prove `∀ n, ?1 n`, prove the start `?1 0`, and the step: `?1 (c₁ + 1)`
  from the hypothesis `?1 c₁`, for an arbitrary number `c₁` (an eigenvariable, as in ∀I). In Lean:
  `Nat.rec`, or the tactic `induction n`.

The levels have no arithmetic: properties like `P`, `Even`, `Odd` are only described by the
assumptions.
:::

:::de
Aussagen über natürliche Zahlen `0, 1, 2, …`, wobei `n + 1` die Zahl nach `n` ist. Eine neue Regel:

* *Induktion* (Ind): Um `∀ n, ?1 n` zu beweisen, beweise den Anfang `?1 0` und den Schritt:
  `?1 (c₁ + 1)` aus der Annahme `?1 c₁`, für eine beliebige Zahl `c₁` (eine Eigenvariable, wie bei
  ∀I). In Lean: `Nat.rec`, oder die Taktik `induction n`.

Die Levels enthalten keine Arithmetik: Eigenschaften wie `P`, `Even`, `Odd` sind nur durch die
Annahmen beschrieben.
:::

::::task (unlocks := "induction") (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, allI, allE, exI, exE, ind") (assumptions := "P 0; ∀ n, P n → P (n + 1)") (conclusions := "∀ n, P n")
:::en
The induction rule itself: connect the start and the step.
:::

:::de
Die Induktionsregel selbst: Verbinde den Anfang und den Schritt.
:::

```lean -show
example (P : Nat → Prop) (h0 : P 0) (hs : ∀ n, P n → P (n + 1)) : ∀ n, P n :=
  Nat.rec (motive := fun n => P n) h0 hs
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, allI, allE, exI, exE, ind") (assumptions := "∀ n, P n → P (n + 1)") (conclusions := "P 0 → ∀ n, P n")
:::en
The same, with the start as a hypothesis.
:::

:::de
Dasselbe, mit dem Anfang als Annahme.
:::

```lean -show
example (P : Nat → Prop) (hs : ∀ n, P n → P (n + 1)) : P 0 → ∀ n, P n :=
  fun h0 => Nat.rec (motive := fun n => P n) h0 hs
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, allI, allE, exI, exE, ind") (assumptions := "P (0 + 1); ∀ n, P n → P (n + 1)") (conclusions := "∀ n, P (n + 1)")
:::en
Induction for `P (n + 1)`: here the start is `P (0 + 1)`.
:::

:::de
Induktion für `P (n + 1)`: Hier ist der Anfang `P (0 + 1)`.
:::

```lean -show
example (P : Nat → Prop) (h1 : P (0 + 1)) (hs : ∀ n, P n → P (n + 1)) : ∀ n, P (n + 1) :=
  Nat.rec (motive := fun n => P (n + 1)) h1 (fun k ih => hs (k + 1) ih)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, allI, allE, exI, exE, ind") (assumptions := "Even 0; ∀ n, Even n → Odd (n + 1); ∀ n, Odd n → Even (n + 1)") (conclusions := "∀ n, Even n ∨ Odd n")
:::en
Every number is even or odd. In the step, distinguish the two cases of the hypothesis.
:::

:::de
Jede Zahl ist gerade (`Even`) oder ungerade (`Odd`). Unterscheide im Schritt die beiden Fälle der Annahme.
:::

```lean -show
example (Even Odd : Nat → Prop) (e0 : Even 0) (eo : ∀ n, Even n → Odd (n + 1)) (oe : ∀ n, Odd n → Even (n + 1)) :
    ∀ n, Even n ∨ Odd n :=
  Nat.rec (motive := fun n => Even n ∨ Odd n) (Or.inl e0)
    (fun k ih => ih.elim (fun e => Or.inr (eo k e)) (fun o => Or.inl (oe k o)))
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, allI, allE, exI, exE, ind") (assumptions := "P 0; Q 0; ∀ n, P n → Q (n + 1); ∀ n, Q n → P (n + 1)") (conclusions := "∀ n, P n ∧ Q n")
:::en
Two properties at once: prove both together.
:::

:::de
Zwei Eigenschaften auf einmal: Beweise beide zusammen.
:::

```lean -show
example (P Q : Nat → Prop) (p0 : P 0) (q0 : Q 0) (pq : ∀ n, P n → Q (n + 1)) (qp : ∀ n, Q n → P (n + 1)) :
    ∀ n, P n ∧ Q n :=
  Nat.rec (motive := fun n => P n ∧ Q n) ⟨p0, q0⟩ (fun k ih => ⟨qp k ih.2, pq k ih.1⟩)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, allI, allE, exI, exE, ind") (assumptions := "P 0 ∨ Q 0; ∀ n, P n → Q (n + 1); ∀ n, Q n → P (n + 1)") (conclusions := "∀ n, P n ∨ Q n")
:::en
The final level: the start is a case distinction too.
:::

:::de
Das letzte Level: Auch der Anfang ist eine Fallunterscheidung.
:::

```lean -show
example (P Q : Nat → Prop) (h : P 0 ∨ Q 0) (pq : ∀ n, P n → Q (n + 1)) (qp : ∀ n, Q n → P (n + 1)) :
    ∀ n, P n ∨ Q n :=
  Nat.rec (motive := fun n => P n ∨ Q n) h
    (fun k ih => ih.elim (fun p => Or.inr (pq k p)) (fun q => Or.inl (qp k q)))
```
::::
