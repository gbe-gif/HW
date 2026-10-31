import assert from 'node:assert/strict';
import {readFile,stat,access} from 'node:fs/promises';
import {places,houses} from './data.mjs';
import {cast,bet} from './characters.mjs';
const routes=['','campus','after-dark','residences','characters','gallery'];
const root=new URL('./dist/',import.meta.url);
let checked=0;
for(const route of routes){
 const html=await readFile(new URL(route?`${route}/index.html`:'index.html',root),'utf8');
 assert(html.includes('<html lang="ko">'),`${route}: missing language`);
 assert(html.includes('aria-label="주요 페이지"'),`${route}: missing navigation`);
 assert(!html.includes('/supporting/')&&!html.includes('조연'), 'Retired supporting page must not appear');
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

const gallery=await readFile(new URL('gallery/index.html',root),'utf8');
const gallerySources=[...gallery.matchAll(/data-src="([^"]+)"/g)].map(match=>match[1]);
assert.equal(gallerySources.length,44);
assert.equal(new Set(gallerySources).size,44);
for(const code of ['D','J','T','C'])for(let number=1;number<=11;number++)assert(gallerySources.includes('https://gbe88.uk/HW/'+code+'_'+number+'.webp'));
assert.equal((gallery.match(/data-gallery-group=/g)||[]).length,4);
const mainNavigation=gallery.match(/<nav class="bottom-nav"[\s\S]*?<\/nav>/)?.[0];
assert(mainNavigation&&mainNavigation.lastIndexOf('수록 이미지')>mainNavigation.lastIndexOf('등장인물'));
console.log('PASS: 44 unique gallery URLs, four collections and last-position archive navigation.');

await assert.rejects(access(new URL('supporting/index.html',root)),{code:'ENOENT'});
for(const code of ['D','J','T','C'])assert.equal((characters.match(new RegExp('src="https://gbe88\\.uk/3/HW/'+code+'\\.webp"','g'))||[]).length,1,'Portrait must appear in the detailed profile: '+code);
console.log('PASS: retired supporting page absent; all four profile portraits linked.');

const traitPanels=[...characters.matchAll(/<details class="intimacy-details [^"]+"[^>]*>/g)].map(match=>match[0]);
assert.equal(traitPanels.length,8);
assert.equal(traitPanels.filter(tag=>tag.includes('data-trait-version="safe"')).length,4);
assert.equal(traitPanels.filter(tag=>tag.includes('data-trait-version="adult"')).length,4);
assert(traitPanels.every(tag=>! /\bopen\b/.test(tag)),'Trait panels must start collapsed');
for(const person of cast){assert(person.safeRomance.length>0);assert(person.intimacy.length>0);}
console.log('PASS: four safe and four adult trait panels, independently collapsed by default.');
