// Campaign card vs the hero's title, text and buttons: horizontal and vertical clearance.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch();
 for (const [w,h] of [[1200,800],[1280,720],[1440,790],[1440,900],[1680,950],[1920,1080],[2560,1300]]) { const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  await p.goto('http://localhost:8765/index.html',{waitUntil:'load'}); await p.waitForTimeout(2600);
  const r = await p.evaluate(()=>{const c=document.querySelector('.home-campaign__card').getBoundingClientRect();
    const els=[]; for (const e of document.querySelectorAll('.hero h1, .hero p, .hero .btn, .hero button')) { if (e.closest('.home-campaign')) continue; if (e.matches('.btn, button')) { els.push(e.getBoundingClientRect()); continue; } const rg=document.createRange(); rg.selectNodeContents(e); els.push(...[...rg.getClientRects()].filter(x=>x.width)); }
    const right=Math.max(...els.map(x=>x.right)); const clash=els.some(x=>x.right>c.left && x.left<c.right && x.bottom>c.top && x.top<c.bottom);
    const s=document.querySelector('#howwework').getBoundingClientRect();
    return {cardLeft:Math.round(c.left), copyRight:Math.round(right), gapX:Math.round(c.left-right), toRight:Math.round(innerWidth-c.right), clash, overTorn:Math.round(c.bottom-s.top), toFold:Math.round(innerHeight-c.bottom), w:Math.round(c.width), h:Math.round(c.height)}});
  console.log(w+'x'+h, JSON.stringify(r)); await p.context().close(); }
 await b.close(); })();
