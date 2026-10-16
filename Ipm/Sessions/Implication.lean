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

:::en
Two new rules, for implication:

* *→-elimination* (→E) uses `A → B` together with `A` to get `B`.
* *→-introduction* (→I) proves `A → B`. It gives you a *local hypothesis* `A`: the blue dot with a
  purple ring on top of the block. Like every blue dot it is something you have, which you may use to prove the block's own input `B`. Everything that uses
  the hypothesis must lead back into that input; a dashed box shows this region. Using the
  hypothesis for anything outside the box is not allowed (⚠).
:::

:::de
Zwei neue Regeln, für die Implikation:

* *→-Beseitigung* (→E) macht aus `A → B` zusammen mit `A` die Aussage `B`.
* *→-Einführung* (→I) beweist `A → B`. Sie gibt dir eine *lokale Annahme* `A`: den blauen Punkt mit
  lila Ring oben am Block. Wie jeder blaue Punkt ist sie etwas, das du hast, und du darfst sie
  verwenden, um den eigenen Eingang `B` des Blocks zu beweisen. Alles, was die Annahme verwendet,
  muss in diesen Eingang zurückführen; ein gestrichelter Kasten zeigt diesen Bereich. Die Annahme
  außerhalb des Kastens zu verwenden, ist nicht erlaubt (⚠).
:::

::::task (assumptions := "A, A → B") (conclusions := "B")
:::en
Your first →E: from `A → B` and `A` you get `B`.
:::

:::de
Dein erstes →E: Aus `A → B` und `A` bekommst du `B`.
:::

```lean -show
example (A B : Prop) (a : A) (f : A → B) : B := f a
```
::::

::::task (assumptions := "A, A → B, B → C") (conclusions := "C")
:::en
Two steps.
:::

:::de
Zwei Schritte.
:::

```lean -show
example (A B C : Prop) (a : A) (f : A → B) (g : B → C) : C := g (f a)
```
::::

::::task (assumptions := "A, A → B, A → C, B → D, C → D") (conclusions := "D")
:::en
More assumptions than you need.
:::

:::de
Mehr Annahmen, als du brauchst.
:::

```lean -show
example (A B C D : Prop) (a : A) (f : A → B) (_ : A → C) (g : B → D) (_ : C → D) : D := g (f a)
```
::::

::::task (assumptions := "A, A → A") (conclusions := "A")
:::en
Is the implication needed at all?
:::

:::de
Braucht man die Implikation überhaupt?
:::

```lean -show
example (A : Prop) (a : A) (_ : A → A) : A := a
```
::::

::::task (assumptions := "A → B, B → C") (conclusions := "A → C")
:::en
Your first →I. Add an →I block for the goal; then use its local hypothesis `A` (the blue dot with the purple ring), and lead what
you get from it into the block's input.
:::

:::de
Dein erstes →I. Nimm einen →I-Block für das Ziel; verwende dann seine lokale Annahme `A` (den
blauen Punkt mit dem lila Ring) und führe, was du daraus bekommst, in den Eingang des Blocks.
:::

```lean -show
example (A B C : Prop) (f : A → B) (g : B → C) : A → C := fun a => g (f a)
```
::::

::::task (assumptions := "A → B, A → B → C") (conclusions := "A → C")
:::en
The hypothesis `A` may be used more than once.
:::

:::de
Die Annahme `A` darf mehrfach verwendet werden.
:::

```lean -show
example (A B C : Prop) (f : A → B) (g : A → B → C) : A → C := fun a => g a (f a)
```
::::

::::task (conclusions := "A → A") (assumptions := "")
:::en
No assumptions at all.
:::

:::de
Gar keine Annahmen.
:::

```lean -show
example (A : Prop) : A → A := fun a => a
```
::::

::::task (assumptions := "A → C, B → C, A ∧ B") (conclusions := "C")
:::en
Combine ∧ and →.
:::

:::de
Kombiniere ∧ und →.
:::

```lean -show
example (A B C : Prop) (f : A → C) (_ : B → C) (h : A ∧ B) : C := f h.1
```
::::

::::task (assumptions := "A → C, B → C") (conclusions := "A ∧ B → C")
:::en
In Lean, `A ∧ B → C` means `(A ∧ B) → C`.
:::

:::de
In Lean bedeutet `A ∧ B → C` dasselbe wie `(A ∧ B) → C`.
:::

```lean -show
example (A B C : Prop) (f : A → C) (_ : B → C) : A ∧ B → C := fun h => f h.1
```
::::

::::task (assumptions := "B") (conclusions := "A → B")
:::en
The hypothesis need not be used.
:::

:::de
Die Annahme muss nicht verwendet werden.
:::

```lean -show
example (A B : Prop) (b : B) : A → B := fun _ => b
```
::::

::::task (assumptions := "A ∧ B → C") (conclusions := "A → B → C")
:::en
Two →I blocks, one inside the other. `A → B → C` means `A → (B → C)`.
:::

:::de
Zwei →I-Blöcke, einer im anderen. `A → B → C` bedeutet `A → (B → C)`.
:::

```lean -show
example (A B C : Prop) (f : A ∧ B → C) : A → B → C := fun a b => f ⟨a, b⟩
```
::::

::::task (assumptions := "A → B → C") (conclusions := "A ∧ B → C")
:::en
And back.
:::

:::de
Und zurück.
:::

```lean -show
example (A B C : Prop) (f : A → B → C) : A ∧ B → C := fun h => f h.1 h.2
```
::::

::::task (assumptions := "(A → B) ∧ (A → C)") (conclusions := "A → B ∧ C")
:::en
Take apart, apply, put together.
:::

:::de
Zerlegen, anwenden, zusammensetzen.
:::

```lean -show
example (A B C : Prop) (h : (A → B) ∧ (A → C)) : A → B ∧ C := fun a => ⟨h.1 a, h.2 a⟩
```
::::

::::task (assumptions := "A → A → B, (A → B) → A") (conclusions := "B")
:::en
The final task of the session.
:::

:::de
Die letzte Aufgabe der Sitzung.
:::

```lean -show
example (A B : Prop) (f : A → A → B) (g : (A → B) → A) : B :=
  have h : A → B := fun a => f a a
  h (g h)
```
::::
