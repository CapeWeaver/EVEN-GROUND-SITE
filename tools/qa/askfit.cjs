// Does the green ask fit on one screen? Its height against the viewport.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch();
  for (const path of ['/campaign/', '/campaign/isenathi/'])
  for (const [w, h] of [[390, 844], [390, 700], [820, 1180], [1200, 760], [1440, 790], [1920, 1080]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
    await p.goto('http://localhost:8765' + path, { waitUntil: 'load' });
    const r = await p.evaluate(() => { const a = document.querySelector('.ccamp-ask').getBoundingClientRect(); const bar = document.querySelector('.cnav'); return { ask: Math.round(a.height), bar: bar ? Math.round(bar.getBoundingClientRect().height) : 0 }; });
    const room = h - r.bar;
    console.log(path.padEnd(24), `${w}x${h}`, 'ask', r.ask, 'room', room, r.ask <= room - 32 ? 'fits' : 'TOO TALL');
    await p.context().close(); }
  await b.close(); })();
