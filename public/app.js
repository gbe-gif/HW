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

const galleryCards = document.querySelectorAll('[data-gallery-card]');
if (galleryCards.length) {
  const loadGalleryImage = card => {
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
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        loadGalleryImage(entry.target);
      });
    }, {rootMargin:'300px'});
    galleryCards.forEach(card => observer.observe(card));
  } else {
    galleryCards.forEach(loadGalleryImage);
  }
  const galleryNames = {all:'전체',D:'데클란',J:'제이스',T:'토비',C:'콜튼'};
  document.querySelectorAll('[data-gallery-filter]').forEach(button => {
    button.addEventListener('click', () => {
      const code = button.dataset.galleryFilter;
      document.querySelectorAll('[data-gallery-filter]').forEach(filter => {
        const active = filter === button;
        filter.classList.toggle('active', active);
        filter.setAttribute('aria-pressed', String(active));
      });
      document.querySelectorAll('[data-gallery-group]').forEach(group => {
        group.hidden = code !== 'all' && group.dataset.galleryGroup !== code;
      });
      document.querySelector('.gallery-status').textContent = `${galleryNames[code]} · ${code === 'all' ? 44 : 11}개 이미지 자리`;
    });
  });
}
