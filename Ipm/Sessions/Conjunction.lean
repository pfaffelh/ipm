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
Your first rule. Tap the red circle of the goal, then tap *∧I* in the menu below the picture. A new
block appears: connect its output to the goal, then fill its two red circles.
:::

:::de
Deine erste Regel. Tippe den roten Kreis des Ziels an, dann *∧I* im Menü unter dem Bild. Ein neuer
Block erscheint: Verbinde seinen Ausgang mit dem Ziel und fülle dann seine beiden roten Kreise.
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

::::task (rules := "conjI, conjE") (assumptions := "A ∧ B") (conclusions := "A")
:::en
Now take a conjunction apart. Add an *∧E* block from the menu, feed `A ∧ B` into it and
connect the right one of its outputs to the goal.
:::

:::de
Jetzt zerlegst du eine Konjunktion. Nimm einen *∧E*-Block aus dem Menü, gib `A ∧ B` hinein und
verbinde den richtigen seiner Ausgänge mit dem Ziel.
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
Regroup. In Lean, `A ∧ B ∧ C` means `A ∧ (B ∧ C)`.
:::

:::de
Umgruppieren. In Lean bedeutet `A ∧ B ∧ C` dasselbe wie `A ∧ (B ∧ C)`.
:::

```lean -show
example (A B C : Prop) (h : (A ∧ B) ∧ C) : A ∧ B ∧ C := ⟨h.1.1, h.1.2, h.2⟩
```
::::
