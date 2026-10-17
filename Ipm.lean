import VersoManual
import Ipm.Task
import Ipm.Sessions.Conjunction
import Ipm.Sessions.Implication
import Ipm.Sessions.Disjunction
import Ipm.Sessions.Falsity
import Ipm.Sessions.Classical
import Ipm.Sessions.Course
import Ipm.Sessions.Iff
import Ipm.Sessions.Quantifiers
import Ipm.Sessions.Puzzles

open Verso.Genre Manual
open Ipm

#doc (Manual) "The Incredible Proof Machine in Lean" =>

%%%
authors := ["Peter Pfaffelhuber"]
%%%

:::en
Proofs as pictures, after the [Incredible Proof Machine](https://incredible.pm) by Joachim Breitner,
redone to be played by tapping, also on a phone.

What you know (the assumptions) is at the top, what you want to show (the goals) at the bottom. A
proof is a set of lines that lead from the assumptions to the goals, through *rule blocks*.

* A *red circle* is something still to be proved. Tap it, and everything in the picture that fits
  glows green: tap that to draw the line.
* A *blue dot* is something you have. Tap it, and the red circles it fits glow green.
* With *Allow tactics* switched on (below the board), tapping a red circle or a blue dot also shows
  buttons with the step that fits its statement, as a Lean tactic: for the goal `A → B` it is *→I · intro h*, for an assumption
  `h₁ : A ∧ B` *∧E · obtain ⟨ha, hb⟩ := h₁*. One tap puts the block in and connects it.
* New blocks come from the button *＋* below the picture: it opens a menu with the rules. Tap one
  to add it, or drag it onto the board. In a rule, `?1` and `?2` stand for any statements; they are
  filled in when you connect the block.
* A line that does not fit gets a ☠; tap it to see why. Tap a line and then ✕ to remove it.
* Blocks can be dragged around. To remove a rule block, drag it onto the trash can 🗑, which
  appears at the corner of the board while you drag. With −, + and Fit you can zoom.
* Below the board you see the same proof in Lean, updated with every step.
* A solved task becomes a *lemma*: in the menu of *＋*, under “Lemmas from solved tasks”, you can use
  it as a block of its own in other tasks.

You are done when no red circle is left. Your progress is kept in your browser.
:::

:::de
Beweise als Bilder, nach der [Incredible Proof Machine](https://incredible.pm) von Joachim Breitner,
neu gebaut zum Spielen durch Antippen, auch auf dem Handy.

Was du weißt (die Annahmen), steht oben, was du zeigen willst (die Ziele), unten. Ein Beweis besteht
aus Linien, die über *Regelblöcke* von den Annahmen zu den Zielen führen.

* Ein *roter Kreis* ist etwas, das noch zu beweisen ist. Tippe ihn an, und alles im Bild, was passt,
  leuchtet grün: Tippe es an, um die Linie zu ziehen.
* Ein *blauer Punkt* ist etwas, das du hast. Tippe ihn an, und die roten Kreise, zu denen er passt,
  leuchten grün.
* Wenn *Taktiken erlauben* (unter dem Spielfeld) eingeschaltet ist, zeigen Knöpfe neben einem
  angetippten roten Kreis oder blauen Punkt den passenden Schritt als Lean-Taktik: für das Ziel `A → B` ist das *→I · intro h*, für eine
  Annahme `h₁ : A ∧ B` *∧E · obtain ⟨ha, hb⟩ := h₁*. Ein Tipp setzt den Block ein und verbindet ihn.
* Neue Blöcke kommen über den Knopf *＋* unter dem Bild: Er öffnet ein Menü mit den Regeln. Tippe
  eine an, um sie hinzuzufügen, oder zieh sie aufs Spielfeld. In einer Regel stehen `?1` und `?2` für
  beliebige Aussagen; sie werden beim Verbinden ausgefüllt.
* Eine Linie, die nicht passt, bekommt ein ☠; tippe darauf, um zu sehen, warum. Tippe eine Linie und
  dann ✕ an, um sie zu entfernen.
* Blöcke lassen sich verschieben. Um einen Regelblock zu entfernen, zieh ihn auf den Mülleimer 🗑, der
  beim Ziehen an der Ecke des Spielfelds erscheint. Mit −, + und Fit kannst du zoomen.
* Unter dem Spielfeld steht derselbe Beweis in Lean, bei jedem Schritt aktualisiert.
* Eine gelöste Aufgabe wird zum *Hilfssatz*: Im Menü von *＋* kannst du sie unter „Hilfssätze aus
  gelösten Aufgaben“ in anderen Aufgaben als eigenen Block verwenden.

Du bist fertig, wenn kein roter Kreis mehr übrig ist. Dein Fortschritt wird in deinem Browser
gespeichert.
:::

{include 1 Ipm.Sessions.Conjunction}

{include 1 Ipm.Sessions.Implication}

{include 1 Ipm.Sessions.Disjunction}

{include 1 Ipm.Sessions.Falsity}

{include 1 Ipm.Sessions.Classical}

{include 1 Ipm.Sessions.Course}

{include 1 Ipm.Sessions.Iff}

{include 1 Ipm.Sessions.Quantifiers}

{include 1 Ipm.Sessions.Puzzles}
