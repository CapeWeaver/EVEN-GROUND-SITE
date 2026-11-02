const { chromium } = require('playwright');
const base = process.argv[2] || 'http://localhost:8765/';
const pages=['index.html','impact-stories.html','donate.html','404.html','project-thanda.html','project-brave.html','project-siyakwazi.html','project-truenorth.html','project-kgololo.html','project-siyabonga.html','campaign/','campaign/isenathi/'];
(async()=>{const b=await chromium.launch(); let bad=0;
for (const w of [1440,1200,820,390]) for (const pg of pages){const p=await (await b.newContext({viewport:{width:w,height:900}, isMobile:w<640, hasTouch:w<640})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
let resp; try { resp=await p.goto(base+pg,{waitUntil:'load',timeout:45000}); } catch(e) { console.log('retry',w,pg); resp=await p.goto(base+pg,{waitUntil:'load',timeout:45000}); }await p.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));await p.waitForTimeout(500);
const r=await p.evaluate(()=>{const li=[...document.querySelectorAll('.nav__links > li')].map(x=>Math.round(x.getBoundingClientRect().top)); return {ov:document.documentElement.scrollWidth-innerWidth,broken:[...document.images].filter(i=>i.complete&&i.currentSrc&&!i.naturalWidth).length, navOneLine: innerWidth<1200 || new Set(li).size<=1}});
if (resp.status()!==200||r.ov||r.broken||!r.navOneLine||errs.length){bad++; console.log('PROBLEM',w,pg,resp.status(),JSON.stringify(r),errs.join(' | '));}
await p.context().close();}
console.log('sweep done, problems:',bad); await b.close();})();
