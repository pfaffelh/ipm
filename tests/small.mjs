// Small screens (phones upright and on their side): on every page and every level, a tip box can be
// closed (✕ and "Got it" in view, the text between them scrolls), the stage can be used (tool bar in
// view, if need be by scrolling the page, a board of some height), the Tips and Lean panels fit or
// scroll, and the other pages scroll. In both modes. Usage: BASE=http://localhost:8002/ node small.mjs [WxH …]
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const sizes = (process.argv.slice(2).length ? process.argv.slice(2) : ['320x568', '360x640', '390x844', '640x360', '844x390']).map(s => s.split('x').map(Number))
const worlds = ['World-1___-Conjunction/', 'World-2___-Implication/', 'World-3___-Disjunction/', 'World-4___-Falsity-and-Negation/', 'World-5___-Classical-Logic/',
  'World-6___-Equivalence-and-Truth/', 'World-7___-Rewriting/', 'World-8___-Quantifiers/', 'World-9___-Puzzles/', 'World-10___-Induction/', 'Tactic-Trainer/']
let problems = 0
const problem = (...x) => { problems++; console.log('  PROBLEM', ...x) }
for (const [w, h] of sizes) {
  for (const mode of ['blocks', 'tactics']) {
    const page = await (await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })).newPage()
    page.on('pageerror', e => problem(`${w}x${h}`, 'PAGEERROR', e.message))
    const inView = r => r && r.top >= -1 && r.bottom <= h + 1 && r.left >= -1 && r.right <= w + 1
    // (where it is, after scrolling to it: on a short screen the page scrolls)
    const rect = sel => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(e => e.offsetParent !== null || getComputedStyle(e).position === 'fixed'); e?.scrollIntoView({ block: 'nearest' }); return e && e.getBoundingClientRect().toJSON() }, sel)
    // a tip box: ✕ and "Got it" in view, the text scrolls if it is long; then closed with "Got it"
    const tip = async where => {
      if (!(await page.locator('.ipm-tip-overlay').count())) return 0
      const r = await page.evaluate(() => {
        const q = s => document.querySelector(s)?.getBoundingClientRect().toJSON()
        const body = document.querySelector('.ipm-tip-body')
        return { ok: q('.ipm-tip-ok'), x: q('.ipm-tip-x'), card: q('.ipm-tip-card'), scrolls: body.scrollHeight <= body.clientHeight + 1 || getComputedStyle(body).overflowY === 'auto' }
      })
      if (!inView(r.ok) || !inView(r.x) || !inView(r.card) || !r.scrolls) problem(`${w}x${h} ${mode} ${where}: tip box`, JSON.stringify(r))
      await page.locator('.ipm-tip-ok').click()
      await page.waitForTimeout(150)
      if (await page.locator('.ipm-tip-overlay').count()) await page.locator('.ipm-tip-ok').click()
      return 1
    }
    await page.goto(base); await page.evaluate(m => { localStorage.clear(); localStorage.setItem('ipm-verso:mode', m); localStorage.setItem('ipm-verso:in-order', 'off'); localStorage.setItem('ipm-verso:lang', 'de') }, mode)
    let tips = 0, levels = 0
    for (const world of worlds) {
      await page.goto(base + world + '#level-1'); await page.waitForTimeout(400)
      const n = await page.locator('.ipm-task').count()
      for (let k = 1; k <= n; k++) {
        if (k > 1) { await page.evaluate(k => { location.hash = `#level-${k}` }, k); await page.waitForTimeout(250) }
        levels++
        tips += await tip(`${world}#${k}`)
        // the stage: the tool bar in view, the board of some height
        const bar = await rect('.ipm-task.ipm-current .ipm-bar'), board = await rect('.ipm-task.ipm-current .ipm-canvas')
        if (!inView(bar)) problem(`${w}x${h} ${mode} ${world}#${k}: tool bar not in view`, JSON.stringify(bar))
        if (!board || board.height < 90 || board.top < 0) problem(`${w}x${h} ${mode} ${world}#${k}: board`, JSON.stringify(board))
        if (k === 1 || k === n) {
          // Tips and Lean: open, fit or scroll, close again with their button (which stays in view)
          for (const b of ['.ipm-about-button', '.ipm-lean-toggle']) {
            const button = page.locator(`.ipm-task.ipm-current ${b}`)
            if (!(await button.count())) continue
            await button.scrollIntoViewIfNeeded()
            await button.click(); await page.waitForTimeout(200)
            tips += await tip(`${world}#${k} ${b}`)
            const r = await page.evaluate(b => {
              const panel = document.querySelector(b === '.ipm-about-button' ? '.ipm-task.ipm-current .ipm-about' : '.ipm-task.ipm-current .ipm-lean')
              if (!panel || panel.hidden) return { none: true }
              const p = panel.getBoundingClientRect().toJSON()
              // some part of it scrolls, or it is whole in view
              const scrollers = [panel, ...panel.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 2 && ['auto', 'scroll'].includes(getComputedStyle(e).overflowY))
              const cut = [panel, ...panel.querySelectorAll('*')].some(e => e.scrollHeight > e.clientHeight + 2 && !['auto', 'scroll', 'visible'].includes(getComputedStyle(e).overflowY))
              const button = document.querySelector(`.ipm-task.ipm-current ${b}`)
              button.scrollIntoView({ block: 'nearest' })
              return { p, scrolls: scrollers.length > 0, cut, button: button.getBoundingClientRect().toJSON() }
            }, b)
            if (!r.none && ((!inView(r.p) && !r.scrolls) || r.cut || !inView(r.button))) problem(`${w}x${h} ${mode} ${world}#${k} ${b}`, JSON.stringify(r))
            if (!r.none) await button.click(); await page.waitForTimeout(150)
          }
        }
      }
    }
    // the other pages scroll to their end
    for (const p of ['', 'Tactic-Lexicon/', 'Block-Lexicon/']) {
      await page.goto(base + p); await page.waitForTimeout(400)
      await tip(p || 'start')
      const r = await page.evaluate(() => { const before = document.documentElement.scrollHeight > innerHeight + 2; window.scrollTo(0, 1e6); return { long: before, y: scrollY } })
      if (r.long && r.y === 0) problem(`${w}x${h} ${mode} ${p || 'start'}: does not scroll`)
    }
    console.log(`${w}x${h} ${mode}: ${levels} levels, ${tips} tip boxes`)
    await page.context().close()
  }
}
console.log(problems ? `FAIL: ${problems} problems` : 'small screens: everything reachable')
await browser.close()
