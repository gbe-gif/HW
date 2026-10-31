import {icon} from './art.mjs';
export const galleryPeople = [
  {code:'D',id:'declan',name:'데클란',en:'DECLAN'},
  {code:'J',id:'jace',name:'제이스',en:'JACE'},
  {code:'T',id:'toby',name:'토비',en:'TOBY'},
  {code:'C',id:'colton',name:'콜튼',en:'COLTON'}
];
export const galleryUrl = (code,number) => `https://gbe88.uk/HW/${code}_${number}.webp`;
export function renderGallery({pageHead,arrow}) {
 return `${pageHead('04 / THE IMAGE ARCHIVE','Scenes to<br><em>remember.</em>','이야기의 순간을 담은 네 사람의 수록 이미지.')}<div class="gallery-toolbar"><div class="gallery-filters" role="group" aria-label="이미지 인물 선택"><button type="button" class="active" data-gallery-filter="all" aria-pressed="true">전체 <span>44</span></button>${galleryPeople.map(p=>`<button type="button" data-gallery-filter="${p.code}" aria-pressed="false">${p.name} <span>11</span></button>`).join('')}</div><ul class="prose gallery-notice"><li>세로·가로 비율을 유지해 잘림 없이 표시되는 이미지.</li><li>아직 업로드되지 않았거나 불러올 수 없는 이미지는 준비 상태로 표시.</li></ul></div><p class="gallery-status" role="status" aria-live="polite">전체 · 44개 이미지 자리</p>
 ${galleryPeople.map(p=>`<section class="gallery-section" data-gallery-group="${p.code}" id="gallery-${p.id}" aria-labelledby="gallery-title-${p.id}"><header class="section-heading"><div><span class="eyebrow">${p.code} / ${p.en} COLLECTION</span><h2 id="gallery-title-${p.id}">${p.name}</h2></div><a class="text-link" href="/characters/#${p.id}">인물 소개 ${arrow}</a></header><div class="gallery-grid">${Array.from({length:11},(_,i)=>{const n=i+1,url=galleryUrl(p.code,n);return `<figure class="gallery-card" data-gallery-card data-state="pending"><div class="gallery-media"><img class="gallery-image" data-gallery-image data-src="${url}" alt="${p.name} 수록 이미지 ${n}번" decoding="async" hidden><div class="gallery-placeholder"><span class="gallery-placeholder-icon">${icon('image',34)}</span><span class="gallery-placeholder-title">이미지 준비 중</span><span class="gallery-placeholder-subtitle">${p.code} / ${String(n).padStart(2,'0')}</span></div></div><figcaption><div><span class="gallery-number">${String(n).padStart(2,'0')}</span><span>${p.name}</span><small>${p.code}_${n}.webp</small></div><a class="gallery-original" href="${url}" target="_blank" rel="noopener noreferrer" hidden aria-label="${p.name} ${n}번 이미지 원본 새 창에서 보기">원본 보기 ${arrow}</a></figcaption></figure>`;}).join('')}</div></section>`).join('')}`;
}
