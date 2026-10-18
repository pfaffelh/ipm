// In the Lean tactic mode the tactic buttons always lie within the board, also when there are many
// (they wrap into rows): for the goal and each assumption of every level, on a desktop and a phone.
// Usage: BASE=http://localhost:8002/ node stepsfit.mjs
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const worlds = ['World-1___-Conjunction/', 'World-2___-Implication/', 'World-3___-Disjunction/', 'World-4___-Falsity-and-Negation/', 'World-5___-Classical-Logic/',
  'World-6___-Equivalence-and-Truth/', 'World-7___-Rewriting/', 'World-8___-Quantifiers/', 'World-9___-Puzzles/', 'World-10___-Induction/']
for (const [name, vp] of [['desktop', { width: 1300, height: 850 }], ['phone', { width: 390, height: 844, isMobile: true, hasTouch: true }]]) {
  const { width, height, ...rest } = vp
  const page = await (await browser.newContext({ viewport: { width, height }, ...rest })).newPage()
  page.on('pageerror', e => console.log('PAGEERROR', e.message))
  let checked = 0, most = 0, bad = 0
  for (const w of worlds) {
    await page.goto(base + w); await page.evaluate(() => { localStorage.setItem('ipm-verso:mode', 'tactics'); localStorage.setItem('ipm-verso:in-order', 'off'); localStorage.setItem('ipm-verso:tips', 'off') })
    await page.reload(); await page.waitForTimeout(400)
    const n = await page.locator('.ipm-task').count()
    for (let k = 1; k <= n; k++) {
      await page.evaluate(k => { location.hash = `#level-${k}`; document.querySelectorAll('.ipm-tip-overlay').forEach(o => o.remove()) }, k); await page.waitForTimeout(120)
      const r = await page.evaluate(() => {
        const t = window.ipmTasks.find(t => t.root.classList.contains('ipm-current'))
        const out = []
        const places = [...t.analysis.openInputs.map(o => ({ kind: 'in', ...o })), ...t.proof.blocks.filter(b => b.kind === 'assumption').map(b => ({ kind: 'out', block: b.id, port: 0 }))]
        for (const sel of places) {
          t.selected = sel; t.render()
          const c = t.canvas.getBoundingClientRect(), steps = [...t.canvas.querySelectorAll('.ipm-step rect')]
          const off = steps.filter(e => { const b = e.getBoundingClientRect(); return b.left < c.left - 1 || b.right > c.right + 1 || b.top < c.top - 1 || b.bottom > c.bottom + 1 })
          out.push({ n: steps.length, off: off.length })
        }
        t.selected = null; t.render()
        return out
      })
      for (const x of r) { checked++; most = Math.max(most, x.n); if (x.off) { bad++; console.log(`  ${name} ${w}${k}: ${x.off} of ${x.n} buttons outside`) } }
    }
  }
  console.log(`${name}: ${checked} places, up to ${most} buttons, ${bad} with buttons outside the board`)
}
await browser.close()
