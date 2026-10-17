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
    '∧-introduction': '∧-Einführung', '∧-elimination': '∧-Beseitigung',
    '→-introduction': '→-Einführung', '→-elimination': '→-Beseitigung',
    '∨-introduction (left)': '∨-Einführung (links)', '∨-introduction (right)': '∨-Einführung (rechts)',
    '∨-elimination': '∨-Beseitigung', '⊥-elimination': '⊥-Beseitigung',
    'tertium non datur': 'Tertium non datur',
    '↔-introduction': '↔-Einführung', '↔-elimination (forwards)': '↔-Beseitigung (vorwärts)',
    '↔-elimination (backwards)': '↔-Beseitigung (rückwärts)', '⊤-introduction': '⊤-Einführung',
    '＋ Add a block': '＋ Baustein hinzufügen', 'Add a block': 'Baustein hinzufügen', 'Rules': 'Regeln', 'Close': 'Schließen',
    '↶ Undo': '↶ Zurück', 'Start over': 'Neu anfangen', 'Tidy up': 'Aufräumen',
    'Arrange the blocks automatically again': 'Die Blöcke wieder automatisch anordnen',
    'Smaller': 'Kleiner', 'Larger': 'Größer', 'Fit to the page': 'An die Seite anpassen',
    'The proof in Lean': 'Der Beweis in Lean', 'Try it in Lean ↗': 'In Lean ausprobieren ↗',
    'Proof complete ✓': 'Beweis fertig ✓',
    'Now tap a glowing green dot, or add a block with ＋': 'Jetzt einen grün leuchtenden Punkt antippen oder mit ＋ einen Baustein hinzufügen',
    'Now tap a glowing green circle, or add a block with ＋': 'Jetzt einen grün leuchtenden Kreis antippen oder mit ＋ einen Baustein hinzufügen',
    '1 red circle left — tap one': 'Noch 1 roter Kreis — tippe ihn an',
    '{n} red circles left — tap one': 'Noch {n} rote Kreise — tippe einen an',
    'Lemmas from solved tasks': 'Hilfssätze aus gelösten Aufgaben',
    'That would go round in a circle.': 'Das wäre ein Kreisschluss.',
    'Prove {x}': 'Beweise {x}', 'Disconnect': 'Verbindung lösen', 'This input is connected already.': 'Dieser Eingang ist schon verbunden.',
    'Remove this block': 'Diesen Block entfernen', 'Remove this connection': 'Diese Verbindung entfernen',
    '⚠ A local hypothesis escapes its box': '⚠ Eine lokale Annahme verlässt ihren Kasten',
    'What is derived from a local hypothesis (of an →I or ∨E block) may only be used to prove the input of that block it belongs to. This line leads, via {x}, to a goal outside.':
      'Was aus einer lokalen Annahme (eines →I- oder ∨E-Blocks) folgt, darf nur für den Eingang des Blocks verwendet werden, zu dem sie gehört. Diese Linie führt über {x} zu einem Ziel außerhalb.',
    '☠ {x} does not fit {y}': '☠ {x} passt nicht zu {y}',
    'Cancel': 'Abbrechen', 'more ▸': 'mehr ▸', 'less ▾': 'weniger ▾', '1 rule ▸': '1 Regel ▸', '{n} rules ▸': '{n} Regeln ▸',
    '{name} block': '{name}-Block', 'Allow tactics': 'Taktiken erlauben',
    'Show the Lean command that fits a tapped circle or dot': 'Zu einem angetippten Kreis oder Punkt den passenden Lean-Befehl zeigen', 'Task {i} of {n}': 'Aufgabe {i} von {n}',
  }
  // Headings of the site, which come from Verso.
  const DE_TITLES = {
    'The Incredible Proof Machine in Lean': 'Die Incredible Proof Machine in Lean',
    'Session 1: Conjunction': 'Sitzung 1: Konjunktion', 'Session 2: Implication': 'Sitzung 2: Implikation',
    'Session 3: Disjunction': 'Sitzung 3: Disjunktion', 'Session 4: Falsity and Negation': 'Sitzung 4: Falsum und Negation',
    'Session 5: Classical Logic': 'Sitzung 5: Klassische Logik', 'Session 6: From the Lean Course': 'Sitzung 6: Aus dem Lean-Kurs', 'Session 7: Equivalence and Truth': 'Sitzung 7: Äquivalenz und Wahrheit', 'Table of Contents': 'Inhalt', 'Contents': 'Inhalt',
  }
  function translatePage() {
    if (LANG !== 'de') return
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    for (let n = walk.nextNode(); n; n = walk.nextNode())
      for (const [en, de] of Object.entries(DE_TITLES)) if (n.nodeValue.includes(en)) n.nodeValue = n.nodeValue.replace(en, de)
    for (const [en, de] of Object.entries(DE_TITLES)) document.title = document.title.replace(en, de)
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
    header.append(box)
  }
  // Tactics: buttons beside a selected port with the Lean command that fits (intro h, constructor, …).
  // The game does not need them; they are off unless switched on (for all tasks, kept in the browser).
  let TACTICS = false
  try { TACTICS = localStorage.getItem('ipm-verso:tactics') === 'on' } catch {}

  const tr = (en, vars = {}) => (LANG === 'de' ? DE[en] ?? en : en).replace(/\{(\w+)\}/g, (_, k) => vars[k])

  // ---------------------------------------------------------------- formulas

  // Formulas: {t: 'atom', n} | {t: 'and'|'or'|'imp'|'iff', a, b} | {t: 'not', a} | {t: 'bot'} | {t: 'top'} | {t: 'meta', id}
  function parse(src) {
    const tokens = src.match(/[A-Za-z][\w']*|∧|∨|↔|→|¬|⊥|⊤|\(|\)|<->|->|\/\\|\\\/|~/g) ?? []
    let i = 0
    const eat = t => { if (tokens[i] === t) { i++; return true } return false }
    const norm = { '/\\': '∧', '\\/': '∨', '->': '→', '<->': '↔', '~': '¬' }
    tokens.forEach((t, k) => { tokens[k] = norm[t] ?? t })
    // As in Lean, →, ∨ and ∧ are right-associative (the Incredible Proof Machine reads ∧ and ∨
    // to the left), and ∧ binds more strongly than ∨, which binds more strongly than →, then ↔.
    const iff = () => { const a = imp(); return eat('↔') ? { t: 'iff', a, b: imp() } : a }
    const imp = () => { const a = or(); return eat('→') ? { t: 'imp', a, b: imp() } : a }
    const or = () => { const a = and(); return eat('∨') ? { t: 'or', a, b: or() } : a }
    const and = () => { const a = un(); return eat('∧') ? { t: 'and', a, b: and() } : a }
    const un = () => {
      if (eat('¬')) return { t: 'not', a: un() }
      if (eat('⊥')) return { t: 'bot' }
      if (eat('⊤')) return { t: 'top' }
      if (eat('(')) { const a = iff(); eat(')'); return a }
      const n = tokens[i++]
      if (!n) throw new Error(`Cannot parse ${src}`)
      if (n === 'True') return { t: 'top' }
      if (n === 'False') return { t: 'bot' }
      return { t: 'atom', n }
    }
    const f = iff()
    if (i < tokens.length) throw new Error(`Cannot parse ${src}`)
    return f
  }

  const prec = { iff: 0, imp: 1, or: 2, and: 3, not: 4 }
  function show(f, s = {}, ctx = 0) {
    f = resolve(f, s)
    const wrap = (p, txt) => (p < ctx ? `(${txt})` : txt)
    switch (f.t) {
      case 'atom': return f.n
      case 'bot': return '⊥'
      case 'top': return '⊤'
      case 'meta': return '?' + metaNumber(f.id.split('.').pop())
      case 'not': return wrap(4, '¬' + show(f.a, s, 4))
      case 'and': return wrap(3, `${show(f.a, s, 4)} ∧ ${show(f.b, s, 3)}`)
      case 'or': return wrap(2, `${show(f.a, s, 3)} ∨ ${show(f.b, s, 2)}`)
      case 'imp': return wrap(1, `${show(f.a, s, 2)} → ${show(f.b, s, 1)}`)
      // Implications beside ↔ get brackets, though Lean does not need them: easier to read.
      case 'iff': return wrap(1, `${show(f.a, s, 2)} ↔ ${show(f.b, s, 2)}`)
    }
  }

  // Rule variables A, B, C, … are shown as ?1, ?2, ?3, … while undetermined.
  const metaNumber = v => (/^[A-Z]$/.test(v) ? v.charCodeAt(0) - 64 : v)

  function resolve(f, s) {
    while (f.t === 'meta' && s[f.id]) f = s[f.id]
    return f
  }

  const occurs = (id, f, s) => {
    f = resolve(f, s)
    if (f.t === 'meta') return f.id === id
    return ['a', 'b'].some(k => f[k] && occurs(id, f[k], s))
  }

  // Unifies `x` and `y` under substitution `s`; returns the extended substitution or null.
  function unify(x, y, s) {
    x = resolve(x, s); y = resolve(y, s)
    if (x.t === 'meta' && y.t === 'meta' && x.id === y.id) return s
    if (x.t === 'meta') return occurs(x.id, y, s) ? null : { ...s, [x.id]: y }
    if (y.t === 'meta') return unify(y, x, s)
    if (x.t !== y.t) return null
    if (x.t === 'atom') return x.n === y.n ? s : null
    if (x.t === 'bot' || x.t === 'top') return s
    if (x.t === 'not') return unify(x.a, y.a, s)
    const s1 = unify(x.a, y.a, s)
    return s1 && unify(x.b, y.b, s1)
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
    iffI: { label: '↔I', name: '↔-introduction', vars: ['A', 'B'], inputs: ['A→B', 'B→A'], outputs: ['A↔B'] },
    iffE1: { label: '↔E₁', name: '↔-elimination (forwards)', vars: ['A', 'B'], inputs: ['A↔B', 'A'], outputs: ['B'] },
    iffE2: { label: '↔E₂', name: '↔-elimination (backwards)', vars: ['A', 'B'], inputs: ['A↔B', 'B'], outputs: ['A'] },
    trueI: { label: '⊤I', name: '⊤-introduction', vars: [], inputs: [], outputs: ['⊤'] },
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
      const r = RULES[name], id = `b${this.next}`
      return this.addBlock({
        kind: 'rule', rule: name,
        inputs: r.inputs.map(p => instantiate(parse(p), r.vars, id)),
        outputs: r.outputs.map(p => instantiate(parse(p), r.vars, id)),
      })
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
      let s = {}
      const status = {}
      for (const c of this.connections) {
        const out = this.block(c.from.block).outputs[c.from.port]
        const inp = this.block(c.to.block).inputs[c.to.port]
        const s1 = unify(out, inp, s)
        if (s1) { s = s1; status[c.id] = 'ok' } else status[c.id] = 'fail'
      }
      const openInputs = []
      for (const b of this.blocks)
        b.inputs.forEach((_, i) => {
          if (!this.connections.some(c => c.to.block === b.id && c.to.port === i && status[c.id] === 'ok'))
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
      const failed = this.connections.some(c => status[c.id] !== 'ok')
      const goalsDone = this.blocks.filter(b => b.kind === 'conclusion')
        .every(b => !openInputs.some(o => o.block === b.id))
      return { s, status, openInputs, scopes, qed: !failed && openInputs.length === 0 && goalsDone }
    }
  }

  // ---------------------------------------------------------------- the proof in Lean

  // The proof graph read as a Lean proof term, one `example` per goal. Assumptions are named
  // h₁, h₂, …, local hypotheses x, y, z, …; an input that is not (correctly) connected yet is `sorry`.
  // A part of the graph that is used twice appears twice in the term.
  const sub = n => String(n).replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[d])
  const localName = k => (k < 3 ? 'xyz'[k] : 'x' + sub(k - 2))

  // Returns the parts of the proof, one per goal, and the lemmas it uses.
  function leanParts(proof, analysis) {
    const p = proof, s = analysis.s, uses = new Set()
    const assumptions = p.blocks.filter(b => b.kind === 'assumption')
    const names = {}, locals = {}
    const lean = f => show(f, s).replace(/⊥/g, 'False').replace(/⊤/g, 'True')
    const hyp = (b, j) => (locals[`${b.id}.${j}`] ??= localName(Object.keys(locals).length))
    const app = (f, ...args) => args.reduce((t, a) => ({ k: 'app', f: t, a }), { k: 'var', n: f })
    assumptions.forEach((b, k) => { names[b.id] = 'h' + sub(k + 1) })
    // Terms: {k: 'var', n} | {k: 'sorry'} | {k: 'app', f, a} | {k: 'fun', x, body} | {k: 'pair', a, b} | {k: 'proj', a, i}
    const input = (b, i, depth) => {
      const c = p.connections.find(c => c.to.block === b.id && c.to.port === i && analysis.status[c.id] !== 'fail')
      return c && depth < 60 ? output(p.block(c.from.block), c.from.port, depth + 1) : { k: 'sorry' }
    }
    const output = (b, j, depth) => {
      if (b.kind === 'assumption') return { k: 'var', n: names[b.id] }
      if (isLocal(b, j)) return { k: 'var', n: hyp(b, j) }
      const arg = i => input(b, i, depth)
      switch (b.rule) {
        case 'conjI': return { k: 'pair', a: arg(0), b: arg(1) }
        case 'conjE': return { k: 'proj', a: arg(0), i: j + 1 }
        case 'impE': return { k: 'app', f: arg(0), a: arg(1) }
        case 'impI': { const x = hyp(b, 1); return { k: 'fun', x, body: arg(0) } }
        case 'disjI1': return app('Or.inl', arg(0))
        case 'disjI2': return app('Or.inr', arg(0))
        case 'disjE': {
          const h = arg(0), x = hyp(b, 1), y = hyp(b, 2)
          return app('Or.elim', h, { k: 'fun', x, body: arg(1) }, { k: 'fun', x: y, body: arg(2) })
        }
        case 'falseE': return app('False.elim', arg(0))
        case 'TND': return app('Classical.em', { k: 'var', n: '_' })
        case 'iffI': return app('Iff.intro', arg(0), arg(1))
        case 'iffE1': return app('Iff.mp', arg(0), arg(1))
        case 'iffE2': return app('Iff.mpr', arg(0), arg(1))
        case 'trueI': return { k: 'var', n: 'trivial' }
      }
      const L = RULES[b.rule]?.lemma
      if (L) {
        uses.add(L.key)
        return app(L.leanNames[j], ...b.inputs.map((_, i) => arg(i)))
      }
      return { k: 'sorry' }
    }
    // Printing, with as few parentheses as Lean needs.
    const atomic = t => ['var', 'sorry', 'pair', 'proj'].includes(t.k)
    // In a complete proof, unused names are written `_`, as Lean asks for.
    const used = new Set()
    const use = t => { if (t.k === 'var') used.add(t.n); for (const k of ['f', 'a', 'b', 'body']) if (t[k]) use(t[k]) }
    const named = n => !analysis.qed || used.has(n)
    const pr = t => {
      switch (t.k) {
        case 'var': return t.n
        case 'sorry': return 'sorry'
        case 'pair': return `⟨${pr(t.a)}, ${pr(t.b)}⟩`
        case 'proj': return `${atomic(t.a) ? pr(t.a) : `(${pr(t.a)})`}.${t.i}`
        case 'app': return `${t.f.k === 'fun' ? `(${pr(t.f)})` : pr(t.f)} ${atomic(t.a) ? pr(t.a) : `(${pr(t.a)})`}`
        case 'fun': {  // fun x => fun y => … is written fun x y => …
          const xs = []
          for (; t.k === 'fun'; t = t.body) xs.push(named(t.x) ? t.x : '_')
          return `fun ${xs.join(' ')} => ${pr(t)}`
        }
      }
    }
    const atoms = new Set()
    const collect = f => { if (f.t === 'atom') atoms.add(f.n); if (f.a) collect(f.a); if (f.b) collect(f.b) }
    for (const b of p.blocks) if (b.kind !== 'rule') [...b.inputs, ...b.outputs].forEach(collect)
    const goals = p.blocks.filter(b => b.kind === 'conclusion').map(g => ({ g, term: input(g, 0, 0) }))
    return {
      uses: [...uses],
      goals: goals.map(({ g, term }) => {
        used.clear()
        use(term)
        return {
          atoms: [...atoms].sort(),
          hyps: assumptions.map(b => `(${named(names[b.id]) ? names[b.id] : '_'} : ${lean(b.outputs[0])})`),
          goal: lean(g.inputs[0]),
          term: pr(term),
        }
      }),
    }
  }

  // The proof as Lean code: the lemmas it uses (and the ones they use), then one `example` per goal.
  function leanProof(proof, analysis) {
    const { uses, goals } = leanParts(proof, analysis)
    const examples = goals.map(g =>
      ['example', g.atoms.length ? `(${g.atoms.join(' ')} : Prop)` : '', ...g.hyps, `: ${g.goal} :=\n  ${g.term}`].filter(x => x).join(' '))
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
    for (const [key, L] of Object.entries(loadLemmas())) {
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
    const w = Math.max(56, width(top) + 12, width(bottom) + 12)
    const centres = keys => {
      const o = {}, left = {}, right = {}
      let x = (w - width(keys)) / 2
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
  function drawBlock(b, q, s, extraClass = '', portClass = () => '') {
    const g = svg('g', { class: `ipm-block ipm-${b.kind} ${extraClass}` })
    g.append(svg('rect', { x: q.x, y: q.y, width: q.w, height: q.h, rx: 8 }))
    if (b.kind === 'rule') {
      // A lemma's block carries its name in the corner.
      if (RULES[b.rule]?.lemma) g.append(svg('text', { x: q.x + 5, y: q.y + q.h - 5, class: 'ipm-lemma-tag' }, RULES[b.rule].label))
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
      })
    return g
  }

  // A rule as a small picture: exactly the block that gets added to the board.
  function rulePicture(name) {
    const r = RULES[name]
    const b = { kind: 'rule', rule: name,
      inputs: r.inputs.map(x => instantiate(parse(x), r.vars, 'rule')),
      outputs: r.outputs.map(x => instantiate(parse(x), r.vars, 'rule')) }
    const size = blockSize(b, {})
    const q = { x: 18, y: 18, ...size }
    const pic = svg('svg', { viewBox: `0 0 ${size.w + 36} ${size.h + 36}`, class: 'ipm-rule-picture',
      width: size.w + 36, height: size.h + 36 })
    pic.append(drawBlock(b, q, {}, '', kind => (kind === 'in' ? 'ipm-open' : '')))
    return pic
  }

  class Task {
    constructor(root, index) {
      this.root = root
      this.key = `ipm-verso:${location.pathname}:${index}`
      this.index = index
      this.assumptions = JSON.parse(root.dataset.assumptions)
      this.conclusions = JSON.parse(root.dataset.conclusions)
      this.rules = JSON.parse(root.dataset.rules)
      this.proof = new Proof(this.assumptions, this.conclusions)
      this.undoStack = []
      try {
        const saved = JSON.parse(localStorage.getItem(this.key))
        if (saved?.proof) this.proof.restore(saved.proof)
      } catch {}

      this.canvas = el('div', 'ipm-canvas')
      this.status = el('div', 'ipm-status')
      const tools = el('div', 'ipm-tools')
      const undo = el('button', 'ipm-button', tr('↶ Undo'))
      undo.type = 'button'
      undo.addEventListener('click', () => this.undo())
      const reset = el('button', 'ipm-button', tr('Start over'))
      reset.type = 'button'
      reset.addEventListener('click', () => { this.change(() => { this.proof = new Proof(this.assumptions, this.conclusions) }) })
      const tidy = el('button', 'ipm-button', tr('Tidy up'))
      tidy.type = 'button'
      tidy.title = tr('Arrange the blocks automatically again')
      tidy.addEventListener('click', () => { this.change(() => { this.proof.moved = {} }) })
      // Zoom: the picture is drawn at `zoom` times the size that fits the page.
      this.zoom = 1
      const zoomButton = (label, title, f) => {
        const z = el('button', 'ipm-button ipm-zoom', label)
        z.type = 'button'
        z.title = title
        z.addEventListener('click', () => { this.zoom = f(this.zoom); this.render() })
        return z
      }
      // The switch for tactics; it holds for all tasks.
      const tactics = el('label', 'ipm-tactics')
      tactics.title = tr('Show the Lean command that fits a tapped circle or dot')
      this.tacticsBox = el('input')
      this.tacticsBox.type = 'checkbox'
      this.tacticsBox.checked = TACTICS
      this.tacticsBox.addEventListener('change', () => {
        TACTICS = this.tacticsBox.checked
        try { localStorage.setItem('ipm-verso:tactics', TACTICS ? 'on' : 'off') } catch {}
        window.dispatchEvent(new Event('ipm-tactics'))
      })
      window.addEventListener('ipm-tactics', () => { this.tacticsBox.checked = TACTICS; this.render() })
      tactics.append(this.tacticsBox, el('span', '', tr('Allow tactics')))
      tools.append(undo, reset, tidy,
        zoomButton('−', tr('Smaller'), z => Math.max(0.4, z / 1.25)),
        zoomButton('+', tr('Larger'), z => Math.min(4, z * 1.25)),
        zoomButton('Fit', tr('Fit to the page'), () => 1),
        tactics, this.status)
      this.sheet = el('div', 'ipm-sheet')
      this.sheet.hidden = true
      // The trash can appears while a rule block is dragged; dropping the block on it removes it.
      this.trash = el('div', 'ipm-trash', '🗑')
      this.trash.setAttribute('aria-hidden', 'true')
      // Adding a block: the button ＋ below the picture opens a popover with all blocks, the rules
      // and the lemmas. Taking one (a tap, or dragging it onto the board) closes the popover again.
      this.menu = el('div', 'ipm-menu')
      this.addButton = el('button', 'ipm-add', tr('＋ Add a block'))
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
      this.lemmaBox = el('div', 'ipm-pop-section')
      this.lemmaList = el('div', 'ipm-pop-list')
      this.lemmaBox.append(el('div', 'ipm-pop-subtitle', tr('Lemmas from solved tasks')), this.lemmaList)
      this.popover.append(head, el('div', 'ipm-pop-subtitle', tr('Rules')), ruleList, this.lemmaBox)
      this.menu.append(this.popover, this.addButton)
      // A tap elsewhere, or Escape, closes the popover.
      document.addEventListener('pointerdown', ev => {
        if (!this.popover.hidden && !this.menu.contains(ev.target)) this.closePopover()
      })
      document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !this.popover.hidden) this.closePopover() })
      // The same proof in Lean, updated with every change.
      this.lean = el('details', 'ipm-lean')
      this.lean.open = true
      this.leanCode = el('pre', 'ipm-lean-code')
      this.leanLink = el('a', 'ipm-lean-link', tr('Try it in Lean ↗'))
      this.leanLink.target = '_blank'
      this.leanLink.rel = 'noopener'
      this.lean.append(el('summary', '', tr('The proof in Lean')), this.leanCode, this.leanLink)
      this.refreshLemmas()
      window.addEventListener('ipm-lemmas', () => this.refreshLemmas())
      root.querySelector('.ipm-board').append(this.canvas, this.menu, tools, this.sheet, this.lean, this.trash)
      this.render()
    }

    // An entry of the popover: tapping it adds the block, dragging puts it where it is dropped.
    menuItem(name, picture, caption, title, act) {
      const b = el('button', 'ipm-menu-item')
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
      let width = Math.max(320, board.w)
      const sizes = {}
      for (const b of p.blocks) sizes[b.id] = blockSize(b, s)
      for (const row of Object.values(rows)) width = Math.max(width, row.reduce((w, b) => w + sizes[b.id].w + 24, 24))
      for (const [l, row] of Object.entries(rows)) {
        const total = row.reduce((w, b) => w + sizes[b.id].w, 0) + 24 * (row.length - 1)
        let x = (width - total) / 2
        for (const b of row) {
          pos[b.id] = { x, y: 20 + Number(l) * layerH, ...sizes[b.id] }
          x += sizes[b.id].w + 24
        }
      }
      for (const [id, m] of Object.entries(p.moved ?? {})) if (pos[id]) Object.assign(pos[id], m)
      // The picture covers all blocks, wherever they were dragged.
      const qs = Object.values(pos)
      const minX = Math.min(0, ...qs.map(q => q.x - 20)), minY = Math.min(0, ...qs.map(q => q.y - 20))
      const maxX = Math.max(width, ...qs.map(q => q.x + q.w + 20))
      const maxY = Math.max(20 + (Math.max(...Object.keys(rows).map(Number)) + 1) * layerH, board.h,
        ...qs.map(q => q.y + q.h + 20))
      return { pos, view: [minX, minY, maxX - minX, maxY - minY] }
    }

    portXY(pos, b, kind, i) { return portAt(pos[b.id], b, kind, i) }

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
          this.proof.moved = { ...(this.proof.moved ?? {}), [nb.id]: { x: at.x - size.w / 2, y: at.y - size.h / 2 } }
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
          this.proof.moved = { ...(this.proof.moved ?? {}), [b.id]: { x: q.x + d.x, y: q.y + d.y } }
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
      // Scale: the natural picture fits the board's width, times the zoom. The
      // picture then covers the whole board, so that blocks can be put anywhere on it.
      const natural = this.layout().view
      const cw = this.canvas.clientWidth || natural[2]
      const ch = parseFloat(getComputedStyle(this.canvas).minHeight) || 0
      // On a large board the picture is drawn larger (up to 1.4 times), so that it is easy to read.
      const scale = Math.min(cw > 700 ? 1.4 : 1, cw / natural[2]) * this.zoom
      const { pos, view } = this.layout({ w: cw / scale - 2, h: ch / scale - 2 })
      const s = this.analysis.s
      const root = svg('svg', { viewBox: view.join(' '), class: 'ipm-svg' })
      // Natural size: the picture's own units, at most the width of the page.
      root.style.width = `${Math.round(view[2] * scale)}px`
      root.style.maxWidth = 'none'
      // Only a zoomed-in picture scrolls (and is clipped); otherwise blocks may be dragged past the edge.
      this.canvas.style.overflow = this.zoom > 1 ? 'auto' : 'visible'
      this.svgRoot = root
      const paths = []  // connection paths, to follow a dragged block
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
        if (this.selectedConn === c.id) {
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
        if (st === 'fail') {
          const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
          const skull = svg('text', { x: m.x, y: m.y + 7, class: 'ipm-skull', 'text-anchor': 'middle' }, '☠')
          skull.addEventListener('click', () => this.explain(c))
          g.append(skull)
        }
        if (st === 'escape') {
          const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
          const warn = svg('text', { x: m.x, y: m.y + 7, class: 'ipm-skull', 'text-anchor': 'middle' }, '⚠')
          warn.addEventListener('click', () => this.explainEscape(c))
          g.append(warn)
        }
        root.append(g)
      }
      // blocks
      const sel = this.selected
      for (const b of p.blocks) {
        const proved = b.kind === 'conclusion' && !this.analysis.openInputs.some(o => o.block === b.id)
        const portClass = (kind, i) => {
          const at = { block: b.id, port: i }
          if (kind === 'in') {
            const open = this.analysis.openInputs.some(o => o.block === b.id && o.port === i)
            return (open ? 'ipm-open ' : '') +
              (sel?.kind === 'in' && sel.block === b.id && sel.port === i ? 'ipm-selected ' : '') +
              (sel?.kind === 'out' && open && this.fits(sel, at) ? 'ipm-candidate' : '')
          }
          return (sel?.kind === 'out' && sel.block === b.id && sel.port === i ? 'ipm-selected ' : '') +
            (sel?.kind === 'in' && this.fits(at, sel) ? 'ipm-candidate' : '')
        }
        const g = drawBlock(b, pos[b.id], s, proved ? 'ipm-proved' : '', portClass)
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
      this.status.textContent = tr(qed ? 'Proof complete ✓' :
        this.selected?.kind === 'in' ? 'Now tap a glowing green dot, or add a block with ＋' :
        this.selected?.kind === 'out' ? 'Now tap a glowing green circle, or add a block with ＋' :
        n === 1 ? '1 red circle left — tap one' : '{n} red circles left — tap one', { n })
      try { localStorage.setItem(this.key, JSON.stringify({ proof: this.proof.snapshot(), solved: qed })) } catch {}
      if (qed) { this.saveLemma(); this.onSolved?.() }
    }

    // ------------------------------------------------------------ lemmas

    // Keeps this solved task as a lemma, with the Lean theorem of its proof.
    saveLemma() {
      const { uses, goals } = leanParts(this.proof, this.analysis)
      if (uses.some(k => dependsOn(k, this.key))) return  // no lemma may be proved by itself
      const session = Number(/Session-(\d+)/.exec(location.pathname)?.[1] ?? 0)
      const n = this.index + 1, base = `lemma_${session}_${n}`
      const leanNames = goals.map((_, j) => (goals.length > 1 ? `${base}_${j + 1}` : base))
      const norm = x => show(parse(x))
      const L = {
        label: `L${session}.${n}`, session, task: n,
        statement: [this.assumptions.map(norm).join(', '), '⊢', this.conclusions.map(norm).join(', ')].filter(x => x).join(' '),
        atoms: goals[0]?.atoms ?? [], assumptions: this.assumptions, conclusions: this.conclusions, leanNames, uses,
        theorems: goals.map((g, j) =>
          ['theorem', leanNames[j], g.atoms.length ? `{${g.atoms.join(' ')} : Prop}` : '', ...g.hyps, `: ${g.goal} :=\n  ${g.term}`].filter(x => x).join(' ')),
      }
      const all = loadLemmas()
      const old = all[this.key]
      if (old && JSON.stringify({ ...old, key: undefined }) === JSON.stringify(L)) return
      all[this.key] = L
      try { localStorage.setItem(LEMMAS, JSON.stringify(all)) } catch {}
      registerLemmas()
      window.dispatchEvent(new Event('ipm-lemmas'))
    }

    // The lemmas this task may use: the other solved tasks, except trivial ones and those that use
    // this task; the same statement only once.
    refreshLemmas() {
      const seen = new Set()
      const lemmas = Object.values(RULES).filter(r => r.lemma).map(r => r.lemma)
        .filter(L => L.key !== this.key && !dependsOn(L.key, this.key))
        .filter(L => { const as = L.assumptions.map(x => show(parse(x))); return !L.conclusions.every(c => as.includes(show(parse(c)))) })
        .sort((a, b) => a.session - b.session || a.task - b.task)
        .filter(L => !seen.has(L.statement) && seen.add(L.statement))
      this.lemmaBox.hidden = lemmas.length === 0
      this.lemmaList.replaceChildren(...lemmas.map(L => {
        const name = 'lemma:' + L.key
        const act = () => { this.undoStack.push(this.proof.snapshot()); this.proof.addRule(name); this.hideSheet(); this.render() }
        const item = this.menuItem(name, rulePicture(name), `${L.label}: ${L.statement}`, RULES[name].name, act)
        item.classList.add('ipm-lemma-item')
        return item
      }))
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
    // ------------------------------------------------------------ steps

    // The steps for the selected port, by the shape of its statement, as in Lean: for a goal `A → B`
    // the →I block (`intro`), for an assumption `A ∧ B` the ∧E block (`obtain`), and so on.
    steps() {
      const sel = this.selected
      if (!sel || !TACTICS) return []
      const b = this.proof.block(sel.block)
      const f = resolve(sel.kind === 'in' ? b.inputs[sel.port] : b.outputs[sel.port], this.analysis.s)
      // The Lean command, with the name of the assumption as in the Lean proof (h₁, h₂, …), or `h`.
      const assumptions = this.proof.blocks.filter(x => x.kind === 'assumption')
      const h = b.kind === 'assumption' ? 'h' + sub(assumptions.indexOf(b) + 1) : 'h'
      const goal = { imp: [['impI', 'intro h']], and: [['conjI', 'constructor']], iff: [['iffI', 'constructor']],
        or: [['disjI1', 'left'], ['disjI2', 'right']], top: [['trueI', 'trivial']] }
      const have = { and: [['conjE', `obtain ⟨ha, hb⟩ := ${h}`]], or: [['disjE', `obtain (ha | hb) := ${h}`]],
        imp: [['impE', `apply ${h}`]], bot: [['falseE', `exact ${h}.elim`]],
        iff: [['iffE1', `apply ${h}.mp`], ['iffE2', `apply ${h}.mpr`]] }
      if (sel.kind === 'in' && !this.analysis.openInputs.some(o => o.block === sel.block && o.port === sel.port)) return []
      return ((sel.kind === 'in' ? goal : have)[f.t] ?? []).filter(([rule]) => this.rules.includes(rule))
    }

    // Puts the block of a step in and connects it to the selected port.
    takeStep(rule) {
      const sel = this.selected
      this.selected = null
      this.change(() => {
        const nb = this.proof.addRule(rule)
        if (sel.kind === 'in') this.proof.connect({ block: nb.id, port: 0 }, { block: sel.block, port: sel.port })
        else this.proof.connect({ block: sel.block, port: sel.port }, { block: nb.id, port: 0 })
      })
    }

    // The steps as small buttons beside the selected port: above a red circle, below a blue dot.
    // If they do not fit side by side into the picture, they are stacked, and kept inside it.
    drawSteps(root, pos, view) {
      const steps = this.steps()
      if (!steps.length) return
      const sel = this.selected, b = this.proof.block(sel.block)
      const at = portAt(pos[b.id], b, sel.kind, sel.port)
      const pills = steps.map(([rule, tactic]) => ({ rule, text: `${RULES[rule].label} · ${tactic}` }))
      const w = t => t.length * 8.2 + 22, gap = 8
      const total = pills.reduce((s, p) => s + w(p.text), 0) + gap * (pills.length - 1)
      const stacked = total > view[2] - 8
      const inside = (x, width) => Math.max(view[0] + 4, Math.min(x, view[0] + view[2] - width - 4))
      let x = at.x - total / 2
      pills.forEach((p, k) => {
        const y = sel.kind === 'in' ? at.y - 52 - (stacked ? (pills.length - 1 - k) * 40 : 0) : at.y + 18 + (stacked ? k * 40 : 0)
        const px = inside(stacked ? at.x - w(p.text) / 2 : x, w(p.text))
        const g = svg('g', { class: 'ipm-step', 'data-rule': p.rule })
        g.append(svg('rect', { x: px, y, width: w(p.text), height: 32, rx: 16 }),
          svg('text', { x: px + w(p.text) / 2, y: y + 21, 'text-anchor': 'middle' }, p.text))
        g.addEventListener('click', ev => { ev.stopPropagation(); this.takeStep(p.rule) })
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
      if (sel?.kind === 'out') return this.link(sel, { block: b.id, port: i })
      if (sel?.kind === 'in' && sel.block === b.id && sel.port === i) return this.closeSheet()
      this.selected = { kind: 'in', block: b.id, port: i }
      this.render()
      this.inputMenu(b, i)
    }

    tapOutput(b, j) {
      this.selectedConn = null
      const sel = this.selected
      if (sel?.kind === 'in') return this.link({ block: b.id, port: j }, sel)
      if (sel?.kind === 'out' && sel.block === b.id && sel.port === j) return this.closeSheet()
      this.selected = { kind: 'out', block: b.id, port: j }
      this.render()
      this.outputMenu(b, j)
    }

    // A rule block: completes a pending selection with its fitting port, or offers to remove it.
    tapBlock(b) {
      const sel = this.selected
      if (sel?.kind === 'in') {
        const j = b.outputs.findIndex((_, j) => this.fits({ block: b.id, port: j }, sel))
        return this.link({ block: b.id, port: Math.max(j, 0) }, sel)
      }
      if (sel?.kind === 'out') {
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
        const generic = x => show(instantiate(parse(x), r.vars, 'rule'))
        return {
          picture: rulePicture(name),
          label: `${r.label}  ${r.inputs.map(generic).join(', ')} ⟹ ${r.outputs.map(generic).join(', ')}`,
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

    explainEscape(c) {
      const p = this.proof, s = this.analysis.s
      this.openSheet(tr('⚠ A local hypothesis escapes its box'), [
        { label: tr('Remove this connection'), act: () => this.change(() => { p.connections = p.connections.filter(x => x !== c) }) },
      ], tr('What is derived from a local hypothesis (of an →I or ∨E block) may only be used to prove the input of ' +
        'that block it belongs to. This line leads, via {x}, to a goal outside.', { x: show(p.block(c.from.block).outputs[c.from.port], s) }))
    }

    explain(c) {
      const p = this.proof, s = this.analysis.s
      const out = p.block(c.from.block).outputs[c.from.port], inp = p.block(c.to.block).inputs[c.to.port]
      this.openSheet(tr('☠ {x} does not fit {y}', { x: show(out, s), y: show(inp, s) }), [
        { label: tr('Remove this connection'), act: () => this.change(() => { p.connections = p.connections.filter(x => x !== c) }) },
      ])
    }
  }

  // Tasks on a page are revealed one at a time, like the steps of a lesson.
  function init() {
    translatePage()
    languageSwitch()
    registerLemmas()
    const tasks = [...document.querySelectorAll('.ipm-task')].map((root, i) => new Task(root, i))
    tasks.forEach((t, i) => t.root.prepend(el('div', 'ipm-task-label', tr('Task {i} of {n}', { i: i + 1, n: tasks.length }))))
    const update = scroll => {
      const open = tasks.findIndex(t => !t.root.classList.contains('ipm-solved'))
      tasks.forEach((t, i) => {
        const locked = open >= 0 && i > open
        if (t.root.classList.contains('ipm-locked') === locked && t.drawn) return
        t.root.classList.toggle('ipm-locked', locked)
        t.root.inert = locked
        t.drawn = true
        t.render()  // the board's size depends on it
      })
      if (scroll && open >= 0) tasks[open].root.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    tasks.forEach(t => {
      t.onSolved = () => {
        if (t.reported) return
        t.reported = true
        setTimeout(() => update(true), 1200)
      }
      if (t.root.classList.contains('ipm-solved')) t.reported = true
    })
    update(false)
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()
