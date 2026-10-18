/-
Tactic proofs for the levels that the search of `tactics-only.mjs` did not find, and for the levels
added later. Only tactics that the game has as buttons, with the names the game gives: the
assumptions h₁, h₂, …, then every new hypothesis the next number, in the order it is made.
Lean core only: `rcases Classical.em P with h | h'` is the game's `by_cases`, `apply
Classical.byContradiction` + `intro h` its `by_contra`, `refine ⟨x, ?_⟩` its `use x`, `have h₄ := h₁ h₂` its `have h₄ := h₁ ?_` on h₁ and `exact h₂`.
`tactic-proofs.mjs` plays each of them in the game, with the tactic buttons alone.
Check: `lake env lean tests/tactic-proofs.lean`.
-/

-- (unused assumptions are part of some levels)
set_option linter.unusedVariables false

-- level 3.15
example (P Q R : Prop) (h₁ : (P ∨ Q) ∧ (P ∨ R)) : P ∨ Q ∧ R := by
  obtain ⟨h₂, h₃⟩ := h₁
  obtain (h₄ | h₅) := h₂
  · left
    exact h₄
  · obtain (h₆ | h₇) := h₃
    · left
      exact h₆
    · right
      constructor
      · exact h₅
      · exact h₇

-- level 3.18
example (P Q R S : Prop) (h₁ : P → R) (h₂ : Q → R) : (P ∨ Q) ∧ S → R := by
  intro h₃
  obtain ⟨h₄, h₅⟩ := h₃
  obtain (h₆ | h₇) := h₄
  · apply h₁
    exact h₆
  · apply h₂
    exact h₇

-- level 4.8
example (A B : Prop) (h₁ : A ∨ B → False) : (A → False) ∧ (B → False) := by
  constructor
  · intro h₂
    apply h₁
    left
    exact h₂
  · intro h₃
    apply h₁
    right
    exact h₃

-- level 4.14
example (A B C : Prop) (h₁ : (A → False) ∨ (B → False) ∨ (C → False)) : A ∧ B ∧ C → False := by
  intro h₂
  obtain ⟨h₃, h₄⟩ := h₂
  obtain ⟨h₅, h₆⟩ := h₄
  obtain (h₇ | h₈) := h₁
  · apply h₇
    exact h₃
  · obtain (h₉ | h₁₀) := h₈
    · apply h₉
      exact h₅
    · apply h₁₀
      exact h₆

-- level 5.3
example (A B : Prop) (h₁ : A ∧ B → False) : (A → False) ∨ (B → False) := by
  rcases Classical.em A with h₂ | h₃
  · right
    intro h₄
    apply h₁
    constructor
    · exact h₂
    · exact h₄
  · left
    exact h₃

-- level 5.7
example (A B C : Prop) (h₁ : A → B) (h₂ : B → C) : (A → False) ∨ C := by
  rcases Classical.em A with h₃ | h₄
  · right
    apply h₂
    apply h₁
    exact h₃
  · left
    exact h₄

-- level 5.8
example (A B : Prop) : ((A → B) → A) → A := by
  intro h₁
  rcases Classical.em A with h₂ | h₃
  · exact h₂
  · apply h₁
    intro h₄
    exfalso
    apply h₃
    exact h₄

-- level 5.9
example (A B C : Prop) (h₁ : A ∧ B ∧ C → False) : (A → False) ∨ (B → False) ∨ (C → False) := by
  rcases Classical.em A with h₂ | h₃
  · rcases Classical.em B with h₄ | h₅
    · right
      right
      intro h₆
      apply h₁
      constructor
      · exact h₂
      · constructor
        · exact h₄
        · exact h₆
    · right
      left
      exact h₅
  · left
    exact h₃

-- level 5.10
example (P Q : Prop) (h₁ : P → Q) (h₂ : (P → False) → Q) : Q := by
  rcases Classical.em P with h₃ | h₄
  · apply h₁
    exact h₃
  · apply h₂
    exact h₄

-- level 5.13
example (P Q : Prop) : (P → Q) ∨ (Q → P) := by
  rcases Classical.em P with h₁ | h₂
  · right
    intro h₃
    exact h₁
  · left
    intro h₄
    exfalso
    apply h₂
    exact h₄

-- level 5.15
example (A B : Prop) (h₁ : (A → B) → False) : A ∧ (B → False) := by
  constructor
  · apply Classical.byContradiction
    intro h₂
    apply h₁
    intro h₃
    exfalso
    apply h₂
    exact h₃
  · intro h₄
    apply h₁
    intro h₅
    exact h₄

-- level 6.5
example (P Q : Prop) (h₁ : P ↔ Q) : Q ↔ P := by
  constructor
  · intro h₂
    apply h₁.mpr
    exact h₂
  · intro h₃
    apply h₁.mp
    exact h₃

-- level 6.6
example (P Q R : Prop) (h₁ : P ↔ Q) (h₂ : Q ↔ R) : P ↔ R := by
  constructor
  · intro h₃
    apply h₂.mp
    apply h₁.mp
    exact h₃
  · intro h₄
    apply h₁.mpr
    apply h₂.mpr
    exact h₄

-- level 6.7
example (P Q : Prop) : (P ↔ Q) ↔ (P → Q) ∧ (Q → P) := by
  constructor
  · intro h₁
    constructor
    · intro h₂
      apply h₁.mp
      exact h₂
    · intro h₃
      apply h₁.mpr
      exact h₃
  · intro h₄
    obtain ⟨h₅, h₆⟩ := h₄
    constructor
    · exact h₅
    · exact h₆

-- level 6.8
example (P Q R S T : Prop) (h₁ : P → Q) (h₂ : Q → T) (h₃ : Q → R) (h₄ : R → S) (h₅ : T → P)
    (h₆ : R → T) : Q ↔ R := by
  constructor
  · intro h₇
    apply h₃
    exact h₇
  · intro h₈
    apply h₁
    apply h₅
    apply h₆
    exact h₈

-- level 6.9
example (P Q R : Prop) (h₁ : P ↔ Q) : P ∧ R ↔ Q ∧ R := by
  constructor
  · intro h₂
    obtain ⟨h₃, h₄⟩ := h₂
    constructor
    · apply h₁.mp
      exact h₃
    · exact h₄
  · intro h₅
    obtain ⟨h₆, h₇⟩ := h₅
    constructor
    · apply h₁.mpr
      exact h₆
    · exact h₇

-- level 6.15
example (P Q : Prop) (h₁ : P → False) (h₂ : Q) : P ↔ (Q → False) := by
  constructor
  · intro h₃
    exfalso
    apply h₁
    exact h₃
  · intro h₄
    exfalso
    apply h₄
    exact h₂

-- level 6.16
example (P Q : Prop) : P ∨ Q ↔ Q ∨ P := by
  constructor
  · intro h₁
    obtain (h₂ | h₃) := h₁
    · right
      exact h₂
    · left
      exact h₃
  · intro h₄
    obtain (h₅ | h₆) := h₄
    · right
      exact h₅
    · left
      exact h₆

-- level 6.17
example (P Q : Prop) : P ∨ P ∧ Q ↔ P := by
  constructor
  · intro h₁
    obtain (h₂ | h₃) := h₁
    · exact h₂
    · obtain ⟨h₄, h₅⟩ := h₃
      exact h₄
  · intro h₆
    left
    exact h₆

-- level 6.18
example (P Q : Prop) : (P ∨ Q → False) ↔ (P → False) ∧ (Q → False) := by
  constructor
  · intro h₁
    constructor
    · intro h₂
      apply h₁
      left
      exact h₂
    · intro h₃
      apply h₁
      right
      exact h₃
  · intro h₄
    obtain ⟨h₅, h₆⟩ := h₄
    intro h₇
    obtain (h₈ | h₉) := h₇
    · apply h₅
      exact h₈
    · apply h₆
      exact h₉

-- level 6.19
example (P Q R : Prop) : P ∧ (Q ∨ R) ↔ P ∧ Q ∨ P ∧ R := by
  constructor
  · intro h₁
    obtain ⟨h₂, h₃⟩ := h₁
    obtain (h₄ | h₅) := h₃
    · left
      constructor
      · exact h₂
      · exact h₄
    · right
      constructor
      · exact h₂
      · exact h₅
  · intro h₆
    obtain (h₇ | h₈) := h₆
    · obtain ⟨h₉, h₁₀⟩ := h₇
      constructor
      · exact h₉
      · left
        exact h₁₀
    · obtain ⟨h₁₁, h₁₂⟩ := h₈
      constructor
      · exact h₁₁
      · right
        exact h₁₂

-- level 6.20
example (P Q R : Prop) : P ∨ Q ∧ R ↔ (P ∨ Q) ∧ (P ∨ R) := by
  constructor
  · intro h₁
    obtain (h₂ | h₃) := h₁
    · constructor
      · left
        exact h₂
      · left
        exact h₂
    · obtain ⟨h₄, h₅⟩ := h₃
      constructor
      · right
        exact h₄
      · right
        exact h₅
  · intro h₆
    obtain ⟨h₇, h₈⟩ := h₆
    obtain (h₉ | h₁₀) := h₇
    · left
      exact h₉
    · obtain (h₁₁ | h₁₂) := h₈
      · left
        exact h₁₁
      · right
        constructor
        · exact h₁₀
        · exact h₁₂

-- level 6.21
example (P : Prop) : ((P → False) → False) ↔ P := by
  constructor
  · intro h₁
    rcases Classical.em P with h₂ | h₃
    · exact h₂
    · exfalso
      apply h₁
      exact h₃
  · intro h₄
    intro h₅
    apply h₅
    exact h₄

-- level 6.22
example (P Q : Prop) : (P ∧ Q → False) ↔ (P → False) ∨ (Q → False) := by
  constructor
  · intro h₁
    rcases Classical.em P with h₂ | h₃
    · right
      intro h₄
      apply h₁
      constructor
      · exact h₂
      · exact h₄
    · left
      exact h₃
  · intro h₅
    intro h₆
    obtain ⟨h₇, h₈⟩ := h₆
    obtain (h₉ | h₁₀) := h₅
    · apply h₉
      exact h₇
    · apply h₁₀
      exact h₈

-- level 6.23
example (P Q : Prop) : (P → Q) ↔ (P → False) ∨ Q := by
  constructor
  · intro h₁
    rcases Classical.em P with h₂ | h₃
    · right
      apply h₁
      exact h₂
    · left
      exact h₃
  · intro h₄
    intro h₅
    obtain (h₆ | h₇) := h₄
    · exfalso
      apply h₆
      exact h₅
    · exact h₇

-- level 6.24
example (P Q : Prop) : ((P → Q) → False) ↔ P ∧ (Q → False) := by
  constructor
  · intro h₁
    constructor
    · apply Classical.byContradiction
      intro h₂
      apply h₁
      intro h₃
      exfalso
      apply h₂
      exact h₃
    · intro h₄
      apply h₁
      intro h₅
      exact h₄
  · intro h₆
    intro h₇
    obtain ⟨h₈, h₉⟩ := h₆
    apply h₉
    apply h₇
    exact h₈

-- level 7.9
example (α : Type) (P Q : α → Prop) (h₁ : (∃ x, P x) ∨ (∃ x, Q x)) : ∃ x, P x ∨ Q x := by
  obtain (h₂ | h₃) := h₁
  · obtain ⟨c₁, h₄⟩ := h₂
    refine ⟨c₁, ?_⟩
    left
    exact h₄
  · obtain ⟨c₂, h₅⟩ := h₃
    refine ⟨c₂, ?_⟩
    right
    exact h₅

-- level 7.20
example (α : Type) (P : α → Prop) (h₁ : (∀ x, P x) → False) : ∃ x, P x → False := by
  apply Classical.byContradiction
  intro h₂
  apply h₁
  intro c₁
  apply Classical.byContradiction
  intro h₃
  apply h₂
  refine ⟨c₁, ?_⟩
  intro h₄
  apply h₃
  exact h₄

-- level 7.23
example (α : Type) [Inhabited α] (A : Prop) (P : α → Prop) (h₁ : (∀ x, P x) → A) : ∃ x, P x → A := by
  rcases Classical.em A with h₂ | h₃
  · refine ⟨default, ?_⟩
    intro h₄
    exact h₂
  · apply Classical.byContradiction
    intro h₅
    apply h₃
    apply h₁
    intro c₁
    apply Classical.byContradiction
    intro h₆
    apply h₅
    refine ⟨c₁, ?_⟩
    intro h₇
    exfalso
    apply h₆
    exact h₇

-- level 8.1
example (α : Type) [Inhabited α] (P : α → Prop) : ∃ x, P x → ∀ y, P y := by
  rcases Classical.em (∀ y, P y) with h₁ | h₂
  · refine ⟨default, ?_⟩
    intro h₃
    exact h₁
  · apply Classical.byContradiction
    intro h₄
    apply h₂
    intro c₁
    apply Classical.byContradiction
    intro h₅
    apply h₄
    refine ⟨c₁, ?_⟩
    intro h₆
    exfalso
    apply h₅
    exact h₆

-- level 8.2
example (α : Type) [Inhabited α] (R : α → Prop) (f : α → α) (h₁ : ∀ x, (R x → False) → R (f x)) :
    ∃ x, R x ∧ R (f (f x)) := by
  rcases Classical.em (R default) with h₂ | h₃
  · rcases Classical.em (R (f (f default))) with h₄ | h₅
    · refine ⟨default, ?_⟩
      constructor
      · exact h₂
      · exact h₄
    · refine ⟨f default, ?_⟩
      constructor
      · apply Classical.byContradiction
        intro h₆
        apply h₅
        apply h₁
        exact h₆
      · apply h₁
        exact h₅
  · rcases Classical.em (R (f (f (f default)))) with h₇ | h₈
    · refine ⟨f default, ?_⟩
      constructor
      · apply h₁
        exact h₃
      · exact h₇
    · refine ⟨f (f default), ?_⟩
      constructor
      · apply Classical.byContradiction
        intro h₉
        apply h₈
        apply h₁
        exact h₉
      · apply h₁
        exact h₈

-- level 9.4
example (Even Odd : Nat → Prop) (h₁ : Even 0) (h₂ : ∀ n, Even n → Odd (n + 1))
    (h₃ : ∀ n, Odd n → Even (n + 1)) : ∀ n, Even n ∨ Odd n := by
  intro n
  induction n with
  | zero =>
    left
    exact h₁
  | succ c₁ h₄ =>
    obtain (h₅ | h₆) := h₄
    · right
      apply h₂
      exact h₅
    · left
      apply h₃
      exact h₆

-- level 9.5
example (P Q : Nat → Prop) (h₁ : P 0) (h₂ : Q 0) (h₃ : ∀ n, P n → Q (n + 1))
    (h₄ : ∀ n, Q n → P (n + 1)) : ∀ n, P n ∧ Q n := by
  intro n
  induction n with
  | zero =>
    constructor
    · exact h₁
    · exact h₂
  | succ c₁ h₅ =>
    obtain ⟨h₆, h₇⟩ := h₅
    constructor
    · apply h₄
      exact h₇
    · apply h₃
      exact h₆

-- level 9.6
example (P Q : Nat → Prop) (h₁ : P 0 ∨ Q 0) (h₂ : ∀ n, P n → Q (n + 1))
    (h₃ : ∀ n, Q n → P (n + 1)) : ∀ n, P n ∨ Q n := by
  intro n
  induction n with
  | zero =>
    exact h₁
  | succ c₁ h₄ =>
    obtain (h₅ | h₆) := h₄
    · right
      apply h₂
      exact h₅
    · left
      apply h₃
      exact h₆

-- level 5.6
example (A : Prop) : A ∨ (A → False) := by
  apply Classical.byContradiction
  intro h₁
  apply h₁
  right
  intro h₂
  apply h₁
  left
  exact h₂

-- level 5.14
example (A B C : Prop) (h₁ : A → B ∨ C) : (A → B) ∨ (A → C) := by
  rcases Classical.em A with h₂ | h₃
  · have h₄ := h₁ h₂
    obtain (h₅ | h₆) := h₄
    · left
      intro h₇
      exact h₅
    · right
      intro h₈
      exact h₆
  · left
    intro h₉
    exfalso
    apply h₃
    exact h₉

-- level 6.25
example (A B : Prop) (h₁ : (A ↔ B) → False) : A ↔ (B → False) := by
  constructor
  · intro h₂
    intro h₃
    apply h₁
    constructor
    · intro h₄
      exact h₃
    · intro h₅
      exact h₂
  · intro h₆
    rcases Classical.em A with h₇ | h₈
    · exact h₇
    · exfalso
      apply h₁
      constructor
      · intro h₉
        exfalso
        apply h₈
        exact h₉
      · intro h₁₀
        exfalso
        apply h₆
        exact h₁₀

-- level 6.26
example (A B : Prop) : (A ↔ B) ∨ (A ↔ (B → False)) := by
  rcases Classical.em (A ↔ B) with h₁ | h₂
  · left
    exact h₁
  · right
    constructor
    · intro h₃
      intro h₄
      apply h₂
      constructor
      · intro h₅
        exact h₄
      · intro h₆
        exact h₃
    · intro h₇
      rcases Classical.em A with h₈ | h₉
      · exact h₈
      · exfalso
        apply h₂
        constructor
        · intro h₁₀
          exfalso
          apply h₉
          exact h₁₀
        · intro h₁₁
          exfalso
          apply h₇
          exact h₁₁

-- level 7.16
example (α : Type) (P : α → Prop) (h₁ : (∃ x, P x) → False) : ∀ x, P x → False := by
  intro c₁
  intro h₂
  apply h₁
  refine ⟨c₁, ?_⟩
  exact h₂

-- level 7.17
example (α : Type) (P : α → Prop) (h₁ : ∀ x, P x → False) : (∃ x, P x) → False := by
  intro h₂
  obtain ⟨c₁, h₃⟩ := h₂
  apply h₁
  exact h₃

-- level 7.18
example (α : Type) (P : α → Prop) (h₁ : (∃ x, P x → False) → False) : ∀ x, P x := by
  intro c₁
  apply Classical.byContradiction
  intro h₂
  apply h₁
  refine ⟨c₁, ?_⟩
  exact h₂

-- level 7.19
example (α : Type) (P : α → Prop) (h₁ : (∀ x, P x → False) → False) : ∃ x, P x := by
  apply Classical.byContradiction
  intro h₂
  apply h₁
  intro c₁
  intro h₃
  apply h₂
  refine ⟨c₁, ?_⟩
  exact h₃

-- level 7.21
example (α : Type) (A : Prop) (P : α → Prop) (h₁ : ∀ x, P x ∨ A) : (∀ x, P x) ∨ A := by
  rcases Classical.em A with h₂ | h₃
  · right
    exact h₂
  · left
    intro c₁
    specialize h₁ c₁
    obtain (h₄ | h₅) := h₁
    · exact h₄
    · exfalso
      apply h₃
      exact h₅

-- level 7.22
example (α : Type) [Inhabited α] (A : Prop) (P : α → Prop) (h₁ : A → ∃ x, P x) : ∃ x, A → P x := by
  rcases Classical.em A with h₂ | h₃
  · have h₄ := h₁ h₂
    obtain ⟨c₁, h₅⟩ := h₄
    refine ⟨c₁, ?_⟩
    intro h₆
    exact h₅
  · refine ⟨default, ?_⟩
    intro h₇
    exfalso
    apply h₃
    exact h₇

-- level 8.3
example (A B : Prop) (h₁ : A ↔ (A → False) ∧ (B → False)) : (A → False) ∧ B := by
  rcases Classical.em A with h₂ | h₃
  · exfalso
    have h₄ := h₁.mp h₂
    obtain ⟨h₅, h₆⟩ := h₄
    apply h₅
    exact h₂
  · constructor
    · exact h₃
    · rcases Classical.em B with h₇ | h₈
      · exact h₇
      · exfalso
        apply h₃
        apply h₁.mpr
        constructor
        · exact h₃
        · exact h₈
