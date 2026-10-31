import {checkGalleryPassword} from '/gallery-lock.js';
const map = document.querySelector('.map-canvas');
if (map) {
  const viewport = document.querySelector('.map-scroll');
  const list = document.querySelector('.place-list');
  const zoomControls = document.querySelector('.zoom-controls');
  const zoomLabel = document.querySelector('#zoom-level');
  let zoom = 1;
  const centerMap = () => { viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2); };
  requestAnimationFrame(centerMap);
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(b => {
      const active = b === button;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-type]').forEach(place => {
      place.hidden = button.dataset.filter !== 'all' && place.dataset.type !== button.dataset.filter;
    });
  }));
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
    const isMap = button.dataset.view === 'map';
    viewport.hidden = !isMap;
    list.hidden = isMap;
    document.querySelector('.mobile-map-hint').hidden = !isMap;
    zoomControls.hidden = !isMap;
    document.querySelectorAll('[data-view]').forEach(b => {
      b.classList.toggle('active', b === button);
      b.setAttribute('aria-pressed', String(b === button));
    });
  }));
  const setZoom = value => {
    zoom = Math.max(1, Math.min(1.6, Math.round(value * 10) / 10));
    map.style.width = `${zoom * 100}%`;
    map.style.minWidth = `${700 * zoom}px`;
    zoomLabel.value = `${Math.round(zoom * 100)}%`;
    document.querySelector('[data-zoom="out"]').disabled = zoom === 1;
    document.querySelector('[data-zoom="in"]').disabled = zoom === 1.6;
  };
  document.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.zoom === 'reset') { setZoom(1); centerMap(); }
    else setZoom(zoom + (button.dataset.zoom === 'in' ? .2 : -.2));
  }));
  document.querySelector('[data-zoom="out"]').disabled = true;
  fetch('/places.json').then(response => {
    if (!response.ok) throw new Error('Place descriptions unavailable');
    return response.json();
  }).then(places => {
    const descriptions = new Map(places.map(place => [place.id, place]));
    document.querySelectorAll('[data-place]').forEach(pin => {
      const show = () => {
        const place = descriptions.get(pin.dataset.place);
        if (!place) return;
        document.querySelector('#story-label').textContent = `${place.number} / ${place.en}`;
        document.querySelector('#story-title').textContent = place.name;
        const artwork = document.querySelector('#story-art');
        artwork.src = '/illustrations/' + (place.type === 'homes' ? place.id : 'library') + '.svg';
        artwork.alt = place.type === 'homes' ? place.name + ' 콘셉트 일러스트' : '벤크로프트 캠퍼스 콘셉트 일러스트';
        document.querySelector('#story-summary').textContent = place.summary;
        document.querySelector('#story-link').href = pin.getAttribute('href');
      };
      pin.addEventListener('pointerenter', show);
      pin.addEventListener('focus', show);
    });
  }).catch(() => { /* All place links and full descriptions remain available without this enhancement. */ });
}

const galleryPage = document.querySelector('[data-gallery-page]');
if (galleryPage) {
  let unlocked = false;
  let mode = 'safe';
  let selectedPerson = 'all';
  const names = {all:'전체',D:'데클란',J:'제이스',T:'토비',C:'콜튼'};
  const safeGallery = galleryPage.querySelector('[data-safe-gallery]');
  const adultGallery = galleryPage.querySelector('[data-adult-gallery]');
  const dialog = document.querySelector('.gallery-password-dialog');
  const form = document.querySelector('#gallery-password-form');
  const input = document.querySelector('#gallery-password');
  const error = document.querySelector('#gallery-password-error');
  const submit = form.querySelector('[type="submit"]');
  const relock = galleryPage.querySelector('[data-gallery-relock]');
  const loadImage = card => {
    if (card.closest('[data-adult-gallery]') && !unlocked) return;
    const image = card.querySelector('[data-gallery-image]');
    if (image.dataset.requested) return;
    image.dataset.requested = 'true';
    image.addEventListener('load', () => {
      if (!image.naturalWidth) return;
      card.dataset.state = 'ready';
      image.hidden = false;
      card.querySelector('.gallery-placeholder').hidden = true;
      card.querySelector('.gallery-original').hidden = false;
    }, {once:true});
    image.addEventListener('error', () => {
      card.dataset.state = 'unavailable';
      image.hidden = true;
    }, {once:true});
    image.src = image.dataset.src;
  };
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      if (card.closest('[data-gallery-group]').hidden) return;
      if (card.closest('[data-adult-gallery]') && !unlocked) return;
      observer.unobserve(card);
      loadImage(card);
    });
  }, {rootMargin:'300px'}) : null;
  const registerImages = container => container.querySelectorAll('[data-gallery-card]').forEach(card => {
    if (observer) observer.observe(card);
    else loadImage(card);
  });
  const refresh = () => {
    safeGallery.hidden = mode !== 'safe';
    adultGallery.hidden = mode !== 'adult' || !unlocked;
    galleryPage.querySelectorAll('[data-gallery-group]').forEach(group => {
      group.hidden = selectedPerson !== 'all' && group.dataset.galleryGroup !== selectedPerson;
    });
    galleryPage.querySelectorAll('[data-gallery-mode]').forEach(button => {
      const active = button.dataset.galleryMode === mode;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',String(active));
    });
    const perPerson = mode === 'adult' ? 8 : 11;
    galleryPage.querySelectorAll('[data-gallery-filter]').forEach(button => {
      const active = button.dataset.galleryFilter === selectedPerson;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',String(active));
      button.querySelector('span').textContent = button.dataset.galleryFilter === 'all' ? perPerson * 4 : perPerson;
    });
    relock.hidden = !unlocked;
    galleryPage.querySelector('.gallery-status').textContent = `${mode === 'adult' ? '언세이프' : '세이프'} · ${names[selectedPerson]} · ${selectedPerson === 'all' ? perPerson * 4 : perPerson}개 이미지 자리`;
  };
  galleryPage.querySelectorAll('[data-gallery-filter]').forEach(button => button.addEventListener('click', () => {
    selectedPerson = button.dataset.galleryFilter;
    refresh();
  }));
  galleryPage.querySelectorAll('[data-gallery-mode]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.galleryMode === 'adult' && !unlocked) {
      form.reset();
      error.textContent = '';
      dialog.showModal();
      input.focus();
      return;
    }
    mode = button.dataset.galleryMode;
    refresh();
  }));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submit.disabled) return;
    submit.disabled = true;
    error.textContent = '';
    try {
      const valid = await checkGalleryPassword(input.value);
      if (!dialog.open) return;
      if (!valid) {
        error.textContent = '비밀번호가 올바르지 않습니다.';
        input.focus();
        return;
      }
      unlocked = true;
      adultGallery.append(document.querySelector('#adult-gallery-template').content.cloneNode(true));
      mode = 'adult';
      refresh();
      registerImages(adultGallery);
      dialog.close();
    } catch {
      error.textContent = '비밀번호를 확인하지 못했습니다. 다시 시도해주세요.';
    } finally {
      submit.disabled = false;
    }
  });
  form.querySelector('[data-password-cancel]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { form.reset(); error.textContent = ''; });
  relock.addEventListener('click', () => {
    unlocked = false;
    adultGallery.querySelectorAll('[data-gallery-card]').forEach(card => {
      observer?.unobserve(card);
      card.querySelector('img').removeAttribute('src');
    });
    adultGallery.replaceChildren();
    mode = 'safe';
    refresh();
    galleryPage.querySelector('[data-gallery-mode="adult"]').focus();
  });
  registerImages(safeGallery);
  refresh();
}
