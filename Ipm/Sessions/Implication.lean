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

#doc (Manual) "World 2: Implication" =>

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

::::task (rules := "conjI, conjE, impI, impE") (unlocks := "apply") (assumptions := "A, A → B") (conclusions := "B")
:::en
Your first →E: from `A → B` and `A` you get `B`.
:::

:::de
Dein erstes →E: Aus `A → B` und `A` bekommst du `B`.
:::


:::tip (rules := "impE, impI")
:::

```lean -show
example (A B : Prop) (a : A) (f : A → B) : B := f a
```
::::

::::task (rules := "conjI, conjE, impI, impE") (assumptions := "A, A → B, B → C") (conclusions := "C")
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

::::task (rules := "conjI, conjE, impI, impE") (assumptions := "A, A → B, A → C, B → D, C → D") (conclusions := "D")
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

::::task (rules := "conjI, conjE, impI, impE") (assumptions := "A, A → A") (conclusions := "A")
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

::::task (rules := "conjI, conjE, impI, impE") (lemma := true) (assumptions := "A → B, B → C") (conclusions := "A → C")
:::en
Your first →I. Add an →I block for the goal; then use its local hypothesis `A` (the blue dot with the purple ring), and lead what
you get from it into the block's input.
:::

:::de
Dein erstes →I. Nimm einen →I-Block für das Ziel; verwende dann seine lokale Annahme `A` (den
blauen Punkt mit dem lila Ring) und führe, was du daraus bekommst, in den Eingang des Blocks.
:::


:::tip (lang := "en") (rules := "impI")
To prove `A → C`, use →I. On top it has a compartment `?1 ⇒ ?2`: the *local hypothesis* `?1`
(the blue dot with the purple ring) is something you have, but only for proving the input `?2`
next to it. Whatever uses it lies in a dashed box.
:::

:::tip (lang := "de")
Um `A → C` zu beweisen, nimm →I. Oben hat er ein Fach `?1 ⇒ ?2`: Die *lokale Annahme* `?1` (der
blaue Punkt mit lila Ring) ist etwas, das du hast, aber nur, um den Eingang `?2` daneben zu beweisen.
Was sie verwendet, liegt in einem gestrichelten Kasten.
:::

```lean -show
example (A B C : Prop) (f : A → B) (g : B → C) : A → C := fun a => g (f a)
```
::::

::::task (rules := "conjI, conjE, impI, impE") (assumptions := "A → B, A → B → C") (conclusions := "A → C")
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

::::task (rules := "conjI, conjE, impI, impE") (unlocks := "intro") (conclusions := "A → A") (assumptions := "")
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

::::task (rules := "conjI, conjE, impI, impE") (assumptions := "A → C, B → C, A ∧ B") (conclusions := "C")
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

::::task (rules := "conjI, conjE, impI, impE") (assumptions := "A → C, B → C") (conclusions := "A ∧ B → C")
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

::::task (rules := "conjI, conjE, impI, impE") (assumptions := "B") (conclusions := "A → B")
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

::::task (rules := "conjI, conjE, impI, impE") (assumptions := "A ∧ B → C") (conclusions := "A → B → C")
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

::::task (rules := "conjI, conjE, impI, impE") (assumptions := "A → B → C") (conclusions := "A ∧ B → C")
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

::::task (rules := "conjI, conjE, impI, impE") (assumptions := "(A → B) ∧ (A → C)") (conclusions := "A → B ∧ C")
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

::::task (rules := "conjI, conjE, impI, impE") (assumptions := "") (conclusions := "P → Q → P")
:::en
If `P` holds, it holds under any further assumption.
:::

:::de
Wenn `P` gilt, dann auch unter jeder weiteren Annahme.
:::

```lean -show
example (P Q : Prop) : P → Q → P := fun p _ => p
```
::::

::::task (rules := "conjI, conjE, impI, impE") (assumptions := "") (conclusions := "P → Q → Q")
:::en
And the same with the second hypothesis.
:::

:::de
Und dasselbe mit der zweiten Annahme.
:::

```lean -show
example (P Q : Prop) : P → Q → Q := fun _ q => q
```
::::

::::task (rules := "conjI, conjE, impI, impE") (assumptions := "") (conclusions := "P → P → P")
:::en
From the Lean course, sheet 01-a. Two →I blocks; which hypothesis do you use?
:::

:::de
Aus dem Lean-Kurs, Blatt 01-a. Zwei →I-Blöcke; welche Annahme verwendest du?
:::

```lean -show
example (P : Prop) : P → P → P := fun p _ => p
```
::::

::::task (rules := "conjI, conjE, impI, impE") (assumptions := "") (conclusions := "P → (P → Q) → Q")
:::en
Modus ponens as a statement of its own.
:::

:::de
Der Modus ponens als eigene Aussage.
:::

```lean -show
example (P Q : Prop) : P → (P → Q) → Q := fun p f => f p
```
::::

::::task (rules := "conjI, conjE, impI, impE") (assumptions := "P → Q → R, Q") (conclusions := "P → R")
:::en
Supply the premises in the other order.
:::

:::de
Liefere die Voraussetzungen in der anderen Reihenfolge.
:::

```lean -show
example (P Q R : Prop) (h : P → Q → R) (q : Q) : P → R := fun p => h p q
```
::::

::::task (rules := "conjI, conjE, impI, impE") (assumptions := "") (conclusions := "(P → Q) → (Q → R) → P → R")
:::en
Transitivity, with no assumptions at all: three →I blocks.
:::

:::de
Transitivität, ganz ohne Annahmen: drei →I-Blöcke.
:::

```lean -show
example (P Q R : Prop) : (P → Q) → (Q → R) → P → R := fun f g p => g (f p)
```
::::

::::task (rules := "conjI, conjE, impI, impE") (assumptions := "") (conclusions := "(P → Q → R) → (P → Q) → P → R")
:::en
Nothing new, only →I and →E, but the proof of `P` is needed twice.
:::

:::de
Nichts Neues, nur →I und →E, aber der Beweis von `P` wird zweimal gebraucht.
:::

```lean -show
example (P Q R : Prop) : (P → Q → R) → (P → Q) → P → R := fun f g p => f p (g p)
```
::::

::::task (rules := "conjI, conjE, impI, impE") (assumptions := "P → Q, Q → T, Q → R, R → S, T → P, R → T") (conclusions := "T → R")
:::en
A puzzle. Not all assumptions are needed: find a path from `T` to `R`.
:::

:::de
Ein Rätsel. Nicht alle Annahmen werden gebraucht: Finde einen Weg von `T` nach `R`.
:::

```lean -show
example (P Q R S T : Prop) (hPQ : P → Q) (_ : Q → T) (hQR : Q → R) (_ : R → S) (hTP : T → P) (_ : R → T) :
    T → R := fun t => hQR (hPQ (hTP t))
```
::::

::::task (rules := "conjI, conjE, impI, impE") (assumptions := "P → Q → R → S") (conclusions := "P ∧ Q ∧ R → S")
:::en
Three premises one after the other, or all three at once.
:::

:::de
Drei Voraussetzungen nacheinander oder alle drei auf einmal.
:::

```lean -show
example (P Q R S : Prop) (h : P → Q → R → S) : P ∧ Q ∧ R → S := fun x => h x.1 x.2.1 x.2.2
```
::::

::::task (rules := "conjI, conjE, impI, impE") (assumptions := "A → A → B, (A → B) → A") (conclusions := "B")
:::en
The final level of the world.
:::

:::de
Das letzte Level der Welt.
:::

```lean -show
example (A B : Prop) (f : A → A → B) (g : (A → B) → A) : B :=
  have h : A → B := fun a => f a a
  h (g h)
```
::::
