// Computed-style snapshot of every element on the campaign pages: the proof that a CSS cleanup changed nothing.
// node snap.cjs out.json   |   node snap.cjs --diff a.json b.json
const fs = require('fs');
if (process.argv[2] === '--diff') {
  const a = JSON.parse(fs.readFileSync(process.argv[3])), b = JSON.parse(fs.readFileSync(process.argv[4])); let n = 0;
  for (const k of Object.keys(a)) { const A = a[k], B = b[k] || []; if (A.length !== B.length) { console.log(k, 'element count', A.length, B.length); n++; continue; }
    A.forEach((el, i) => { const hidden = el.s.display === 'none' && B[i].s.display === 'none'; const stat = el.s.position === 'static' && B[i].s.position === 'static';
      if (hidden) return;
      for (const p in el.s) if (el.s[p] !== B[i].s[p]) { if (stat && /^(top|left|right|bottom|inset)/.test(p)) continue; if (n < 60) console.log(k, el.id, p, JSON.stringify(el.s[p]), '->', JSON.stringify(B[i].s[p])); n++; } }); }
  console.log('differences:', n); process.exit(0);
}
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--force-prefers-reduced-motion'] }); const out = {};
  for (const path of ['/campaign/', '/campaign/isenathi/', '/index.html']) for (const [w, h] of [[390, 844], [820, 1180], [1024, 700], [1200, 760], [1440, 790], [1920, 1080]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' }); const p = await ctx.newPage();
    await p.goto('http://localhost:8765' + path, { waitUntil: 'load' });
    await p.evaluate(async () => { await document.fonts.ready; document.querySelectorAll('.reveal').forEach(e => e.classList.add('visible')); }); await p.waitForTimeout(600);
    out[path + '@' + w] = await p.evaluate(() => [...document.querySelectorAll('body *')].filter(e => !e.closest('svg') || e.tagName === 'svg').map((e, i) => {
      const cs = getComputedStyle(e), s = {}; for (const prop of cs) if (!prop.startsWith('-webkit-') && prop !== 'transition' && !prop.startsWith('animation') && !prop.startsWith('transition')) s[prop] = cs.getPropertyValue(prop);
      for (const pse of ['::before', '::after']) { const c = getComputedStyle(e, pse); if (c.content && c.content !== 'none' && c.content !== 'normal') for (const prop of ['content', 'display', 'position', 'width', 'height', 'background-color', 'inset', 'border-radius']) s[pse + prop] = c.getPropertyValue(prop); }
      return { id: e.tagName + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : '') + '#' + i, s }; }));
    await ctx.close(); }
  fs.writeFileSync(process.argv[2], JSON.stringify(out)); console.log('snapshot', Object.keys(out).length, 'states'); await b.close(); })();
