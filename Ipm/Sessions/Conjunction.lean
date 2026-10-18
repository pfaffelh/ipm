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

#doc (Manual) "World 1: Conjunction" =>

:::en
Two rules, for conjunction (`∧`, “and”):

* *∧-introduction* (∧I) makes `A ∧ B` from `A` and `B`,
* *∧-elimination* (∧E) takes `A ∧ B` apart into `A` and `B`.
:::

:::de
Zwei Regeln für die Konjunktion (`∧`, „und“):

* *∧-Einführung* (∧I) macht aus `A` und `B` die Aussage `A ∧ B`,
* *∧-Beseitigung* (∧E) zerlegt `A ∧ B` in `A` und `B`.
:::

::::task (rules := "conjI, conjE") (assumptions := "A") (conclusions := "A")
:::en
Tap the red circle on top of the goal `A`; the assumption `A` glows green. Tap it.
:::

:::de
Tippe den roten Kreis oben am Ziel `A` an; die Annahme `A` leuchtet grün. Tippe sie an.
:::


:::tip (lang := "en") (rules := "conjI, conjE")
How to play: a *red circle* is something still to prove, a *blue dot* something you have. Tap
one of them, then one of the parts that glow green: a line connects them. You are done when no red
circle is left.
:::

:::tip (lang := "de")
So wird gespielt: Ein *roter Kreis* ist etwas, das noch zu beweisen ist, ein *blauer Punkt* etwas,
das du hast. Tippe eines davon an, dann eines der grün leuchtenden Teile: Eine Linie verbindet sie.
Du bist fertig, wenn kein roter Kreis mehr übrig ist.
:::

```lean -show
example (A : Prop) (a : A) : A := a
```
::::

::::task (rules := "conjI, conjE") (assumptions := "A, B") (conclusions := "A")
:::en
Not every assumption has to be used.
:::

:::de
Nicht jede Annahme muss verwendet werden.
:::

```lean -show
example (A B : Prop) (a : A) (_ : B) : A := a
```
::::

::::task (rules := "conjI, conjE") (assumptions := "A, B") (conclusions := "B, A")
:::en
Two goals.
:::

:::de
Zwei Ziele.
:::

```lean -show
example (A B : Prop) (a : A) (b : B) : B ∧ A := ⟨b, a⟩
```
::::

::::task (rules := "conjI, conjE") (assumptions := "A, B") (conclusions := "A ∧ B")
:::en
Your first rule. Tap the red circle of the goal, then *＋* below the picture, and choose *∧I*. A new
block appears: connect its output to the goal, then fill its two red circles.
:::

:::de
Deine erste Regel. Tippe den roten Kreis des Ziels an, dann *＋* unter dem Bild, und wähle *∧I*. Ein
neuer Block erscheint: Verbinde seinen Ausgang mit dem Ziel und fülle dann seine beiden roten Kreise.
:::


:::tip (lang := "en") (rules := "conjI")
Your first *rule block*: it comes from *＋* below the board. ∧I has two inputs (red circles `?1`
and `?2`) and one output (blue dot `?1 ∧ ?2`). Connect its output to the goal: then `?1` and `?2`
become `A` and `B`, and its two red circles are what is left to prove.
:::

:::tip (lang := "de")
Dein erster *Regelblock*: Er kommt über *＋* unter dem Spielfeld. ∧I hat zwei Eingänge (rote Kreise
`?1` und `?2`) und einen Ausgang (blauer Punkt `?1 ∧ ?2`). Verbinde seinen Ausgang mit dem Ziel: Dann
werden `?1` und `?2` zu `A` und `B`, und seine zwei roten Kreise sind, was noch zu beweisen bleibt.
:::

```lean -show
example (A B : Prop) (a : A) (b : B) : A ∧ B := ⟨a, b⟩
```
::::

::::task (rules := "conjI, conjE") (assumptions := "A") (conclusions := "A ∧ A")
:::en
An assumption can be used more than once.
:::

:::de
Eine Annahme kann mehrfach verwendet werden.
:::

```lean -show
example (A : Prop) (a : A) : A ∧ A := ⟨a, a⟩
```
::::

::::task (rules := "conjI, conjE") (assumptions := "P, Q, R") (conclusions := "P ∧ Q ∧ R")
:::en
From the Lean course, sheet 01-b. `P ∧ Q ∧ R` means `P ∧ (Q ∧ R)`.
:::

:::de
Aus dem Lean-Kurs, Blatt 01-b. `P ∧ Q ∧ R` bedeutet `P ∧ (Q ∧ R)`.
:::

```lean -show
example (P Q R : Prop) (p : P) (q : Q) (r : R) : P ∧ Q ∧ R := ⟨p, q, r⟩
```
::::

::::task (rules := "conjI, conjE") (assumptions := "A ∧ B") (conclusions := "A")
:::en
Now take a conjunction apart. Add an *∧E* block with *＋*, feed `A ∧ B` into it and
connect the right one of its outputs to the goal.
:::

:::de
Jetzt zerlegst du eine Konjunktion. Nimm mit *＋* einen *∧E*-Block, gib `A ∧ B` hinein und
verbinde den richtigen seiner Ausgänge mit dem Ziel.
:::


:::tip (lang := "en") (rules := "conjE")
∧E takes a conjunction apart: one input `?1 ∧ ?2`, two outputs `?1` and `?2`. Feed `A ∧ B` into
it, and use the output you need.
:::

:::tip (lang := "de")
∧E zerlegt eine Konjunktion: ein Eingang `?1 ∧ ?2`, zwei Ausgänge `?1` und `?2`. Gib `A ∧ B` hinein
und verwende den Ausgang, den du brauchst.
:::

```lean -show
example (A B : Prop) (h : A ∧ B) : A := h.1
```
::::

::::task (rules := "conjI, conjE") (assumptions := "A ∧ B") (conclusions := "A, B")
:::en
One ∧-elimination gives both parts.
:::

:::de
Eine ∧-Beseitigung liefert beide Teile.
:::

```lean -show
example (A B : Prop) (h : A ∧ B) : A ∧ B := ⟨h.1, h.2⟩
```
::::

::::task (rules := "conjI, conjE") (assumptions := "A ∧ B") (conclusions := "A ∧ B")
:::en
The shortest way is the best.
:::

:::de
Der kürzeste Weg ist der beste.
:::

```lean -show
example (A B : Prop) (h : A ∧ B) : A ∧ B := h
```
::::

::::task (rules := "conjI, conjE") (assumptions := "A ∧ B") (conclusions := "B ∧ A")
:::en
Take apart, then put together again.
:::

:::de
Zerlegen und wieder zusammensetzen.
:::

```lean -show
example (A B : Prop) (h : A ∧ B) : B ∧ A := ⟨h.2, h.1⟩
```
::::

::::task (rules := "conjI, conjE") (assumptions := "(A ∧ B) ∧ C") (conclusions := "A, B, C")
:::en
Three goals from one assumption.
:::

:::de
Drei Ziele aus einer Annahme.
:::

```lean -show
example (A B C : Prop) (h : (A ∧ B) ∧ C) : A ∧ B ∧ C := ⟨h.1.1, h.1.2, h.2⟩
```
::::

::::task (rules := "conjI, conjE") (assumptions := "(A ∧ B) ∧ C") (conclusions := "A ∧ C")
:::en
Pick the parts you need.
:::

:::de
Nimm die Teile, die du brauchst.
:::

```lean -show
example (A B C : Prop) (h : (A ∧ B) ∧ C) : A ∧ C := ⟨h.1.1, h.2⟩
```
::::

::::task (rules := "conjI, conjE") (assumptions := "(A ∧ B) ∧ C") (conclusions := "A ∧ B ∧ C")
:::en
The final level of the world: regroup. In Lean, `A ∧ B ∧ C` means `A ∧ (B ∧ C)`.
:::

:::de
Das letzte Level der Welt: Umgruppieren. In Lean bedeutet `A ∧ B ∧ C` dasselbe wie `A ∧ (B ∧ C)`.
:::

```lean -show
example (A B C : Prop) (h : (A ∧ B) ∧ C) : A ∧ B ∧ C := ⟨h.1.1, h.1.2, h.2⟩
```
::::
