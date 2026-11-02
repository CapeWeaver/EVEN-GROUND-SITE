// axe-core (WCAG 2.2 AA) on the campaign pages and the homepage, at laptop and phone size.
const { chromium } = require('playwright');
const AXE = require.resolve('axe-core/axe.min.js');
(async () => { const b = await chromium.launch();
  for (const path of ['/campaign/', '/campaign/isenathi/', '/index.html']) for (const [w, h] of [[1440, 790], [390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto('http://localhost:8765' + path, { waitUntil: 'load' });
    await p.evaluate(() => document.querySelectorAll('.reveal').forEach(e => e.classList.add('visible'))); await p.waitForTimeout(1500);
    await p.addScriptTag({ path: AXE });
    const r = await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] })).violations.map(v => `${v.impact} ${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 3).map(n => n.target.join(' ') + (n.any[0] ? ' [' + n.any[0].message.slice(0, 110) + ']' : '')).join(' | ')}`));
    console.log(path, w, r.length ? '\n  ' + r.join('\n  ') : 'clean');
    await p.close(); }
  await b.close(); })();
