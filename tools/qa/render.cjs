// The loop's evidence set: full pages with every reveal settled, then sliced to screen-sized JPGs.
const { chromium } = require('playwright');
const OUT = process.argv[2];
const SHOTS = [
  ['campaign', '/campaign/', 1440, 790, true], ['campaign', '/campaign/', 390, 844, true], ['campaign', '/campaign/', 820, 1180, true], ['campaign', '/campaign/', 1920, 1080, false],
  ['isenathi', '/campaign/isenathi/', 1440, 790, true], ['isenathi', '/campaign/isenathi/', 390, 844, true], ['isenathi', '/campaign/isenathi/', 1200, 760, false],
  ['home', '/index.html', 1440, 790, false], ['home', '/index.html', 390, 844, false], ['home', '/index.html', 1200, 800, false],
];
(async () => { const b = await chromium.launch();
  for (const [name, path, w, h, full] of SHOTS) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto('http://localhost:8765' + path, { waitUntil: 'load' }); await p.waitForTimeout(2600);
    if (full) { await p.evaluate(async () => { document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager'); for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); document.querySelectorAll('.reveal').forEach(e => e.classList.add('visible')); }); await p.waitForTimeout(1600); }
    await p.screenshot({ path: `${OUT}/${name}-${w}${full ? '-full' : ''}.png`, fullPage: full });
    await p.close(); }
  await b.close(); })();
