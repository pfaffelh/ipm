// The pages of the worlds moved from Session-N___-…/ to World-N___-…/: progress kept under the old
// addresses moves to the new ones, and the old address forwards to the new one.
// Usage: BASE=http://localhost:8002/ node migrate.mjs
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true })
const base = process.env.BASE ?? 'http://127.0.0.1:8002/'
const path = new URL(base).pathname
const page = await (await browser.newContext({ viewport: { width: 1300, height: 900 } })).newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
// Progress as the old version kept it: level 1 of world 1 solved, the last level, a lemma
await page.goto(base)
await page.evaluate(p => {
  localStorage.clear()
  const proof = JSON.stringify({ b: [{ kind: 'assumption', inputs: [], outputs: [{ t: 'atom', n: 'A' }], id: 'b0' }, { kind: 'conclusion', inputs: [{ t: 'atom', n: 'A' }], outputs: [], id: 'b1' }],
    c: [{ id: 'c2', from: { block: 'b0', port: 0 }, to: { block: 'b1', port: 0 } }], n: 3, m: {} })
  localStorage.setItem(`ipm-verso:${p}Session-1___-Conjunction/:0`, JSON.stringify({ proof, solved: true }))
  localStorage.setItem('ipm-verso:last', JSON.stringify({ href: `${p}Session-1___-Conjunction/#task-2`, title: 'Session 1: Conjunction' }))
}, path)
await page.reload(); await page.waitForTimeout(300)
const keys = await page.evaluate(() => Object.keys(localStorage).filter(k => k.includes('Conjunction')))
console.log('kept under:', JSON.stringify(keys), '| Continue →', await page.locator('.ipm-start-button').getAttribute('href'))
await page.goto(base + 'World-1___-Conjunction/#level-1'); await page.waitForTimeout(300)
console.log('level 1 of world 1:', await page.locator('.ipm-task').first().evaluate(t => t.classList.contains('ipm-solved')) ? 'solved' : 'NOT solved')
await page.goto(base + 'Session-2___-Implication/#task-3'); await page.waitForTimeout(800)
console.log('old address forwards to:', new URL(page.url()).pathname + new URL(page.url()).hash)
await browser.close()
