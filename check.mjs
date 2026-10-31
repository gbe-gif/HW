import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {places,houses} from './data.mjs';
import {cast,bet} from './characters.mjs';
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

const characters=await readFile(new URL('characters/index.html',root),'utf8');
assert.equal(cast.length,4);
for(const person of cast){
 assert(characters.includes('id="'+person.id+'"'));
 assert(characters.includes(person.name));
 assert(characters.includes(person.costume));
 assert(characters.includes('/residences/#'+person.id));
}
const spoilerTag=characters.match(/<details class="spoiler-details"[^>]*>/)?.[0];
assert(spoilerTag&&!/\bopen\b/.test(spoilerTag),'Spoilers must start closed');
assert.deepEqual(Object.keys(bet).sort(),['premise','rules']);
for(const privateType of ['9w8','8w7','5w4','7w8','sp/sx','sx/so','FID','Unbothered Sluggard','Social Butterfly','Galge Brain','Golden Retriever Alpha']) assert(!characters.includes(privateType),'Raw personality metadata must not be published');
const jace=cast.find(p=>p.id==='jace');
for(const [key,value] of [['나이','24살'],['생일','07.01'],['MBTI','ENTP']]) assert(jace.badges.some(badge=>badge[0]===key&&badge[1]===value),'Missing Jace badge: '+key);
for(const detail of ['경영학을 전공하는 4학년','로건금융그룹 오너의 차남','GPA 3.88','약 1,100만 달러','코네티컷주 그리니치','레드애플','암브록산','바닐라 머스크','주류 수집과 주식','현재 금연 중','애스턴 마틴 DBS 볼란테','피임 도구를 늘 준비']) assert(characters.includes(detail),'Missing Jace detail: '+detail);
const toby=places.find(p=>p.id==='toby');
assert(toby.x<30,'Toby belongs to the western neighborhood');
console.log('PASS: 4 profiles, costume/residence links, closed spoilers, public metadata and western residence.');
