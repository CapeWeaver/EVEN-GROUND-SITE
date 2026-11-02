// Click each child's pill on the campaign page and measure where her card lands.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch();
  for (const [w, h] of [[390, 844], [820, 1180], [1200, 760], [1440, 790], [1920, 1080]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
    await p.goto('http://localhost:8765/campaign/', { waitUntil: 'load' });
    const out = [];
    for (const slug of ['isenathi', 'melokuhle', 'lesego']) {
      await p.click(`.cnav__child[href="#${slug}"]`); await p.waitForTimeout(1400);
      out.push(await p.evaluate((slug) => { const bar = document.querySelector('.cnav').getBoundingClientRect(); const c = document.getElementById(slug).getBoundingClientRect();
        return `${slug}: above ${Math.round(c.top - bar.bottom)} below ${Math.round(innerHeight - c.bottom)}${c.top < bar.bottom ? ' UNDER BAR' : ''}`; }, slug));
    }
    console.log(`${w}x${h}`, out.join(' | '));
    await p.context().close(); }
  // arrival from a story page
  const p = await (await b.newContext({ viewport: { width: 1440, height: 790 } })).newPage();
  await p.goto('http://localhost:8765/campaign/#melokuhle', { waitUntil: 'load' }); await p.waitForTimeout(800);
  console.log('arrival', await p.evaluate(() => { const bar = document.querySelector('.cnav').getBoundingClientRect(); const c = document.getElementById('melokuhle').getBoundingClientRect(); return `above ${Math.round(c.top - bar.bottom)} below ${Math.round(innerHeight - c.bottom)}`; }));
  await b.close(); })();
