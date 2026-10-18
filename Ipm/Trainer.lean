import VersoManual
import Ipm.Task

open Verso.Genre Manual
open Ipm
open Verso.Genre.Manual.InlineLean

/-
The tactic trainer: levels played with tactics only (`(tactics := true)`). There are no blocks to
add and no lines to draw: a tapped red circle or blue dot offers the tactics that fit, and each one
puts its block in, already connected. Each level is a lesson on one tactic, in its tip.
-/

#doc (Manual) "Tactic Trainer" =>

%%%
number := false
%%%

:::en
Here you prove with tactics only, as in Lean, but still on the board. Tap a red circle (a goal) or a
blue dot (something you have): the tactics that fit appear beside it, and each one puts its block
in, already connected. A tapped goal also shows, below the board, what you have there, as Lean shows
it: `h₁ : A ∧ B ⊢ B ∧ A`.
:::

:::de
Hier beweist du nur mit Taktiken, wie in Lean, aber weiter auf dem Spielfeld. Tippe einen roten Kreis
(ein Ziel) oder einen blauen Punkt (etwas, das du hast) an: Daneben erscheinen die Taktiken, die
passen, und jede setzt ihren Baustein ein, schon verbunden. Bei einem angetippten Ziel steht unter dem
Spielfeld außerdem, was du dort hast, so wie Lean es zeigt: `h₁ : A ∧ B ⊢ B ∧ A`.
:::

::::task (rules := "conjI, conjE, impI, impE") (tactics := true) (assumptions := "A, B") (conclusions := "B")
:::en
`exact`: the goal is exactly something you have.
:::

:::de
`exact`: Das Ziel ist genau etwas, das du hast.
:::

:::tip (lang := "en")
*exact h₂* — when the goal is exactly one of the things you have. Tap the goal `B` (the red circle at
the bottom): it offers `exact h₂`, because `h₂ : B`. On the board this is just a line from `h₂` to the
goal. In Lean the goal is then closed.
:::

:::tip (lang := "de")
*exact h₂* — wenn das Ziel genau eines der Dinge ist, die du hast. Tippe das Ziel `B` an (den roten
Kreis unten): Es bietet `exact h₂` an, denn `h₂ : B`. Auf dem Spielfeld ist das einfach eine Linie von
`h₂` zum Ziel. In Lean ist das Ziel damit erledigt.
:::

```lean -show
example (A B : Prop) (h₁ : A) (h₂ : B) : B := by
  exact h₂
```
::::

::::task (rules := "conjI, conjE, impI, impE") (tactics := true) (assumptions := "A, B") (conclusions := "A ∧ B")
:::en
`constructor`: split a goal `A ∧ B` in two.
:::

:::de
`constructor`: ein Ziel `A ∧ B` in zwei zerlegen.
:::

:::tip (lang := "en") (rules := "conjI")
*constructor* — for a goal `A ∧ B`. It puts in an ∧I block, which proves `A ∧ B` from two inputs, `A`
and `B`: one goal becomes two red circles. In Lean, `constructor` leaves two goals, `A` and `B`, one
after the other (in a proof written out, each starts with `·`).
:::

:::tip (lang := "de") (rules := "conjI")
*constructor* — für ein Ziel `A ∧ B`. Es setzt einen ∧I-Baustein ein, der `A ∧ B` aus zwei Eingängen
`A` und `B` beweist: Aus einem Ziel werden zwei rote Kreise. In Lean hinterlässt `constructor` zwei
Ziele, `A` und `B`, eines nach dem anderen (in einem ausgeschriebenen Beweis beginnt jedes mit `·`).
:::

```lean -show
example (A B : Prop) (h₁ : A) (h₂ : B) : A ∧ B := by
  constructor
  · exact h₁
  · exact h₂
```
::::

::::task (rules := "conjI, conjE, impI, impE") (tactics := true) (assumptions := "A ∧ B") (conclusions := "B ∧ A")
:::en
`obtain`: take apart what you have.
:::

:::de
`obtain`: zerlegen, was du hast.
:::

:::tip (lang := "en") (rules := "conjE")
*obtain ⟨h₂, h₃⟩ := h₁* — for something you have, `h₁ : A ∧ B`. Tap the blue dot of `h₁`: it puts in
an ∧E block, which gives you its two parts, `h₂ : A` and `h₃ : B`, as two new blue dots. Unlike
`constructor`, it works on what you have, not on the goal.
:::

:::tip (lang := "de") (rules := "conjE")
*obtain ⟨h₂, h₃⟩ := h₁* — für etwas, das du hast, `h₁ : A ∧ B`. Tippe den blauen Punkt von `h₁` an: Es
setzt einen ∧E-Baustein ein, der dir die beiden Teile `h₂ : A` und `h₃ : B` als zwei neue blaue Punkte
gibt. Anders als `constructor` wirkt es auf das, was du hast, nicht auf das Ziel.
:::

```lean -show
example (A B : Prop) (h₁ : A ∧ B) : B ∧ A := by
  obtain ⟨h₂, h₃⟩ := h₁
  constructor
  · exact h₃
  · exact h₂
```
::::

::::task (rules := "conjI, conjE, impI, impE") (tactics := true) (assumptions := "") (conclusions := "A → A")
:::en
`intro`: to prove `A → B`, assume `A`.
:::

:::de
`intro`: Um `A → B` zu beweisen, nimm `A` an.
:::

:::tip (lang := "en") (rules := "impI")
*intro h₁* — for a goal `A → B`. It puts in an →I block: you get `h₁ : A` (the blue dot with the
purple ring), and the goal becomes `B`. You may use `h₁` only for this goal; below the board, a
tapped goal shows what you have there.
:::

:::tip (lang := "de") (rules := "impI")
*intro h₁* — für ein Ziel `A → B`. Es setzt einen →I-Baustein ein: Du bekommst `h₁ : A` (den blauen
Punkt mit lila Ring), und das Ziel wird `B`. Du darfst `h₁` nur für dieses Ziel verwenden; unter dem
Spielfeld zeigt ein angetipptes Ziel, was du dort hast.
:::

```lean -show
example (A : Prop) : A → A := by
  intro h₁
  exact h₁
```
::::

::::task (rules := "conjI, conjE, impI, impE") (tactics := true) (assumptions := "A → B, A") (conclusions := "B")
:::en
`apply`: work backwards from the goal.
:::

:::de
`apply`: vom Ziel aus rückwärts arbeiten.
:::

:::tip (lang := "en") (rules := "impE")
*apply h₁* — when the goal is `B` and you have `h₁ : A → B`. It puts in an →E block, which gives `B`
once you prove `A`: the goal becomes `A`.
:::

:::tip (lang := "de") (rules := "impE")
*apply h₁* — wenn das Ziel `B` ist und du `h₁ : A → B` hast. Es setzt einen →E-Baustein ein, der `B`
liefert, sobald du `A` bewiesen hast: Das Ziel wird `A`.
:::

```lean -show
example (A B : Prop) (h₁ : A → B) (h₂ : A) : B := by
  apply h₁
  exact h₂
```
::::

::::task (rules := "conjI, conjE, impI, impE") (tactics := true) (assumptions := "A → B, B → C") (conclusions := "A → C")
:::en
`intro` and `apply` together.
:::

:::de
`intro` und `apply` zusammen.
:::

```lean -show
example (A B C : Prop) (h₁ : A → B) (h₂ : B → C) : A → C := by
  intro h₃
  apply h₂
  apply h₁
  exact h₃
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (tactics := true) (assumptions := "B") (conclusions := "A ∨ B")
:::en
`left` and `right`: choose a side.
:::

:::de
`left` und `right`: eine Seite wählen.
:::

:::tip (lang := "en") (rules := "disjI1, disjI2")
*left* and *right* — for a goal `A ∨ B`. `left` puts in ∨I₁ and leaves the goal `A`, `right` puts in
∨I₂ and leaves `B`. Choose the side you can prove.
:::

:::tip (lang := "de") (rules := "disjI1, disjI2")
*left* und *right* — für ein Ziel `A ∨ B`. `left` setzt ∨I₁ ein und lässt das Ziel `A`, `right` setzt
∨I₂ ein und lässt `B`. Wähle die Seite, die du beweisen kannst.
:::

```lean -show
example (A B : Prop) (h₁ : B) : A ∨ B := by
  right
  exact h₁
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE") (tactics := true) (assumptions := "A ∨ B") (conclusions := "B ∨ A")
:::en
`obtain` on `A ∨ B`: two cases.
:::

:::de
`obtain` bei `A ∨ B`: zwei Fälle.
:::

:::tip (lang := "en") (rules := "disjE")
*obtain (h₂ | h₃) := h₁* — for `h₁ : A ∨ B`. It puts in an ∨E block with two cases: in the first you
have `h₂ : A`, in the second `h₃ : B`, and in each the goal is the same as before. Each case has its
own box: tap the goal of one case, and below the board you see what you have there; the hypothesis of
the other case is dimmed.
:::

:::tip (lang := "de") (rules := "disjE")
*obtain (h₂ | h₃) := h₁* — für `h₁ : A ∨ B`. Es setzt einen ∨E-Baustein mit zwei Fällen ein: Im ersten
hast du `h₂ : A`, im zweiten `h₃ : B`, und in beiden ist das Ziel dasselbe wie vorher. Jeder Fall hat
seinen eigenen Kasten: Tippe das Ziel eines Falls an, und unter dem Spielfeld siehst du, was du dort
hast; die Annahme des anderen Falls ist ausgegraut.
:::

```lean -show
example (A B : Prop) (h₁ : A ∨ B) : B ∨ A := by
  obtain (h₂ | h₃) := h₁
  · right
    exact h₂
  · left
    exact h₃
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE") (tactics := true) (assumptions := "A, A → ⊥") (conclusions := "B")
:::en
`exfalso`: prove `⊥` instead.
:::

:::de
`exfalso`: stattdessen `⊥` beweisen.
:::

:::tip (lang := "en") (rules := "falseE")
*exfalso* — for any goal. It puts in a ⊥E block: from `⊥` anything follows, so the goal becomes `⊥`.
That pays off when what you have contradicts itself, like `A` and `A → ⊥` here.
:::

:::tip (lang := "de") (rules := "falseE")
*exfalso* — für jedes Ziel. Es setzt einen ⊥E-Baustein ein: Aus `⊥` folgt alles, also wird das Ziel
`⊥`. Das lohnt sich, wenn sich widerspricht, was du hast, wie hier `A` und `A → ⊥`.
:::

```lean -show
example (A B : Prop) (h₁ : A) (h₂ : A → False) : B := by
  exfalso
  apply h₂
  exact h₁
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, raa") (tactics := true) (assumptions := "(A → ⊥) → ⊥") (conclusions := "A")
:::en
`by_contra`: assume the opposite.
:::

:::de
`by_contra`: das Gegenteil annehmen.
:::

:::tip (lang := "en") (rules := "raa")
`by_contra h₂` — for any goal `A`. It puts in an RAA block: you get `h₂ : A → ⊥` (that is, `¬A`), and
the goal becomes `⊥`. If the opposite of `A` leads to a contradiction, `A` holds.
:::

:::tip (lang := "de") (rules := "raa")
`by_contra h₂` — für jedes Ziel `A`. Es setzt einen RAA-Baustein ein: Du bekommst `h₂ : A → ⊥` (also
`¬A`), und das Ziel wird `⊥`. Führt das Gegenteil von `A` zu einem Widerspruch, dann gilt `A`.
:::

```lean -show
example (A : Prop) (h₁ : (A → False) → False) : A := by
  -- `by_contra h₂` (Mathlib), without Mathlib:
  apply Classical.byContradiction
  intro h₂
  apply h₁
  exact h₂
```
::::
