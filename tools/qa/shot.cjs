// node tools/qa/shot.cjs <path> <w> <h> <out.png> [full=1] [scrollToSelector]
const { chromium } = require('playwright');
const [,, path, w, h, out, full, sel] = process.argv;
(async () => { const b = await chromium.launch();
  const mobile = +w < 640;
  const p = await (await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile })).newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto((path.startsWith('http')?'':'http://localhost:8765')+path, {waitUntil:'load'}); await p.waitForTimeout(600);
  if (full==='1') { await p.evaluate(async()=>{ for (let y=0;y<document.documentElement.scrollHeight;y+=300){window.scrollTo(0,y); await new Promise(r=>setTimeout(r,130));} window.scrollTo(0,0); }); await p.waitForTimeout(1800); }
  if (sel) { await p.evaluate(s=>{const e=document.querySelector(s); window.scrollTo(0, e.getBoundingClientRect().top+scrollY-90)}, sel); await p.waitForTimeout(1800); }
  else if (full!=='1') await p.waitForTimeout(1500);
  const m = await p.evaluate(()=>({ov:document.documentElement.scrollWidth-innerWidth, h:document.documentElement.scrollHeight, broken:[...document.images].filter(i=>i.complete&&i.currentSrc&&!i.naturalWidth).map(i=>i.src)}));
  console.log(out, JSON.stringify(m), errs.join(' | '));
  await p.screenshot({path: out, fullPage: full==='1'}); await b.close(); })();
