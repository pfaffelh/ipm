// The tactic mode keeps the picture: after each tactic, the blocks that were there stay where they
// were (in the picture's own units), except the goal the new block proves and what is below it,
// which move down; nothing moves sideways. Plays 2.5 and 3.5 (with
// boards: the goal of a case is a block of the case's board, not a moved one).
// Usage: BASE=http://localhost:8002/ node steady.mjs (SHOT=dir)
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const page = await (await browser.newContext({ viewport: { width: 1300, height: 800 } })).newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
const places = () => page.evaluate(() => {
  const out = {}
  for (const g of document.querySelectorAll('.ipm-task.ipm-current .ipm-canvas .ipm-block')) {
    const r = g.querySelector('rect'); out[g.textContent.replace(/\s+/g, '') + '@' + r.getAttribute('x')[0]] = [Math.round(+r.getAttribute('x')), Math.round(+r.getAttribute('y'))]
  }
  return out
})
const play = async (path, steps) => {
  await page.goto(base); await page.evaluate(() => { localStorage.clear(); localStorage.setItem('ipm-verso:mode', 'tactics'); localStorage.setItem('ipm-verso:in-order', 'off'); localStorage.setItem('ipm-verso:tactic-mode', '1') })
  await page.goto(base + path); await page.reload(); await page.waitForTimeout(500)
  let moved = 0, total = 0
  for (const [where, want] of steps) {
    for (let k = 0; k < 3; k++) await page.locator('.ipm-tip-ok').click({ timeout: 400 }).catch(() => {})
    const before = await places()
    const t = page.locator('.ipm-task.ipm-current')
    await page.evaluate(([where, want]) => {
      const t = window.ipmTasks.find(x => x.root.classList.contains('ipm-current'))
      if (!t.analysis.openInputs.length) return  // done already
      // the button, at a goal (in Lean's order) or at something one has
      const places = where === 'goal' ? t.analysis.openInputs.map(o => ({ kind: 'in', ...o }))
        : t.proof.blocks.flatMap(b => b.outputs.map((_, j) => ({ kind: 'out', block: b.id, port: j })))
      for (const sel of places) {
        t.selected = sel
        const s = t.steps().find(x => x.text.includes(want))
        if (s) { s.act(); return }
      }
      throw new Error('no ' + want + ' among ' + t.analysis.openInputs.map(o => { t.selected = { kind: 'in', ...o }; return JSON.stringify(o) + ': ' + t.steps().map(x => x.text).join('/') }).join(' ; ') + ' | ' + t.leanCode.textContent)
    }, [where, want])
    await page.waitForTimeout(200)
    const after = await places()
    for (const k of Object.keys(before)) if (after[k]) { total++; if (after[k][0] !== before[k][0] || after[k][1] !== before[k][1]) { moved++; console.log('  moved:', k, before[k], '→', after[k]) } }
  }
  console.log(path, `| blocks kept their place: ${total - moved} of ${total} |`, await page.locator('.ipm-task.ipm-current .ipm-status').innerText())
}
await play('World-2___-Implication/#level-5', [['goal', 'intro'], ['goal', 'apply h₂'], ['goal', 'apply h₁'], ['goal', 'exact']])
if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/steady-25.png' })
await play('World-3___-Disjunction/#level-5', [['have', 'obtain ('], ['goal', 'right'], ['goal', 'exact'], ['goal', 'left'], ['goal', 'exact']])
await browser.close()
