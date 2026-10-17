import VersoManual
import Ipm.Task

open Verso.Genre Manual
open Ipm
open Verso.Genre.Manual.InlineLean

/-
Tasks from the logic exercises of the Lean course (https://pfaffelh.github.io/leancourse/),
chapter 01-Logic, that the Incredible Proof Machine does not have.
Each task carries a Lean proof, checked when the site is built.
-/

#doc (Manual) "Session 6: From the Lean Course" =>

:::en
Tasks from the exercises of the [Lean course](https://pfaffelh.github.io/leancourse/) (chapter
01-Logic) that the sessions so far did not have, with all the rules from before. There, `¬P` is
written; here it is `P → ⊥`, which in Lean is the same.

The last tasks need TND, the others do not.
:::

:::de
Aufgaben aus den Übungen des [Lean-Kurses](https://pfaffelh.github.io/leancourse/) (Kapitel
01-Logic), die in den bisherigen Sitzungen nicht vorkamen, mit allen bisherigen Regeln. Dort steht
`¬P`; hier steht `P → ⊥`, was in Lean dasselbe ist.

Die letzten Aufgaben brauchen TND, die anderen nicht.
:::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "") (conclusions := "P → P → P")
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

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "") (conclusions := "P → Q → P")
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

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "") (conclusions := "P → Q → Q")
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

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "") (conclusions := "P → (P → Q) → Q")
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

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "") (conclusions := "(P → Q) → (Q → R) → P → R")
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

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "P → Q → R, Q") (conclusions := "P → R")
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

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "P → Q, Q → T, Q → R, R → S, T → P, R → T") (conclusions := "T → R")
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

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "") (conclusions := "(P → Q → R) → (P → Q) → P → R")
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

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "P, Q, R") (conclusions := "P ∧ Q ∧ R")
:::en
Sheet 01-b. `P ∧ Q ∧ R` means `P ∧ (Q ∧ R)`.
:::

:::de
Blatt 01-b. `P ∧ Q ∧ R` bedeutet `P ∧ (Q ∧ R)`.
:::

```lean -show
example (P Q R : Prop) (p : P) (q : Q) (r : R) : P ∧ Q ∧ R := ⟨p, q, r⟩
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "Q") (conclusions := "P ∨ Q ∨ R")
:::en
Sheet 01-c. `P ∨ Q ∨ R` means `P ∨ (Q ∨ R)`.
:::

:::de
Blatt 01-c. `P ∨ Q ∨ R` bedeutet `P ∨ (Q ∨ R)`.
:::

```lean -show
example (P Q R : Prop) (q : Q) : P ∨ Q ∨ R := Or.inr (Or.inl q)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "P ∧ Q ∧ R") (conclusions := "P ∨ Q ∨ R")
:::en
Any one of the three will do.
:::

:::de
Irgendeine der drei genügt.
:::

```lean -show
example (P Q R : Prop) (h : P ∧ Q ∧ R) : P ∨ Q ∨ R := Or.inl h.1
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "P ∨ P ∧ Q") (conclusions := "P")
:::en
Absorption, one direction: in both cases you have `P`.
:::

:::de
Absorption, eine Richtung: In beiden Fällen hast du `P`.
:::

```lean -show
example (P Q : Prop) (h : P ∨ P ∧ Q) : P := h.elim (fun p => p) (fun x => x.1)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "P → Q → R → S") (conclusions := "P ∧ Q ∧ R → S")
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

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "P → R, Q → R") (conclusions := "(P ∨ Q) ∧ S → R")
:::en
Take apart, then distinguish the cases. `S` is not needed.
:::

:::de
Zerlegen, dann die Fälle unterscheiden. `S` wird nicht gebraucht.
:::

```lean -show
example (P Q R S : Prop) (f : P → R) (g : Q → R) : (P ∨ Q) ∧ S → R := fun x => x.1.elim f g
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "(P ∨ Q) ∨ R") (conclusions := "P ∨ Q ∨ R")
:::en
Associativity of `∨`: the direction that session 3 did not have.
:::

:::de
Assoziativität von `∨`: die Richtung, die in Sitzung 3 fehlte.
:::

```lean -show
example (P Q R : Prop) (h : (P ∨ Q) ∨ R) : P ∨ Q ∨ R :=
  h.elim (fun pq => pq.elim Or.inl (fun q => Or.inr (Or.inl q))) (fun r => Or.inr (Or.inr r))
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "P → R, Q → S") (conclusions := "P ∨ Q → R ∨ S")
:::en
Weaken a disjunction on both sides at once.
:::

:::de
Schwäche eine Disjunktion auf beiden Seiten zugleich ab.
:::

```lean -show
example (P Q R S : Prop) (f : P → R) (g : Q → S) : P ∨ Q → R ∨ S :=
  fun h => h.elim (fun p => Or.inl (f p)) (fun q => Or.inr (g q))
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "P ∧ Q ∨ P ∧ R") (conclusions := "P ∧ (Q ∨ R)")
:::en
Distributivity, the direction back.
:::

:::de
Distributivität, die Richtung zurück.
:::

```lean -show
example (P Q R : Prop) (h : P ∧ Q ∨ P ∧ R) : P ∧ (Q ∨ R) :=
  h.elim (fun x => ⟨x.1, Or.inl x.2⟩) (fun x => ⟨x.1, Or.inr x.2⟩)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "(P ∨ Q) ∧ (P ∨ R)") (conclusions := "P ∨ Q ∧ R")
:::en
The other distributive law, back. Two case distinctions, one inside the other.
:::

:::de
Das andere Distributivgesetz, zurück. Zwei Fallunterscheidungen, eine in der anderen.
:::

```lean -show
example (P Q R : Prop) (h : (P ∨ Q) ∧ (P ∨ R)) : P ∨ Q ∧ R :=
  h.1.elim Or.inl (fun q => h.2.elim Or.inl (fun r => Or.inr ⟨q, r⟩))
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "") (conclusions := "P → (P → ⊥) → ⊥")
:::en
Sheet 01-d. In Lean: `P → ¬¬P`.
:::

:::de
Blatt 01-d. In Lean: `P → ¬¬P`.
:::

```lean -show
example (P : Prop) : P → (P → False) → False := fun p np => np p
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "") (conclusions := "P ∧ (P → ⊥) → ⊥")
:::en
`P` and `¬P` never hold together.
:::

:::de
`P` und `¬P` gelten nie zusammen.
:::

```lean -show
example (P : Prop) : P ∧ (P → False) → False := fun h => h.2 h.1
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "P, P → ⊥") (conclusions := "Q")
:::en
From a contradiction, anything follows.
:::

:::de
Aus einem Widerspruch folgt alles.
:::

```lean -show
example (P Q : Prop) (p : P) (np : P → False) : Q := (np p).elim
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "P → Q, P → Q → ⊥") (conclusions := "P → ⊥")
:::en
If `P` implies both `Q` and `¬Q`, then `P` is false.
:::

:::de
Wenn `P` sowohl `Q` als auch `¬Q` impliziert, ist `P` falsch.
:::

```lean -show
example (P Q : Prop) (f : P → Q) (g : P → Q → False) : P → False := fun p => g p (f p)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "") (conclusions := "P ∨ Q → (Q → ⊥) → P")
:::en
Sheet 01-f: one of the two, and not the second.
:::

:::de
Blatt 01-f: eines von beiden, und das zweite nicht.
:::

```lean -show
example (P Q : Prop) : P ∨ Q → (Q → False) → P := fun h nq => h.elim (fun p => p) (fun q => (nq q).elim)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "P, Q → ⊥") (conclusions := "(P → Q) → ⊥")
:::en
If `P` holds and `Q` does not, then `P → Q` is false.
:::

:::de
Wenn `P` gilt und `Q` nicht, ist `P → Q` falsch.
:::

```lean -show
example (P Q : Prop) (p : P) (nq : Q → False) : (P → Q) → False := fun f => nq (f p)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "P → Q, (P → ⊥) → Q") (conclusions := "Q")
:::en
Sheet 01-e. Classical: distinguish the cases `P` and `¬P`.
:::

:::de
Blatt 01-e. Klassisch: Unterscheide die Fälle `P` und `¬P`.
:::

```lean -show
example (P Q : Prop) (f : P → Q) (g : (P → False) → Q) : Q := (Classical.em P).elim f g
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "") (conclusions := "((P → ⊥) → P) → P")
:::en
A statement that follows from its own negation holds.
:::

:::de
Eine Aussage, die aus ihrer eigenen Negation folgt, gilt.
:::

```lean -show
example (P : Prop) : ((P → False) → P) → P := fun h => (Classical.em P).elim (fun p => p) (fun np => h np)
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "P → Q") (conclusions := "Q ∨ (P → ⊥)")
:::en
An implication as a disjunction.
:::

:::de
Eine Implikation als Disjunktion.
:::

```lean -show
example (P Q : Prop) (f : P → Q) : Q ∨ (P → False) := (Classical.em P).elim (fun p => Or.inl (f p)) Or.inr
```
::::

::::task (rules := "conjI, conjE, impI, impE, disjI1, disjI2, disjE, falseE, TND") (assumptions := "") (conclusions := "(P → Q) ∨ (Q → P)")
:::en
The final task: one of the two implications always holds. Distinguish the cases for `Q`.
:::

:::de
Die letzte Aufgabe: Eine der beiden Implikationen gilt immer. Unterscheide die Fälle für `Q`.
:::

```lean -show
example (P Q : Prop) : (P → Q) ∨ (Q → P) :=
  (Classical.em Q).elim (fun q => Or.inl (fun _ => q)) (fun nq => Or.inr (fun q => (nq q).elim))
```
::::
