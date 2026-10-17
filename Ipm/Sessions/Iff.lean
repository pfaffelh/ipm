import VersoManual
import Ipm.Task

open Verso.Genre Manual
open Ipm
open Verso.Genre.Manual.InlineLean

/-
Equivalence (↔) and truth (⊤), with tasks from the logic exercises of the Lean course
(https://pfaffelh.github.io/leancourse/), chapter 01-Logic.
Each task carries a Lean proof, checked when the site is built.
-/

#doc (Manual) "World 6: Equivalence and Truth" =>

:::en
Two more connectives, and four new rules:

* `P ↔ Q` (“`P` if and only if `Q`”) is an *equivalence*. *↔-introduction* (↔I) proves it from the
  two implications `P → Q` and `Q → P`. *↔-elimination* uses it: ↔E₁ forwards, from `P` to `Q`, and
  ↔E₂ backwards, from `Q` to `P`. In Lean: `Iff.intro`, `Iff.mp` and `Iff.mpr`.
* `⊤` (“true”, in Lean `True`) always holds: *⊤-introduction* (⊤I) proves it, without an input. In
  Lean: `trivial`.

In Lean, `↔` binds less strongly than `→`: `P → Q ↔ R` means `(P → Q) ↔ R`. Here such brackets are
shown anyway. The levels come from the [Lean course](https://pfaffelh.github.io/leancourse/); the
last ones need TND.
:::

:::de
Zwei weitere Verknüpfungen und vier neue Regeln:

* `P ↔ Q` („`P` genau dann, wenn `Q`“) ist eine *Äquivalenz*. Die *↔-Einführung* (↔I) beweist sie
  aus den zwei Implikationen `P → Q` und `Q → P`. Die *↔-Beseitigung* verwendet sie: ↔E₁ vorwärts,
  von `P` nach `Q`, und ↔E₂ rückwärts, von `Q` nach `P`. In Lean: `Iff.intro`, `Iff.mp` und
  `Iff.mpr`.
* `⊤` („wahr“, in Lean `True`) gilt immer: Die *⊤-Einführung* (⊤I) beweist es, ohne Eingang. In
  Lean: `trivial`.

In Lean bindet `↔` schwächer als `→`: `P → Q ↔ R` bedeutet `(P → Q) ↔ R`. Hier werden solche
Klammern trotzdem gezeigt. Die Levels stammen aus dem [Lean-Kurs](https://pfaffelh.github.io/leancourse/);
die letzten brauchen TND.
:::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "P → Q, Q → P") (conclusions := "P ↔ Q")
:::en
Your first ↔I: an equivalence is two implications.
:::

:::de
Dein erstes ↔I: Eine Äquivalenz besteht aus zwei Implikationen.
:::


:::tip (rules := "iffI, iffE1, iffE2, trueI")
:::

```lean -show
example (P Q : Prop) (f : P → Q) (g : Q → P) : P ↔ Q := Iff.intro f g
```
::::

::::task (unlocks := "mp") (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "P, P ↔ Q") (conclusions := "Q")
:::en
↔E₁ uses an equivalence forwards.
:::

:::de
↔E₁ verwendet eine Äquivalenz vorwärts.
:::

```lean -show
example (P Q : Prop) (p : P) (h : P ↔ Q) : Q := h.mp p
```
::::

::::task (unlocks := "mpr") (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "Q, P ↔ Q") (conclusions := "P")
:::en
… and ↔E₂ backwards.
:::

:::de
… und ↔E₂ rückwärts.
:::

```lean -show
example (P Q : Prop) (q : Q) (h : P ↔ Q) : P := h.mpr q
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "") (conclusions := "P ↔ P")
:::en
No assumptions. Each direction is an →I.
:::

:::de
Keine Annahmen. Jede Richtung ist ein →I.
:::

```lean -show
example (P : Prop) : P ↔ P := Iff.intro (fun p => p) (fun p => p)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "P ↔ Q") (conclusions := "Q ↔ P")
:::en
Symmetry of `↔`.
:::

:::de
Symmetrie von `↔`.
:::

```lean -show
example (P Q : Prop) (h : P ↔ Q) : Q ↔ P := Iff.intro h.mpr h.mp
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "P ↔ Q, Q ↔ R") (conclusions := "P ↔ R")
:::en
Transitivity of `↔`.
:::

:::de
Transitivität von `↔`.
:::

```lean -show
example (P Q R : Prop) (h1 : P ↔ Q) (h2 : Q ↔ R) : P ↔ R :=
  Iff.intro (fun p => h2.mp (h1.mp p)) (fun r => h1.mpr (h2.mpr r))
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "") (conclusions := "(P ↔ Q) ↔ (P → Q) ∧ (Q → P)")
:::en
`↔` really is a conjunction of two implications.
:::

:::de
`↔` ist wirklich eine Konjunktion zweier Implikationen.
:::

```lean -show
example (P Q : Prop) : (P ↔ Q) ↔ (P → Q) ∧ (Q → P) :=
  Iff.intro (fun h => ⟨h.mp, h.mpr⟩) (fun h => Iff.intro h.1 h.2)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "P → Q, Q → T, Q → R, R → S, T → P, R → T") (conclusions := "Q ↔ R")
:::en
The puzzle from world 2, with a new goal.
:::

:::de
Das Rätsel aus Welt 2, mit einem neuen Ziel.
:::

```lean -show
example (P Q R S T : Prop) (hPQ : P → Q) (_ : Q → T) (hQR : Q → R) (_ : R → S) (hTP : T → P) (hRT : R → T) :
    Q ↔ R := Iff.intro hQR (fun r => hPQ (hTP (hRT r)))
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "P ↔ Q") (conclusions := "P ∧ R ↔ Q ∧ R")
:::en
Replace `P` by `Q` inside a conjunction.
:::

:::de
Ersetze `P` durch `Q` in einer Konjunktion.
:::

```lean -show
example (P Q R : Prop) (h : P ↔ Q) : P ∧ R ↔ Q ∧ R :=
  Iff.intro (fun x => ⟨h.mp x.1, x.2⟩) (fun x => ⟨h.mpr x.1, x.2⟩)
```
::::

::::task (unlocks := "trivial") (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "") (conclusions := "P → ⊤")
:::en
`⊤` (in Lean `True`) always holds: ⊤I proves it, with no input.
:::

:::de
`⊤` (in Lean `True`) gilt immer: ⊤I beweist es, ganz ohne Eingang.
:::


:::tip (lang := "en") (rules := "trueI")
`⊤` (in Lean `True`) always holds: the block ⊤I proves it, without any input.
:::

:::tip (lang := "de")
`⊤` (in Lean `True`) gilt immer: Der Block ⊤I beweist es, ganz ohne Eingang.
:::

```lean -show
example (P : Prop) : P → True := fun _ => trivial
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "") (conclusions := "(⊤ → P) ↔ P")
:::en
An assumption that always holds tells you nothing.
:::

:::de
Eine Annahme, die immer gilt, sagt nichts.
:::

```lean -show
example (P : Prop) : (True → P) ↔ P := Iff.intro (fun f => f trivial) (fun p _ => p)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "") (conclusions := "(⊤ → ⊥) ↔ ⊥")
:::en
In Lean: `¬True ↔ False`.
:::

:::de
In Lean: `¬True ↔ False`.
:::

```lean -show
example : (True → False) ↔ False := Iff.intro (fun f => f trivial) (fun f _ => f)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "") (conclusions := "⊤ ↔ (⊥ → ⊥)")
:::en
In Lean: `True ↔ ¬False`.
:::

:::de
In Lean: `True ↔ ¬False`.
:::

```lean -show
example : True ↔ (False → False) := Iff.intro (fun _ f => f) (fun _ => trivial)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "P → ⊥") (conclusions := "P ↔ ⊥")
:::en
`¬P` says exactly that `P` is false.
:::

:::de
`¬P` sagt genau, dass `P` falsch ist.
:::

```lean -show
example (P : Prop) (np : P → False) : P ↔ False := Iff.intro np (fun f => f.elim)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "P → ⊥, Q") (conclusions := "P ↔ (Q → ⊥)")
:::en
Both sides are false.
:::

:::de
Beide Seiten sind falsch.
:::

```lean -show
example (P Q : Prop) (np : P → False) (q : Q) : P ↔ (Q → False) :=
  Iff.intro (fun p => (np p).elim) (fun nq => (nq q).elim)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "") (conclusions := "P ∨ Q ↔ Q ∨ P")
:::en
Commutativity of `∨`, both directions.
:::

:::de
Kommutativität von `∨`, beide Richtungen.
:::

```lean -show
example (P Q : Prop) : P ∨ Q ↔ Q ∨ P :=
  Iff.intro (fun h => h.elim Or.inr Or.inl) (fun h => h.elim Or.inr Or.inl)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "") (conclusions := "P ∨ P ∧ Q ↔ P")
:::en
Absorption. Here `P ∨ P ∧ Q` means `P ∨ (P ∧ Q)`.
:::

:::de
Absorption. Hier bedeutet `P ∨ P ∧ Q` dasselbe wie `P ∨ (P ∧ Q)`.
:::

```lean -show
example (P Q : Prop) : P ∨ P ∧ Q ↔ P := Iff.intro (fun h => h.elim (fun p => p) (fun x => x.1)) Or.inl
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "") (conclusions := "(P ∨ Q → ⊥) ↔ (P → ⊥) ∧ (Q → ⊥)")
:::en
De Morgan: `¬(P ∨ Q) ↔ ¬P ∧ ¬Q`.
:::

:::de
De Morgan: `¬(P ∨ Q) ↔ ¬P ∧ ¬Q`.
:::

```lean -show
example (P Q : Prop) : (P ∨ Q → False) ↔ (P → False) ∧ (Q → False) :=
  Iff.intro (fun h => ⟨fun p => h (Or.inl p), fun q => h (Or.inr q)⟩) (fun h x => x.elim h.1 h.2)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "") (conclusions := "P ∧ (Q ∨ R) ↔ P ∧ Q ∨ P ∧ R")
:::en
Distributivity, both directions.
:::

:::de
Distributivität, beide Richtungen.
:::

```lean -show
example (P Q R : Prop) : P ∧ (Q ∨ R) ↔ P ∧ Q ∨ P ∧ R :=
  Iff.intro (fun h => h.2.elim (fun q => Or.inl ⟨h.1, q⟩) (fun r => Or.inr ⟨h.1, r⟩))
    (fun h => h.elim (fun x => ⟨x.1, Or.inl x.2⟩) (fun x => ⟨x.1, Or.inr x.2⟩))
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "") (conclusions := "P ∨ Q ∧ R ↔ (P ∨ Q) ∧ (P ∨ R)")
:::en
The other distributive law. Lemmas from world 3 may help.
:::

:::de
Das andere Distributivgesetz. Hilfssätze aus Welt 3 können helfen.
:::

```lean -show
example (P Q R : Prop) : P ∨ Q ∧ R ↔ (P ∨ Q) ∧ (P ∨ R) :=
  Iff.intro (fun h => h.elim (fun p => ⟨Or.inl p, Or.inl p⟩) (fun x => ⟨Or.inr x.1, Or.inr x.2⟩))
    (fun h => h.1.elim Or.inl (fun q => h.2.elim Or.inl (fun r => Or.inr ⟨q, r⟩)))
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "") (conclusions := "((P → ⊥) → ⊥) ↔ P")
:::en
Classical: double negation, both directions.
:::

:::de
Klassisch: doppelte Negation, beide Richtungen.
:::

```lean -show
example (P : Prop) : ((P → False) → False) ↔ P :=
  Iff.intro (fun h => (Classical.em P).elim (fun p => p) (fun np => (h np).elim)) (fun p np => np p)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "") (conclusions := "(P ∧ Q → ⊥) ↔ (P → ⊥) ∨ (Q → ⊥)")
:::en
The De Morgan law that needs TND.
:::

:::de
Das De-Morgan-Gesetz, das TND braucht.
:::

```lean -show
example (P Q : Prop) : (P ∧ Q → False) ↔ (P → False) ∨ (Q → False) :=
  Iff.intro (fun h => (Classical.em P).elim (fun p => Or.inr (fun q => h ⟨p, q⟩)) Or.inl)
    (fun h x => h.elim (fun np => np x.1) (fun nq => nq x.2))
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "") (conclusions := "(P → Q) ↔ (P → ⊥) ∨ Q")
:::en
An implication is a disjunction in disguise.
:::

:::de
Eine Implikation ist eine verkleidete Disjunktion.
:::

```lean -show
example (P Q : Prop) : (P → Q) ↔ (P → False) ∨ Q :=
  Iff.intro (fun f => (Classical.em P).elim (fun p => Or.inr (f p)) Or.inl)
    (fun h p => h.elim (fun np => (np p).elim) (fun q => q))
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, raa, iffI, iffE1, iffE2, trueI") (assumptions := "") (conclusions := "((P → Q) → ⊥) ↔ P ∧ (Q → ⊥)")
:::en
The final level: negating an implication.
:::

:::de
Das letzte Level: eine Implikation verneinen.
:::

```lean -show
example (P Q : Prop) : ((P → Q) → False) ↔ P ∧ (Q → False) :=
  Iff.intro
    (fun h => ⟨(Classical.em P).elim (fun p => p) (fun np => (h (fun p => (np p).elim)).elim), fun q => h (fun _ => q)⟩)
    (fun x f => x.2 (f x.1))
```
::::
