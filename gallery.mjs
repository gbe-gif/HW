import {icon} from './art.mjs';
export const galleryPeople = [
  {code:'D',id:'declan',name:'데클란',en:'DECLAN'},
  {code:'J',id:'jace',name:'제이스',en:'JACE'},
  {code:'T',id:'toby',name:'토비',en:'TOBY'},
  {code:'C',id:'colton',name:'콜튼',en:'COLTON'}
];
export const galleryUrl = (code,number) => `https://gbe88.uk/HW/${code}_${number}.webp`;
function collection(person,version,arrow){
 const adult=version==='adult';
 const first=adult?12:1,count=adult?8:11;
 return `<section class="gallery-section" data-gallery-group="${person.code}" data-gallery-version="${version}" id="gallery-${version}-${person.id}" aria-labelledby="gallery-title-${version}-${person.id}"><header class="section-heading"><div><span class="eyebrow">${person.en} COLLECTION${adult?' · ADULT':''}</span><h2 id="gallery-title-${version}-${person.id}">${person.name}</h2></div><a class="text-link" href="/characters/#${person.id}">인물 소개 ${arrow}</a></header><div class="gallery-grid">${Array.from({length:count},(_,i)=>{
 const n=first+i,url=galleryUrl(person.code,n);
 return `<figure class="gallery-card" data-gallery-card data-state="pending"><div class="gallery-media"><img class="gallery-image" data-gallery-image data-src="${url}" alt="${person.name} ${adult?'성인 ':''}수록 이미지" decoding="async" hidden><div class="gallery-placeholder"><span class="gallery-placeholder-icon">${icon('image',34)}</span><span class="gallery-placeholder-title">이미지 준비 중</span></div></div><figcaption><span>${person.name}</span></figcaption></figure>`;
 }).join('')}</div></section>`;
}
export function renderGallery({pageHead,arrow}) {
 return `${pageHead('04 / THE IMAGE ARCHIVE','Scenes to<br><em>remember.</em>','이야기의 순간을 담은 네 사람의 수록 이미지.')}<div data-gallery-page><div class="gallery-access"><div class="gallery-version-buttons" role="group" aria-label="이미지 버전 선택"><button type="button" class="active" data-gallery-mode="safe" aria-pressed="true">세이프 이미지</button><button type="button" data-gallery-mode="adult" aria-pressed="false">언세이프 이미지</button></div><button type="button" class="gallery-relock" data-gallery-relock hidden>다시 잠그기</button></div><div class="gallery-toolbar"><div class="gallery-filters" role="group" aria-label="이미지 인물 선택"><button type="button" class="active" data-gallery-filter="all" aria-pressed="true">전체</button>${galleryPeople.map(p=>`<button type="button" data-gallery-filter="${p.code}" aria-pressed="false">${p.name}</button>`).join('')}</div><ul class="prose gallery-notice"><li>세로·가로 비율을 유지해 잘림 없이 표시되는 이미지.</li><li>아직 업로드되지 않았거나 불러올 수 없는 이미지는 준비 상태로 표시.</li></ul></div><p class="gallery-status" role="status" aria-live="polite">세이프 · 전체</p><div data-safe-gallery>${galleryPeople.map(p=>collection(p,'safe',arrow)).join('')}</div><div data-adult-gallery hidden></div><template id="adult-gallery-template">${galleryPeople.map(p=>collection(p,'adult',arrow)).join('')}</template></div>
 <dialog class="gallery-password-dialog" aria-labelledby="gallery-password-title"><form id="gallery-password-form"><span class="eyebrow">UNSAFE IMAGE ARCHIVE</span><h2 id="gallery-password-title">언세이프 버전 상세정보의 비밀번호를 입력해주세요</h2><label for="gallery-password">비밀번호</label><input id="gallery-password" name="gallery-password" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" required autofocus aria-describedby="gallery-password-error"><p id="gallery-password-error" class="gallery-password-error" role="alert"></p><div class="gallery-password-actions"><button type="button" data-password-cancel>취소</button><button type="submit" class="gallery-password-submit">열기</button></div></form></dialog>`;
}
