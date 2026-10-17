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

:::en
The statement `⊥` (“falsity”) can never be true; in Lean it is called `False`. One new rule:

* *⊥-elimination* (⊥E): from `⊥` you may conclude anything. (In Lean: `False.elim`.)

There is no extra rule for negation: “not `A`” is written `A → ⊥`, “from `A` follows something
impossible”. Lean writes `¬A` for it, and `¬A` really is defined as `A → False`. So to prove
`A → ⊥` you use →I, and `A → ⊥` together with `A` gives `⊥` by →E.
:::

:::de
Die Aussage `⊥` („Falsum“) kann nie wahr sein; in Lean heißt sie `False`. Eine neue Regel:

* *⊥-Beseitigung* (⊥E): Aus `⊥` darfst du alles folgern. (In Lean: `False.elim`.)

Für die Negation gibt es keine eigene Regel: „nicht `A`“ wird `A → ⊥` geschrieben, „aus `A` folgt
etwas Unmögliches“. Lean schreibt dafür `¬A`, und `¬A` ist tatsächlich als `A → False` definiert.
Um `A → ⊥` zu beweisen, verwendest du also →I, und `A → ⊥` zusammen mit `A` ergibt `⊥` mit →E.
:::

::::task (unlocks := "exfalso") (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "⊥") (conclusions := "A")
:::en
From something impossible, anything follows.
:::

:::de
Aus etwas Unmöglichem folgt alles.
:::

```lean -show
example (A : Prop) (h : False) : A := h.elim
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "⊥") (conclusions := "A, B")
:::en
Two goals, one assumption.
:::

:::de
Zwei Ziele, eine Annahme.
:::

```lean -show
example (A B : Prop) (h : False) : A ∧ B := ⟨h.elim, h.elim⟩
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "A") (conclusions := "⊥ ∨ A")
:::en
An “or” with something impossible.
:::

:::de
Ein „oder“ mit etwas Unmöglichem.
:::

```lean -show
example (A : Prop) (a : A) : False ∨ A := Or.inr a
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "⊥ ∨ A") (conclusions := "A")
:::en
And back: one of the two cases cannot happen.
:::

:::de
Und zurück: Einer der beiden Fälle kann nicht eintreten.
:::

```lean -show
example (A : Prop) (h : False ∨ A) : A := h.elim (fun f => f.elim) (fun a => a)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "⊥ ∧ A") (conclusions := "⊥")
:::en
No new rule needed.
:::

:::de
Keine neue Regel nötig.
:::

```lean -show
example (A : Prop) (h : False ∧ A) : False := h.1
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (conclusions := "⊥ → A") (assumptions := "")
:::en
No assumptions at all.
:::

:::de
Gar keine Annahmen.
:::

```lean -show
example (A : Prop) : False → A := fun f => f.elim
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "A → B") (conclusions := "(B → ⊥) → A → ⊥")
:::en
If `A` implies `B`, then “not `B`” implies “not `A`”. Here `(B → ⊥) → A → ⊥` means
`(B → ⊥) → (A → ⊥)`.
:::

:::de
Wenn `A` die Aussage `B` impliziert, dann impliziert „nicht `B`“ auch „nicht `A`“. Hier bedeutet
`(B → ⊥) → A → ⊥` dasselbe wie `(B → ⊥) → (A → ⊥)`.
:::

```lean -show
example (A B : Prop) (f : A → B) : (B → False) → A → False := fun nb a => nb (f a)
```
::::

::::task (lemma := true) (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "A ∨ B → ⊥") (conclusions := "(A → ⊥) ∧ (B → ⊥)")
:::en
If neither `A` nor `B` …
:::

:::de
Wenn weder `A` noch `B` …
:::

```lean -show
example (A B : Prop) (h : A ∨ B → False) : (A → False) ∧ (B → False) :=
  ⟨fun a => h (Or.inl a), fun b => h (Or.inr b)⟩
```
::::

::::task (lemma := true) (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "(A → ⊥) ∧ (B → ⊥)") (conclusions := "A ∨ B → ⊥")
:::en
… and back.
:::

:::de
… und zurück.
:::

```lean -show
example (A B : Prop) (h : (A → False) ∧ (B → False)) : A ∨ B → False :=
  fun hab => hab.elim h.1 h.2
```
::::

::::task (lemma := true) (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "(A → ⊥) ∨ (B → ⊥)") (conclusions := "A ∧ B → ⊥")
:::en
If one of the two is false, then not both are true.
:::

:::de
Wenn eine der beiden falsch ist, dann sind nicht beide wahr.
:::

```lean -show
example (A B : Prop) (h : (A → False) ∨ (B → False)) : A ∧ B → False :=
  fun ab => h.elim (fun na => na ab.1) (fun nb => nb ab.2)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "((A → ⊥) → ⊥) → ⊥") (conclusions := "A → ⊥")
:::en
Three negations are as good as one.
:::

:::de
Drei Negationen sind so gut wie eine.
:::

```lean -show
example (A : Prop) (h : ((A → False) → False) → False) : A → False :=
  fun a => h (fun na => na a)
```
::::

::::task (lemma := true) (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "(A → ⊥) ∨ B") (conclusions := "A → B")
:::en
Case by case.
:::

:::de
Fall für Fall.
:::

```lean -show
example (A B : Prop) (h : (A → False) ∨ B) : A → B :=
  fun a => h.elim (fun na => (na a).elim) (fun b => b)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "A → ⊥, B → A") (conclusions := "B → ⊥")
:::en
Chain the implications.
:::

:::de
Verkette die Implikationen.
:::

```lean -show
example (A B : Prop) (na : A → False) (f : B → A) : B → False := fun b => na (f b)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (assumptions := "(A → ⊥) ∨ (B → ⊥) ∨ (C → ⊥)") (conclusions := "A ∧ B ∧ C → ⊥")
:::en
Three cases this time.
:::

:::de
Diesmal drei Fälle.
:::

```lean -show
example (A B C : Prop) (h : (A → False) ∨ (B → False) ∨ (C → False)) : A ∧ B ∧ C → False :=
  fun abc => h.elim (fun na => na abc.1) (fun h => h.elim (fun nb => nb abc.2.1) (fun nc => nc abc.2.2))
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (conclusions := "(A ∨ (A → ⊥) → ⊥) → ⊥") (assumptions := "")
:::en
The final task of the session: it is impossible that both `A` and “not `A`” are false. Note
`A ∨ (A → ⊥) → ⊥` means `(A ∨ (A → ⊥)) → ⊥`.
:::

:::de
Die letzte Aufgabe der Sitzung: Es ist unmöglich, dass sowohl `A` als auch „nicht `A`“ falsch
sind. Beachte: `A ∨ (A → ⊥) → ⊥` bedeutet `(A ∨ (A → ⊥)) → ⊥`.
:::

```lean -show
example (A : Prop) : (A ∨ (A → False) → False) → False :=
  fun h => h (Or.inr (fun a => h (Or.inl a)))
```
::::
