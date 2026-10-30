import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {places,houses} from './data.mjs';
const routes=['','campus','after-dark','residences','characters','supporting'];
const root=new URL('./dist/',import.meta.url);
let checked=0;
for(const route of routes){
 const html=await readFile(new URL(route?`${route}/index.html`:'index.html',root),'utf8');
 assert(html.includes('<html lang="ko">'),`${route}: missing language`);
 assert(html.includes('aria-label="주요 페이지"'),`${route}: missing navigation`);
 assert(!html.includes('Ⓤ'),`${route}: unprocessed user symbol`);
 for(const match of html.matchAll(/(?:href|src)="([^" ]+)"/g)){
   const path=match[1];if(!path.startsWith('/')&&!path.startsWith('#'))continue;
   const url=new URL(path,'https://test.invalid/'+(route?route+'/':''));
   let target=new URL('.'+url.pathname,root);
   const info=await stat(target);
   if(info.isDirectory())target=new URL('index.html',target);
   if(url.hash){const content=await readFile(target,'utf8');assert(content.includes(`id="${url.hash.slice(1)}"`),`Broken anchor: ${route} -> ${path}`);}
   checked++;
 }
}
assert.equal(new Set(places.map(p=>p.id)).size,11);
assert.equal(houses.length,4);
const homes=await readFile(new URL('residences/index.html',root),'utf8');
for(const house of houses)for(const [, ,facts] of house.levels)for(const fact of facts)assert(homes.includes(fact),`Missing home detail: ${fact}`);
const campus=await readFile(new URL('campus/index.html',root),'utf8');
for(const place of places.filter(p=>p.type==='campus'))for(const fact of place.facts)assert(campus.includes(fact),`Missing campus detail: ${fact}`);
console.log(`PASS: ${routes.length} pages, ${checked} internal links/assets/anchors, 11 places and all campus/residence detail entries.`);
