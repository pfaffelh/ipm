import VersoManual
import Ipm.Task

open Verso.Genre Manual
open Ipm
open Verso.Genre.Manual.InlineLean

/-
Session 6 of the Incredible Proof Machine (https://incredible.pm, Joachim Breitner, MIT license):
quantifiers, written as in Lean.
Each task carries a Lean proof, checked when the site is built.
-/

#doc (Manual) "World 7: Quantifiers" =>

:::en
Statements about objects: `P a` says that the object `a` has the property `P`, `R a b` that `a`
and `b` are in the relation `R`. Four new rules:

* *∀-elimination* (∀E): from `∀ x, ?1 x` you get `?1 ?2` for any object `?2`. In Lean: `h a`.
* *∀-introduction* (∀I): to prove `∀ x, ?1 x`, prove `?1 c₁` for its *eigenvariable* `c₁`, an
  arbitrary object. In Lean: `fun c₁ => …`.
* *∃-introduction* (∃I): from `?1 ?2` for some object `?2` you get `∃ x, ?1 x`. In Lean: `⟨a, …⟩`.
* *∃-elimination* (∃E): from `∃ x, ?1 x` you may conclude `?2` if you can prove it with the
  hypothesis `?1 c₁`, where the eigenvariable `c₁` is the object that exists. In Lean:
  `Exists.elim h (fun c₁ h₁ => …)`.

An eigenvariable must stay arbitrary: it may not appear in the conclusion of its block, nor in an
assumption that the proof uses. If it does, its block gets a ⚠. As in Lean with `Inhabited`, there
is always at least one object; an object that is not determined appears in Lean as `default`.
:::

:::de
Aussagen über Objekte: `P a` sagt, dass das Objekt `a` die Eigenschaft `P` hat, `R a b`, dass `a`
und `b` in der Beziehung `R` stehen. Vier neue Regeln:

* *∀-Beseitigung* (∀E): Aus `∀ x, ?1 x` bekommst du `?1 ?2` für ein beliebiges Objekt `?2`. In
  Lean: `h a`.
* *∀-Einführung* (∀I): Um `∀ x, ?1 x` zu beweisen, beweise `?1 c₁` für seine *Eigenvariable* `c₁`,
  ein beliebiges Objekt. In Lean: `fun c₁ => …`.
* *∃-Einführung* (∃I): Aus `?1 ?2` für ein Objekt `?2` bekommst du `∃ x, ?1 x`. In Lean: `⟨a, …⟩`.
* *∃-Beseitigung* (∃E): Aus `∃ x, ?1 x` darfst du `?2` folgern, wenn du es mit der Annahme `?1 c₁`
  beweisen kannst; die Eigenvariable `c₁` ist das Objekt, das existiert. In Lean:
  `Exists.elim h (fun c₁ h₁ => …)`.

Eine Eigenvariable muss beliebig bleiben: Sie darf weder in der Folgerung ihres Blocks vorkommen noch
in einer Annahme, die der Beweis verwendet. Sonst bekommt ihr Block ein ⚠. Wie in Lean mit
`Inhabited` gibt es immer mindestens ein Objekt; ein Objekt, das nicht festgelegt ist, erscheint in
Lean als `default`.
:::

::::task (unlocks := "specialize") (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, allI, allE, exI, exE") (assumptions := "∀ x, P x") (conclusions := "P a")
:::en
Your first ∀E: what holds for all `x` holds for `a`.
:::

:::de
Dein erstes ∀E: Was für alle `x` gilt, gilt auch für `a`.
:::


:::tip (rules := "allE, allI, exI, exE")
:::

```lean -show
example (α : Type) (P : α → Prop) (a : α) (h : ∀ x, P x) : P a := h a
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, allI, allE, exI, exE") (assumptions := "∀ x, P x") (conclusions := "P a ∧ P b")
:::en
For two objects.
:::

:::de
Für zwei Objekte.
:::

```lean -show
example (α : Type) (P : α → Prop) (a b : α) (h : ∀ x, P x) : P a ∧ P b := ⟨h a, h b⟩
```
::::

::::task (unlocks := "use") (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, allI, allE, exI, exE") (assumptions := "P a") (conclusions := "∃ x, P x")
:::en
Your first ∃I: `a` is an example.
:::

:::de
Dein erstes ∃I: `a` ist ein Beispiel.
:::


:::tip (lang := "en") (rules := "exI")
∃I: to prove `∃ x, P x`, give an example. From `P a` you get `∃ x, P x`.
:::

:::tip (lang := "de")
∃I: Um `∃ x, P x` zu beweisen, gib ein Beispiel an. Aus `P a` bekommst du `∃ x, P x`.
:::

```lean -show
example (α : Type) (P : α → Prop) (a : α) (h : P a) : ∃ x, P x := ⟨a, h⟩
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, allI, allE, exI, exE") (assumptions := "∀ x, P x") (conclusions := "∃ x, P x")
:::en
No object is named. Here (as in Lean with `Inhabited`) there is always at least one.
:::

:::de
Kein Objekt hat einen Namen. Hier gibt es (wie in Lean mit `Inhabited`) immer mindestens eines.
:::

```lean -show
example (α : Type) [Inhabited α] (P : α → Prop) (h : ∀ x, P x) : ∃ x, P x := ⟨default, h default⟩
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, allI, allE, exI, exE") (assumptions := "∀ x, A") (conclusions := "A")
:::en
`A` does not depend on `x`.
:::

:::de
`A` hängt nicht von `x` ab.
:::

```lean -show
example (α : Type) [Inhabited α] (A : Prop) (h : ∀ _ : α, A) : A := h default
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, allI, allE, exI, exE") (assumptions := "∃ x, A") (conclusions := "A")
:::en
Your first ∃E. Its eigenvariable `c₁` is the object that exists; its hypothesis is `A`.
:::

:::de
Dein erstes ∃E. Seine Eigenvariable `c₁` ist das Objekt, das existiert; seine Annahme ist `A`.
:::


:::tip (lang := "en") (rules := "exE")
∃E: from `∃ x, A` you may use the hypothesis `A` about an object `c₁` that exists, the block's
*eigenvariable*. Nothing else is known about `c₁`: it must not appear in the goal.
:::

:::tip (lang := "de")
∃E: Aus `∃ x, A` darfst du die Annahme `A` über ein Objekt `c₁` verwenden, das existiert, die
*Eigenvariable* des Blocks. Sonst ist über `c₁` nichts bekannt: Es darf nicht im Ziel vorkommen.
:::

```lean -show
example (α : Type) (A : Prop) (h : ∃ _ : α, A) : A := h.elim (fun _ a => a)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, allI, allE, exI, exE") (assumptions := "A ∧ (∀ x, P x)") (conclusions := "∀ x, A ∧ P x")
:::en
Your first ∀I: prove `A ∧ P c₁` for an arbitrary `c₁`.
:::

:::de
Dein erstes ∀I: Beweise `A ∧ P c₁` für ein beliebiges `c₁`.
:::


:::tip (lang := "en") (rules := "allI")
∀I: to prove `∀ x, A ∧ P x`, prove `A ∧ P c₁` for an arbitrary object `c₁`, the block's
eigenvariable. Arbitrary means: `c₁` must not appear in an assumption that you use.
:::

:::tip (lang := "de")
∀I: Um `∀ x, A ∧ P x` zu beweisen, beweise `A ∧ P c₁` für ein beliebiges Objekt `c₁`, die
Eigenvariable des Blocks. Beliebig heißt: `c₁` darf in keiner Annahme vorkommen, die du verwendest.
:::

```lean -show
example (α : Type) (P : α → Prop) (A : Prop) (h : A ∧ (∀ x, P x)) : ∀ x, A ∧ P x := fun x => ⟨h.1, h.2 x⟩
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, allI, allE, exI, exE") (assumptions := "(∀ x, P x) ∧ (∀ x, Q x)") (conclusions := "∀ x, P x ∧ Q x")
:::en
Two ∀ statements into one.
:::

:::de
Zwei ∀-Aussagen werden eine.
:::

```lean -show
example (α : Type) (P Q : α → Prop) (h : (∀ x, P x) ∧ (∀ x, Q x)) : ∀ x, P x ∧ Q x := fun x => ⟨h.1 x, h.2 x⟩
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, allI, allE, exI, exE") (assumptions := "(∃ x, P x) ∨ (∃ x, Q x)") (conclusions := "∃ x, P x ∨ Q x")
:::en
A case distinction, and in each case an ∃E.
:::

:::de
Eine Fallunterscheidung, und in jedem Fall ein ∃E.
:::

```lean -show
example (α : Type) (P Q : α → Prop) (h : (∃ x, P x) ∨ (∃ x, Q x)) : ∃ x, P x ∨ Q x :=
  h.elim (fun ⟨x, p⟩ => ⟨x, Or.inl p⟩) (fun ⟨x, q⟩ => ⟨x, Or.inr q⟩)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, allI, allE, exI, exE") (assumptions := "(∃ x, P x) → A") (conclusions := "∀ x, P x → A")
:::en
Here `∀ x, P x → A` means `∀ x, (P x → A)`.
:::

:::de
Hier bedeutet `∀ x, P x → A` dasselbe wie `∀ x, (P x → A)`.
:::

```lean -show
example (α : Type) (P : α → Prop) (A : Prop) (h : (∃ x, P x) → A) : ∀ x, P x → A := fun x p => h ⟨x, p⟩
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, allI, allE, exI, exE") (assumptions := "∀ x, P x → Q x; P a") (conclusions := "Q a")
:::en
First ∀E, then →E.
:::

:::de
Erst ∀E, dann →E.
:::

```lean -show
example (α : Type) (P Q : α → Prop) (a : α) (h : ∀ x, P x → Q x) (p : P a) : Q a := h a p
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, allI, allE, exI, exE") (assumptions := "∀ x, ∀ y, P x y") (conclusions := "∀ y, ∀ x, P x y")
:::en
Swap two ∀.
:::

:::de
Vertausche zwei ∀.
:::

```lean -show
example (α : Type) (P : α → α → Prop) (h : ∀ x, ∀ y, P x y) : ∀ y, ∀ x, P x y := fun y x => h x y
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, allI, allE, exI, exE") (assumptions := "∃ x, ∃ y, P x y") (conclusions := "∃ y, ∃ x, P x y")
:::en
Swap two ∃.
:::

:::de
Vertausche zwei ∃.
:::

```lean -show
example (α : Type) (P : α → α → Prop) (h : ∃ x, ∃ y, P x y) : ∃ y, ∃ x, P x y :=
  h.elim fun x hx => hx.elim fun y hy => ⟨y, x, hy⟩
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, allI, allE, exI, exE") (assumptions := "∃ x, ∀ y, P x y") (conclusions := "∀ y, ∃ x, P x y")
:::en
∃∀ gives ∀∃. (The other way round it does not work: try it, and watch the ⚠.)
:::

:::de
Aus ∃∀ folgt ∀∃. (Umgekehrt geht es nicht: Probiere es, und achte auf das ⚠.)
:::

```lean -show
example (α : Type) (P : α → α → Prop) (h : ∃ x, ∀ y, P x y) : ∀ y, ∃ x, P x y := fun y => h.elim fun x hx => ⟨x, hx y⟩
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, allI, allE, exI, exE") (assumptions := "∀ x, P x") (conclusions := "(∃ x, P x → ⊥) → ⊥")
:::en
In Lean: from `∀ x, P x` follows `¬∃ x, ¬P x`.
:::

:::de
In Lean: Aus `∀ x, P x` folgt `¬∃ x, ¬P x`.
:::

```lean -show
example (α : Type) (P : α → Prop) (h : ∀ x, P x) : (∃ x, P x → False) → False := fun ⟨x, np⟩ => np (h x)
```
::::

::::task (lemma := true) (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, allI, allE, exI, exE") (assumptions := "(∀ x, P x) → ⊥") (conclusions := "∃ x, P x → ⊥")
:::en
Classical: if not all `x` have `P`, then one does not. Use TND twice.
:::

:::de
Klassisch: Wenn nicht alle `x` die Eigenschaft `P` haben, dann eines nicht. Verwende TND zweimal.
:::

```lean -show
example (α : Type) (P : α → Prop) (h : (∀ x, P x) → False) : ∃ x, P x → False :=
  (Classical.em (∃ x, P x → False)).elim id
    (fun hne => (h (fun x => (Classical.em (P x)).elim id (fun np => (hne ⟨x, np⟩).elim))).elim)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND, allI, allE, exI, exE") (assumptions := "(∀ x, P x) → A") (conclusions := "∃ x, P x → A")
:::en
The final level, and a hard one. Distinguish the cases `∀ x, P x` and its negation.
:::

:::de
Das letzte Level, und ein schweres. Unterscheide die Fälle `∀ x, P x` und seine Negation.
:::

```lean -show
example (α : Type) [Inhabited α] (P : α → Prop) (A : Prop) (h : (∀ x, P x) → A) : ∃ x, P x → A :=
  (Classical.em (∀ x, P x)).elim (fun hall => ⟨default, fun _ => h hall⟩)
    (fun hn => (Classical.em (∃ x, P x → False)).elim (fun ⟨x, np⟩ => ⟨x, fun p => (np p).elim⟩)
      (fun hne => (hn (fun x => (Classical.em (P x)).elim id (fun np => (hne ⟨x, np⟩).elim))).elim))
```
::::
