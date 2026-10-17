// For the tests of the game's logic: shows all tasks of a page one below the other (as before the
// stage), each with a board of fixed height, so that every task can be played and read.
export async function allTasks(page) {
  await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style')
    style.textContent = `html.ipm-playing, html.ipm-playing body { overflow: visible !important; }
      .ipm-stage { height: auto !important; display: block !important; }
      .ipm-stage > .ipm-task { display: block !important; margin: 1.2em 0 !important; }
      .ipm-stage .ipm-board { display: block !important; }
      .ipm-stage .ipm-canvas { height: 560px !important; flex: none !important; }`
    document.head.append(style)
  }))
}
