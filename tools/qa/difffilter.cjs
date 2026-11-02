// The cleanup proof: style differences outside the accepted set (hidden bar logo image, flex-direction on a block, the ask's align-items).
const fs=require('fs');const a=JSON.parse(fs.readFileSync(process.argv[2])),b=JSON.parse(fs.readFileSync(process.argv[3]));let n=0,known=0;
for(const k of Object.keys(a)){const A=a[k],B=b[k];if(A.length!==B.length){console.log(k,'count',A.length,B.length);continue}
A.forEach((el,i)=>{if(el.s.display==='none'&&B[i].s.display==='none')return;const st=el.s.position==='static'&&B[i].s.position==='static';
for(const p in el.s){if(el.s[p]===B[i].s[p])continue;if(st&&/^(top|left|right|bottom|inset)/.test(p))continue;
const isKnown=(el.id.startsWith('IMG#')&&/(width|height|inline-size|block-size)$/.test(p)&&(B[i].s.width==='2894px'||el.s.width==='2894px'))||(p==='flex-direction'&&el.id.includes('cstory-hero--campaign'))||(p==='align-items'&&el.id.includes('ccamp-ask'));
if(isKnown){known++;continue}n++;if(n<=40)console.log(k,el.id,p,JSON.stringify(el.s[p]),'->',JSON.stringify(B[i].s[p]));}})}
console.log('unexplained:',n,' accepted:',known);
