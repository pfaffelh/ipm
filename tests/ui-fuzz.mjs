// A fuzzer for the interface: taps at random what a player can tap (circles, dots, blocks, the
// blocks on the left, tactic buttons, lines and their ✕, Undo, Start over, Tidy up, the dots of the
// levels), in both modes, and collects errors of the page; every proof it gets accepted goes to Lean.
// After every tap all lines must still lead between existing ports (BROKEN otherwise).
// Usage: BASE=http://localhost:8002/ [ONLY=World-6___-Equivalence-and-Truth/] node ui-fuzz.mjs [taps per level] [seed] → fuzz-out/ui.lean, ui.json
import fs from 'node:fs'
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const taps = Number(process.argv[2] ?? 150)
let seed = Number(process.argv[3] ?? 1)
const rand = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648 }
const page = await (await browser.newContext({ viewport: { width: 1300, height: 900 } })).newPage()
const errors = []
page.on('pageerror', e => errors.push(`${page.url()}: ${e.stack}`))
const pages = process.env.ONLY ? [process.env.ONLY] : ['World-1___-Conjunction/', 'World-2___-Implication/', 'World-3___-Disjunction/', 'World-4___-Falsity-and-Negation/',
  'World-5___-Classical-Logic/', 'World-6___-Equivalence-and-Truth/', 'World-7___-Quantifiers/', 'World-8___-Puzzles/',
  'World-9___-Induction/', 'Tactic-Trainer/']
const proofs = new Map()
const targets = ['.ipm-current .ipm-canvas .ipm-port', '.ipm-current .ipm-canvas .ipm-port', '.ipm-current .ipm-canvas .ipm-port',
  '.ipm-current .ipm-step', '.ipm-current .ipm-step', '.ipm-current .ipm-canvas .ipm-rule', '.ipm-current .ipm-palette-item',
  '.ipm-current .ipm-conn-hit', '.ipm-current .ipm-conn-remove',
  '.ipm-current .ipm-undo', '.ipm-current .ipm-option', '.ipm-current .ipm-bar button']
for (const w of pages) {
  for (const mode of ['all', 'tactics']) {
    if (w === 'Tactic-Trainer/' && mode === 'tactics') continue
    await page.goto(base + w)
    await page.evaluate(m => { localStorage.clear(); localStorage.setItem('ipm-verso:in-order', 'off'); localStorage.setItem('ipm-verso:mode', 'tactics') }, mode)
    await page.reload()
    const n = await page.evaluate(() => window.ipmTasks?.length ?? 0)
    for (let i = 0; i < n; i++) {
      await page.goto(base + w + `#level-${i + 1}`); await page.reload()
      await page.locator('.ipm-tip-overlay button').click({ timeout: 500 }).catch(() => {})
      if (mode === 'tactics') await page.evaluate(i => { const t = window.ipmTasks[i]; t.tacticsOnly = true; t.render() }, i)
      for (let k = 0; k < taps; k++) {
        const sel = targets[Math.floor(rand() * targets.length)]
        // Start over and Tidy up rarely (they are in the bar)
        if (sel.includes('ipm-bar') && rand() < 0.8) continue
        const els = page.locator(sel)
        const m = await els.count()
        if (!m) continue
        const el = els.nth(Math.floor(rand() * m))
        if (/Next|Weiter|About|Über/.test(await el.textContent().catch(() => ''))) continue
        const what = `${sel} «${(await el.textContent().catch(() => '')).slice(0, 40)}»`
        const before = await page.evaluate(i => window.ipmTasks[i].proof.snapshot(), i)
        await el.dispatchEvent('click').catch(() => {})
        const broken = await page.evaluate(i => { const p = window.ipmTasks[i].proof
          return p.connections.filter(c => !p.block(c.from.block)?.outputs[c.from.port] || !p.block(c.to.block)?.inputs[c.to.port]).map(c => JSON.stringify(c)) }, i)
        if (broken.length) { console.log('BROKEN after', what, broken.join(' '), '\nBEFORE', before.slice(0, 1500)); }
        const st = await page.evaluate(i => { const t = window.ipmTasks[i]; return { qed: t.analysis?.qed, lean: t.leanCode.textContent } }, i)
        if (st.qed) { if (!proofs.has(st.lean)) proofs.set(st.lean, `${w}${i + 1}/${mode}`); break }
      }
    }
    process.stdout.write(`${w} ${mode}: ${proofs.size} proofs, ${errors.length} errors  `)
  }
}
fs.mkdirSync(new URL('fuzz-out/', import.meta.url), { recursive: true })
fs.writeFileSync(new URL('fuzz-out/ui.lean', import.meta.url), [...proofs].map(([lean, name], k) => `-- #${k} ${name}\n${lean}`).join('\n\n') + '\n')
fs.writeFileSync(new URL('fuzz-out/ui.json', import.meta.url), JSON.stringify({ errors: [...new Set(errors)] }, null, 1))
console.log(`\n${proofs.size} accepted proofs, ${new Set(errors).size} different page errors`)
for (const e of [...new Set(errors)].slice(0, 10)) console.log('ERROR', e.slice(0, 1500))
await browser.close()
