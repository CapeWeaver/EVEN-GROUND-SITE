// The campaign bar: every pill's box, one row, same height, nothing clipped, at several widths.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch();
  for (const w of [320, 390, 640, 820, 960, 1200, 1440, 1920]) {
    const p = await b.newPage({ viewport: { width: w, height: 800 } });
    await p.goto('http://localhost:8765/campaign/', { waitUntil: 'load' });
    const r = await p.evaluate(async () => { await document.fonts.ready;
      const pills = [...document.querySelectorAll('.cnav__pill')].filter(x => getComputedStyle(x.parentElement).display !== 'none');
      const boxes = pills.map(x => x.getBoundingClientRect());
      const clipped = pills.filter(x => x.scrollWidth > x.clientWidth + 1).map(x => x.textContent.trim().slice(0, 9));
      const bar = document.querySelector('.cnav').getBoundingClientRect(); return { bar: Math.round(bar.height), n: pills.length, tops: [...new Set(boxes.map(x => Math.round(x.top)))].length, heights: [...new Set(boxes.map(x => Math.round(x.height)))],
        widths: boxes.map(x => Math.round(x.width)), clipped, overflow: document.documentElement.scrollWidth > innerWidth };
    });
    console.log(w, JSON.stringify(r)); await p.close(); }
  await b.close(); })();
