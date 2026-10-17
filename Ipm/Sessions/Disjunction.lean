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

#doc (Manual) "World 3: Disjunction" =>

:::en
Three new rules, for disjunction (`∨`, “or”):

* *∨-introduction* comes in two forms: ∨I₁ makes `A ∨ B` from `A`, ∨I₂ makes `A ∨ B` from `B`.
* *∨-elimination* (∨E) is a case distinction. From `A ∨ B` you may conclude `C` if you can prove `C`
  twice: once using the local hypothesis `A`, once using `B`. Each hypothesis (a blue dot with a
  purple ring) sits next to the input it belongs to, and may only be used to prove that input.

In Lean, ∨I₁ and ∨I₂ are `Or.inl` and `Or.inr`, and ∨E is `Or.elim`.
:::

:::de
Drei neue Regeln, für die Disjunktion (`∨`, „oder“):

* Die *∨-Einführung* gibt es in zwei Formen: ∨I₁ macht aus `A` die Aussage `A ∨ B`, ∨I₂ macht aus
  `B` die Aussage `A ∨ B`.
* Die *∨-Beseitigung* (∨E) ist eine Fallunterscheidung. Aus `A ∨ B` darfst du `C` folgern, wenn du
  `C` zweimal beweisen kannst: einmal mit der lokalen Annahme `A`, einmal mit `B`. Jede Annahme
  (ein blauer Punkt mit lila Ring) sitzt neben dem Eingang, zu dem sie gehört, und darf nur für
  diesen Eingang verwendet werden.

In Lean heißen ∨I₁ und ∨I₂ `Or.inl` und `Or.inr`, und ∨E heißt `Or.elim`.
:::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "A, B") (conclusions := "A ∨ B")
:::en
Your first `∨`. One of the two assumptions is enough.
:::

:::de
Dein erstes `∨`. Eine der beiden Annahmen genügt.
:::


:::tip (rules := "disjI1, disjI2, disjE")
:::

```lean -show
example (A B : Prop) (a : A) (_ : B) : A ∨ B := Or.inl a
```
::::

::::task (unlocks := "left") (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "A") (conclusions := "A ∨ B")
:::en
`B` need not be true at all.
:::

:::de
`B` muss gar nicht wahr sein.
:::

```lean -show
example (A B : Prop) (a : A) : A ∨ B := Or.inl a
```
::::

::::task (unlocks := "right") (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "B") (conclusions := "A ∨ B")
:::en
And from the other side.
:::

:::de
Und von der anderen Seite.
:::

```lean -show
example (A B : Prop) (b : B) : A ∨ B := Or.inr b
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "A") (conclusions := "A ∨ A")
:::en
Either way.
:::

:::de
So oder so.
:::

```lean -show
example (A : Prop) (a : A) : A ∨ A := Or.inl a
```
::::

::::task (lemma := true) (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "A ∨ B") (conclusions := "B ∨ A")
:::en
Your first ∨E: prove `B ∨ A` in the case `A` and in the case `B`.
:::

:::de
Dein erstes ∨E: Beweise `B ∨ A` im Fall `A` und im Fall `B`.
:::


:::tip (lang := "en") (rules := "disjE")
∨E is a case distinction. From `A ∨ B`, prove the goal twice: in the compartment `?1 ⇒ ?3` with
the hypothesis `A`, and in `?2 ⇒ ?3` with the hypothesis `B`.
:::

:::tip (lang := "de")
∨E ist eine Fallunterscheidung. Aus `A ∨ B` beweist du das Ziel zweimal: im Fach `?1 ⇒ ?3` mit der
Annahme `A` und im Fach `?2 ⇒ ?3` mit der Annahme `B`.
:::

```lean -show
example (A B : Prop) (h : A ∨ B) : B ∨ A := h.elim (fun a => Or.inr a) (fun b => Or.inl b)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "A ∨ B ∨ C") (conclusions := "(A ∨ B) ∨ C")
:::en
`A ∨ B ∨ C` means `A ∨ (B ∨ C)`. One case distinction inside another.
:::

:::de
`A ∨ B ∨ C` bedeutet `A ∨ (B ∨ C)`. Eine Fallunterscheidung in einer anderen.
:::

```lean -show
example (A B C : Prop) (h : A ∨ B ∨ C) : (A ∨ B) ∨ C :=
  h.elim (fun a => Or.inl (Or.inl a)) (fun h => h.elim (fun b => Or.inl (Or.inr b)) (fun c => Or.inr c))
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "A ∧ B") (conclusions := "A ∨ B")
:::en
“And” is stronger than “or”.
:::

:::de
„Und“ ist stärker als „oder“.
:::

```lean -show
example (A B : Prop) (h : A ∧ B) : A ∨ B := Or.inl h.1
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "A ∧ B ∨ C") (conclusions := "(A ∨ C) ∧ (B ∨ C)")
:::en
In Lean, `∧` binds more strongly than `∨`: `A ∧ B ∨ C` is `(A ∧ B) ∨ C`.
:::

:::de
In Lean bindet `∧` stärker als `∨`: `A ∧ B ∨ C` ist `(A ∧ B) ∨ C`.
:::

```lean -show
example (A B C : Prop) (h : A ∧ B ∨ C) : (A ∨ C) ∧ (B ∨ C) :=
  h.elim (fun ab => ⟨Or.inl ab.1, Or.inl ab.2⟩) (fun c => ⟨Or.inr c, Or.inr c⟩)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "(A ∨ B) ∧ C") (conclusions := "A ∧ C ∨ B ∧ C")
:::en
Distribute `C`.
:::

:::de
Verteile `C`.
:::

```lean -show
example (A B C : Prop) (h : (A ∨ B) ∧ C) : A ∧ C ∨ B ∧ C :=
  h.1.elim (fun a => Or.inl ⟨a, h.2⟩) (fun b => Or.inr ⟨b, h.2⟩)
```
::::

::::task (lemma := true) (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "(A → C) ∧ (B → C)") (conclusions := "A ∨ B → C")
:::en
`A ∨ B → C` means `(A ∨ B) → C`.
:::

:::de
`A ∨ B → C` bedeutet `(A ∨ B) → C`.
:::

```lean -show
example (A B C : Prop) (h : (A → C) ∧ (B → C)) : A ∨ B → C :=
  fun hab => hab.elim h.1 h.2
```
::::

::::task (lemma := true) (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "A ∨ B → C") (conclusions := "(A → C) ∧ (B → C)")
:::en
And back.
:::

:::de
Und zurück.
:::

```lean -show
example (A B C : Prop) (h : A ∨ B → C) : (A → C) ∧ (B → C) :=
  ⟨fun a => h (Or.inl a), fun b => h (Or.inr b)⟩
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (assumptions := "(A → B) ∨ (A → C)") (conclusions := "A → B ∨ C")
:::en
The final level of the world.
:::

:::de
Das letzte Level der Welt.
:::

```lean -show
example (A B C : Prop) (h : (A → B) ∨ (A → C)) : A → B ∨ C :=
  fun a => h.elim (fun f => Or.inl (f a)) (fun g => Or.inr (g a))
```
::::
