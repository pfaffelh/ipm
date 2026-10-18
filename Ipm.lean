import VersoManual
import Ipm.Task
import Ipm.Sessions.Conjunction
import Ipm.Sessions.Implication
import Ipm.Sessions.Disjunction
import Ipm.Sessions.Falsity
import Ipm.Sessions.Classical
import Ipm.Sessions.Iff
import Ipm.Sessions.Quantifiers
import Ipm.Sessions.Puzzles
import Ipm.Sessions.Induction
import Ipm.Trainer
import Ipm.TacticLexicon
import Ipm.BlockLexicon

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
* New blocks stand left of the board on a large screen, and come from *＋* below it on a phone. Tap
  one to add it, or drag it onto the board. In a rule, `?1` and `?2` stand for any statements; they
  are filled in when you connect the block.
* A line that does not fit gets a ☠; tap it to see why, and ✕ to remove it. Any line can be tapped
  and removed with ✕.
* Blocks can be dragged around. To remove a rule block, drag it onto the trash can 🗑, which
  appears at the corner of the board while you drag. The board always shows the whole proof.
* Below the board: *Undo*, *Start over*, *Tidy up*, *Lean* (the same proof in Lean, updated with
  every step), *Tips* (the level's text and tips) and *Next*.
* The worlds are in the table of contents (☰ on a phone); the levels of a world are the dots above
  the board. A level that brings something new explains it in a tip, the first time.
* Two modes, switched above each level: in the *puzzle mode* you build the proof from blocks and
  lines, as described here; in the *Lean tactic mode* you only tap tactic buttons, as in Lean (for
  the goal `A → B`: *→I · intro h*), and goals with different hypotheses get boards of their own.
  Both build the same proof; below the board it is the Lean proof, a term or a tactic script.
* Some solved levels become *lemmas*: in later levels they appear with the blocks, under “Lemmas
  from solved levels”.

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
* Neue Bausteine stehen auf einem großen Bildschirm links neben dem Spielfeld, auf dem Handy kommen
  sie über *＋* darunter. Tippe einen an, um ihn hinzuzufügen, oder zieh ihn aufs Spielfeld. In einer
  Regel stehen `?1` und `?2` für beliebige Aussagen; sie werden beim Verbinden ausgefüllt.
* Eine Linie, die nicht passt, bekommt ein ☠; tippe darauf, um zu sehen, warum, und auf ✕, um sie zu
  entfernen. Jede Linie lässt sich antippen und mit ✕ entfernen.
* Blöcke lassen sich verschieben. Um einen Regelblock zu entfernen, zieh ihn auf den Mülleimer 🗑, der
  beim Ziehen an der Ecke des Spielfelds erscheint. Das Spielfeld zeigt immer den ganzen Beweis.
* Unter dem Spielfeld: *Zurück*, *Neu anfangen*, *Aufräumen*, *Lean* (derselbe Beweis in Lean, bei
  jedem Schritt aktualisiert), *Tipps* (der Text des Levels und seine Tipps) und *Weiter*.
* Die Welten stehen im Inhaltsverzeichnis (☰ auf dem Handy); die Levels einer Welt sind die Kreise
  über dem Spielfeld. Ein Level, das etwas Neues bringt, erklärt es beim ersten Mal in einem Tipp.
* Zwei Modi, umschaltbar über jedem Level: Im *Puzzle-Modus* baust du den Beweis aus Bausteinen und
  Linien, wie hier beschrieben; im *Lean-Taktik-Modus* tippst du nur Taktik-Knöpfe an, wie in Lean
  (für das Ziel `A → B`: *→I · intro h*), und Ziele mit verschiedenen Annahmen bekommen eigene
  Spielfelder. Beide bauen denselben Beweis; unter dem Spielfeld steht er in Lean, als Term oder als
  Taktik-Skript.
* Manche gelösten Levels werden zu *Hilfssätzen*: In späteren Levels stehen sie bei den Bausteinen,
  unter „Hilfssätze aus gelösten Levels“.

Du bist fertig, wenn kein roter Kreis mehr übrig ist. Dein Fortschritt wird in deinem Browser
gespeichert.
:::

{include 1 Ipm.Sessions.Conjunction}

{include 1 Ipm.Sessions.Implication}

{include 1 Ipm.Sessions.Disjunction}

{include 1 Ipm.Sessions.Falsity}

{include 1 Ipm.Sessions.Classical}

{include 1 Ipm.Sessions.Iff}

{include 1 Ipm.Sessions.Quantifiers}

{include 1 Ipm.Sessions.Puzzles}

{include 1 Ipm.Sessions.Induction}

{include 1 Ipm.Trainer}

{include 1 Ipm.TacticLexicon}

{include 1 Ipm.BlockLexicon}
