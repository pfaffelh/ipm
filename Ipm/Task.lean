import VersoManual

/-!
# Proof graph tasks

`::::task (assumptions := "A, B") (conclusions := "A ∧ B")` embeds a task for the tap-based proof
graph editor `ipm.js`, in the style of the Incredible Proof Machine. The task is checked in the
browser, without a server. A Lean proof of the task belongs inside the directive, in a hidden
`lean` block, so that building the site checks that the task is provable. With `(lemma := true)`,
the solved task is offered as a lemma (a block of its own) in the tasks after it; with
`(unlocks := "intro")`, solving it unlocks the tactic `intro`:

````
::::task (assumptions := "A ∧ B") (conclusions := "B ∧ A")
Swap the two parts.

```lean -show
example (A B : Prop) (h : A ∧ B) : B ∧ A := ⟨h.2, h.1⟩
```
::::
````
-/

open Lean Elab
open Verso Doc Elab ArgParse
open Verso.Genre Manual
open Verso.Output (Html)

namespace Ipm

def ipmJs : String := include_str "ipm.js"
def ipmCss : String := include_str "ipm.css"

/-- The statements of a task: separated by `;`, or else by `,` unless there is a quantifier (whose
`,` is part of the statement), e.g. `"A, B"`, `"∀ x, P x"`, `"∀ x, P x → Q x; P a"`. -/
def items (s : String) : Array String :=
  let parts := if s.contains ';' then s.splitOn ";"
    else if s.contains '∀' || s.contains '∃' then [s] else s.splitOn ","
  parts.toArray.map (·.trimAscii.copy) |>.filter (· ≠ "")

-- A task: assumptions, conclusions and the rules available, for `ipm.js`.
-- `lemma`: whether the task, once solved, is offered as a lemma in later tasks; `unlocks`: the
-- tactics that solving it unlocks.
block_extension Block.task (assumptions conclusions rules : Array String) (lemma : Bool) (unlocks : Array String) where
  data := Json.mkObj [("assumptions", toJson assumptions), ("conclusions", toJson conclusions),
    ("rules", toJson rules), ("lemma", toJson lemma), ("unlocks", toJson unlocks)]
  traverse _ _ _ := pure none
  extraJs := {JS.mk ipmJs}
  extraCss := {CSS.mk ipmCss}
  toHtml := some fun _ goB _ data content => do
    let get (k : String) := (data.getObjVal? k).toOption.getD (Json.arr #[])
    pure <| .tag "div" #[("class", "ipm-task"), ("data-assumptions", (get "assumptions").compress),
        ("data-conclusions", (get "conclusions").compress), ("data-rules", (get "rules").compress),
        ("data-lemma", (data.getObjValD "lemma").compress), ("data-unlocks", (get "unlocks").compress)] <|
      .seq #[← content.mapM goB, .tag "div" #[("class", "ipm-board")] .empty]
  toTeX := none

structure TaskConfig where
  assumptions : String
  conclusions : String
  rules : String
  lemma : Bool
  unlocks : String

instance : FromArgs TaskConfig DocElabM where
  fromArgs := TaskConfig.mk <$> .namedD `assumptions .string "" <*> .named `conclusions .string false <*>
    .namedD `rules .string "conjI, conjE, impI, impE" <*> .namedD `lemma .bool false <*>
    .namedD `unlocks .string ""

/-- A proof graph task; see the module documentation. -/
@[directive]
def task : DirectiveExpanderOf TaskConfig
  | cfg, contents => do
    let blocks ← contents.mapM elabBlock
    ``(Verso.Doc.Block.other
        (Block.task $(quote (items cfg.assumptions)) $(quote (items cfg.conclusions)) $(quote (items cfg.rules)) $(quote cfg.lemma) $(quote (items cfg.unlocks)))
        #[$blocks,*])

-- Text in one language: `:::en` and `:::de` blocks; `ipm.js` shows the language chosen in the header.
block_extension Block.lang (lang : String) where
  data := Json.str lang
  traverse _ _ _ := pure none
  extraJs := {JS.mk ipmJs}
  extraCss := {CSS.mk ipmCss}
  toHtml := some fun _ goB _ data content => do
    let lang := data.getStr?.toOption.getD "en"
    pure <| .tag "div" #[("class", s!"ipm-lang ipm-lang-{lang}"), ("lang", lang)] (← content.mapM goB)
  toTeX := none

/-- English text; see `de`. -/
@[directive]
def en : DirectiveExpanderOf Unit
  | (), contents => do
    let blocks ← contents.mapM elabBlock
    ``(Verso.Doc.Block.other (Block.lang "en") #[$blocks,*])

/-- German text, shown instead of the `en` blocks when German is chosen. -/
@[directive]
def de : DirectiveExpanderOf Unit
  | (), contents => do
    let blocks ← contents.mapM elabBlock
    ``(Verso.Doc.Block.other (Block.lang "de") #[$blocks,*])

end Ipm
