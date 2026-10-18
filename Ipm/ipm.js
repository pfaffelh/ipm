// A tap-based proof graph editor in the style of the Incredible Proof Machine
// (https://incredible.pm, Joachim Breitner, MIT license), for natural deduction.
//
// Local hypotheses: →-introduction has an extra output on top, the hypothesis A. What is derived
// from it must flow back into the block's own input B; the block then concludes A → B. A path from
// the hypothesis that leaves this "box" (e.g. reaches a goal directly) is an error.
//
// Each `.ipm-task` element is a task: given assumptions, prove the conclusions by connecting rule
// blocks. Everything is checked in the browser: every connection is checked by unification, in the
// order the connections were made, so a conflict is blamed on the newest connection (☠).
//
// Interaction works by tapping, so it also works on phones: tap a port to see what can be connected
// to it — existing ports or new rule blocks whose propositions fit — and tap an option.

(function () {
  'use strict'

  // ---------------------------------------------------------------- language

  // English or German, as chosen with the switch in the header (kept in the browser). The page's
  // texts come in both languages (`:::en` and `:::de` blocks); the class `ipm-de` on the root
  // element shows the German ones.
  let LANG = 'en'
  try { LANG = localStorage.getItem('ipm-verso:lang') === 'de' ? 'de' : 'en' } catch {}
  document.documentElement.classList.toggle('ipm-de', LANG === 'de')
  document.documentElement.lang = LANG
  const DE = {
    '🎯 Tactic trainer': '🎯 Taktik-Trainer',
    '∧-introduction': '∧-Einführung', '∧-elimination': '∧-Beseitigung',
    '→-introduction': '→-Einführung', '→-elimination': '→-Beseitigung',
    '∨-introduction (left)': '∨-Einführung (links)', '∨-introduction (right)': '∨-Einführung (rechts)',
    '∨-elimination': '∨-Beseitigung', '⊥-elimination': '⊥-Beseitigung',
    'tertium non datur': 'Tertium non datur', 'proof by contradiction': 'Widerspruchsbeweis',
    '↔-introduction': '↔-Einführung', '↔-elimination (forwards)': '↔-Beseitigung (vorwärts)',
    '↔-elimination (backwards)': '↔-Beseitigung (rückwärts)', '⊤-introduction': '⊤-Einführung',
    '＋ Add a block': '＋ Baustein hinzufügen', 'Add a block': 'Baustein hinzufügen', 'Rules': 'Regeln', 'Close': 'Schließen',
    '↶ Undo': '↶ Zurück', 'Start over': 'Neu anfangen', 'Tidy up': 'Aufräumen',
    'Arrange the blocks automatically again': 'Die Blöcke wieder automatisch anordnen',
    
    'The proof in Lean': 'Der Beweis in Lean', 'Try it in Lean ↗': 'In Lean ausprobieren ↗',
    'goals accomplished 🎉': 'goals accomplished 🎉',
    'Now choose a tactic': 'Jetzt eine Taktik wählen',
    'Now tap a glowing green dot, or add a block with ＋': 'Jetzt einen grün leuchtenden Punkt antippen oder mit ＋ einen Baustein hinzufügen',
    'Now tap a glowing green circle, or add a block with ＋': 'Jetzt einen grün leuchtenden Kreis antippen oder mit ＋ einen Baustein hinzufügen',
    '1 red circle left — tap one': 'Noch 1 roter Kreis — tippe ihn an',
    '{n} red circles left — tap one': 'Noch {n} rote Kreise — tippe einen an',
    'Lemmas from solved levels': 'Hilfssätze aus gelösten Levels',
    'That would go round in a circle.': 'Das wäre ein Kreisschluss.',
    'Prove {x}': 'Beweise {x}', 'Disconnect': 'Verbindung lösen', 'This input is connected already.': 'Dieser Eingang ist schon verbunden.',
    'Remove this block': 'Diesen Block entfernen', 'Remove this connection': 'Diese Verbindung entfernen',
    '{x} does not fit {y}': '{x} passt nicht zu {y}',
    'A local hypothesis may only be used inside its box.': 'Eine lokale Annahme darf nur innerhalb ihres Kastens verwendet werden.',
    'Cancel': 'Abbrechen', 'more ▸': 'mehr ▸', 'less ▾': 'weniger ▾', '1 rule ▸': '1 Regel ▸', '{n} rules ▸': '{n} Regeln ▸',
    '{name} block': '{name}-Block', 'Next ›': 'Weiter ›', '▶ Start': '▶ Start', '▶ Continue': '▶ Weiterspielen', 'or start from the beginning': 'oder von vorn beginnen', 'About this level': 'Über dieses Level', 'This world': 'Diese Welt', 'Tip': 'Tipp', 'Got it': 'Verstanden', 'Undo': 'Zurück', 'Restart': 'Neu', 'Tidy': 'Ordnen', 'About': 'Info', 'Next': 'Weiter', 'Block': 'Baustein', 'Worlds': 'Welten', 'Drag to make the blocks or the board wider': 'Ziehen, um die Bausteine oder das Spielfeld breiter zu machen', 'Settings': 'Einstellungen', 'Off': 'Aus', 'All': 'Alle',
    'Tactics: buttons with the Lean command that fits a tapped circle or dot': 'Taktiken: Knöpfe mit dem passenden Lean-Befehl zu einem angetippten Kreis oder Punkt',
    'Earned by solving levels': 'Durch Lösen von Levels freigespielt', 'Order': 'Reihenfolge', 'Levels in order': 'Levels der Reihe nach',
    'A level can be played once the one before it is solved.': 'Ein Level ist spielbar, sobald das vorherige gelöst ist.',
    '🔓 Unlocked: the tactic {t}': '🔓 Freigespielt: die Taktik {t}', '🔒 Solve this level to unlock the tactic {t}.': '🔒 Löse dieses Level, um die Taktik {t} freizuspielen.',
    'induction': 'Induktion', '∀-introduction': '∀-Einführung', '∀-elimination': '∀-Beseitigung', '∃-introduction': '∃-Einführung', '∃-elimination': '∃-Beseitigung',
    '⚠ {c} escapes': '⚠ {c} entkommt',
    'The {c} of this induction block stands for an arbitrary number. So it must not occur in the conclusion, nor in an assumption other than its hypothesis that the proof of the step uses.':
      'Das {c} dieses Induktionsblocks steht für eine beliebige Zahl. Es darf daher weder in der Folgerung vorkommen noch in einer anderen Annahme als seiner eigenen, die der Beweis des Schritts verwendet.',
    'The {c} of this ∀I block stands for an arbitrary object. So it must not occur in the conclusion, nor in an assumption that the proof of its input uses.':
      'Das {c} dieses ∀I-Blocks steht für ein beliebiges Objekt. Es darf daher weder in der Folgerung vorkommen noch in einer Annahme, die der Beweis seines Eingangs verwendet.',
    'The {c} of this ∃E block stands for the object that exists, about which nothing else is known. So it must not occur in the conclusion, nor in the ∃ statement, nor in another assumption that the proof of its second input uses.':
      'Das {c} dieses ∃E-Blocks steht für das Objekt, das existiert und über das sonst nichts bekannt ist. Es darf daher weder in der Folgerung noch in der ∃-Aussage vorkommen noch in einer anderen Annahme, die der Beweis seines zweiten Eingangs verwendet.', 'Allow tactics': 'Taktiken erlauben',
    'Show the Lean command that fits a tapped circle or dot': 'Zu einem angetippten Kreis oder Punkt den passenden Lean-Befehl zeigen', 'Level {i} of {n}': 'Level {i} von {n}',
  }
  // Headings of the site, which come from Verso.
  const DE_TITLES = {
    'Tactic Trainer': 'Taktik-Trainer',
    'The Incredible Proof Machine in Lean': 'Die Incredible Proof Machine in Lean',
    'World 1: Conjunction': 'Welt 1: Konjunktion', 'World 2: Implication': 'Welt 2: Implikation',
    'World 3: Disjunction': 'Welt 3: Disjunktion', 'World 4: Falsity and Negation': 'Welt 4: Falsum und Negation',
    'World 5: Classical Logic': 'Welt 5: Klassische Logik', 'World 6: Equivalence and Truth': 'Welt 6: Äquivalenz und Wahrheit',
    'World 7: Quantifiers': 'Welt 7: Quantoren', 'World 8: Two Puzzles': 'Welt 8: Zwei Rätsel', 'World 9: Induction': 'Welt 9: Induktion',
    'Table of Contents': 'Inhalt', 'Contents': 'Inhalt',
  }
  function translatePage() {
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      if (LANG === 'de')
        for (const [en, de] of Object.entries(DE_TITLES)) if (n.nodeValue.includes(en)) n.nodeValue = n.nodeValue.replace(en, de)
      // The worlds are numbered anyway (1. …): "1. World 1: Conjunction" is shown as "1. Conjunction".
      if (!n.parentElement?.closest('.ipm-task')) n.nodeValue = n.nodeValue.replace(/(World|Welt) \d+: /g, '')
    }
    if (LANG === 'de') for (const [en, de] of Object.entries(DE_TITLES)) document.title = document.title.replace(en, de)
  }
  // The switch in the header: EN | DE. Changing the language reloads the page; progress is kept.
  function languageSwitch() {
    const header = document.querySelector('header')
    if (!header || header.querySelector('.ipm-lang-switch')) return
    const box = document.createElement('div')
    box.className = 'ipm-lang-switch'
    for (const l of ['en', 'de']) {
      const b = document.createElement('button')
      b.type = 'button'
      b.textContent = l.toUpperCase()
      b.className = l === LANG ? 'ipm-lang-current' : ''
      b.setAttribute('aria-pressed', l === LANG)
      b.addEventListener('click', () => {
        if (l === LANG) return
        try { localStorage.setItem('ipm-verso:lang', l) } catch {}
        location.reload()
      })
      box.append(b)
    }
    header.append(box, settingsButton())
  }

  // ⚙ in the header: the settings, in a panel below it.
  function settingsButton() {
    const button = el('button', 'ipm-settings-button', '⚙')
    button.type = 'button'
    button.title = tr('Settings')
    button.setAttribute('aria-label', tr('Settings'))
    const panel = el('div', 'ipm-settings')
    panel.hidden = true
    const close = el('button', 'ipm-pop-close', '✕')
    close.type = 'button'
    close.addEventListener('click', () => { panel.hidden = true })
    const head = el('div', 'ipm-pop-head')
    head.append(el('span', 'ipm-pop-title', tr('Settings')), close)
    const radio = (value, text) => {
      const l = el('label', 'ipm-setting')
      const r = el('input')
      r.type = 'radio'; r.name = 'ipm-tactics'; r.value = value; r.checked = SETTINGS.tactics === value
      r.addEventListener('change', () => { SETTINGS.tactics = value; saveSettings() })
      l.append(r, el('span', '', text))
      return l
    }
    const order = el('label', 'ipm-setting')
    const box = el('input')
    box.type = 'checkbox'; box.name = 'ipm-in-order'; box.checked = SETTINGS.inOrder
    box.addEventListener('change', () => { SETTINGS.inOrder = box.checked; saveSettings() })
    order.append(box, el('span', '', tr('Levels in order')))
    panel.append(head,
      el('div', 'ipm-pop-subtitle', tr('Tactics: buttons with the Lean command that fits a tapped circle or dot')),
      radio('off', tr('Off')), radio('earned', tr('Earned by solving levels')), radio('all', tr('All')),
      el('div', 'ipm-pop-subtitle', tr('Order')), order,
      el('div', 'ipm-setting-note', tr('A level can be played once the one before it is solved.')))
    button.addEventListener('click', ev => { ev.stopPropagation(); panel.hidden = !panel.hidden })
    document.addEventListener('pointerdown', ev => { if (!panel.hidden && !panel.contains(ev.target) && ev.target !== button) panel.hidden = true })
    document.addEventListener('keydown', ev => { if (ev.key === 'Escape') panel.hidden = true })
    document.body.append(panel)
    return button
  }
  // Settings, for all tasks, kept in the browser (⚙ in the header).
  // `tactics`: buttons beside a tapped port with the Lean command that fits (intro h, constructor, …):
  // 'off', 'earned' (a tactic once a task that unlocks it is solved by hand) or 'all'.
  // `inOrder`: a task can be played once the one before it is solved.
  const SETTINGS = { tactics: 'earned', inOrder: true }
  let UNLOCKED = new Set()
  try {
    const t = localStorage.getItem('ipm-verso:tactics')
    if (t === 'on') SETTINGS.tactics = 'all'
    else if (['off', 'earned', 'all'].includes(t)) SETTINGS.tactics = t
    SETTINGS.inOrder = localStorage.getItem('ipm-verso:in-order') !== 'off'
    UNLOCKED = new Set(JSON.parse(localStorage.getItem('ipm-verso:unlocked')) ?? [])
  } catch {}
  const allowedTactic = key => SETTINGS.tactics === 'all' || (SETTINGS.tactics === 'earned' && UNLOCKED.has(key))
  function saveSettings() {
    try {
      localStorage.setItem('ipm-verso:tactics', SETTINGS.tactics)
      localStorage.setItem('ipm-verso:in-order', SETTINGS.inOrder ? 'on' : 'off')
      localStorage.setItem('ipm-verso:unlocked', JSON.stringify([...UNLOCKED]))
    } catch {}
    window.dispatchEvent(new Event('ipm-settings'))
  }

  const tr = (en, vars = {}) => (LANG === 'de' ? DE[en] ?? en : en).replace(/\{(\w+)\}/g, (_, k) => vars[k])

  // ---------------------------------------------------------------- formulas

  // Formulas: {t: 'atom', n} (a proposition) | {t: 'pred', n, args} (a predicate applied to terms) |
  // {t: 'and'|'or'|'imp'|'iff', a, b} | {t: 'not', a} | {t: 'bot'} | {t: 'top'} |
  // {t: 'all'|'ex', v, a} (quantifiers; `v` is the name of the bound variable) | {t: 'meta', id} |
  // {t: 'sub', a, v, by} (a delayed substitution: `a` with `by` for `v`, while `a` is undetermined).
  // Terms: {t: 'bv', n} (a bound variable) | {t: 'con', n} (a constant) | {t: 'eig', n} (the
  // eigenvariable of a ∀I or ∃E block) | {t: 'fn', n, args} | {t: 'meta', id, term: true}.
  // Statements are written as in Lean: `∀ x, P x → Q (f x)`, `∃ y, R a y`.
  function parse(src) {
    const tokens = src.match(/[A-Za-z_][\w'₀-₉]*|\d+|∀|∃|,|\+|∧|∨|↔|→|¬|⊥|⊤|\(|\)|<->|->|\/\\|\\\/|~/g) ?? []
    let i = 0
    const eat = t => { if (tokens[i] === t) { i++; return true } return false }
    const norm = { '/\\': '∧', '\\/': '∨', '->': '→', '<->': '↔', '~': '¬' }
    tokens.forEach((t, k) => { tokens[k] = norm[t] ?? t })
    const bound = []
    const fail = () => { throw new Error(`Cannot parse ${src}`) }
    const lower = t => /^[a-z_\d]/.test(t ?? '')
    // As in Lean, →, ∨ and ∧ are right-associative (the Incredible Proof Machine reads ∧ and ∨
    // to the left), and ∧ binds more strongly than ∨, which binds more strongly than →, then ↔.
    // A quantifier reaches as far to the right as possible.
    const iff = () => { const a = imp(); return eat('↔') ? { t: 'iff', a, b: imp() } : a }
    const imp = () => { const a = or(); return eat('→') ? { t: 'imp', a, b: imp() } : a }
    const or = () => { const a = and(); return eat('∨') ? { t: 'or', a, b: or() } : a }
    const and = () => { const a = un(); return eat('∧') ? { t: 'and', a, b: and() } : a }
    // A term in an argument position: a variable or constant, or a term in brackets.
    const atomicTerm = () => {
      if (eat('(')) { const t = term(); if (!eat(')')) fail(); return t }
      const n = tokens[i++]
      if (!lower(n)) fail()
      return bound.includes(n) ? { t: 'bv', n } : { t: 'con', n }
    }
    // Natural numbers: 0, and t + 1 (the successor of t).
    const term = () => {
      let t
      if (tokens[i] === '(') t = atomicTerm()
      else {
        const n = tokens[i++]
        if (!lower(n)) fail()
        const args = []
        while (lower(tokens[i]) || tokens[i] === '(') args.push(atomicTerm())
        t = args.length ? { t: 'fn', n, args } : bound.includes(n) ? { t: 'bv', n } : { t: 'con', n }
      }
      while (eat('+')) { if (!eat('1')) fail(); t = { t: 'fn', n: 'succ', args: [t] } }
      return t
    }
    const un = () => {
      if (eat('¬')) return { t: 'not', a: un() }
      if (eat('⊥')) return { t: 'bot' }
      if (eat('⊤')) return { t: 'top' }
      for (const q of ['∀', '∃']) if (eat(q)) {
        const vs = []
        while (lower(tokens[i])) vs.push(tokens[i++])
        if (!vs.length || !eat(',')) fail()
        bound.push(...vs)
        let a = iff()
        bound.splice(bound.length - vs.length)
        for (const v of vs.reverse()) a = { t: q === '∀' ? 'all' : 'ex', v, a }
        return a
      }
      if (eat('(')) { const a = iff(); if (!eat(')')) fail(); return a }
      const n = tokens[i++]
      if (!n || lower(n)) fail()
      if (n === 'True') return { t: 'top' }
      if (n === 'False') return { t: 'bot' }
      const args = []
      while (lower(tokens[i]) || tokens[i] === '(') args.push(atomicTerm())
      return args.length ? { t: 'pred', n, args } : { t: 'atom', n }
    }
    const f = iff()
    if (i < tokens.length) fail()
    return f
  }

  // The type of objects in Lean: α, or Nat for statements about natural numbers.
  let leanDomain = 'α'
  // While a Lean type is written: what an eigenvariable outside its block is written as (`default`).
  let eigOutside = null

  // Names of bound variables of rule blocks carry the block (`x#b3`), so that they never clash; they
  // are shown without it.
  const baseName = n => n.split('#')[0]
  // The names of the quantified variables inside `f`.
  const quantified = (f, s) => {
    f = norm(f, s)
    const inner = parts(f).flatMap(g => quantified(g, s))
    return f.t === 'all' || f.t === 'ex' ? [baseName(f.v), ...inner] : inner
  }

  const prec = { iff: 0, imp: 1, or: 2, and: 3, not: 4 }
  // With `lean`, as Lean code: False, True, and quantifiers with the type α, `_` if unused.
  // `names` gives the shown name of a bound variable.
  function show(f, s = {}, ctx = 0, lean = false, names = {}) {
    f = norm(f, s)
    const show_ = (g, s, c, n = names) => show(g, s, c, lean, n)
    const term = (t, atomic) => showTerm(t, s, atomic, names)
    const wrap = (p, txt) => (p < ctx ? `(${txt})` : txt)
    switch (f.t) {
      case 'atom': return f.n
      case 'pred': return wrap(5, [f.n, ...f.args.map(t => term(t, true))].join(' '))
      case 'bot': return lean ? 'False' : '⊥'
      case 'top': return lean ? 'True' : '⊤'
      case 'meta': return '?' + metaNumber(f.id.split('.').pop())
      // An undetermined body applied to a term, as in the Proof Machine: ?1 c
      case 'sub': return wrap(5, `${show_(f.a, s)} ${term(f.by, true)}`)
      case 'not': return wrap(4, '¬' + show_(f.a, s, 4))
      case 'and': return wrap(3, `${show_(f.a, s, 4)} ∧ ${show_(f.b, s, 3)}`)
      case 'or': return wrap(2, `${show_(f.a, s, 3)} ∨ ${show_(f.b, s, 2)}`)
      case 'imp': return wrap(1, `${show_(f.a, s, 2)} → ${show_(f.b, s, 1)}`)
      // Implications beside ↔ get brackets, though Lean does not need them: easier to read.
      case 'iff': return wrap(1, `${show_(f.a, s, 2)} ↔ ${show_(f.b, s, 2)}`)
      case 'all': case 'ex': {
        const q = f.t === 'all' ? '∀' : '∃', body = norm(f.a, s)
        // The variable's name, unless a quantifier inside or outside already uses it: then another one.
        const taken = new Set([...quantified(body, s), ...Object.values(names)])
        const name = [baseName(f.v), 'x', 'y', 'z', 'u', 'v', 'w'].find(n => !taken.has(n)) ?? baseName(f.v)
        const inner = { ...names, [f.v]: name }
        const v = lean ? `${hasBound(body, s, f.v) ? name : '_'} : ${leanDomain}` : name
        // An undetermined body is shown applied to the variable: ∀ x, ?1 x
        const txt = body.t === 'meta' ? `${show_(body, s, 0, inner)} ${name}` : show_(body, s, 0, inner)
        return ctx > 0 ? `(${q} ${v}, ${txt})` : `${q} ${v}, ${txt}`
      }
    }
  }

  function showTerm(t, s, atomic = false, names = {}) {
    t = resolve(t, s)
    switch (t.t) {
      case 'bv': return names[t.n] ?? baseName(t.n)
      case 'con': return t.n
      case 'eig': return eigOutside?.(t.n) ?? t.n
      case 'meta': return '?' + metaNumber(t.id.split('.').pop())
      case 'fn': {
        const txt = t.n === 'succ' ? `${showTerm(t.args[0], s, false, names)} + 1`
          : [t.n, ...t.args.map(a => showTerm(a, s, true, names))].join(' ')
        return atomic ? `(${txt})` : txt
      }
    }
  }

  // Rule variables A, B, C, … are shown as ?1, ?2, ?3, … while undetermined.
  const metaNumber = v => (/^[A-Z]$/.test(v) ? v.charCodeAt(0) - 64 : v)

  function resolve(f, s) {
    while (f.t === 'meta' && s[f.id]) f = s[f.id]
    return f
  }

  // Resolves metavariables at the top, and carries out a delayed substitution once its formula is known.
  function norm(f, s) {
    f = resolve(f, s)
    if (f.t !== 'sub') return f
    const a = norm(f.a, s)
    return a.t === 'meta' || a.t === 'sub' ? { ...f, a } : norm(substF(a, f.v, f.by, s), s)
  }

  // `f` with the term `by` for the bound variable `v`.
  function substF(f, v, by, s) {
    f = resolve(f, s)
    switch (f.t) {
      case 'meta': return { t: 'sub', a: f, v, by }
      case 'sub': { const g = norm(f, s); return g.t === 'sub' ? { t: 'sub', a: g, v, by } : substF(g, v, by, s) }
      case 'atom': case 'bot': case 'top': return f
      case 'pred': return { ...f, args: f.args.map(t => substT(t, v, by, s)) }
      case 'all': case 'ex': return f.v === v ? f : { ...f, a: substF(f.a, v, by, s) }
      case 'not': return { ...f, a: substF(f.a, v, by, s) }
      default: return { ...f, a: substF(f.a, v, by, s), b: substF(f.b, v, by, s) }
    }
  }

  function substT(t, v, by, s) {
    t = resolve(t, s)
    if (t.t === 'bv' && t.n === v) return by
    if (t.t === 'fn') return { ...t, args: t.args.map(a => substT(a, v, by, s)) }
    return t  // a term metavariable never stands for a bound variable
  }

  // The children of a formula or term.
  const parts = f => [f.a, f.b, f.by, ...(f.args ?? [])].filter(x => x)

  const occurs = (id, f, s) => {
    f = resolve(f, s)
    if (f.t === 'meta') return f.id === id
    return parts(f).some(g => occurs(id, g, s))
  }

  // Whether `f` still contains an undetermined part (with `formulas`: other than an object ?2).
  const undetermined = (f, s, formulas = false) => {
    f = norm(f, s)
    if (f.t === 'meta') return !(formulas && f.term)
    return f.t === 'sub' || parts(f).some(g => undetermined(g, s, formulas))
  }

  // Whether `f` contains the bound variable `v` (not bound inside `f`), or any bound variable.
  const hasBound = (f, s, v) => {
    f = resolve(f, s)
    if (f.t === 'bv') return v === undefined || f.n === v
    if ((f.t === 'all' || f.t === 'ex') && f.v === v) return false
    return parts(f).some(g => hasBound(g, s, v))
  }

  // `f` (determined) with the bound variable `v` for every occurrence of the term `by`.
  function abstract(f, by, v, s) {
    f = norm(f, s)
    if (sameTerm(f, by)) return { t: 'bv', n: v }
    const g = { ...f }
    for (const k of ['a', 'b']) if (f[k]) g[k] = abstract(f[k], by, v, s)
    if (f.args) g.args = f.args.map(t => abstract(t, by, v, s))
    return g
  }
  const sameTerm = (x, y) => (x.t === 'eig' || x.t === 'bv') && x.t === y.t && x.n === y.n

  // Unifies `x` and `y` under substitution `s`. Returns the extended substitution, null if they do
  // not fit, or DEFER if that cannot be decided yet (a delayed substitution into an undetermined
  // formula); such a connection is tried again once more is known.
  const DEFER = 'defer'
  let fresh = 0
  // The blocks in the scope of each eigenvariable, during the last rounds of `analyze`.
  let eigScope = null
  // The undetermined objects ?2 in `f`.
  const termMetas = (f, s) => {
    f = resolve(f, s)
    if (f.t === 'meta') return f.term ? [f] : []
    return parts(f).flatMap(g => termMetas(g, s))
  }
  function unify(x, y, s) {
    x = norm(x, s); y = norm(y, s)
    if (x.t === 'meta' && y.t === 'meta' && x.id === y.id) return s
    if (x.t === 'meta') {
      if (x.term && hasBound(y, s)) return null
      return occurs(x.id, y, s) ? null : { ...s, [x.id]: y }
    }
    if (y.t === 'meta') return unify(y, x, s)
    if (x.t === 'sub' || y.t === 'sub') {
      if (x.t !== 'sub') [x, y] = [y, x]
      // ?1 c against a known formula: for an eigenvariable or a bound variable, the formula with `v`
      // for every `c` is the only choice (it must not occur in ?1 itself). An undetermined object ?2
      // never becomes a bound variable; it might become the eigenvariable, so then this waits.
      const by = resolve(x.by, s)
      const known = by.t === 'bv' ? !undetermined(y, s, true) : !undetermined(y, s)
      if (y.t !== 'sub' && (by.t === 'eig' || by.t === 'bv') && known && x.a.t === 'meta')
        return unify(x.a, abstract(y, by, x.v, s), s)
      // When nothing else can be decided (`eigScope` is set): undetermined objects ?2 of blocks in
      // the scope of the eigenvariable are taken to be it. Any object may be chosen for them, and
      // inside the scope the eigenvariable is one; the eigenvariable check still follows.
      if (eigScope && by.t === 'eig' && y.t !== 'sub' && x.a.t === 'meta' && !undetermined(y, s, true)) {
        const metas = termMetas(y, s)
        if (metas.every(m => eigScope[by.n]?.has(m.id.split('.')[0]))) {
          let s1 = s
          for (const m of metas) s1 = { ...s1, [m.id]: by }
          return unify(x.a, abstract(y, by, x.v, s1), s1)
        }
      }
      return DEFER
    }
    if (x.t !== y.t) return null
    switch (x.t) {
      case 'atom': case 'con': case 'eig': case 'bv': return x.n === y.n ? s : null
      case 'bot': case 'top': return s
      case 'pred': case 'fn': {
        if (x.n !== y.n || x.args.length !== y.args.length) return null
        let s1 = s
        for (let k = 0; k < x.args.length && s1; k++) { s1 = unify(x.args[k], y.args[k], s1); if (s1 === DEFER) return DEFER }
        return s1
      }
      case 'all': case 'ex': {
        if (x.v === y.v) return unify(x.a, y.a, s)
        const v = `v#${fresh++}`
        return unify(substF(x.a, x.v, { t: 'bv', n: v }, s), substF(y.a, y.v, { t: 'bv', n: v }, s), s)
      }
      case 'not': return unify(x.a, y.a, s)
      default: {
        const s1 = unify(x.a, y.a, s)
        if (s1 === DEFER) return DEFER
        return s1 && unify(x.b, y.b, s1)
      }
    }
  }

  // Replaces the rule's variables by metavariables private to one block.
  function instantiate(f, vars, block) {
    if (f.t === 'atom' && vars.includes(f.n)) return { t: 'meta', id: `${block}.${f.n}` }
    if (f.t === 'atom' || f.t === 'bot' || f.t === 'top') return f
    const g = { ...f }
    if (f.a) g.a = instantiate(f.a, vars, block)
    if (f.b) g.b = instantiate(f.b, vars, block)
    return g
  }

  // ---------------------------------------------------------------- rules

  // `local` maps an output that is a local hypothesis to the input that consumes it.
  const RULES = {
    conjI: { label: '∧I', name: '∧-introduction', vars: ['A', 'B'], inputs: ['A', 'B'], outputs: ['A∧B'] },
    conjE: { label: '∧E', name: '∧-elimination', vars: ['A', 'B'], inputs: ['A∧B'], outputs: ['A', 'B'] },
    impI: { label: '→I', name: '→-introduction', vars: ['A', 'B'], inputs: ['B'], outputs: ['A→B', 'A'], local: { 1: 0 } },
    impE: { label: '→E', name: '→-elimination', vars: ['A', 'B'], inputs: ['A→B', 'A'], outputs: ['B'] },
    disjI1: { label: '∨I₁', name: '∨-introduction (left)', vars: ['A', 'B'], inputs: ['A'], outputs: ['A∨B'] },
    disjI2: { label: '∨I₂', name: '∨-introduction (right)', vars: ['A', 'B'], inputs: ['B'], outputs: ['A∨B'] },
    // Case distinction: from A ∨ B, prove C once with the hypothesis A and once with B.
    disjE: { label: '∨E', name: '∨-elimination', vars: ['A', 'B', 'C'], inputs: ['A∨B', 'C', 'C'],
             outputs: ['C', 'A', 'B'], local: { 1: 1, 2: 2 } },
    falseE: { label: '⊥E', name: '⊥-elimination', vars: ['A'], inputs: ['⊥'], outputs: ['A'] },
    TND: { label: 'TND', name: 'tertium non datur', vars: ['A'], inputs: [], outputs: ['A∨(A→⊥)'] },
    // Proof by contradiction: from the hypothesis A → ⊥ derive ⊥, and you have A (classical).
    raa: { label: 'RAA', name: 'proof by contradiction', vars: ['A'], inputs: ['⊥'], outputs: ['A', 'A→⊥'], local: { 1: 0 } },
    iffI: { label: '↔I', name: '↔-introduction', vars: ['A', 'B'], inputs: ['A→B', 'B→A'], outputs: ['A↔B'] },
    iffE1: { label: '↔E₁', name: '↔-elimination (forwards)', vars: ['A', 'B'], inputs: ['A↔B', 'A'], outputs: ['B'] },
    iffE2: { label: '↔E₂', name: '↔-elimination (backwards)', vars: ['A', 'B'], inputs: ['A↔B', 'B'], outputs: ['A'] },
    trueI: { label: '⊤I', name: '⊤-introduction', vars: [], inputs: [], outputs: ['⊤'] },
    // Quantifiers. `?1` is the body, shown applied to a term: `∀ x, ?1 x` gives `?1 ?2` for any term
    // ?2 (∀E). ∀I and ∃E have an eigenvariable `c` of their own, which must not escape (see `eigenCheck`).
    allI: { label: '∀I', name: '∀-introduction', eigen: true,
            build: (id, c) => ({ inputs: [delayed(body(id), id, eig(c))], outputs: [all(id)] }) },
    allE: { label: '∀E', name: '∀-elimination',
            build: id => ({ inputs: [all(id)], outputs: [delayed(body(id), id, termMeta(id))] }) },
    exI: { label: '∃I', name: '∃-introduction',
           build: id => ({ inputs: [delayed(body(id), id, termMeta(id))], outputs: [ex(id)] }) },
    // Induction: ?1 0, and ?1 (c + 1) from the hypothesis ?1 c, give ∀ n, ?1 n.
    ind: { label: 'Ind', name: 'induction', eigen: true, local: { 1: 1 },
           build: (id, c) => ({ inputs: [delayed(body(id), id, { t: 'con', n: '0' }, 'n'), delayed(body(id), id, { t: 'fn', n: 'succ', args: [eig(c)] }, 'n')],
                                outputs: [{ t: 'all', v: `n#${id}`, a: body(id) }, delayed(body(id), id, eig(c), 'n')] }) },
    exE: { label: '∃E', name: '∃-elimination', eigen: true, local: { 1: 1 },
           build: (id, c) => ({ inputs: [ex(id), meta(id, 'B')], outputs: [meta(id, 'B'), delayed(body(id), id, eig(c))] }) },
  }

  function meta(id, n) { return { t: 'meta', id: `${id}.${n}` } }
  function body(id) { return meta(id, 'A') }
  function termMeta(id) { return { t: 'meta', id: `${id}.B`, term: true } }
  function eig(c) { return { t: 'eig', n: c } }
  function delayed(a, id, by, v = 'x') { return { t: 'sub', a, v: `${v}#${id}`, by } }
  function all(id) { return { t: 'all', v: `x#${id}`, a: body(id) } }
  function ex(id) { return { t: 'ex', v: `x#${id}`, a: body(id) } }

  // The statements at the ports of a new block of rule `name`; `c` is its eigenvariable, if any.
  function ruleFormulas(name, id, c = 'c') {
    const r = RULES[name]
    if (r.build) return r.build(id, c)
    return { inputs: r.inputs.map(p => instantiate(parse(p), r.vars, id)),
             outputs: r.outputs.map(p => instantiate(parse(p), r.vars, id)) }
  }

  // Whether output `j` of block `b` is a local hypothesis.
  const isLocal = (b, j) => b.kind === 'rule' && RULES[b.rule].local?.[j] !== undefined
  const consumer = (b, j) => RULES[b.rule].local[j]

  // ---------------------------------------------------------------- the proof state

  class Proof {
    constructor(assumptions, conclusions) {
      this.blocks = []
      this.connections = []
      this.next = 0
      for (const a of assumptions) this.addBlock({ kind: 'assumption', inputs: [], outputs: [parse(a)] })
      for (const c of conclusions) this.addBlock({ kind: 'conclusion', inputs: [parse(c)], outputs: [] })
    }

    addBlock(b) {
      b.id = `b${this.next++}`
      this.blocks.push(b)
      return b
    }

    addRule(name) {
      const id = `b${this.next}`
      // Eigenvariables are named c₁, c₂, … in the order of their blocks.
      let c
      if (RULES[name].eigen) {
        const used = this.blocks.filter(b => b.eig).map(b => Number(b.eig.slice(1).replace(/[₀-₉]/g, d => '₀₁₂₃₄₅₆₇₈₉'.indexOf(d))))
        c = 'c' + sub(1 + Math.max(0, ...used))
      }
      return this.addBlock({ kind: 'rule', rule: name, ...ruleFormulas(name, id, c), ...(c && { eig: c }) })
    }

    connect(from, to) {
      // An input takes one connection.
      this.connections = this.connections.filter(c => !(c.to.block === to.block && c.to.port === to.port))
      this.connections.push({ id: `c${this.next++}`, from, to })
    }

    block(id) { return this.blocks.find(b => b.id === id) }

    removeBlock(id) {
      this.blocks = this.blocks.filter(b => b.id !== id)
      if (this.moved) delete this.moved[id]
      this.connections = this.connections.filter(c => c.from.block !== id && c.to.block !== id)
    }

    // `moved` holds the positions of blocks the player has dragged.
    snapshot() { return JSON.stringify({ b: this.blocks, c: this.connections, n: this.next, m: this.moved ?? {} }) }
    restore(snap) {
      const o = JSON.parse(snap)
      // A block of a lemma that is no longer known is left out.
      this.blocks = o.b.filter(b => b.kind !== 'rule' || RULES[b.rule])
      const ids = new Set(this.blocks.map(b => b.id))
      this.connections = o.c.filter(c => ids.has(c.from.block) && ids.has(c.to.block))
      this.next = o.n; this.moved = o.m ?? {}
    }

    // Whether connecting the output of `from` to `to` closes a cycle.
    createsCycle(from, to) {
      // Lines from a local hypothesis lead back into its own block; they do not count.
      const succ = id => this.connections
        .filter(c => c.from.block === id && !isLocal(this.block(id), c.from.port)).map(c => c.to.block)
      const seen = new Set(), stack = [to]
      while (stack.length) {
        const x = stack.pop()
        if (x === from) return true
        if (seen.has(x)) continue
        seen.add(x)
        stack.push(...succ(x))
      }
      return false
    }

    // Checks all connections in the order they were made.
    analyze() {
      // A connection that cannot be decided yet (a quantifier rule whose body is still unknown) is
      // put back and tried again, as long as the others teach something new. What stays undecided is
      // `pending`: connected, but not (yet) part of a complete proof.
      // Objects chosen with a tactic (specialize h₁ a, use a) are fixed from the start.
      let s = Object.assign({}, ...this.blocks.map(b => b.fix ?? {}))
      const status = {}
      // A line that closes a circle (a block that would help to prove itself) is never part of a
      // proof, however it came in (the interface does not draw one).
      for (const c of this.connections)
        if (!isLocal(this.block(c.from.block), c.from.port) && (c.from.block === c.to.block || this.createsCycle(c.from.block, c.to.block))) status[c.id] = 'cycle'
      let todo = this.connections.filter(c => !status[c.id]), progress = true
      eigScope = null
      for (;;) {
        progress = false
        const later = []
        for (const c of todo) {
          const out = this.block(c.from.block).outputs[c.from.port]
          const inp = this.block(c.to.block).inputs[c.to.port]
          const s1 = unify(out, inp, s)
          if (s1 === DEFER) { later.push(c); continue }
          progress = true
          if (s1) { s = s1; status[c.id] = 'ok' } else status[c.id] = 'fail'
        }
        todo = later
        if (progress) { eigScope = null; continue }
        // Stuck: try once more with objects in the scope of an eigenvariable taken to be it.
        if (eigScope || !todo.length) break
        eigScope = this.eigenScopes()
      }
      eigScope = null
      for (const c of todo) status[c.id] = 'pending'
      const openInputs = []
      for (const b of this.blocks)
        b.inputs.forEach((_, i) => {
          if (!this.connections.some(c => c.to.block === b.id && c.to.port === i && ['ok', 'pending'].includes(status[c.id])))
            openInputs.push({ block: b.id, port: i })
        })
      // Local hypotheses: follow every path from the hypothesis. It must end in the input of its own
      // block; a path that reaches a goal has escaped the box. The blocks on the good paths form the box.
      const scopes = []
      for (const x of this.blocks) {
        if (x.kind !== 'rule') continue
        x.outputs.forEach((_, h) => {
          if (!isLocal(x, h)) return
          const k = consumer(x, h), members = new Set()
          const visit = (c, path) => {
            if (c.to.block === x.id && c.to.port === k) { path.forEach(e => members.add(e.from.block)); return }
            const t = this.block(c.to.block)
            if (t.kind === 'conclusion') {
              for (const e of path) if (status[e.id] === 'ok') status[e.id] = 'escape'
              return
            }
            if (path.some(e => e.to.block === t.id && e !== c)) return
            for (const c2 of this.connections)
              if (c2.from.block === t.id && !isLocal(t, c2.from.port)) visit(c2, [...path, c2])
          }
          for (const c of this.connections)
            if (c.from.block === x.id && c.from.port === h) visit(c, [c])
          members.delete(x.id)
          const used = this.connections.some(c => c.from.block === x.id && c.from.port === h)
          scopes.push({ block: x.id, port: h, consumer: k, members: [...members], used })
        })
      }
      const eigen = this.eigenCheck(s, status)
      const failed = this.connections.some(c => status[c.id] !== 'ok') || Object.keys(eigen).length > 0
      const goalsDone = this.blocks.filter(b => b.kind === 'conclusion')
        .every(b => !openInputs.some(o => o.block === b.id))
      return { s, status, openInputs, scopes, eigen, qed: !failed && openInputs.length === 0 && goalsDone }
    }

    // For each eigenvariable, the blocks whose proofs lead into the input where it is in scope: the
    // input of ∀I, the second input of ∃E and of induction.
    eigenScopes() {
      const scopes = {}
      for (const b of this.blocks) {
        if (!b.eig) continue
        const inside = new Set()
        const visit = (x, k) => {
          for (const c of this.connections) {
            if (c.to.block !== x.id || c.to.port !== k) continue
            const src = this.block(c.from.block)
            if (src.kind !== 'rule' || isLocal(src, c.from.port) || inside.has(src.id)) continue
            inside.add(src.id)
            src.inputs.forEach((_, j) => visit(src, j))
          }
        }
        visit(b, b.rule === 'allI' ? 0 : 1)
        scopes[b.eig] = inside
      }
      return scopes
    }

    // The eigenvariable `c` of a ∀I block stands for an arbitrary object: it must not occur in the
    // block's conclusion `∀ x, …`, nor in any assumption that the proof of its input still depends
    // on. For ∃E likewise in `∃ x, …`, in the conclusion, and in the assumptions of the second input
    // other than its own hypothesis. Returns the blocks where this is violated.
    eigenCheck(s, status) {
      const bad = {}
      const has = (f, c) => { f = norm(f, s); return (f.t === 'eig' && f.n === c) || parts(f).some(g => has(g, c)) }
      // The assumptions that the proof of input `i` of block `b` depends on, as [block, port].
      const openHyps = (b, i) => {
        const inside = new Set(), hyps = []
        const visit = (x, k) => {
          for (const c of this.connections) {
            if (c.to.block !== x.id || c.to.port !== k || ['fail', 'cycle'].includes(status[c.id])) continue
            const src = this.block(c.from.block)
            if (src.kind === 'assumption' || isLocal(src, c.from.port)) hyps.push([src, c.from.port])
            else if (!inside.has(src.id)) { inside.add(src.id); src.inputs.forEach((_, j) => visit(src, j)) }
          }
        }
        visit(b, i)
        // A local hypothesis whose block is part of this proof is discharged within it.
        return hyps.filter(([x]) => x.kind === 'assumption' || !inside.has(x.id))
      }
      for (const b of this.blocks) {
        if (!b.eig) continue
        const c = b.eig
        if (b.rule === 'allI') {
          if (has(b.outputs[0], c) || openHyps(b, 0).some(([x, j]) => has(x.outputs[j], c))) bad[b.id] = true
        } else if (b.rule === 'ind') {
          if (has(b.outputs[0], c) || openHyps(b, 1).some(([x, j]) => !(x.id === b.id && j === 1) && has(x.outputs[j], c))) bad[b.id] = true
        } else if (b.rule === 'exE') {
          if (has(b.outputs[0], c) || has(b.inputs[0], c) ||
              openHyps(b, 1).some(([x, j]) => !(x.id === b.id && j === 1) && has(x.outputs[j], c))) bad[b.id] = true
        }
      }
      return bad
    }
  }

  // ---------------------------------------------------------------- the proof in Lean

  // The proof graph read as a Lean proof term, one `example` per goal. Assumptions are named
  // h₁, h₂, …, local hypotheses on from there; an input that is not (correctly) connected yet is `sorry`.
  // A part of the graph that is used twice appears twice in the term.
  const sub = n => String(n).replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[d])

  // Names of what one has, as in Lean: the assumptions h₁, h₂, …, then, in the order of the blocks,
  // the local hypotheses, the two parts that `obtain` gives (∧E) and what a step on a blue dot gives
  // (`have h₃ := h₁ ?_`); what ∀E gives keeps the name of what it specializes (`specialize h₁ a`). Returns the names by `block.port`, and how many there are.
  function hypNames(p) {
    const names = {}
    let n = 0
    for (const b of p.blocks) if (b.kind === 'assumption') names[`${b.id}.0`] = 'h' + sub(++n)
    for (const b of p.blocks) if (b.kind === 'rule') b.outputs.forEach((_, j) => { if (isLocal(b, j) || b.rule === 'conjE' || (b.named && !RULES[b.rule].local && b.rule !== 'allE')) names[`${b.id}.${j}`] = 'h' + sub(++n) })
    for (const b of p.blocks) if (b.kind === 'rule' && b.rule === 'allE') {
      const c = p.connections.find(c => c.to.block === b.id && c.to.port === 0)
      names[`${b.id}.0`] = (c && names[`${c.from.block}.${c.from.port}`]) ?? 'h'
    }
    return { names, count: n }
  }

  // Returns the parts of the proof, one per goal, and the lemmas it uses.
  function leanParts(proof, analysis) {
    const p = proof, s = analysis.s, uses = new Set()
    const assumptions = p.blocks.filter(b => b.kind === 'assumption')
    const names = {}, locals = {}
    // The signature: propositions, and for predicate logic a type α of objects with predicates,
    // functions and constants on it.
    const atoms = new Set(), preds = {}, fns = {}, cons = new Set()
    let quantifiers = false, needDefault = false, nat = false
    const collect = f => {
      if (f.t === 'atom') atoms.add(f.n)
      if (f.t === 'pred') preds[f.n] = f.args.length
      if (f.t === 'fn' && f.n !== 'succ') fns[f.n] = f.args.length
      if (f.t === 'con' && f.n !== '0') cons.add(f.n)
      if ((f.t === 'fn' && f.n === 'succ') || (f.t === 'con' && f.n === '0')) nat = true
      if (f.t === 'all' || f.t === 'ex') quantifiers = true
      parts(f).forEach(collect)
    }
    for (const b of p.blocks) if (b.kind !== 'rule') [...b.inputs, ...b.outputs].forEach(collect)
    const domain = quantifiers || Object.keys(preds).length > 0 || cons.size > 0
    leanDomain = nat ? 'Nat' : 'α'
    const D = leanDomain
    const lean = f => show(f, s, 0, true)
    // `f` in Lean with what is still undetermined filled in: True for a statement, `default` for an
    // object (a proof is a proof of the statement with any of them).
    const closedNow = f => {
      const s2 = { ...s }
      const fill = g => {
        g = norm(g, s2)
        if (g.t === 'meta') { if (g.term) needDefault = true; s2[g.id] = g.term ? { t: 'con', n: 'default' } : { t: 'top' }; return }
        parts(g).forEach(fill)
      }
      for (let k = 0; k < 5 && undetermined(f, s2); k++) fill(f)
      eigOutside = n => (boundEig.has(n) ? null : (needDefault = true, 'default'))
      try { return show(f, s2, 0, true) } finally { eigOutside = null }
    }
    // The major premise of an elimination, with its type if Lean could not find it: ⟨a, b⟩.1 or
    // Or.elim (Or.inl a) … do not elaborate, (⟨a, b⟩ : A ∧ B).1 does.
    const head = t => (t.k === 'app' ? head(t.f) : t)
    const typed = (t, f) => (['pair', 'fun'].includes(t.k) || (t.k === 'app' && ['Or.inl', 'Or.inr', 'Iff.intro', 'False.elim',
      'Classical.byContradiction', 'Or.elim', 'Exists.elim'].includes(head(t).n)) ? { k: 'typed', a: t, f } : t)
    // A term in the proof: an object of α; an undetermined one is `default`.
    const boundEig = new Set()
    const leanTerm = (t, atomic) => {
      t = resolve(t, s)
      // undetermined, or an eigenvariable outside its block (where it stands for any object)
      if (t.t === 'meta' || (t.t === 'eig' && !boundEig.has(t.n))) { needDefault = true; return 'default' }
      if (t.t === 'fn') {
        const txt = t.n === 'succ' ? `${leanTerm(t.args[0], false)} + 1` : [t.n, ...t.args.map(a => leanTerm(a, true))].join(' ')
        return atomic ? `(${txt})` : txt
      }
      return baseName(t.n)
    }
    // Local hypotheses are named h₃, h₄, … after the assumptions, in the order of their blocks, as the
    // tactic buttons name them (`hypNames`).
    const hyp = (b, j) => locals[`${b.id}.${j}`]
    const app = (f, ...args) => args.reduce((t, a) => ({ k: 'app', f: t, a }), { k: 'var', n: f })
    assumptions.forEach((b, k) => { names[b.id] = 'h' + sub(k + 1) })
    { const all = hypNames(p).names; for (const b of p.blocks) if (b.kind === 'rule') b.outputs.forEach((_, j) => { if (isLocal(b, j)) locals[`${b.id}.${j}`] = all[`${b.id}.${j}`] }) }
    // Terms: {k: 'var', n} | {k: 'sorry'} | {k: 'app', f, a} | {k: 'fun', x, body} | {k: 'pair', a, b} | {k: 'proj', a, i}
    const input = (b, i, depth) => {
      const c = p.connections.find(c => c.to.block === b.id && c.to.port === i && !['fail', 'cycle'].includes(analysis.status[c.id]))
      return c && depth < 60 ? output(p.block(c.from.block), c.from.port, depth + 1) : { k: 'sorry' }
    }
    const output = (b, j, depth) => {
      if (b.kind === 'assumption') return { k: 'var', n: names[b.id] }
      if (isLocal(b, j)) return { k: 'var', n: hyp(b, j) }
      const arg = i => input(b, i, depth)
      const major = i => typed(arg(i), b.inputs[i])
      switch (b.rule) {
        case 'conjI': return { k: 'pair', a: arg(0), b: arg(1) }
        case 'conjE': return { k: 'proj', a: major(0), i: j + 1 }
        case 'impE': return { k: 'app', f: major(0), a: arg(1) }
        case 'impI': { const x = hyp(b, 1); return { k: 'fun', x, body: arg(0) } }
        case 'disjI1': return app('Or.inl', arg(0))
        case 'disjI2': return app('Or.inr', arg(0))
        case 'disjE': {
          const h = major(0), x = hyp(b, 1), y = hyp(b, 2)
          return app('Or.elim', h, { k: 'fun', x, body: arg(1) }, { k: 'fun', x: y, body: arg(2) })
        }
        case 'falseE': return app('False.elim', arg(0))
        case 'TND': return app('Classical.em', { k: 'type', f: { t: 'meta', id: `${b.id}.A` } })
        case 'raa': { const x = hyp(b, 1); return app('Classical.byContradiction', { k: 'fun', x, body: arg(0) }) }
        case 'iffI': return app('Iff.intro', arg(0), arg(1))
        case 'iffE1': return app('Iff.mp', major(0), arg(1))
        case 'iffE2': return app('Iff.mpr', major(0), arg(1))
        case 'trueI': return { k: 'var', n: 'trivial' }
        case 'allI': return { k: 'fun', x: b.eig, body: arg(0) }
        case 'allE': return { k: 'app', f: major(0), a: { k: 'term', t: termMeta(b.id) } }
        case 'exI': return { k: 'pair', a: { k: 'term', t: termMeta(b.id) }, b: arg(0) }
        case 'exE': return app('Exists.elim', major(0), { k: 'fun', x: b.eig, body: { k: 'fun', x: hyp(b, 1), body: arg(1) } })
        case 'ind': {
          // Nat.rec needs the motive: the body of ∀ n, … as a function.
          const all = norm(b.outputs[0], s)
          let motive = '_'
          if (all.t === 'all' && !undetermined(all.a, s)) {
            const n = ['n', 'm', 'k', 'i'].find(x => !quantified(all.a, s).includes(x))
            motive = `fun ${hasBound(all.a, s, all.v) ? n : '_'} => ${show(all.a, s, 0, true, { [all.v]: n })}`
          }
          return { k: 'nat', motive, z: arg(0), st: { k: 'fun', x: b.eig, body: { k: 'fun', x: hyp(b, 1), body: arg(1) } } }
        }
      }
      const L = RULES[b.rule]?.lemma
      if (L) {
        uses.add(L.key)
        return app(L.leanNames[j], ...b.inputs.map((_, i) => arg(i)))
      }
      return { k: 'sorry' }
    }
    // Printing, with as few parentheses as Lean needs.
    const atomic = t => ['var', 'sorry', 'pair', 'proj', 'typed', 'type'].includes(t.k) || (t.k === 'term' && resolve(t.t, s).t !== 'fn')
    // In a complete proof, unused names are written `_`, as Lean asks for.
    const used = new Set()
    const useTerm = t => { t = resolve(t, s); if (t.t === 'eig') used.add(t.n); parts(t).forEach(useTerm) }
    const use = t => {
      if (t.k === 'var') used.add(t.n)
      if (t.k === 'term') { useTerm(t.t); return }
      for (const k of ['f', 'a', 'b', 'body', 'z', 'st']) if (t[k]) use(t[k])
    }
    const named = n => !analysis.qed || used.has(n)
    const pr = t => {
      switch (t.k) {
        case 'var': return t.n
        case 'term': return leanTerm(t.t, false)
        case 'nat': return `Nat.rec (motive := ${t.motive}) ${atomic(t.z) ? pr(t.z) : `(${pr(t.z)})`} (${pr(t.st)})`
        case 'sorry': return 'sorry'
        case 'pair': return `⟨${pr(t.a)}, ${pr(t.b)}⟩`
        case 'proj': return `${atomic(t.a) ? pr(t.a) : `(${pr(t.a)})`}.${t.i}`
        case 'typed': return `(${pr(t.a)} : ${closedNow(t.f)})`
        case 'type': { const a = closedNow(t.f); return /\s/.test(a) ? `(${a})` : a }
        case 'app': return `${t.f.k === 'fun' ? `(${pr(t.f)})` : pr(t.f)} ${atomic(t.a) ? pr(t.a) : `(${pr(t.a)})`}`
        case 'fun': {  // fun x => fun y => … is written fun x y => …
          const xs = [], eigs = []
          for (; t.k === 'fun'; t = t.body) {
            xs.push(named(t.x) ? t.x : '_')
            if (/^c[₀-₉]+$/.test(t.x) && !boundEig.has(t.x)) { boundEig.add(t.x); eigs.push(t.x) }
          }
          const body = pr(t)
          eigs.forEach(x => boundEig.delete(x))
          return `fun ${xs.join(' ')} => ${body}`
        }
      }
    }
    const goals = p.blocks.filter(b => b.kind === 'conclusion').map(g => ({ g, term: input(g, 0, 0) }))
    return {
      uses: [...uses],
      goals: goals.map(({ g, term }) => {
        used.clear()
        use(term)
        needDefault = false
        const txt = pr(term)
        // The variables of the statement, as groups [names, type]; `[Inhabited α]` if `default` is used.
        const arrow = (n, res) => [...Array(n).fill(D), res].join(' → ')
        const groups = []
        const group = (names, type) => { if (names.length) groups.push([names.sort(), type]) }
        if (domain && !nat) groups.push([['α'], 'Type'])
        if (needDefault && !nat) groups.push([[], 'Inhabited α'])
        for (const n of new Set(Object.values(preds))) group(Object.keys(preds).filter(k => preds[k] === n), arrow(n, 'Prop'))
        for (const n of new Set(Object.values(fns))) group(Object.keys(fns).filter(k => fns[k] === n), arrow(n, D))
        group([...cons], D)
        group([...atoms], 'Prop')
        return {
          atoms: [...atoms].sort(),
          groups,
          hyps: assumptions.map(b => `(${named(names[b.id]) ? names[b.id] : '_'} : ${lean(b.outputs[0])})`),
          goal: lean(g.inputs[0]),
          term: txt,
        }
      }),
    }
  }

  // The variables of a statement as Lean binders: (A B : Prop), or {A B : Prop} for a theorem.
  const binders = (groups, implicit) => groups.map(([names, type]) =>
    !names.length ? `[${type}]` : implicit ? `{${names.join(' ')} : ${type}}` : `(${names.join(' ')} : ${type})`)

  // The proof as Lean code: the lemmas it uses (and the ones they use), then one `example` per goal.
  function leanProof(proof, analysis) {
    const { uses, goals } = leanParts(proof, analysis)
    const examples = goals.map(g =>
      ['example', ...binders(g.groups, false), ...g.hyps, `: ${g.goal} :=\n  ${g.term}`].join(' '))
    return [...lemmaTheorems(uses), ...examples].join('\n\n')
  }

  // ---------------------------------------------------------------- lemmas

  // A solved task can be used in other tasks, as a block of its own: its assumptions are the inputs,
  // its goals the outputs, and its statements (A, B, …) become ?1, ?2, …. The lemmas are kept in
  // the browser, with the Lean theorems of their proofs.
  const LEMMAS = 'ipm-verso:lemmas'
  function loadLemmas() {
    try { return JSON.parse(localStorage.getItem(LEMMAS)) ?? {} } catch { return {} }
  }
  function registerLemmas() {
    for (const k of Object.keys(RULES)) if (k.startsWith('lemma:')) delete RULES[k]
    for (const [key, L] of Object.entries(loadLemmas())) {
      if (L.v !== 2) continue  // from before tasks were marked as lemmas
      L.key = key
      // The statements of the lemma are renamed A, B, C, …, so that they are shown as ?1, ?2, ?3, ….
      const letter = Object.fromEntries(L.atoms.map((x, i) => [x, String.fromCharCode(65 + i)]))
      const rename = f => (f.t === 'atom' ? { t: 'atom', n: letter[f.n] ?? f.n } : { ...f, ...(f.a && { a: rename(f.a) }), ...(f.b && { b: rename(f.b) }) })
      const renamed = x => show(rename(parse(x)))
      RULES['lemma:' + key] = { label: L.label, name: `${L.label}: ${L.statement}`, vars: L.atoms.map(x => letter[x]),
        inputs: L.assumptions.map(renamed), outputs: L.conclusions.map(renamed), lemma: L }
    }
  }
  // Whether lemma `key` uses lemma `target`, directly or through other lemmas.
  function dependsOn(key, target, seen = new Set()) {
    if (key === target) return true
    if (seen.has(key)) return false
    seen.add(key)
    return (RULES['lemma:' + key]?.lemma.uses ?? []).some(k => dependsOn(k, target, seen))
  }
  function lemmaTheorems(keys) {
    const out = [], seen = new Set()
    const visit = key => {
      const L = RULES['lemma:' + key]?.lemma
      if (!L || seen.has(key)) return
      seen.add(key)
      L.uses.forEach(visit)
      out.push(...L.theorems)
    }
    keys.forEach(visit)
    return out
  }

  // ---------------------------------------------------------------- rendering

  const SVG = 'http://www.w3.org/2000/svg'
  const svg = (tag, attrs = {}, text) => {
    const e = document.createElementNS(SVG, tag)
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v)
    if (text !== undefined) e.textContent = text
    return e
  }
  const el = (tag, cls, text) => {
    const e = document.createElement(tag)
    if (cls) e.className = cls
    if (text !== undefined) e.textContent = text
    return e
  }
  const charW = 8.4, layerH = 104, portGap = 30

  // The line from output position `a` down to input position `b`.
  // The line from an output at `a` to an input at `b` (entered from above). Normal outputs leave
  // downwards, local hypotheses (`up`) upwards.
  function curve(a, b, up = false) {
    const dy = Math.max(30, Math.abs(b.y - a.y) / 2)
    // A local hypothesis sits at the left of its block's top row; its line goes up on the left,
    // around the blocks in between, and enters the target from above.
    if (up) {
      const side = Math.min(a.x, b.x) - 70
      return `M${a.x},${a.y} C${side},${a.y - 10} ${side},${b.y - 50} ${b.x},${b.y}`
    }
    return `M${a.x},${a.y} C${a.x},${a.y + dy} ${b.x},${b.y - dy} ${b.x},${b.y}`
  }

  // Size of a block, from its labels.
  function blockSize(b, s) {
    // Rule blocks show only the statements at their ports (15px), in a row on top and one below.
    // Each port gets a slot as wide as its label; `topX` and `bottomX` are the slots' centres.
    const labelW = 9.2
    if (b.kind !== 'rule') {
      const t = show(b.kind === 'assumption' ? b.outputs[0] : b.inputs[0], s)
      return { w: Math.max(56, t.length * charW + 20), h: 34 }
    }
    const port = key => (key.startsWith('in') ? b.inputs : b.outputs)[Number(key.slice(key.startsWith('in') ? 2 : 3))]
    const top = topRow(b)
    const bottom = b.outputs.map((_, j) => j).filter(j => !isLocal(b, j)).map(j => `out${j}`)
    // A local hypothesis shares a compartment with the input it leads back into: `?1 ⇒ ?3`. Its slot
    // has room for the arrow on its right.
    const arrowW = 18
    const isHyp = key => key.startsWith('out') && top.includes(key)
    const slot = key => show(port(key), s).length * labelW + portGap + (isHyp(key) ? arrowW : 0)
    const width = keys => keys.reduce((w, k) => w + slot(k), 0)
    // Room on the left for the name of the rule (∧I, →E, …) in the bottom corner.
    const tag = 22
    const w = Math.max(56, width(top) + 12, width(bottom) + 12) + tag
    const centres = keys => {
      const o = {}, left = {}, right = {}
      let x = (w + tag - width(keys)) / 2
      for (const k of keys) {
        o[k] = x + (slot(k) - (isHyp(k) ? arrowW : 0)) / 2
        left[k] = x; right[k] = x + slot(k)
        x += slot(k)
      }
      return { o, left, right }
    }
    const t = centres(top)
    return { w, h: 52, topX: t.o, topLeft: t.left, topRight: t.right, bottomX: centres(bottom).o }
  }

  // The ports in the top row: each input, preceded by the local hypotheses that lead back into it.
  function topRow(b) {
    const row = []
    b.inputs.forEach((_, i) => {
      b.outputs.forEach((_, j) => { if (isLocal(b, j) && consumer(b, j) === i) row.push(`out${j}`) })
      row.push(`in${i}`)
    })
    return row
  }

  // The compartment of local hypothesis `j` of block `b` at `q`: from the hypothesis to its input.
  function compartment(q, b, j) {
    const h = `out${j}`, i = `in${consumer(b, j)}`
    return { x0: q.x + q.topLeft[h] + 3, x1: q.x + q.topRight[i] - 3, arrow: q.x + q.topRight[h] - 9 }
  }

  // Where port `i` (kind 'in' or 'out') of block `b` at position `q` sits.
  // The top row holds the inputs and local hypotheses; the bottom row the other outputs.
  function portAt(q, b, kind, i) {
    const key = kind + i
    if (q.topX?.[key] !== undefined) return { x: q.x + q.topX[key], y: q.y }
    if (q.bottomX?.[key] !== undefined) return { x: q.x + q.bottomX[key], y: q.y + q.h }
    if (kind === 'in' || isLocal(b, i)) {
      const row = topRow(b)
      return { x: q.x + q.w * (row.indexOf(kind + i) + 1) / (row.length + 1), y: q.y }
    }
    const plain = b.outputs.map((_, j) => j).filter(j => !isLocal(b, j))
    return { x: q.x + q.w * (plain.indexOf(i) + 1) / (plain.length + 1), y: q.y + q.h }
  }

  // Draws block `b` at `q` = {x, y, w, h}. The same drawing is used on the board and in the list of
  // rules. `portClass(kind, i)` adds classes to the ports; ports carry `data-kind` and `data-i`.
  // `names`: the names of what one has (h₁, h₂, …) by `block.port`, written beside the blue dots.
  function drawBlock(b, q, s, extraClass = '', portClass = () => '', names = {}) {
    const g = svg('g', { class: `ipm-block ipm-${b.kind} ${extraClass}` })
    g.append(svg('rect', { x: q.x, y: q.y, width: q.w, height: q.h, rx: 8 }))
    if (b.kind === 'rule') {
      // The name of the rule (or lemma) in the corner, so that one sees which block it is, also once
      // its statements are filled in. Not in the pictures of the menu, which have it below.
      if (RULES[b.rule] && !b.picture) g.append(svg('text', { x: q.x + 5, y: q.y + q.h - 5, class: 'ipm-lemma-tag' }, RULES[b.rule].label))
      b.outputs.forEach((_, j) => {
        if (!isLocal(b, j) || !q.topLeft) return
        const c = compartment(q, b, j)
        g.append(svg('rect', { x: c.x0, y: q.y + 4, width: c.x1 - c.x0, height: 26, rx: 6, class: 'ipm-compartment' }),
          svg('text', { x: c.arrow, y: q.y + 22, 'text-anchor': 'middle', class: 'ipm-implies' }, '⇒'))
      })
      b.inputs.forEach((f, i) => g.append(svg('text', { x: portAt(q, b, 'in', i).x, y: q.y + 22, 'text-anchor': 'middle', class: 'ipm-port-label' }, show(f, s))))
      b.outputs.forEach((f, i) => g.append(svg('text', { x: portAt(q, b, 'out', i).x, y: isLocal(b, i) ? q.y + 22 : q.y + q.h - 10, 'text-anchor': 'middle', class: 'ipm-port-label' + (isLocal(b, i) ? ' ipm-local-label' : '') }, show(f, s))))
    } else {
      const f = b.kind === 'assumption' ? b.outputs[0] : b.inputs[0]
      g.append(svg('text', { x: q.x + q.w / 2, y: q.y + q.h / 2 + 5, 'text-anchor': 'middle', class: 'ipm-prop' }, show(f, s)))
    }
    for (const kind of ['in', 'out'])
      (kind === 'in' ? b.inputs : b.outputs).forEach((_, i) => {
        const xy = portAt(q, b, kind, i)
        const local = kind === 'out' && isLocal(b, i)
        const port = svg('g', { class: `ipm-port ipm-${kind} ${local ? 'ipm-local ' : ''}${portClass(kind, i)}`, 'data-kind': kind, 'data-i': i })
        port.append(svg('circle', { cx: xy.x, cy: xy.y, r: 16, class: 'ipm-hit' }), svg('circle', { cx: xy.x, cy: xy.y, r: 6 }))
        g.append(port)
        const name = kind === 'out' && names[`${b.id}.${i}`]
        if (name) g.append(svg('text', { x: xy.x + 9, y: xy.y + (local ? -7 : 16),
          class: 'ipm-hyp-name' + (portClass(kind, i).includes('ipm-out-of-scope') ? ' ipm-out-of-scope' : '') }, name))
      })
    return g
  }

  // A rule as a small picture: exactly the block that gets added to the board; `pad` is the room
  // around it (for the ports, which stick out).
  function rulePicture(name, pad = 18) {
    const b = { kind: 'rule', rule: name, picture: true, ...ruleFormulas(name, 'rule') }
    const size = blockSize(b, {})
    const q = { x: pad, y: pad, ...size }
    const pic = svg('svg', { viewBox: `0 0 ${size.w + 2 * pad} ${size.h + 2 * pad}`, class: 'ipm-rule-picture',
      width: size.w + 2 * pad, height: size.h + 2 * pad })
    pic.append(drawBlock(b, q, {}, '', kind => (kind === 'in' ? 'ipm-open' : '')))
    return pic
  }

  // A button of the tool bar: on phones a symbol over a short word (like the tab bar of an app),
  // otherwise its words.
  function barButton(cls, icon, label, short = label) {
    const b = el('button', `ipm-button ${cls}`.trim())
    b.type = 'button'
    b.title = label
    b.append(el('span', 'ipm-ico', icon), el('span', 'ipm-lbl', label), el('span', 'ipm-short', short))
    return b
  }

  class Task {
    constructor(root, index) {
      this.root = root
      this.key = `ipm-verso:${location.pathname}:${index}`
      this.index = index
      this.session = Number(/World-(\d+)/.exec(location.pathname)?.[1] ?? 0)
      // Whether this task, once solved, is a lemma for the tasks after it.
      this.isLemma = root.dataset.lemma === 'true'
      this.assumptions = JSON.parse(root.dataset.assumptions)
      this.conclusions = JSON.parse(root.dataset.conclusions)
      this.rules = JSON.parse(root.dataset.rules)
      // A level of the tactic trainer: one plays only with tactics (no blocks to add, no lines to draw).
      this.tacticsOnly = root.dataset.tactics === 'true'
      root.classList.toggle('ipm-tactics-only', this.tacticsOnly)
      this.proof = new Proof(this.assumptions, this.conclusions)
      this.undoStack = []
      try {
        const saved = JSON.parse(localStorage.getItem(this.key))
        if (saved?.proof) this.proof.restore(saved.proof)
      } catch {}

      this.canvas = el('div', 'ipm-canvas')
      this.status = el('div', 'ipm-status')
      // The tool bar below the board: ＋, Undo, Start over, Tidy up, Lean (and Next, from the stage).
      const tools = el('div', 'ipm-tools ipm-bar')
      const undo = barButton('ipm-undo', '↶', tr('Undo'))
      undo.type = 'button'
      undo.addEventListener('click', () => this.undo())
      const reset = barButton('', '⟲', tr('Start over'), tr('Restart'))
      reset.addEventListener('click', () => { this.change(() => { this.proof = new Proof(this.assumptions, this.conclusions) }) })
      const tidy = barButton('', '⇅', tr('Tidy up'), tr('Tidy'))
      tidy.title = tr('Arrange the blocks automatically again')
      tidy.addEventListener('click', () => { this.change(() => { this.proof.moved = {} }) })
      window.addEventListener('ipm-settings', () => this.render())
      // The tactics this task unlocks, shown below it while tactics are earned.
      this.unlocks = JSON.parse(root.dataset.unlocks ?? '[]')
      this.unlockNote = el('div', 'ipm-unlock')
      this.info = el('div', 'ipm-info')
      // a selected goal with what one has there, as Lean shows it: h₁ : A ∨ B, h₂ : A ⊢ B ∨ A
      this.context = el('div', 'ipm-context')
      this.info.append(this.context, this.status, this.unlockNote)
      this.sheet = el('div', 'ipm-sheet')
      this.sheet.hidden = true
      // The trash can appears while a rule block is dragged; dropping the block on it removes it.
      this.trash = el('div', 'ipm-trash', '🗑')
      this.trash.setAttribute('aria-hidden', 'true')
      // Adding a block: the button ＋ below the picture opens a popover with all blocks, the rules
      // and the lemmas. Taking one (a tap, or dragging it onto the board) closes the popover again.
      this.menu = el('div', 'ipm-menu')
      this.addButton = el('button', 'ipm-add')
      this.addButton.append(el('span', 'ipm-ico', '＋'), el('span', 'ipm-add-text', tr('Add a block')), el('span', 'ipm-short', tr('Block')))
      this.addButton.title = tr('Add a block')
      this.addButton.type = 'button'
      this.addButton.setAttribute('aria-expanded', 'false')
      this.addButton.addEventListener('click', () => (this.popover.hidden ? this.openPopover() : this.closePopover()))
      this.popover = el('div', 'ipm-popover')
      this.popover.hidden = true
      const head = el('div', 'ipm-pop-head')
      const close = el('button', 'ipm-pop-close', '✕')
      close.type = 'button'
      close.title = tr('Close')
      close.addEventListener('click', () => this.closePopover())
      head.append(el('span', 'ipm-pop-title', tr('Add a block')), close)
      const ruleList = el('div', 'ipm-pop-list')
      this.rules.forEach((name, k) => {
        const o = this.ruleOptions()[k]
        ruleList.append(this.menuItem(name, o.picture, RULES[name].label, `${o.label} (${o.detail})`, o.act))
      })
      // On a large screen, the same blocks stand in a column left of the board (instead of ＋).
      this.palette = el('div', 'ipm-palette')
      this.rules.forEach((name, k) => {
        const o = this.ruleOptions()[k]
        this.palette.append(this.menuItem(name, rulePicture(name, 8), RULES[name].label, `${o.label} (${o.detail})`, o.act, 'ipm-palette-item'))
      })
      this.paletteLemmas = el('div', 'ipm-palette-lemmas')
      this.palette.append(this.paletteLemmas)
      this.lemmaBox = el('div', 'ipm-pop-section')
      this.lemmaList = el('div', 'ipm-pop-list')
      this.lemmaBox.append(el('div', 'ipm-pop-subtitle', tr('Lemmas from solved levels')), this.lemmaList)
      this.popover.append(head, el('div', 'ipm-pop-subtitle', tr('Rules')), ruleList, this.lemmaBox)
      this.menu.append(this.popover, this.addButton)
      // A tap elsewhere, or Escape, closes the popover.
      document.addEventListener('pointerdown', ev => {
        if (!this.popover.hidden && !this.menu.contains(ev.target)) this.closePopover()
      })
      document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !this.popover.hidden) this.closePopover() })
      // The same proof in Lean, updated with every change.
      this.lean = el('details', 'ipm-lean')
      this.lean.open = false  // folded at first: the Lean button opens it
      this.leanCode = el('pre', 'ipm-lean-code')
      this.leanLink = el('a', 'ipm-lean-link', tr('Try it in Lean ↗'))
      this.leanLink.target = '_blank'
      this.leanLink.rel = 'noopener'
      this.lean.append(el('summary', '', tr('The proof in Lean')), this.leanCode, this.leanLink)
      const leanButton = barButton('ipm-lean-toggle', 'λ', 'Lean')
      leanButton.title = tr('The proof in Lean')
      leanButton.addEventListener('click', () => { this.lean.open = !this.lean.open })
      const pressed = () => leanButton.setAttribute('aria-pressed', String(this.lean.open))
      this.lean.addEventListener('toggle', pressed)
      pressed()
      tools.append(...(this.tacticsOnly ? [] : [this.menu]), undo, reset, tidy, leanButton)
      this.refreshLemmas()
      window.addEventListener('ipm-lemmas', () => this.refreshLemmas())
      this.play = el('div', 'ipm-play')
      if (this.tacticsOnly) this.play.append(this.canvas)
      else this.play.append(this.palette, this.splitter(), this.canvas)
      root.querySelector('.ipm-board').append(this.play, this.info, this.lean, this.sheet, tools, this.trash)
      this.render()
    }

    // Between the blocks and the board (large screens): a line to drag, which makes one wider and the
    // other narrower. The width holds for all levels and is kept in the browser.
    splitter() {
      const line = el('div', 'ipm-splitter')
      line.title = tr('Drag to make the blocks or the board wider')
      line.addEventListener('pointerdown', ev => {
        ev.preventDefault()
        try { line.setPointerCapture(ev.pointerId) } catch {}
        const start = ev.clientX, w0 = this.palette.getBoundingClientRect().width
        const most = this.play.getBoundingClientRect().width * 0.5
        let frame = 0
        const move = e => {
          const w = Math.max(110, Math.min(most, w0 + e.clientX - start))
          document.documentElement.style.setProperty('--ipm-palette-width', `${w}px`)
          cancelAnimationFrame(frame)
          frame = requestAnimationFrame(() => this.render())
        }
        const up = () => {
          line.removeEventListener('pointermove', move)
          line.removeEventListener('pointerup', up)
          line.removeEventListener('pointercancel', up)
          try { localStorage.setItem('ipm-verso:palette-width', getComputedStyle(document.documentElement).getPropertyValue('--ipm-palette-width')) } catch {}
          this.render()
        }
        line.addEventListener('pointermove', move)
        line.addEventListener('pointerup', up)
        line.addEventListener('pointercancel', up)
      })
      return line
    }

    // An entry of the popover: tapping it adds the block, dragging puts it where it is dropped.
    menuItem(name, picture, caption, title, act, cls = 'ipm-menu-item') {
      const b = el('button', cls)
      b.type = 'button'
      b.dataset.rule = name
      b.title = title
      b.append(picture, el('span', 'ipm-menu-caption', caption))
      if (Number(picture.getAttribute('width')) > 220) b.classList.add('ipm-wide')  // two columns
      b.addEventListener('mousedown', ev => ev.preventDefault())
      const take = () => { this.closePopover(); act() }
      this.makeMenuDraggable(b, name, take)
      // A click that follows a tap already handled does nothing; a click by keyboard adds.
      b.addEventListener('click', () => { if (Date.now() - Number(b.dataset.added ?? 0) > 700) take() })
      return b
    }

    openPopover() {
      this.popover.hidden = false
      this.popover.scrollTop = 0
      this.addButton.setAttribute('aria-expanded', 'true')
    }

    closePopover() {
      this.popover.hidden = true
      this.popover.classList.remove('ipm-pop-dragging')
      this.addButton.setAttribute('aria-expanded', 'false')
    }

    change(act) {
      this.undoStack.push(this.proof.snapshot())
      act()
      this.selected = null
      this.closeSheet(false)
      this.render()
    }

    undo() {
      const snap = this.undoStack.pop()
      if (!snap) return
      this.proof.restore(snap)
      this.selected = null
      this.closeSheet(false)
      this.render()
    }

    // ------------------------------------------------------------ layout and drawing

    // `board` = {w, h}: the size of the board in the picture's units; rows are centred in its width,
    // and the picture covers at least the whole board.
    layout(board = { w: 0, h: 0 }) {
      const p = this.proof
      const layer = {}
      const order = p.blocks.filter(b => b.kind !== 'conclusion')
      for (const b of p.blocks) if (b.kind === 'assumption') layer[b.id] = 0
      // Longest path from the assumptions; unconnected rule blocks go to layer 1.
      for (let round = 0; round < p.blocks.length; round++)
        for (const b of order) {
          if (b.kind === 'assumption') continue
          const preds = p.connections.filter(c => c.to.block === b.id && !isLocal(p.block(c.from.block), c.from.port))
            .map(c => layer[c.from.block] ?? 0)
          layer[b.id] = 1 + Math.max(0, ...preds)
        }
      const last = 1 + Math.max(0, ...order.map(b => layer[b.id]))
      for (const b of p.blocks) if (b.kind === 'conclusion') layer[b.id] = Math.max(last, this.root.inert ? 1 : 2)  // a locked task: compact
      const s = this.analysis.s
      const pos = {}
      const rows = {}
      for (const b of p.blocks) (rows[layer[b.id]] ??= []).push(b)
      const sizes = {}
      for (const b of p.blocks) sizes[b.id] = blockSize(b, s)
      // A layer wider than the board (at the scale it is drawn at best) is broken into several
      // lines, so that the picture uses the height of the board and stays large.
      const cw = this.canvas.clientWidth || 640
      const most = Math.max(320, cw / (cw > 700 ? 1.4 : 1) - 8)
      const lines = []
      for (const row of Object.values(rows)) {
        let line = [], w = 24
        for (const b of row) {
          if (line.length && w + sizes[b.id].w + 24 > most) { lines.push(line); line = []; w = 24 }
          line.push(b); w += sizes[b.id].w + 24
        }
        lines.push(line)
      }
      const lineWidth = line => line.reduce((w, b) => w + sizes[b.id].w + 24, 24)
      const width = Math.max(320, board.w, ...lines.map(lineWidth))
      lines.forEach((line, k) => {
        let x = (width - lineWidth(line)) / 2 + 24
        for (const b of line) {
          pos[b.id] = { x, y: 20 + k * layerH, ...sizes[b.id] }
          x += sizes[b.id].w + 24
        }
      })
      for (const [id, m] of Object.entries(p.moved ?? {})) if (pos[id]) Object.assign(pos[id], m)
      // The picture covers all blocks, wherever they were dragged.
      const qs = Object.values(pos)
      const minX = Math.min(0, ...qs.map(q => q.x - 20)), minY = Math.min(0, ...qs.map(q => q.y - 20))
      const maxX = Math.max(width, ...qs.map(q => q.x + q.w + 20))
      const maxY = Math.max(20 + lines.length * layerH, board.h,
        ...qs.map(q => q.y + q.h + 20))
      return { pos, view: [minX, minY, maxX - minX, maxY - minY] }
    }

    portXY(pos, b, kind, i) { return portAt(pos[b.id], b, kind, i) }

    // A position for a block of size `q` at (x, y), kept inside the board, which shows `this.view`.
    inside(x, y, q) {
      const [vx, vy, vw, vh] = this.view ?? [x, y, Infinity, Infinity]
      return { x: Math.max(vx + 4, Math.min(x, vx + vw - q.w - 4)), y: Math.max(vy + 30, Math.min(y, vy + vh - q.h - 4)) }
    }

    // Blocks can be dragged with mouse, finger or pen. A movement of a few pixels or less counts
    // as a tap. While dragging, the lines at the block follow it; the new position is kept.
    // A rule is put on the board by dragging it there from the menu: a picture of the block follows
    // the pointer and the block lands where it is dropped. A tap (no movement) adds it as well.
    makeMenuDraggable(item, name, add) {
      item.addEventListener('touchstart', e => e.preventDefault(), { passive: false })
      item.addEventListener('pointerdown', ev => {
        if (ev.button > 0) return
        try { item.setPointerCapture(ev.pointerId) } catch {}
        const start = { x: ev.clientX, y: ev.clientY }
        let ghost = null
        const overBoard = e => {
          const r = this.canvas.getBoundingClientRect()
          return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
        }
        const move = e => {
          if (!ghost && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 6) return
          if (!ghost) {
            this.popover.classList.add('ipm-pop-dragging')
            ghost = rulePicture(name)
            ghost.classList.add('ipm-ghost')
            document.body.append(ghost)
          }
          const w = ghost.getBoundingClientRect()
          ghost.style.left = `${e.clientX - w.width / 2}px`
          ghost.style.top = `${e.clientY - w.height / 2}px`
          this.canvas.classList.toggle('ipm-drop-target', overBoard(e))
        }
        const up = e => {
          item.removeEventListener('pointermove', move)
          item.removeEventListener('pointerup', up)
          item.removeEventListener('pointercancel', up)
          this.canvas.classList.remove('ipm-drop-target')
          if (!ghost) {
            if (e.type === 'pointerup') { item.dataset.added = Date.now(); add() }
            return
          }
          ghost.remove()
          this.closePopover()
          item.dataset.added = Date.now()  // the browser may follow the drag with a click
          if (e.type !== 'pointerup' || !overBoard(e) || !this.svgRoot) return
          // Where the pointer is, in the picture's coordinates; the block is centred there.
          const pt = this.svgRoot.createSVGPoint()
          pt.x = e.clientX; pt.y = e.clientY
          const at = pt.matrixTransform(this.svgRoot.getScreenCTM().inverse())
          this.undoStack.push(this.proof.snapshot())
          const nb = this.proof.addRule(name)
          const size = blockSize(nb, this.analysis.s)
          this.proof.moved = { ...(this.proof.moved ?? {}), [nb.id]: this.inside(at.x - size.w / 2, at.y - size.h / 2, size) }
          this.hideSheet()
          this.render()
        }
        item.addEventListener('pointermove', move)
        item.addEventListener('pointerup', up)
        item.addEventListener('pointercancel', up)
      })
    }

    // The trash can sits at the bottom right corner of the board, just above the rule menu; if the
    // board reaches below the screen, at the bottom of its visible part.
    placeTrash() {
      const board = this.canvas.getBoundingClientRect(), size = 64, gap = 10
      const menuTop = this.menu.getBoundingClientRect().top
      const bottom = Math.min(board.bottom, menuTop, window.innerHeight)
      this.trash.style.left = `${Math.min(board.right, window.innerWidth) - size - gap}px`
      this.trash.style.top = `${Math.max(board.top, bottom - size - gap)}px`
    }

    makeDraggable(g, b, pos, paths, tap) {
      // On touch screens the browser would take a drag on a block for scrolling (it ignores
      // `touch-action` on SVG elements). Prevent that; then there is no click either, so a touch
      // without movement is handled as a tap below.
      g.addEventListener('touchstart', e => { if (!e.target.closest('.ipm-port')) e.preventDefault() }, { passive: false })
      g.addEventListener('pointerdown', ev => {
        if (ev.target.closest('.ipm-port') || ev.button > 0) return
        const toSvg = e => {
          const pt = this.svgRoot.createSVGPoint()
          pt.x = e.clientX; pt.y = e.clientY
          return pt.matrixTransform(this.svgRoot.getScreenCTM().inverse())
        }
        const start = toSvg(ev), q = pos[b.id]
        let moved = false, d = { x: 0, y: 0 }
        try { g.setPointerCapture(ev.pointerId) } catch {}
        const move = e => {
          const now = toSvg(e)
          d = { x: now.x - start.x, y: now.y - start.y }
          if (!moved && Math.hypot(d.x, d.y) < 6) return
          moved = true
          g.classList.add('ipm-dragging')
          if (b.kind === 'rule') {
            if (!this.trash.classList.contains('ipm-trash-shown')) this.placeTrash()
            this.trash.classList.add('ipm-trash-shown')
            const r = this.trash.getBoundingClientRect(), m = 12
            const over = e.clientX >= r.left - m && e.clientX <= r.right + m &&
              e.clientY >= r.top - m && e.clientY <= r.bottom + m
            this.trash.classList.toggle('ipm-trash-hot', over)
            g.classList.toggle('ipm-doomed', over)
          }
          g.setAttribute('transform', `translate(${d.x},${d.y})`)
          for (const { path, c, a, b: to, up } of paths) {
            const from = c.from.block === b.id ? { x: a.x + d.x, y: a.y + d.y } : a
            const dest = c.to.block === b.id ? { x: to.x + d.x, y: to.y + d.y } : to
            if (from !== a || dest !== to) path.setAttribute('d', curve(from, dest, up))
          }
        }
        const up = e => {
          g.removeEventListener('pointermove', move)
          g.removeEventListener('pointerup', up)
          g.removeEventListener('pointercancel', up)
          if (!moved) {
            if (ev.pointerType === 'touch' && e.type === 'pointerup') tap()
            return
          }
          this.justDragged = true
          setTimeout(() => { this.justDragged = false }, 0)
          const trashed = this.trash.classList.contains('ipm-trash-hot') && e.type === 'pointerup'
          this.trash.classList.remove('ipm-trash-shown', 'ipm-trash-hot')
          if (trashed) return this.change(() => this.proof.removeBlock(b.id))
          this.undoStack.push(this.proof.snapshot())
          this.proof.moved = { ...(this.proof.moved ?? {}), [b.id]: this.inside(q.x + d.x, q.y + d.y, q) }
          this.render()
        }
        g.addEventListener('pointermove', move)
        g.addEventListener('pointerup', up)
        g.addEventListener('pointercancel', up)
      })
    }

    render() {
      const p = this.proof
      this.analysis = p.analyze()
      // The whole picture is always in view: it is scaled to fit the board, in width and height (the
      // board is about as high as the screen), and then covers the whole board, so that blocks can
      // be put anywhere on it. A locked task's board is only as high as its picture.
      const natural = this.layout().view
      const cw = this.canvas.clientWidth || natural[2]
      const ch = this.root.inert ? 0 : this.canvas.clientHeight
      // On a large board the picture is drawn larger (up to 1.4 times), so that it is easy to read.
      const scale = Math.min(cw > 700 ? 1.4 : 1, cw / natural[2], ch ? ch / natural[3] : Infinity)
      const { pos, view } = this.layout({ w: cw / scale - 2, h: ch ? ch / scale - 2 : 0 })
      this.view = view
      const s = this.analysis.s
      const root = svg('svg', { viewBox: view.join(' '), class: 'ipm-svg' })
      // Natural size: the picture's own units, at most the width of the page.
      root.style.width = `${Math.round(view[2] * scale)}px`
      root.style.maxWidth = 'none'
      this.svgRoot = root
      const paths = []  // connection paths, to follow a dragged block
      let bubble = null
      this.arrowId ??= `ipm-arrow-${Math.random().toString(36).slice(2)}`
      const marker = svg('marker', { id: this.arrowId, viewBox: '0 0 10 10', refX: 19, refY: 5,
        markerWidth: 9, markerHeight: 9, markerUnits: 'userSpaceOnUse', orient: 'auto' })
      marker.append(svg('path', { d: 'M0,0 L10,5 L0,10 z', class: 'ipm-arrow' }))
      const defs = svg('defs')
      defs.append(marker)
      root.append(defs)
      // The box of each local hypothesis: around the blocks that use it, and the top of its block.
      for (const sc of this.analysis.scopes) {
        // Only once the hypothesis is used: the box starts at its compartment.
        if (!sc.used) continue
        const x = pos[sc.block], cm = compartment(x, p.block(sc.block), sc.port)
        const qs = [...sc.members.map(id => pos[id]), { x: cm.x0 + 9, y: x.y, w: cm.x1 - cm.x0 - 18, h: 26 }]
        const x0 = Math.min(...qs.map(q => q.x)) - 12, y0 = Math.min(...qs.map(q => q.y)) - 28
        const x1 = Math.max(...qs.map(q => q.x + q.w)) + 12, y1 = Math.max(...qs.map(q => q.y + q.h)) + 6
        root.append(svg('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, rx: 12, class: 'ipm-box' }))
      }
      // connections
      for (const c of p.connections) {
        const a = this.portXY(pos, p.block(c.from.block), 'out', c.from.port)
        const b = this.portXY(pos, p.block(c.to.block), 'in', c.to.port)
        const st = this.analysis.status[c.id]
        const up = isLocal(p.block(c.from.block), c.from.port)
        const g = svg('g', { class: `ipm-conn ipm-${st}` + (up ? ' ipm-from-local' : '') })
        const path = svg('path', { d: curve(a, b, up) })
        paths.push({ path, c, a, b, up })
        const hit = svg('path', { d: path.getAttribute('d'), class: 'ipm-conn-hit' })
        // A white seam: where a line passes under a port or crosses another line, a gap shows that
        // it does not end there. An arrowhead marks the input where it does end.
        const halo = svg('path', { d: path.getAttribute('d'), class: 'ipm-conn-halo' })
        path.setAttribute('marker-end', `url(#${this.arrowId})`)
        paths.push({ path: hit, c, a, b, up }, { path: halo, c, a, b, up })
        g.append(hit, halo, path)
        g.addEventListener('click', ev => {
          if (ev.target.closest('.ipm-skull, .ipm-conn-remove')) return
          this.selectedConn = this.selectedConn === c.id ? null : c.id
          this.selected = null
          this.hideSheet()
          this.render()
        })
        if (this.selectedConn === c.id && (st === 'fail' || st === 'escape' || st === 'cycle')) {
          // A line with ☠ or ⚠: the explanation and ✕ in a box right beside it (drawn over the blocks).
          g.classList.add('ipm-conn-selected')
          const out = p.block(c.from.block).outputs[c.from.port], inp = p.block(c.to.block).inputs[c.to.port]
          bubble = { c, m: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, text: st === 'cycle' ? tr('That would go round in a circle.')
            : st === 'fail' ? tr('{x} does not fit {y}', { x: show(out, s), y: show(inp, s) })
            : tr('A local hypothesis may only be used inside its box.') }
        } else if (this.selectedConn === c.id) {
          g.classList.add('ipm-conn-selected')
          const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
          const x = svg('g', { class: 'ipm-conn-remove' })
          x.append(svg('circle', { cx: m.x + 18, cy: m.y, r: 13 }), svg('text', { x: m.x + 18, y: m.y + 5, 'text-anchor': 'middle' }, '✕'))
          x.addEventListener('click', () => {
            this.selectedConn = null
            this.change(() => { p.connections = p.connections.filter(e => e !== c) })
          })
          g.append(x)
        }
        if (st === 'fail' || st === 'cycle') {
          const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
          const skull = svg('text', { x: m.x, y: m.y + 7, class: 'ipm-skull', 'text-anchor': 'middle' }, '☠')
          skull.addEventListener('click', ev => { ev.stopPropagation(); this.selectConn(c) })
          g.append(skull)
        }
        if (st === 'escape') {
          const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
          const warn = svg('text', { x: m.x, y: m.y + 7, class: 'ipm-skull', 'text-anchor': 'middle' }, '⚠')
          warn.addEventListener('click', ev => { ev.stopPropagation(); this.selectConn(c) })
          g.append(warn)
        }
        root.append(g)
      }
      // blocks
      const sel = this.selected
      // While tactics are offered, the names they use (h₁, h₂, …) stand beside the blue dots.
      const shownNames = this.tacticsOnly || allowedTactic('exact') || SETTINGS.tactics === 'all' ? hypNames(p).names : {}
      // a selected goal: what one has there (the rest is dimmed), shown in a line as in Lean
      const usable = sel?.kind === 'in' ? this.usableAt(sel) : null
      const hypNamesNow = usable ? hypNames(p).names : {}
      for (const b of p.blocks) {
        const proved = b.kind === 'conclusion' && !this.analysis.openInputs.some(o => o.block === b.id)
        const portClass = (kind, i) => {
          const at = { block: b.id, port: i }
          if (kind === 'in') {
            const open = this.analysis.openInputs.some(o => o.block === b.id && o.port === i)
            return (open ? 'ipm-open ' : '') +
              (sel?.kind === 'in' && sel.block === b.id && sel.port === i ? 'ipm-selected ' : '') +
              (sel?.kind === 'out' && open && !this.tacticsOnly && this.fits(sel, at) ? 'ipm-candidate' : '')
          }
          return (sel?.kind === 'out' && sel.block === b.id && sel.port === i ? 'ipm-selected ' : '') +
            (usable && hypNamesNow[`${b.id}.${i}`] && !usable[`${b.id}.${i}`] ? 'ipm-out-of-scope ' : '') +
            (sel?.kind === 'in' && !this.tacticsOnly && this.fits(at, sel) ? 'ipm-candidate' : '')
        }
        const g = drawBlock(b, pos[b.id], s, proved ? 'ipm-proved' : '', portClass, shownNames)
        // An eigenvariable that escapes: a ⚠ at the block, which explains itself when tapped.
        if (this.analysis.eigen[b.id]) {
          const q = pos[b.id]
          const warn = svg('text', { x: q.x + q.w - 4, y: q.y + q.h + 4, class: 'ipm-skull ipm-eigen-warn', 'text-anchor': 'middle' }, '⚠')
          warn.addEventListener('click', ev => { ev.stopPropagation(); this.explainEigen(b) })
          g.append(warn)
        }
        for (const port of g.querySelectorAll('.ipm-port')) {
          const i = Number(port.dataset.i)
          port.addEventListener('click', () => port.dataset.kind === 'in' ? this.tapInput(b, i) : this.tapOutput(b, i))
        }
        // Tapping an assumption or a goal is tapping its only port.
        const tap = () => {
          if (b.kind === 'assumption') this.tapOutput(b, 0)
          else if (b.kind === 'conclusion') this.tapInput(b, 0)
          else this.tapBlock(b)
        }
        this.makeDraggable(g, b, pos, paths, tap)
        g.addEventListener('click', ev => {
          if (this.justDragged) { this.justDragged = false; return }
          if (ev.target.closest('.ipm-port')) return
          tap()
        })
        root.append(g)
      }
      if (bubble) this.drawBubble(root, bubble, view)
      this.drawSteps(root, pos, view)
      root.addEventListener('click', ev => {
        if (ev.target === root && (this.selected || this.selectedConn)) {
          this.selected = null; this.selectedConn = null; this.render()
        }
      })
      this.canvas.replaceChildren(root)
      const qed = this.analysis.qed
      this.root.classList.toggle('ipm-solved', qed)
      const code = leanProof(p, this.analysis)
      this.leanCode.textContent = code
      this.leanLink.href = 'https://live.lean-lang.org/#code=' + encodeURIComponent(code)
      this.leanLink.hidden = !qed
      const n = this.analysis.openInputs.length
      this.context.replaceChildren()
      if (this.selected?.kind === 'in' && !qed) {
        const at = this.selected, s = this.analysis.s
        for (const [k, name] of Object.entries(this.usableAt(at))) {
          const [id, port] = k.split('.')
          this.context.append(el('span', 'ipm-ctx-hyp', `${name} : ${show(this.proof.block(id).outputs[Number(port)], s)}`))
        }
        this.context.append(el('span', 'ipm-ctx-goal', `⊢ ${show(this.proof.block(at.block).inputs[at.port], s)}`))
      }
      this.status.textContent = tr(qed ? 'goals accomplished 🎉' :
        this.selected && this.tacticsOnly ? 'Now choose a tactic' :
        this.selected?.kind === 'in' ? 'Now tap a glowing green dot, or add a block with ＋' :
        this.selected?.kind === 'out' ? 'Now tap a glowing green circle, or add a block with ＋' :
        n === 1 ? '1 red circle left — tap one' : '{n} red circles left — tap one', { n })
      try { localStorage.setItem(this.key, JSON.stringify({ proof: this.proof.snapshot(), solved: qed })) } catch {}
      if (qed) { this.saveLemma(); this.unlock(); this.onSolved?.() }
      this.unlockNote.hidden = !(SETTINGS.tactics === 'earned' && this.unlocks.length)
      const ts = this.unlocks.join(', ')
      this.unlockNote.textContent = this.unlocks.every(k => UNLOCKED.has(k))
        ? tr('🔓 Unlocked: the tactic {t}', { t: ts }) : tr('🔒 Solve this level to unlock the tactic {t}.', { t: ts })
    }

    // Solving the task unlocks its tactics.
    unlock() {
      const fresh = this.unlocks.filter(k => !UNLOCKED.has(k))
      if (!fresh.length) return
      fresh.forEach(k => UNLOCKED.add(k))
      saveSettings()
    }

    // ------------------------------------------------------------ lemmas

    // Keeps this solved task as a lemma, with the Lean theorem of its proof.
    saveLemma() {
      if (!this.isLemma) return
      const { uses, goals } = leanParts(this.proof, this.analysis)
      if (uses.some(k => dependsOn(k, this.key))) return  // no lemma may be proved by itself
      const session = this.session
      const n = this.index + 1, base = `lemma_${session}_${n}`
      const leanNames = goals.map((_, j) => (goals.length > 1 ? `${base}_${j + 1}` : base))
      const norm = x => show(parse(x))
      const L = {
        v: 2, label: `L${session}.${n}`, session, task: n,
        statement: [this.assumptions.map(norm).join(', '), '⊢', this.conclusions.map(norm).join(', ')].filter(x => x).join(' '),
        atoms: goals[0]?.atoms ?? [], assumptions: this.assumptions, conclusions: this.conclusions, leanNames, uses,
        theorems: goals.map((g, j) =>
          ['theorem', leanNames[j], ...binders(g.groups, true), ...g.hyps, `: ${g.goal} :=\n  ${g.term}`].join(' ')),
      }
      const all = loadLemmas()
      const old = all[this.key]
      if (old && JSON.stringify({ ...old, key: undefined }) === JSON.stringify(L)) return
      all[this.key] = L
      try { localStorage.setItem(LEMMAS, JSON.stringify(all)) } catch {}
      registerLemmas()
      window.dispatchEvent(new Event('ipm-lemmas'))
    }

    // The lemmas this task may use: the solved tasks marked as lemmas that come before it (so that
    // no circle is possible), except trivial ones; the same statement only once.
    refreshLemmas() {
      const seen = new Set()
      const before = L => L.session < this.session || (L.session === this.session && L.task < this.index + 1)
      const lemmas = Object.values(RULES).filter(r => r.lemma).map(r => r.lemma)
        .filter(L => before(L) && !dependsOn(L.key, this.key))
        .filter(L => { const as = L.assumptions.map(x => show(parse(x))); return !L.conclusions.every(c => as.includes(show(parse(c)))) })
        .sort((a, b) => a.session - b.session || a.task - b.task)
        .filter(L => !seen.has(L.statement) && seen.add(L.statement))
      this.lemmaBox.hidden = lemmas.length === 0
      const items = cls => lemmas.map(L => {
        const name = 'lemma:' + L.key
        const act = () => { this.undoStack.push(this.proof.snapshot()); this.proof.addRule(name); this.hideSheet(); this.render() }
        const item = this.menuItem(name, rulePicture(name, cls === 'ipm-palette-item' ? 8 : 18), `${L.label}: ${L.statement}`, RULES[name].name, act, cls)
        item.classList.add('ipm-lemma-item')
        return item
      })
      this.lemmaList.replaceChildren(...items('ipm-menu-item'))
      this.paletteLemmas.replaceChildren(...(lemmas.length ? [el('div', 'ipm-pop-subtitle', tr('Lemmas from solved levels')), ...items('ipm-palette-item')] : []))
    }

    // ------------------------------------------------------------ tapping

    // Whether output `o` fits input `i` (both {block, port}) without a cycle.
    fits(o, i) {
      const p = this.proof
      const local = isLocal(p.block(o.block), o.port)
      if (!local && (o.block === i.block || p.createsCycle(o.block, i.block))) return false
      return !!unify(p.block(o.block).outputs[o.port], p.block(i.block).inputs[i.port], this.analysis.s)
    }

    // Draws a line from output `o` to input `i`; one that does not fit gets a ☠.
    selectConn(c) {
      this.selectedConn = this.selectedConn === c.id ? null : c.id
      this.selected = null
      this.hideSheet()
      this.render()
    }

    // The box beside a line with ☠ or ⚠: what is wrong, and ✕ to remove the line.
    drawBubble(root, { c, m, text }, view) {
      const words = text.split(' '), lines = ['']
      for (const w of words) {
        if ((lines.at(-1) + ' ' + w).trim().length > 30) lines.push(w)
        else lines[lines.length - 1] = (lines.at(-1) + ' ' + w).trim()
      }
      const w = Math.max(...lines.map(l => l.length)) * 7.4 + 62, h = lines.length * 18 + 16
      const x = Math.max(view[0] + 4, Math.min(m.x - w / 2, view[0] + view[2] - w - 4)), y = m.y + 18
      const g = svg('g', { class: 'ipm-bubble' })
      g.append(svg('rect', { x, y, width: w, height: h, rx: 8 }))
      lines.forEach((l, k) => g.append(svg('text', { x: x + 10, y: y + 22 + k * 18 }, l)))
      const del = svg('g', { class: 'ipm-conn-remove' })
      del.append(svg('circle', { cx: x + w - 22, cy: y + h / 2, r: 14 }), svg('text', { x: x + w - 22, y: y + h / 2 + 5, 'text-anchor': 'middle' }, '✕'))
      del.addEventListener('click', ev => {
        ev.stopPropagation()
        this.selectedConn = null
        this.change(() => { this.proof.connections = this.proof.connections.filter(e => e !== c) })
      })
      g.addEventListener('click', ev => ev.stopPropagation())
      g.append(del)
      root.append(g)
    }

    // ------------------------------------------------------------ steps

    // The steps for the selected port, by the shape of its statement, as in Lean: for a goal `A → B`
    // the →I block (`intro`), for an assumption `A ∧ B` the ∧E block (`obtain`), and so on.
    steps() {
      const sel = this.selected
      if (!sel || (SETTINGS.tactics === 'off' && !this.tacticsOnly)) return []
      const tacticAllowed = key => this.tacticsOnly || allowedTactic(key)
      const b = this.proof.block(sel.block)
      // (norm: also below ∀I, where the statement is the body with c₁ for the variable)
      const f = norm(sel.kind === 'in' ? b.inputs[sel.port] : b.outputs[sel.port], this.analysis.s)
      // The Lean command, with the names as in the Lean proof: assumptions h₁, h₂, …, local
      // hypotheses on from there (a new one gets the next name); `h` for what has no name.
      const { names, count } = hypNames(this.proof)
      const fresh = (k = 1) => 'h' + sub(count + k)
      const h = names[`${b.id}.${sel.port}`] ?? 'h'
      // the objects one may name: constants of the task, and eigenvariables of blocks on the board
      const objects = new Set()
      const collect = g => { if (g.t === 'con' && g.n !== '0') objects.add(g.n); parts(g).forEach(collect) }
      for (const x of this.proof.blocks) if (x.kind !== 'rule') [...x.inputs, ...x.outputs].forEach(collect)
      // (an eigenvariable only inside its block: the input of ∀I, the case of ∃E and induction)
      for (const x of this.proof.blocks)
        if (x.eig && sel.kind === 'in' && this.within(sel, x.id, x.rule === 'allI' ? 0 : 1)) objects.add(x.eig)
      const objs = [...objects].slice(0, 4)
      // [rule, Lean command, tactic (which must be allowed)]
      const goal = { imp: [['impI', `intro ${fresh()}`, 'intro']], and: [['conjI', 'constructor', 'constructor']],
        iff: [['iffI', 'constructor', 'constructor']], or: [['disjI1', 'left', 'left'], ['disjI2', 'right', 'right']],
        top: [['trueI', 'trivial', 'trivial']], all: [['allI', `intro c${sub(1 + this.proof.blocks.filter(x => x.eig).length)}`, 'intro'], ['ind', 'intro n; induction n', 'induction']],
        ex: [['exI', 'use _', 'use']] }
      const have = { and: [['conjE', `obtain ⟨${fresh()}, ${fresh(2)}⟩ := ${h}`, 'obtain']], or: [['disjE', `obtain (${fresh()} | ${fresh(2)}) := ${h}`, 'obtain']],
        imp: [['impE', `have ${fresh()} := ${h} ?_`, 'apply']], bot: [['falseE', `have ${fresh()} := ${h}.elim`, 'exfalso']],
        iff: [['iffE1', `have ${fresh()} := ${h}.mp ?_`, 'mp'], ['iffE2', `have ${fresh()} := ${h}.mpr ?_`, 'mpr']],
        all: [], ex: [['exE', `obtain ⟨c${sub(1 + this.proof.blocks.filter(x => x.eig).length)}, ${fresh()}⟩ := ${h}`, 'obtain']] }
      if (sel.kind === 'in' && !this.analysis.openInputs.some(o => o.block === sel.block && o.port === sel.port)) return []
      const steps = ((sel.kind === 'in' ? goal : have)[f.t] ?? []).filter(([rule, , key]) => this.rules.includes(rule) && tacticAllowed(key))
        .map(([rule, tactic]) => ({ rule, text: `${RULES[rule].label} · ${tactic}`, act: () => this.takeStep(rule) }))
      // ∀E and ∃I with the object named (or `default`, if there is none: Lean's choice)
      const withObject = (rule, key, cmd) => {
        if (!this.rules.includes(rule) || !tacticAllowed(key)) return
        for (const o of objs.length ? objs : [null])
          steps.push({ rule, text: `${RULES[rule].label} · ${cmd(o ?? 'default')}`, act: () => this.takeStep(rule, o) })
      }
      if (sel.kind !== 'in' && f.t === 'all') withObject('allE', 'specialize', o => `specialize ${h} ${o}`)
      if (sel.kind === 'in' && f.t === 'ex') withObject('exI', 'use', o => `use ${o}`)
      if (sel.kind !== 'in') return steps
      // For a goal also: `exact h` for what one has (an assumption, a local hypothesis in whose box the
      // goal is, a part from `obtain`) that fits it, and `apply h` for an h : A → B whose B fits it
      // (a →E block, which leaves A to prove). Each is tried on a copy of the proof first.
      const exact = [], apply = []
      const goalTo = { block: sel.block, port: sel.port }
      for (const [at, name] of Object.entries(this.usableAt(sel))) {
        const [id, port] = at.split('.'), o = { block: id, port: Number(port) }, x = this.proof.block(id)
        if (!x || (!isLocal(x, o.port) && (o.block === sel.block || this.proof.createsCycle(o.block, sel.block)))) continue
        const g = norm(x.outputs[o.port], this.analysis.s)
        if (tacticAllowed('exact') && unify(x.outputs[o.port], f, this.analysis.s) && this.tryOut(q => q.connect(o, goalTo))) {
          exact.push({ text: `exact ${name}`, act: () => this.link(o, sel) })
          continue
        }
        // A chain of blocks from `o` to the goal: `rules` one after the other, each taking the one
        // before at its input 0 (h : A → B → C with goal C: two →E blocks; `A` and `B` are left to prove).
        const chain = (rule, text, rules) => {
          const build = q => {
            let from = o
            for (const r of rules) { const nb = q.addRule(r); q.connect(from, { block: nb.id, port: 0 }); from = { block: nb.id, port: 0 } }
            q.connect(from, goalTo)
          }
          if (this.tryOut(build)) apply.push({ rule, text, act: () => { this.selected = null; this.change(() => build(this.proof)) } })
        }
        // h : A → B → C or ∀ x, P x → Q x: as many →E and ∀E blocks as it takes to reach the goal
        if ((g.t === 'imp' || g.t === 'all') && tacticAllowed('apply')) {
          const seq = []
          for (let t = g; seq.length < 4; ) {
            if (t.t === 'imp' && this.rules.includes('impE')) { seq.push('impE'); t = norm(t.b, this.analysis.s) }
            else if (t.t === 'all' && this.rules.includes('allE')) { seq.push('allE'); t = norm(t.a, this.analysis.s) }
            else break
            const n = apply.length
            chain(seq[0], `${RULES[seq[0]].label} · apply ${name}`, [...seq])
            if (apply.length > n) break
          }
        }
        if (g.t === 'iff') {
          if (this.rules.includes('iffE1') && tacticAllowed('mp') && unify(g.b, f, this.analysis.s)) chain('iffE1', `↔E₁ · apply ${name}.mp`, ['iffE1'])
          if (this.rules.includes('iffE2') && tacticAllowed('mpr') && unify(g.a, f, this.analysis.s)) chain('iffE2', `↔E₂ · apply ${name}.mpr`, ['iffE2'])
        }
        if (g.t === 'bot' && f.t !== 'bot' && this.rules.includes('falseE') && tacticAllowed('exfalso'))
          chain('falseE', `⊥E · exact ${name}.elim`, ['falseE'])
      }
      // For any goal: exfalso (prove ⊥ instead), by_contra (assume the opposite), by_cases (two cases)
      const any = []
      if (f.t !== 'bot' && this.rules.includes('falseE') && tacticAllowed('exfalso'))
        any.push({ rule: 'falseE', text: '⊥E · exfalso', act: () => this.takeStep('falseE') })
      if (f.t !== 'bot' && this.rules.includes('raa') && tacticAllowed('by_contra'))
        any.push({ rule: 'raa', text: `RAA · by_contra ${fresh()}`, act: () => this.takeStep('raa') })
      // by_cases needs the statement to split on: one button for each proposition of the level
      if (this.rules.includes('TND') && this.rules.includes('disjE') && tacticAllowed('by_cases')) {
        const props = new Set()
        const atoms = g => { if (g.t === 'atom') props.add(g.n); else parts(g).forEach(atoms) }
        for (const x of this.proof.blocks) if (x.kind !== 'rule') [...x.inputs, ...x.outputs].forEach(atoms)
        for (const p of [...props].slice(0, 4))
          any.push({ rule: 'TND', text: `TND · by_cases ${fresh()} : ${p}`, act: () => this.takeCases(p) })
        if (!props.size) any.push({ rule: 'TND', text: `TND · by_cases ${fresh()} : …`, act: () => this.takeCases() })
      }
      return [...exact, ...steps, ...apply, ...any]
    }

    // What one has at the input `at` ({block, port}), as Lean shows it beside a goal: each named thing
    // (assumption, local hypothesis, part from `obtain`, …) unless it rests on a local hypothesis in
    // whose box the input is not. Returns the names by `block.port`.
    usableAt(at) {
      const p = this.proof
      const leadsInto = (x, k) => this.within(at, x, k)
      // the local hypotheses an output rests on
      // the local hypotheses an output rests on
      const rests = (o, seen = new Set()) => {
        const b = p.block(o.block)
        if (isLocal(b, o.port)) return [[b.id, consumer(b, o.port)]]
        if (seen.has(b.id)) return []
        seen.add(b.id)
        return p.connections.filter(c => c.to.block === b.id).flatMap(c => rests(c.from, seen))
      }
      const { names } = hypNames(p), out = {}
      for (const [k, name] of Object.entries(names)) {
        const [id, port] = k.split('.')
        if (!p.block(id)) continue
        if (rests({ block: id, port: Number(port) }).every(([x, j]) => leadsInto(x, j))) out[k] = name
      }
      return out
    }

    // Whether the input `at` lies in the box of block x's input k (where x's local hypothesis or
    // eigenvariable may be used): it leads into that input, and on no way to a goal past it (an
    // output may be used more than once).
    within(at, x, k) {
      const p = this.proof
      if (at.block === x && at.port === k) return true
      const seen = new Set(), stack = [at.block]
      let into = false
      while (stack.length) {
        const b = stack.pop()
        if (seen.has(b)) continue
        seen.add(b)
        if (p.block(b).kind === 'conclusion') return false
        for (const c of p.connections) {
          if (c.from.block !== b || isLocal(p.block(b), c.from.port)) continue
          if (c.to.block === x && c.to.port === k) { into = true; continue }
          stack.push(c.to.block)
        }
      }
      return into
    }

    // Whether the lines that `connect` draws (on a copy of the proof) fit, and no local hypothesis escapes.
    tryOut(connect) {
      const q = new Proof([], [])
      q.restore(this.proof.snapshot())
      const before = new Set(q.connections.map(c => c.id)), eig = Object.keys(this.analysis.eigen).length
      connect(q)
      const a = q.analyze()
      return q.connections.every(c => before.has(c.id) || ['ok', 'pending'].includes(a.status[c.id])) &&
        Object.keys(a.eigen).length <= eig
    }

    // by_cases: a case distinction (∨E) on A ∨ ¬A (TND) for the selected goal; A is the chosen
    // proposition (or left open).
    takeCases(prop = null) {
      const sel = this.selected
      if (!sel) return  // a button left over from an earlier picture
      this.selected = null
      this.change(() => {
        const cases = this.proof.addRule('disjE'), tnd = this.proof.addRule('TND')
        if (prop) tnd.fix = { [`${tnd.id}.A`]: { t: 'atom', n: prop } }
        this.proof.connect({ block: cases.id, port: 0 }, { block: sel.block, port: sel.port })
        this.proof.connect({ block: tnd.id, port: 0 }, { block: cases.id, port: 0 })
      })
    }

    // Puts the block of a step in and connects it to the selected port.
    takeStep(rule, object = null) {
      const sel = this.selected
      if (!sel) return  // a button left over from an earlier picture
      this.selected = null
      this.change(() => {
        const nb = this.proof.addRule(rule)
        // the object of ∀E or ∃I, named in the tactic
        if (object) nb.fix = { [`${nb.id}.B`]: /^c[₀-₉]+$/.test(object) ? { t: 'eig', n: object } : { t: 'con', n: object } }
        if (sel.kind === 'in') this.proof.connect({ block: nb.id, port: 0 }, { block: sel.block, port: sel.port })
        else {
          this.proof.connect({ block: sel.block, port: sel.port }, { block: nb.id, port: 0 })
          nb.named = true
          // ∨E and ∃E (obtain) prove the goal by cases: as in Lean, the first open goal where what is
          // taken apart may be used
          if (RULES[rule].local) {
            this.analysis = this.proof.analyze()
            const key = `${sel.block}.${sel.port}`
            const goal = this.analysis.openInputs.find(o => o.block !== nb.id && !this.proof.createsCycle(nb.id, o.block) && this.usableAt(o)[key])
            if (goal) this.proof.connect({ block: nb.id, port: 0 }, goal)
          }
        }
      })
    }

    // The steps as small buttons beside the selected port: above a red circle, below a blue dot.
    // If they do not fit side by side into the picture, they are stacked, and kept inside it.
    drawSteps(root, pos, view) {
      const steps = this.steps()
      if (!steps.length) return
      const sel = this.selected, b = this.proof.block(sel.block)
      const at = portAt(pos[b.id], b, sel.kind, sel.port)
      const pills = steps
      const w = t => t.length * 8.2 + 22, gap = 8
      const total = pills.reduce((s, p) => s + w(p.text), 0) + gap * (pills.length - 1)
      const stacked = total > view[2] - 8
      const inside = (x, width) => Math.max(view[0] + 4, Math.min(x, view[0] + view[2] - width - 4))
      let x = at.x - total / 2
      pills.forEach((p, k) => {
        const y = sel.kind === 'in' ? at.y - 52 - (stacked ? (pills.length - 1 - k) * 40 : 0) : at.y + 18 + (stacked ? k * 40 : 0)
        const px = inside(stacked ? at.x - w(p.text) / 2 : x, w(p.text))
        const g = svg('g', { class: 'ipm-step', 'data-rule': p.rule ?? '' })
        g.append(svg('rect', { x: px, y, width: w(p.text), height: 32, rx: 16 }),
          svg('text', { x: px + w(p.text) / 2, y: y + 21, 'text-anchor': 'middle' }, p.text))
        g.addEventListener('click', ev => { ev.stopPropagation(); p.act() })
        root.append(g)
        x += w(p.text) + gap
      })
    }

    link(o, i) {
      const local = isLocal(this.proof.block(o.block), o.port)
      if (!local && (o.block === i.block || this.proof.createsCycle(o.block, i.block))) {
        this.status.textContent = tr('That would go round in a circle.')
        return
      }
      this.selected = null
      this.change(() => this.proof.connect(o, i))
    }

    tapInput(b, i) {
      this.selectedConn = null
      const sel = this.selected
      if (sel?.kind === 'out' && !this.tacticsOnly) return this.link(sel, { block: b.id, port: i })
      if (sel?.kind === 'in' && sel.block === b.id && sel.port === i) return this.closeSheet()
      this.selected = { kind: 'in', block: b.id, port: i }
      this.render()
      this.inputMenu(b, i)
    }

    tapOutput(b, j) {
      this.selectedConn = null
      const sel = this.selected
      if (sel?.kind === 'in' && !this.tacticsOnly) return this.link({ block: b.id, port: j }, sel)
      if (sel?.kind === 'out' && sel.block === b.id && sel.port === j) return this.closeSheet()
      this.selected = { kind: 'out', block: b.id, port: j }
      this.render()
      this.outputMenu(b, j)
    }

    // A rule block: completes a pending selection with its fitting port, or offers to remove it.
    tapBlock(b) {
      const sel = this.selected
      if (sel && this.tacticsOnly) return this.closeSheet()
      if (sel?.kind === 'in' && b.outputs.length) {
        const j = b.outputs.findIndex((_, j) => this.fits({ block: b.id, port: j }, sel))
        return this.link({ block: b.id, port: Math.max(j, 0) }, sel)
      }
      // (a block without inputs, like ⊤I, takes no line)
      if (sel?.kind === 'out' && b.inputs.length) {
        const open = this.analysis.openInputs.filter(o => o.block === b.id)
        const target = open.find(o => this.fits(sel, o)) ?? open[0] ?? { block: b.id, port: 0 }
        return this.link(sel, target)
      }
      this.blockMenu(b)
    }

    // ------------------------------------------------------------ menus

    closeSheet(rerender = true) {
      this.sheet.hidden = true
      this.sheet.replaceChildren()
      if (this.selected) {
        this.selected = null
        if (rerender) this.render()
      }
    }

    // The sheet shows one line (title, number of new blocks) and folds out on tap. It starts
    // unfolded only when `unfold` is set, i.e. when nothing in the picture fits.
    openSheet(title, options, hint, unfold = true) {
      const n = options.filter(o => /block$/i.test(o.detail ?? '')).length
      const head = el('div', 'ipm-sheet-head')
      const toggle = el('span', 'ipm-sheet-toggle')
      head.append(el('div', 'ipm-sheet-title', title), toggle)
      const body = el('div', 'ipm-sheet-body')
      if (hint) body.append(el('div', 'ipm-sheet-hint', hint))
      for (const o of options) {
        if (o.section) { body.append(el('div', 'ipm-sheet-section', o.section)); continue }
        const b = el('button', 'ipm-option' + (o.bad ? ' ipm-bad' : '') + (o.picture ? ' ipm-option-picture' : ''))
        b.type = 'button'
        if (o.picture) { b.append(o.picture); b.title = o.label }
        else b.append(el('span', 'ipm-option-main', o.label))
        if (o.detail) b.append(el('span', 'ipm-option-detail', o.detail))
        b.addEventListener('click', o.act)
        body.append(b)
      }
      const close = el('button', 'ipm-option ipm-close', tr('Cancel'))
      close.type = 'button'
      close.addEventListener('click', () => this.closeSheet())
      body.append(close)
      const setFolded = folded => {
        this.sheet.classList.toggle('ipm-folded', folded)
        toggle.textContent = tr(folded ? (n ? (n === 1 ? '1 rule ▸' : '{n} rules ▸') : 'more ▸') : 'less ▾', { n })
      }
      head.addEventListener('click', () => setFolded(!this.sheet.classList.contains('ipm-folded')))
      this.sheet.replaceChildren(head, body)
      setFolded(!unfold)
      this.sheet.hidden = false
      this.sheet.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }

    // The rules, shown generically (`∧I  ?1, ?2 ⟹ ?1 ∧ ?2`) so that they do not give anything away.
    // Choosing one only adds the block; the player then connects it, and the current selection stays.
    ruleOptions() {
      return this.rules.map(name => {
        const r = RULES[name]
        const f = ruleFormulas(name, 'rule')
        return {
          picture: rulePicture(name),
          label: `${r.label}  ${f.inputs.map(x => show(x)).join(', ')} ⟹ ${f.outputs.map(x => show(x)).join(', ')}`,
          detail: tr('{name} block', { name: tr(r.name) }),
          act: () => {
            this.undoStack.push(this.proof.snapshot())
            this.proof.addRule(name)
            this.sheet.hidden = true
            this.render()
          },
        }
      })
    }

    // A selected input: the player taps an output in the picture or adds a rule from the menu. A
    // sheet appears only to disconnect an input that is connected already.
    inputMenu(b, i) {
      const p = this.proof, s = this.analysis.s
      const connected = p.connections.find(c => c.to.block === b.id && c.to.port === i)
      if (!connected) return this.hideSheet()
      this.openSheet(tr('Prove {x}', { x: show(b.inputs[i], s) }), [{ label: tr('Disconnect'), act: () => {
        this.selected = null
        this.change(() => { p.connections = p.connections.filter(c => c !== connected) })
      } }], tr('This input is connected already.'))
    }

    outputMenu() { this.hideSheet() }

    // Hides the sheet but keeps the selection (unlike `closeSheet`).
    hideSheet() { this.sheet.hidden = true; this.sheet.replaceChildren() }

    blockMenu(b) {
      this.openSheet(tr(RULES[b.rule].name), [
        { label: tr('Remove this block'), act: () => this.change(() => this.proof.removeBlock(b.id)) },
      ])
    }

    explainEigen(b) {
      const what = b.rule === 'allI'
        ? 'The {c} of this ∀I block stands for an arbitrary object. So it must not occur in the conclusion, nor in an assumption that the proof of its input uses.'
        : b.rule === 'ind'
        ? 'The {c} of this induction block stands for an arbitrary number. So it must not occur in the conclusion, nor in an assumption other than its hypothesis that the proof of the step uses.'
        : 'The {c} of this ∃E block stands for the object that exists, about which nothing else is known. So it must not occur in the conclusion, nor in the ∃ statement, nor in another assumption that the proof of its second input uses.'
      this.openSheet(tr('⚠ {c} escapes', { c: b.eig }), [
        { label: tr('Remove this block'), act: () => this.change(() => this.proof.removeBlock(b.id)) },
      ], tr(what, { c: b.eig }))
    }
  }

  // Tasks on a page are revealed one at a time, like the steps of a lesson.
  // The worlds as a map (instead of the list in the table of contents): a circle per world, with a
  // ring for the levels solved, and lines from the worlds it builds on. The number of levels of each
  // world is here (docs/levels.py checks it); `at` is the place on the map.
  const WORLDS = [
    { n: 1, levels: 13, at: [0, 0], after: [] }, { n: 2, levels: 23, at: [0, 1], after: [1] },
    { n: 3, levels: 20, at: [0, 2], after: [2] }, { n: 4, levels: 21, at: [0, 3], after: [3] },
    { n: 5, levels: 13, at: [0, 4], after: [4] }, { n: 6, levels: 24, at: [0, 5], after: [5] },
    { n: 7, levels: 17, at: [0, 6], after: [5] }, { n: 8, levels: 2, at: [1, 7], after: [7] },
    { n: 9, levels: 6, at: [1, 8], after: [7] },
  ]
  function worldMap() {
    const toc = document.querySelector('#toc')
    const links = {}
    for (const a of document.querySelectorAll('#toc a[href*="World-"]')) {
      const m = /World-(\d+)___/.exec(a.getAttribute('href'))
      if (m && !links[m[1]]) links[m[1]] = a
    }
    if (!toc || !links[1]) return
    const here = Number(/World-(\d+)___/.exec(location.pathname)?.[1] ?? 0)
    const solved = w => {
      const path = new URL(links[w.n].href, location.href).pathname
      let k = 0
      for (let i = 0; i < w.levels; i++) {
        try { if (JSON.parse(localStorage.getItem(`ipm-verso:${path}:${i}`))?.solved) k++ } catch {}
      }
      return k
    }
    // The worlds go down; a world's name stands right of its circle. A line that skips a row (5 → 7,
    // 7 → 9) bends to the left around the circle in between.
    const W = 250, dx = 46, dy = 56, x0 = 34, y0 = 26
    const pos = w => [x0 + w.at[0] * dx, y0 + w.at[1] * dy]
    const H = y0 + 8 * dy + 30
    const map = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'ipm-map' })
    for (const w of WORLDS) for (const a of w.after) {
      const [x1, y1] = pos(WORLDS[a - 1]), [x2, y2] = pos(w)
      const d = w.at[1] - WORLDS[a - 1].at[1] > 1 && x1 === x2
        ? `M${x1},${y1} C${x1 - 34},${y1 + dy * 0.4} ${x2 - 34},${y2 - dy * 0.4} ${x2},${y2}`
        : w.at[1] - WORLDS[a - 1].at[1] > 1
          ? `M${x1},${y1} C${x1 - 30},${(y1 + y2) / 2} ${x2 - 40},${y2 - 10} ${x2},${y2}`
          : `M${x1},${y1} L${x2},${y2}`
      map.append(svg('path', { d, class: 'ipm-map-edge' }))
    }
    for (const w of WORLDS) {
      const [x, y] = pos(w), r = 18, k = solved(w), frac = k / w.levels
      const name = (links[w.n].textContent ?? '').replace(/^\s*\d+\.\s*/, '').replace(/(World|Welt) \d+: /, '').trim()
      const g = svg('a', { href: links[w.n].getAttribute('href'), class: 'ipm-map-world' + (w.n === here ? ' ipm-map-here' : '') + (k === w.levels ? ' ipm-map-done' : '') })
      g.append(svg('title', {}, `${name}: ${k}/${w.levels}`))
      g.append(svg('circle', { cx: x, cy: y, r, class: 'ipm-map-disc' }))
      // the ring: the share of levels solved
      if (frac > 0 && frac < 1) {
        const a = 2 * Math.PI * frac, ex = x + r * Math.sin(a), ey = y - r * Math.cos(a)
        g.append(svg('path', { d: `M${x},${y - r} A${r},${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${ex},${ey}`, class: 'ipm-map-ring' }))
      }
      g.append(svg('text', { x, y: y + 6, 'text-anchor': 'middle', class: 'ipm-map-n' }, String(w.n)))
      g.append(svg('text', { x: x + r + 8, y: y - 1, class: 'ipm-map-name' }, name))
      g.append(svg('text', { x: x + r + 8, y: y + 13, class: 'ipm-map-count' }, `${k}/${w.levels}`))
      map.append(g)
    }
    const box = el('div', 'ipm-worlds')
    box.append(el('div', 'ipm-worlds-title', tr('Worlds')), map)
    // the tactic trainer, beside the way through the worlds
    const train = toc.querySelector('a[href*="Tactic-Trainer"]')
    if (train) {
      const t = el('a', 'ipm-map-trainer' + (location.pathname.includes('Tactic-Trainer') ? ' ipm-map-here' : ''), tr('🎯 Tactic trainer'))
      t.href = train.getAttribute('href')
      box.append(t)
    }
    toc.querySelector('.first')?.prepend(box) ?? toc.prepend(box)
    toc.classList.add('ipm-has-map')
  }

  // The start page: a big button to start (the first session), or to go on where one left off.
  function startButton() {
    const first = document.querySelector('#toc a[href*="World-1___"], main a[href*="World-1___"]')
    const h1 = document.querySelector('main h1')
    if (!first || !h1) return
    let last = null
    try { last = JSON.parse(localStorage.getItem('ipm-verso:last')) } catch {}
    const box = el('div', 'ipm-start')
    const go = el('a', 'ipm-start-button', last ? tr('▶ Continue') : tr('▶ Start'))
    go.href = last?.href ?? first.getAttribute('href')
    box.append(go)
    if (last) {
      box.append(el('div', 'ipm-start-where', last.title))
      const again = el('a', 'ipm-start-again', tr('or start from the beginning'))
      again.href = first.getAttribute('href')
      box.append(again)
    }
    const train = document.querySelector('#toc a[href*="Tactic-Trainer"], main a[href*="Tactic-Trainer"]')
    if (train) {
      const t = el('a', 'ipm-start-trainer', tr('🎯 Tactic trainer'))
      t.href = train.getAttribute('href')
      box.append(t)
    }
    h1.after(box)
  }

  // A world's page shows one level at a time, on a stage as high as the screen: the level's text,
  // its board (which takes the room that is left), ＋ and the tools. Above, on the right: a dot for
  // each task (to go there; ← → also do). At its foot: the rules of the session, folded away.
  // Nothing scrolls while one plays; the level is in the address (#level-3).
  // The levels moved twice: from Session-2___-Implication/ to World-2___-Implication/, and then the
  // levels of the world "From the Lean Course" into the worlds of their rules (the later worlds one
  // number down). What the browser keeps under the old places (progress, tips seen) moves once, by
  // this table (world page/:level index, old → new); the lemmas are made anew when their levels are
  // shown again.
  const MOVED = {"Session-1___-Conjunction/:0":"World-1___-Conjunction/:0","Session-1___-Conjunction/:1":"World-1___-Conjunction/:1","Session-1___-Conjunction/:2":"World-1___-Conjunction/:2","Session-1___-Conjunction/:3":"World-1___-Conjunction/:3","Session-1___-Conjunction/:4":"World-1___-Conjunction/:4","World-6___-From-the-Lean-Course/:8":"World-1___-Conjunction/:5","Session-6___-From-the-Lean-Course/:8":"World-1___-Conjunction/:5","World-1___-Conjunction/:5":"World-1___-Conjunction/:6","Session-1___-Conjunction/:5":"World-1___-Conjunction/:6","World-1___-Conjunction/:6":"World-1___-Conjunction/:7","Session-1___-Conjunction/:6":"World-1___-Conjunction/:7","World-1___-Conjunction/:7":"World-1___-Conjunction/:8","Session-1___-Conjunction/:7":"World-1___-Conjunction/:8","World-1___-Conjunction/:8":"World-1___-Conjunction/:9","Session-1___-Conjunction/:8":"World-1___-Conjunction/:9","World-1___-Conjunction/:9":"World-1___-Conjunction/:10","Session-1___-Conjunction/:9":"World-1___-Conjunction/:10","World-1___-Conjunction/:10":"World-1___-Conjunction/:11","Session-1___-Conjunction/:10":"World-1___-Conjunction/:11","World-1___-Conjunction/:11":"World-1___-Conjunction/:12","Session-1___-Conjunction/:11":"World-1___-Conjunction/:12","Session-2___-Implication/:0":"World-2___-Implication/:0","Session-2___-Implication/:1":"World-2___-Implication/:1","Session-2___-Implication/:2":"World-2___-Implication/:2","Session-2___-Implication/:3":"World-2___-Implication/:3","Session-2___-Implication/:4":"World-2___-Implication/:4","Session-2___-Implication/:5":"World-2___-Implication/:5","Session-2___-Implication/:6":"World-2___-Implication/:6","Session-2___-Implication/:7":"World-2___-Implication/:7","Session-2___-Implication/:8":"World-2___-Implication/:8","Session-2___-Implication/:9":"World-2___-Implication/:9","Session-2___-Implication/:10":"World-2___-Implication/:10","Session-2___-Implication/:11":"World-2___-Implication/:11","Session-2___-Implication/:12":"World-2___-Implication/:12","World-6___-From-the-Lean-Course/:1":"World-2___-Implication/:13","Session-6___-From-the-Lean-Course/:1":"World-2___-Implication/:13","World-6___-From-the-Lean-Course/:2":"World-2___-Implication/:14","Session-6___-From-the-Lean-Course/:2":"World-2___-Implication/:14","World-6___-From-the-Lean-Course/:0":"World-2___-Implication/:15","Session-6___-From-the-Lean-Course/:0":"World-2___-Implication/:15","World-6___-From-the-Lean-Course/:3":"World-2___-Implication/:16","Session-6___-From-the-Lean-Course/:3":"World-2___-Implication/:16","World-6___-From-the-Lean-Course/:5":"World-2___-Implication/:17","Session-6___-From-the-Lean-Course/:5":"World-2___-Implication/:17","World-6___-From-the-Lean-Course/:4":"World-2___-Implication/:18","Session-6___-From-the-Lean-Course/:4":"World-2___-Implication/:18","World-6___-From-the-Lean-Course/:7":"World-2___-Implication/:19","Session-6___-From-the-Lean-Course/:7":"World-2___-Implication/:19","World-6___-From-the-Lean-Course/:6":"World-2___-Implication/:20","Session-6___-From-the-Lean-Course/:6":"World-2___-Implication/:20","World-6___-From-the-Lean-Course/:12":"World-2___-Implication/:21","Session-6___-From-the-Lean-Course/:12":"World-2___-Implication/:21","World-2___-Implication/:13":"World-2___-Implication/:22","Session-2___-Implication/:13":"World-2___-Implication/:22","Session-3___-Disjunction/:0":"World-3___-Disjunction/:0","Session-3___-Disjunction/:1":"World-3___-Disjunction/:1","Session-3___-Disjunction/:2":"World-3___-Disjunction/:2","Session-3___-Disjunction/:3":"World-3___-Disjunction/:3","Session-3___-Disjunction/:4":"World-3___-Disjunction/:4","Session-3___-Disjunction/:5":"World-3___-Disjunction/:5","Session-3___-Disjunction/:6":"World-3___-Disjunction/:6","World-6___-From-the-Lean-Course/:9":"World-3___-Disjunction/:7","Session-6___-From-the-Lean-Course/:9":"World-3___-Disjunction/:7","World-6___-From-the-Lean-Course/:10":"World-3___-Disjunction/:8","Session-6___-From-the-Lean-Course/:10":"World-3___-Disjunction/:8","World-6___-From-the-Lean-Course/:14":"World-3___-Disjunction/:9","Session-6___-From-the-Lean-Course/:14":"World-3___-Disjunction/:9","World-6___-From-the-Lean-Course/:11":"World-3___-Disjunction/:10","Session-6___-From-the-Lean-Course/:11":"World-3___-Disjunction/:10","World-3___-Disjunction/:7":"World-3___-Disjunction/:11","Session-3___-Disjunction/:7":"World-3___-Disjunction/:11","World-3___-Disjunction/:8":"World-3___-Disjunction/:12","Session-3___-Disjunction/:8":"World-3___-Disjunction/:12","World-6___-From-the-Lean-Course/:16":"World-3___-Disjunction/:13","Session-6___-From-the-Lean-Course/:16":"World-3___-Disjunction/:13","World-6___-From-the-Lean-Course/:17":"World-3___-Disjunction/:14","Session-6___-From-the-Lean-Course/:17":"World-3___-Disjunction/:14","World-3___-Disjunction/:9":"World-3___-Disjunction/:15","Session-3___-Disjunction/:9":"World-3___-Disjunction/:15","World-3___-Disjunction/:10":"World-3___-Disjunction/:16","Session-3___-Disjunction/:10":"World-3___-Disjunction/:16","World-6___-From-the-Lean-Course/:13":"World-3___-Disjunction/:17","Session-6___-From-the-Lean-Course/:13":"World-3___-Disjunction/:17","World-6___-From-the-Lean-Course/:15":"World-3___-Disjunction/:18","Session-6___-From-the-Lean-Course/:15":"World-3___-Disjunction/:18","World-3___-Disjunction/:11":"World-3___-Disjunction/:19","Session-3___-Disjunction/:11":"World-3___-Disjunction/:19","Session-4___-Falsity-and-Negation/:0":"World-4___-Falsity-and-Negation/:0","Session-4___-Falsity-and-Negation/:1":"World-4___-Falsity-and-Negation/:1","Session-4___-Falsity-and-Negation/:2":"World-4___-Falsity-and-Negation/:2","Session-4___-Falsity-and-Negation/:3":"World-4___-Falsity-and-Negation/:3","Session-4___-Falsity-and-Negation/:4":"World-4___-Falsity-and-Negation/:4","Session-4___-Falsity-and-Negation/:5":"World-4___-Falsity-and-Negation/:5","Session-4___-Falsity-and-Negation/:6":"World-4___-Falsity-and-Negation/:6","Session-4___-Falsity-and-Negation/:7":"World-4___-Falsity-and-Negation/:7","Session-4___-Falsity-and-Negation/:8":"World-4___-Falsity-and-Negation/:8","Session-4___-Falsity-and-Negation/:9":"World-4___-Falsity-and-Negation/:9","Session-4___-Falsity-and-Negation/:10":"World-4___-Falsity-and-Negation/:10","Session-4___-Falsity-and-Negation/:11":"World-4___-Falsity-and-Negation/:11","Session-4___-Falsity-and-Negation/:12":"World-4___-Falsity-and-Negation/:12","Session-4___-Falsity-and-Negation/:13":"World-4___-Falsity-and-Negation/:13","World-6___-From-the-Lean-Course/:20":"World-4___-Falsity-and-Negation/:14","Session-6___-From-the-Lean-Course/:20":"World-4___-Falsity-and-Negation/:14","World-6___-From-the-Lean-Course/:18":"World-4___-Falsity-and-Negation/:15","Session-6___-From-the-Lean-Course/:18":"World-4___-Falsity-and-Negation/:15","World-6___-From-the-Lean-Course/:19":"World-4___-Falsity-and-Negation/:16","Session-6___-From-the-Lean-Course/:19":"World-4___-Falsity-and-Negation/:16","World-6___-From-the-Lean-Course/:21":"World-4___-Falsity-and-Negation/:17","Session-6___-From-the-Lean-Course/:21":"World-4___-Falsity-and-Negation/:17","World-6___-From-the-Lean-Course/:22":"World-4___-Falsity-and-Negation/:18","Session-6___-From-the-Lean-Course/:22":"World-4___-Falsity-and-Negation/:18","World-6___-From-the-Lean-Course/:23":"World-4___-Falsity-and-Negation/:19","Session-6___-From-the-Lean-Course/:23":"World-4___-Falsity-and-Negation/:19","World-4___-Falsity-and-Negation/:14":"World-4___-Falsity-and-Negation/:20","Session-4___-Falsity-and-Negation/:14":"World-4___-Falsity-and-Negation/:20","Session-5___-Classical-Logic/:0":"World-5___-Classical-Logic/:0","Session-5___-Classical-Logic/:1":"World-5___-Classical-Logic/:1","Session-5___-Classical-Logic/:2":"World-5___-Classical-Logic/:2","Session-5___-Classical-Logic/:3":"World-5___-Classical-Logic/:3","Session-5___-Classical-Logic/:4":"World-5___-Classical-Logic/:4","Session-5___-Classical-Logic/:5":"World-5___-Classical-Logic/:5","Session-5___-Classical-Logic/:6":"World-5___-Classical-Logic/:6","Session-5___-Classical-Logic/:7":"World-5___-Classical-Logic/:7","World-6___-From-the-Lean-Course/:24":"World-5___-Classical-Logic/:8","Session-6___-From-the-Lean-Course/:24":"World-5___-Classical-Logic/:8","World-6___-From-the-Lean-Course/:25":"World-5___-Classical-Logic/:9","Session-6___-From-the-Lean-Course/:25":"World-5___-Classical-Logic/:9","World-6___-From-the-Lean-Course/:26":"World-5___-Classical-Logic/:10","Session-6___-From-the-Lean-Course/:26":"World-5___-Classical-Logic/:10","World-6___-From-the-Lean-Course/:27":"World-5___-Classical-Logic/:11","Session-6___-From-the-Lean-Course/:27":"World-5___-Classical-Logic/:11","World-5___-Classical-Logic/:8":"World-5___-Classical-Logic/:12","Session-5___-Classical-Logic/:8":"World-5___-Classical-Logic/:12","World-7___-Equivalence-and-Truth/:0":"World-6___-Equivalence-and-Truth/:0","Session-7___-Equivalence-and-Truth/:0":"World-6___-Equivalence-and-Truth/:0","World-7___-Equivalence-and-Truth/:1":"World-6___-Equivalence-and-Truth/:1","Session-7___-Equivalence-and-Truth/:1":"World-6___-Equivalence-and-Truth/:1","World-7___-Equivalence-and-Truth/:2":"World-6___-Equivalence-and-Truth/:2","Session-7___-Equivalence-and-Truth/:2":"World-6___-Equivalence-and-Truth/:2","World-7___-Equivalence-and-Truth/:3":"World-6___-Equivalence-and-Truth/:3","Session-7___-Equivalence-and-Truth/:3":"World-6___-Equivalence-and-Truth/:3","World-7___-Equivalence-and-Truth/:4":"World-6___-Equivalence-and-Truth/:4","Session-7___-Equivalence-and-Truth/:4":"World-6___-Equivalence-and-Truth/:4","World-7___-Equivalence-and-Truth/:5":"World-6___-Equivalence-and-Truth/:5","Session-7___-Equivalence-and-Truth/:5":"World-6___-Equivalence-and-Truth/:5","World-7___-Equivalence-and-Truth/:6":"World-6___-Equivalence-and-Truth/:6","Session-7___-Equivalence-and-Truth/:6":"World-6___-Equivalence-and-Truth/:6","World-7___-Equivalence-and-Truth/:7":"World-6___-Equivalence-and-Truth/:7","Session-7___-Equivalence-and-Truth/:7":"World-6___-Equivalence-and-Truth/:7","World-7___-Equivalence-and-Truth/:8":"World-6___-Equivalence-and-Truth/:8","Session-7___-Equivalence-and-Truth/:8":"World-6___-Equivalence-and-Truth/:8","World-7___-Equivalence-and-Truth/:9":"World-6___-Equivalence-and-Truth/:9","Session-7___-Equivalence-and-Truth/:9":"World-6___-Equivalence-and-Truth/:9","World-7___-Equivalence-and-Truth/:10":"World-6___-Equivalence-and-Truth/:10","Session-7___-Equivalence-and-Truth/:10":"World-6___-Equivalence-and-Truth/:10","World-7___-Equivalence-and-Truth/:11":"World-6___-Equivalence-and-Truth/:11","Session-7___-Equivalence-and-Truth/:11":"World-6___-Equivalence-and-Truth/:11","World-7___-Equivalence-and-Truth/:12":"World-6___-Equivalence-and-Truth/:12","Session-7___-Equivalence-and-Truth/:12":"World-6___-Equivalence-and-Truth/:12","World-7___-Equivalence-and-Truth/:13":"World-6___-Equivalence-and-Truth/:13","Session-7___-Equivalence-and-Truth/:13":"World-6___-Equivalence-and-Truth/:13","World-7___-Equivalence-and-Truth/:14":"World-6___-Equivalence-and-Truth/:14","Session-7___-Equivalence-and-Truth/:14":"World-6___-Equivalence-and-Truth/:14","World-7___-Equivalence-and-Truth/:15":"World-6___-Equivalence-and-Truth/:15","Session-7___-Equivalence-and-Truth/:15":"World-6___-Equivalence-and-Truth/:15","World-7___-Equivalence-and-Truth/:16":"World-6___-Equivalence-and-Truth/:16","Session-7___-Equivalence-and-Truth/:16":"World-6___-Equivalence-and-Truth/:16","World-7___-Equivalence-and-Truth/:17":"World-6___-Equivalence-and-Truth/:17","Session-7___-Equivalence-and-Truth/:17":"World-6___-Equivalence-and-Truth/:17","World-7___-Equivalence-and-Truth/:18":"World-6___-Equivalence-and-Truth/:18","Session-7___-Equivalence-and-Truth/:18":"World-6___-Equivalence-and-Truth/:18","World-7___-Equivalence-and-Truth/:19":"World-6___-Equivalence-and-Truth/:19","Session-7___-Equivalence-and-Truth/:19":"World-6___-Equivalence-and-Truth/:19","World-7___-Equivalence-and-Truth/:20":"World-6___-Equivalence-and-Truth/:20","Session-7___-Equivalence-and-Truth/:20":"World-6___-Equivalence-and-Truth/:20","World-7___-Equivalence-and-Truth/:21":"World-6___-Equivalence-and-Truth/:21","Session-7___-Equivalence-and-Truth/:21":"World-6___-Equivalence-and-Truth/:21","World-7___-Equivalence-and-Truth/:22":"World-6___-Equivalence-and-Truth/:22","Session-7___-Equivalence-and-Truth/:22":"World-6___-Equivalence-and-Truth/:22","World-7___-Equivalence-and-Truth/:23":"World-6___-Equivalence-and-Truth/:23","Session-7___-Equivalence-and-Truth/:23":"World-6___-Equivalence-and-Truth/:23","World-8___-Quantifiers/:0":"World-7___-Quantifiers/:0","Session-8___-Quantifiers/:0":"World-7___-Quantifiers/:0","World-8___-Quantifiers/:1":"World-7___-Quantifiers/:1","Session-8___-Quantifiers/:1":"World-7___-Quantifiers/:1","World-8___-Quantifiers/:2":"World-7___-Quantifiers/:2","Session-8___-Quantifiers/:2":"World-7___-Quantifiers/:2","World-8___-Quantifiers/:3":"World-7___-Quantifiers/:3","Session-8___-Quantifiers/:3":"World-7___-Quantifiers/:3","World-8___-Quantifiers/:4":"World-7___-Quantifiers/:4","Session-8___-Quantifiers/:4":"World-7___-Quantifiers/:4","World-8___-Quantifiers/:5":"World-7___-Quantifiers/:5","Session-8___-Quantifiers/:5":"World-7___-Quantifiers/:5","World-8___-Quantifiers/:6":"World-7___-Quantifiers/:6","Session-8___-Quantifiers/:6":"World-7___-Quantifiers/:6","World-8___-Quantifiers/:7":"World-7___-Quantifiers/:7","Session-8___-Quantifiers/:7":"World-7___-Quantifiers/:7","World-8___-Quantifiers/:8":"World-7___-Quantifiers/:8","Session-8___-Quantifiers/:8":"World-7___-Quantifiers/:8","World-8___-Quantifiers/:9":"World-7___-Quantifiers/:9","Session-8___-Quantifiers/:9":"World-7___-Quantifiers/:9","World-8___-Quantifiers/:10":"World-7___-Quantifiers/:10","Session-8___-Quantifiers/:10":"World-7___-Quantifiers/:10","World-8___-Quantifiers/:11":"World-7___-Quantifiers/:11","Session-8___-Quantifiers/:11":"World-7___-Quantifiers/:11","World-8___-Quantifiers/:12":"World-7___-Quantifiers/:12","Session-8___-Quantifiers/:12":"World-7___-Quantifiers/:12","World-8___-Quantifiers/:13":"World-7___-Quantifiers/:13","Session-8___-Quantifiers/:13":"World-7___-Quantifiers/:13","World-8___-Quantifiers/:14":"World-7___-Quantifiers/:14","Session-8___-Quantifiers/:14":"World-7___-Quantifiers/:14","World-8___-Quantifiers/:15":"World-7___-Quantifiers/:15","Session-8___-Quantifiers/:15":"World-7___-Quantifiers/:15","World-8___-Quantifiers/:16":"World-7___-Quantifiers/:16","Session-8___-Quantifiers/:16":"World-7___-Quantifiers/:16","World-9___-Two-Puzzles/:0":"World-8___-Two-Puzzles/:0","Session-9___-Two-Puzzles/:0":"World-8___-Two-Puzzles/:0","World-9___-Two-Puzzles/:1":"World-8___-Two-Puzzles/:1","Session-9___-Two-Puzzles/:1":"World-8___-Two-Puzzles/:1","World-10___-Induction/:0":"World-9___-Induction/:0","Session-10___-Induction/:0":"World-9___-Induction/:0","World-10___-Induction/:1":"World-9___-Induction/:1","Session-10___-Induction/:1":"World-9___-Induction/:1","World-10___-Induction/:2":"World-9___-Induction/:2","Session-10___-Induction/:2":"World-9___-Induction/:2","World-10___-Induction/:3":"World-9___-Induction/:3","Session-10___-Induction/:3":"World-9___-Induction/:3","World-10___-Induction/:4":"World-9___-Induction/:4","Session-10___-Induction/:4":"World-9___-Induction/:4","World-10___-Induction/:5":"World-9___-Induction/:5","Session-10___-Induction/:5":"World-9___-Induction/:5"}
  const MOVED_PAGES = {"Session-1___-Conjunction":"World-1___-Conjunction","Session-2___-Implication":"World-2___-Implication","Session-3___-Disjunction":"World-3___-Disjunction","Session-4___-Falsity-and-Negation":"World-4___-Falsity-and-Negation","Session-5___-Classical-Logic":"World-5___-Classical-Logic","World-6___-From-the-Lean-Course":"World-2___-Implication","Session-6___-From-the-Lean-Course":"World-2___-Implication","World-7___-Equivalence-and-Truth":"World-6___-Equivalence-and-Truth","Session-7___-Equivalence-and-Truth":"World-6___-Equivalence-and-Truth","World-8___-Quantifiers":"World-7___-Quantifiers","Session-8___-Quantifiers":"World-7___-Quantifiers","World-9___-Two-Puzzles":"World-8___-Two-Puzzles","Session-9___-Two-Puzzles":"World-8___-Two-Puzzles","World-10___-Induction":"World-9___-Induction","Session-10___-Induction":"World-9___-Induction"}
  function moveProgress() {
    try {
      if (localStorage.getItem('ipm-verso:layout') === '2') return
      const place = /((?:Session|World)-\d+___-[^/]+)\/:(\d+)/
      const moves = []
      for (const k of Object.keys(localStorage)) {
        if (!k.startsWith('ipm-verso:')) continue
        if (k === 'ipm-verso:lemmas' || /\/:current$/.test(k)) { localStorage.removeItem(k); continue }
        const m = place.exec(k)
        const to = m && MOVED[`${m[1]}/:${m[2]}`]
        if (to) moves.push([k, k.replace(m[0], to), m[1].startsWith('World')])
      }
      // first all values, then the old keys away, then the new ones (an old place may be a new one)
      const values = moves.map(([k]) => localStorage.getItem(k))
      for (const [k] of moves) localStorage.removeItem(k)
      moves.forEach(([, k2, fromWorld], n) => { if (fromWorld || localStorage.getItem(k2) === null) localStorage.setItem(k2, values[n]) })
      const last = JSON.parse(localStorage.getItem('ipm-verso:last') ?? 'null')
      if (last?.href) {
        const m = /((?:Session|World)-\d+___-[^/]+)\//.exec(last.href)
        if (m && MOVED_PAGES[m[1]]) localStorage.setItem('ipm-verso:last', JSON.stringify({ href: last.href.replace(m[0], MOVED_PAGES[m[1]] + '/').replace(/#.*$/, ''), title: '' }))
      }
      localStorage.setItem('ipm-verso:layout', '2')
    } catch {}
  }

  function init() {
    moveProgress()
    setTimeout(worldMap)  // after translatePage, so that the names are in the language chosen
    try { const w = localStorage.getItem('ipm-verso:palette-width'); if (w) document.documentElement.style.setProperty('--ipm-palette-width', w) } catch {}
    translatePage()
    languageSwitch()
    registerLemmas()
    const tasks = [...document.querySelectorAll('.ipm-task')].map((root, i) => new Task(root, i))
    tasks.forEach((t, i) => t.root.prepend(el('div', 'ipm-task-label', tr('Level {i} of {n}', { i: i + 1, n: tasks.length }))))
    window.ipmTasks = tasks  // for the tests
    if (!tasks.length) { startButton(); return }
    const stage = el('div', 'ipm-stage')
    tasks[0].root.before(stage)
    const top = el('div', 'ipm-top'), dots = el('div', 'ipm-dots'), foot = el('div', 'ipm-foot')
    // The heading of the session moves into the top line of the stage (left; the dots right), so
    // that the page is only the header and the stage, and does not scroll.
    const h1 = stage.parentElement?.querySelector('h1')
    const title = el('div', 'ipm-stage-title', (h1?.textContent ?? '').replace('🔗', '').trim())
    if (h1) h1.hidden = true
    top.append(title, dots)
    stage.append(top, ...tasks.map(t => t.root), foot)
    document.documentElement.classList.add('ipm-playing')
    // The text before the tasks (the rules of the session) folds away above them; open at first.
    // The text before the levels (the rules of the world) is the tip of its first level. A level's
    // tip appears when it is played for the first time; it and the rules of the world are always
    // under "About this level" at the foot.
    const before = []
    for (let n = stage.previousSibling; n && !(n.nodeType === 1 && /^H\d$/.test(n.tagName)); n = n.previousSibling) before.unshift(n)
    const rules = el('div', 'ipm-rules')
    rules.append(...before)
    const hasRules = before.some(n => n.nodeType === 1)
    const tipNodes = k => [...tasks[k].root.querySelectorAll(':scope > .ipm-tip')].map(n => {
      const c = n.cloneNode(true); c.classList.remove('ipm-tip'); c.classList.add('ipm-lang'); return c
    })
    const clone = () => [...rules.childNodes].map(n => n.cloneNode(true))
    // The text of a level (shown no longer above the board, but here).
    const levelText = k => [...tasks[k].root.querySelectorAll(':scope > .ipm-lang')].map(n => n.cloneNode(true))
    // The rule blocks a tip is about, drawn as they come from ＋ (with their names).
    const tipBlocks = k => {
      const names = [...new Set([...tasks[k].root.querySelectorAll(':scope > .ipm-tip')]
        .flatMap(n => (n.dataset.rules ?? '').split(',').map(x => x.trim()).filter(x => RULES[x])))]
      if (!names.length) return []
      const row = el('div', 'ipm-tip-blocks')
      for (const name of names) {
        const fig = el('div', 'ipm-tip-block')
        fig.append(rulePicture(name), el('div', 'ipm-menu-caption', `${RULES[name].label} · ${tr(RULES[name].name)}`))
        row.append(fig)
      }
      return [row]
    }
    // "About this level": a panel above the tool bar of the current level, opened by its button.
    const about = el('div', 'ipm-about'), aboutBody = el('div', 'ipm-intro-body')
    about.append(aboutBody)
    about.hidden = true
    const aboutButtons = []
    // On a phone, About and Lean lie over the board (they scroll); a tap elsewhere closes them.
    document.addEventListener('pointerdown', ev => {
      if (!window.matchMedia('(max-width: 600px)').matches) return
      if (ev.target.closest('.ipm-about, .ipm-lean, .ipm-about-button, .ipm-lean-toggle')) return
      if (!about.hidden) toggleAbout(false)
      for (const t of tasks) if (t.lean.open) t.lean.open = false
    })
    const toggleAbout = open => {
      about.hidden = !open
      aboutButtons.forEach(b => b.setAttribute('aria-pressed', String(open)))
      tasks[current].render()
    }
    const fillAbout = () => {
      const own = [...levelText(current), ...tipBlocks(current), ...tipNodes(current)]
      aboutBody.replaceChildren(...own, ...(hasRules ? [el('div', 'ipm-rules-head', tr('This world')), ...clone()] : []))
    }
    // The tip of a level, once: in a box over the stage, closed with "Got it".
    const seenKey = k => `${tasks[k].key}:tip`
    const showTip = k => {
      if (tasks[k].root.inert) return
      const tip = [...tipBlocks(k), ...tipNodes(k), ...(k === 0 && hasRules ? clone() : [])]
      const nodes = tip.length ? [...levelText(k), ...tip] : []
      let seen = false
      try { seen = localStorage.getItem(seenKey(k)) === '1' } catch {}
      if (!nodes.length || seen || document.querySelector('.ipm-tip-overlay')) return
      const overlay = el('div', 'ipm-tip-overlay'), card = el('div', 'ipm-tip-card'), ok = el('button', 'ipm-tip-ok', tr('Got it'))
      ok.type = 'button'
      const close = () => { try { localStorage.setItem(seenKey(k), '1') } catch {}; overlay.remove() }
      ok.addEventListener('click', close)
      overlay.addEventListener('click', ev => { if (ev.target === overlay) close() })
      card.append(el('div', 'ipm-tip-head', '💡 ' + tr('Tip')), ...nodes, ok)
      overlay.append(card)
      document.body.append(overlay)
      ok.focus({ preventScroll: true })  // a long tip starts at its top, with the blocks
      card.scrollTop = 0
    }
    let current = 0
    const key = `ipm-verso:${location.pathname}:current`
    const show = i => {
      current = Math.max(0, Math.min(tasks.length - 1, i))
      tasks.forEach((t, k) => t.root.classList.toggle('ipm-current', k === current))
      refreshDots()
      // (with the path: the page has a <base>, against which a bare #level-3 would point elsewhere)
      history.replaceState(null, '', `${location.pathname}${location.search}#level-${current + 1}`)
      try {
        localStorage.setItem(key, String(current))
        // For "Continue" on the start page.
        localStorage.setItem('ipm-verso:last', JSON.stringify({ href: location.pathname + location.hash, title: document.title }))
      } catch {}
      tasks[current].render()  // its board now has its size
      fillAbout()
      // the panel moves to the level shown, above its tool bar
      const bar = tasks[current].root.querySelector('.ipm-tools')
      bar?.before(about)
      tasks[current].render()
      showTip(current)
    }
    const refreshDots = () => {
      dots.replaceChildren(...tasks.map((t, k) => {
        const d = el('button', 'ipm-dot' + (t.root.classList.contains('ipm-solved') ? ' ipm-dot-solved' : '') +
          (t.root.classList.contains('ipm-locked') ? ' ipm-dot-locked' : '') + (k === current ? ' ipm-dot-current' : ''))
        d.type = 'button'
        d.title = tr('Level {i} of {n}', { i: k + 1, n: tasks.length })
        d.addEventListener('click', () => show(k))
        return d
      }))
      // The dot of the next task glows once this one is solved.
      dots.children[current + 1]?.classList.toggle('ipm-dot-next', tasks[current].root.classList.contains('ipm-solved'))
    }
    // ← and → go to the previous and next task (not while typing, or with a menu open).
    document.addEventListener('keydown', ev => {
      if (ev.target.closest?.('input, textarea') || ev.altKey || ev.ctrlKey || ev.metaKey) return
      if (ev.key === 'ArrowLeft') show(current - 1)
      if (ev.key === 'ArrowRight') show(current + 1)
    })
    // On the right of each tool bar: "About this level" and "Next ›" (which glows once the level is solved).
    tasks.forEach((t, k) => {
      const bar = t.root.querySelector('.ipm-tools')
      const a = barButton('ipm-about-button', 'ⓘ', tr('About this level'), tr('About'))
      a.setAttribute('aria-pressed', 'false')
      a.addEventListener('click', () => toggleAbout(about.hidden))
      aboutButtons.push(a)
      const b = barButton('ipm-next', '›', tr('Next ›'), tr('Next'))
      b.disabled = k === tasks.length - 1
      b.addEventListener('click', () => show(k + 1))
      bar?.append(a, b)
    })
    const update = () => {
      const open = tasks.findIndex(t => !t.root.classList.contains('ipm-solved'))
      tasks.forEach((t, i) => {
        const locked = SETTINGS.inOrder && open >= 0 && i > open
        if (t.root.classList.contains('ipm-locked') === locked && t.drawn) return
        t.root.classList.toggle('ipm-locked', locked)
        t.root.inert = locked
        t.drawn = true
        t.render()  // the board's size depends on it
      })
      refreshDots()
    }
    tasks.forEach(t => {
      t.onSolved = () => {
        if (t.reported) return
        t.reported = true
        setTimeout(update, 300)
      }
      if (t.root.classList.contains('ipm-solved')) t.reported = true
    })
    update()
    window.addEventListener('ipm-settings', update)
    // Which task: from the address, or the one played last, or the first one not solved.
    const fromHash = () => Number(/^#(?:level|task)-(\d+)$/.exec(location.hash)?.[1] ?? 0) - 1  // #task-3: the old form
    let start = fromHash()
    if (start < 0) { try { start = Number(localStorage.getItem(key) ?? -1) } catch { start = -1 } }
    if (start < 0) start = Math.max(0, tasks.findIndex(t => !t.root.classList.contains('ipm-solved')))
    show(start)
    window.addEventListener('hashchange', () => { if (fromHash() >= 0 && fromHash() !== current) show(fromHash()) })
    let resizing
    // The Lean proof, opened or closed, changes the room for the board.
    tasks.forEach(t => t.lean.addEventListener('toggle', () => t.render()))
    // The stage fills the screen below the header: its height is measured, also when the window
    // changes.
    const fit = () => {
      window.scrollTo(0, 0)
      stage.style.height = `${Math.max(320, window.innerHeight - stage.getBoundingClientRect().top - 10)}px`
      tasks[current].render()
    }
    fit()
    window.addEventListener('resize', () => { clearTimeout(resizing); resizing = setTimeout(fit, 120) })
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()
