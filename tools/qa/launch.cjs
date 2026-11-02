// Launch checks on every page: axe WCAG 2.2 AA, console errors, and every internal link and asset answering 200.
const { chromium } = require('playwright');
const fs = require('fs');
const AXE = require.resolve('axe-core/axe.min.js');
const pages = fs.readdirSync('.').filter(f => f.endsWith('.html') && !/^review-/.test(f));
(async () => { const b = await chromium.launch(); const links = new Set(); let bad = 0;
  for (const f of pages) { const p = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); const errs = []; // final states only: mid-animation text reads as low contrast
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 90)); });
    const r = await p.goto('http://localhost:8765/' + f, { waitUntil: 'load' });
    await p.addScriptTag({ path: AXE });
    const v = await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] })).violations.map(x => x.id + '(' + x.nodes.length + ')'));
    (await p.evaluate(() => [...document.querySelectorAll('a[href], img[src], link[href], script[src]')].map(e => e.href || e.src))).forEach(u => { if (u.startsWith('http://localhost:8765')) links.add(u.split('#')[0]); });
    if (r.status() !== 200 || v.length || errs.length) { bad++; console.log(f, r.status(), v.join(' '), errs.join(' | ')); }
    await p.close(); }
  const p = await b.newPage(); let dead = [];
  for (const u of links) { const res = await p.request.get(u); if (res.status() >= 400) dead.push(res.status() + ' ' + u.replace('http://localhost:8765', '')); }
  console.log(pages.length, 'pages,', links.size, 'internal links and assets checked;', 'pages with issues:', bad, '| dead:', dead.length ? '\n  ' + dead.join('\n  ') : 0);
  await b.close(); })();
