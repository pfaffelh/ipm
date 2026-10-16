import VersoManual
import Ipm.Task
import Ipm.Sessions.Conjunction
import Ipm.Sessions.Implication

open Verso.Genre Manual

#doc (Manual) "Proof Graphs" =>

%%%
authors := ["Peter Pfaffelhuber"]
%%%

Proofs as pictures, after the [Incredible Proof Machine](https://incredible.pm) by Joachim Breitner,
redone to be played by tapping, also on a phone.

What you know (the assumptions) is at the top, what you want to show (the goals) at the bottom. A
proof is a set of lines that lead from the assumptions to the goals, through *rule blocks*.

* A *red circle* is something still to be proved. Tap it, and everything in the picture that fits
  glows green: tap that to draw the line.
* A *blue dot* is something you have. Tap it, and the red circles it fits glow green.
* New rule blocks come from the list below the picture. In a rule, `?1` and `?2` stand for any
  statements; they are filled in when you connect the block.
* A line that does not fit gets a ☠; tap it to see why. Blocks can be dragged around; drag a
  rule block onto the trash can 🗑 (bottom right, it appears while dragging) to remove it.

You are done when no red circle is left. Your progress is kept in your browser.

{include 1 Ipm.Sessions.Conjunction}

{include 1 Ipm.Sessions.Implication}
