(() => {
  'use strict';
  const data = window.PORTFOLIO_DATA;
  if (!data) return;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const safe = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const brandLogoEl = document.getElementById('brand-logo');
  if (brandLogoEl && data.brandLogo) {
    brandLogoEl.src = data.brandLogo;
  }

  // Deliberately designed stand-in visuals. These are NOT previews of actual renders.
  function conceptualArt(visual, extraClass = '') {
    if (visual === 'titans') {
      return `<div class="visual visual-titans ${extraClass}" aria-hidden="true"><div class="titans-glow"></div><div class="titans-stage">${[65,78,91,100,85,73,61].map(h=>`<i class="titan-pillar" style="--h:${h}%"></i>`).join('')}</div><span class="visual-word">VII</span><span class="visual-label">TEMPORARY ART DIRECTION STUDY</span></div>`;
    }
    if (visual === 'cosmic') {
      return `<div class="visual visual-cosmic ${extraClass}" aria-hidden="true"><div class="cosmic-dust"></div><div class="starfield"></div><div class="orbit"></div><div class="orbit orbit-2"></div><span class="visual-label">TEMPORARY ART DIRECTION STUDY</span></div>`;
    }
    return `<div class="visual visual-technical ${extraClass}" aria-hidden="true"><div class="technical-grid"></div><svg class="tech-drawing" viewBox="0 0 870 600" preserveAspectRatio="xMidYMid meet"><path d="M94 335 L207 280 L320 326 L414 230 L565 290 L687 207 L808 236"/><path d="M207 280 L192 400 L115 462 M320 326 L318 441 L269 486 M565 290 L578 414 L624 481 M687 207 L709 365 L769 428"/><path class="accent" d="M88 462 H187 M260 486 H349 M574 481 H667 M734 428 H822"/><path class="dash" d="M108 150 H770 M111 526 H766 M194 100 V535 M600 100 V535"/>${[[94,335],[207,280],[320,326],[414,230],[565,290],[687,207],[808,236],[115,462],[269,486],[624,481],[769,428]].map(([x,y],i)=>`<circle class="${i>6?'accent':''}" cx="${x}" cy="${y}" r="${i<7?8:5}"/>`).join('')}<circle class="fill" cx="414" cy="230" r="7"/></svg><span class="visual-label">TEMPORARY ART DIRECTION STUDY</span></div>`;
  }

  const hero = $('#hero');
  const heroSlidesEl = $('#hero-slides');
  const indicatorsEl = $('#slide-indicators');
  let current = 0;
  let timer = null;
  let userPaused = reduceMotion.matches;
  let heroVisible = true;
  const DURATION = 9000;

  data.slides.forEach((slide, i) => {
    const section = document.createElement('div');
    const desktop = slide.framing?.desktop || {};
    const mobile = slide.framing?.mobile || {};
    const rightFramed = desktop.layout === 'right';

    section.className = [
      'hero-slide',
      slide.type === 'image' ? 'hero-image-slide' : '',
      rightFramed ? 'hero-right-framed' : '',
      i === 0 ? 'is-active' : ''
    ].filter(Boolean).join(' ');
    section.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
    section.setAttribute('data-slide', slide.id);

    // Each slide controls its crop and zoom independently at desktop and phone sizes.
    section.style.setProperty('--hero-position', desktop.position || '50% 50%');
    section.style.setProperty('--hero-position-mobile', mobile.position || desktop.position || '50% 50%');
    section.style.setProperty('--hero-zoom', String(desktop.zoom ?? 1));
    section.style.setProperty('--hero-zoom-mobile', String(mobile.zoom ?? desktop.zoom ?? 1));
    section.style.setProperty('--hero-shift-x', desktop.shiftX || '0%');
    section.style.setProperty('--hero-shift-y', desktop.shiftY || '0%');
    section.style.setProperty('--hero-shift-x-mobile', mobile.shiftX || '0%');
    section.style.setProperty('--hero-shift-y-mobile', mobile.shiftY || '0%');
    section.style.setProperty('--hero-flip', desktop.flipX ? '-1' : '1');
    section.style.setProperty('--hero-flip-mobile', mobile.flipX ? '-1' : '1');
    section.style.setProperty('--hero-frame-width', desktop.width || '65%');

    if (slide.type === 'image') {
      section.innerHTML = `<div class="hero-media-frame"><img class="hero-slide-media" src="${safe(slide.src)}" alt="" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}></div>`;
    } else if (slide.type === 'video') {
      const format = /\.mov(?:$|\?)/i.test(slide.src) ? 'video/quicktime' : 'video/mp4';
      section.innerHTML = `<div class="hero-media-frame"><video class="hero-slide-media" muted loop playsinline preload="metadata" aria-hidden="true" ${slide.poster ? `poster="${safe(slide.poster)}"` : ''}><source src="${safe(slide.src)}" type="${format}"></video></div>`;
      if (slide.poster) {
        section.querySelector('.hero-media-frame').style.backgroundImage = `url("${encodeURI(slide.poster)}")`;
      }
      section.querySelector('video').addEventListener('error', () => section.classList.add('hero-video-unavailable'));
      section.querySelector('source').addEventListener('error', () => { section.classList.add('hero-video-unavailable'); console.warn(`[Portfolio] Video unavailable: ${slide.src}. Check the exact filename and extension in assets/.`); });
    } else {
      section.innerHTML = conceptualArt(slide.visual);
    }

    heroSlidesEl.append(section);
    const indicator = document.createElement('button');
    indicator.type = 'button';
    indicator.className = `slide-indicator ${i === 0 ? 'is-active' : ''}`;
    indicator.setAttribute('aria-label', `Slide ${i + 1}: ${slide.title}${slide.visualStatus === 'placeholder' ? ', placeholder artwork' : ''}`);
    indicator.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    indicator.innerHTML = `<span class="indicator-n">${String(i + 1).padStart(2, '0')}</span><span class="indicator-bar"><span class="indicator-fill"></span></span>`;
    indicator.addEventListener('click', () => { stopAutoplay(); showSlide(i); });
    indicatorsEl.append(indicator);
  });

  function syncVideos() {
    $$('#hero-slides video').forEach(video => {
      const active = video.closest('.hero-slide')?.classList.contains('is-active');
      if (active && heroVisible && !document.hidden && !reduceMotion.matches) video.play().catch(() => { video.closest('.hero-slide')?.classList.add('hero-video-unavailable'); });
      else video.pause();
    });
  }
  function showSlide(index) {
    current = (index + data.slides.length) % data.slides.length;
    $$('.hero-slide',heroSlidesEl).forEach((el,i) => {
      el.classList.toggle('is-active', i === current);
      el.setAttribute('aria-hidden', i === current ? 'false':'true');
    });
    $$('.slide-indicator',indicatorsEl).forEach((el,i) => {
      el.classList.toggle('is-active', i === current);
      el.classList.toggle('is-playing', i === current && !userPaused && !document.hidden);
      el.setAttribute('aria-pressed', i === current ? 'true':'false');
    });
    const s=data.slides[current];
    $('#slide-category').textContent=s.category;
    $('#slide-title').textContent=s.title;
    $('#slide-copy').textContent=s.caption;
    syncVideos();
  }
  function startAutoplay() {
    clearInterval(timer);
    if (userPaused || !heroVisible || document.hidden || reduceMotion.matches) return;
    timer=setInterval(()=>showSlide(current+1),DURATION);
    showSlide(current);
  }
  function stopAutoplay() {
    clearInterval(timer);
    timer=null;
    userPaused=true;
    $('#carousel-pause').textContent='▶';
    $('#carousel-pause').setAttribute('aria-label','Resume slideshow');
    $('#carousel-pause').title='Resume slideshow';
    showSlide(current);
  }
  $('#carousel-prev').addEventListener('click',()=>{stopAutoplay();showSlide(current-1)});
  $('#carousel-next').addEventListener('click',()=>{stopAutoplay();showSlide(current+1)});
  // Click the outer edges of the hero to navigate without reaching the small arrows.
  // Keep links, buttons, selected text and touch swipes free from accidental navigation.
  const edgeWidth = 0.18; // first/last 18% of the visible hero
  let edgeSwipe = false;
  function getHeroEdge(clientX) {
    const rect = hero.getBoundingClientRect();
    const fraction = (clientX - rect.left) / rect.width;
    return fraction <= edgeWidth ? -1 : fraction >= (1 - edgeWidth) ? 1 : 0;
  }
  hero.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    const inControl = event.target.closest('a, button, input, textarea, select, [role="button"]');
    hero.dataset.carouselEdge = !inControl && getHeroEdge(event.clientX) ? 'true' : 'false';
  });
  hero.addEventListener('pointerleave', () => { delete hero.dataset.carouselEdge; });
  hero.addEventListener('click', event => {
    if (edgeSwipe) { edgeSwipe = false; return; }
    if (event.target.closest('a, button, input, textarea, select, [role="button"]')) return;
    if (window.getSelection()?.toString()) return;
    const direction = getHeroEdge(event.clientX);
    if (!direction) return;
    stopAutoplay();
    showSlide(current + direction);
  });
  $('#carousel-pause').addEventListener('click',()=>{
    if (!userPaused) {stopAutoplay();return;}
    userPaused=false;
    $('#carousel-pause').textContent='Ⅱ';
    $('#carousel-pause').setAttribute('aria-label','Pause slideshow');
    $('#carousel-pause').title='Pause slideshow';
    startAutoplay();
  });
  hero.addEventListener('keydown',e=>{
    if (e.key === 'ArrowLeft') {e.preventDefault();stopAutoplay();showSlide(current-1)}
    if (e.key === 'ArrowRight') {e.preventDefault();stopAutoplay();showSlide(current+1)}
  });
  let touchX = null;
  hero.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].screenX},{passive:true});
  hero.addEventListener('touchend',e=>{
    if (touchX===null) return;
    const d=e.changedTouches[0].screenX-touchX;
    if (Math.abs(d)>65) {edgeSwipe=true;stopAutoplay();showSlide(current+(d<0?1:-1));setTimeout(()=>{edgeSwipe=false;},350);}
    touchX=null;
  },{passive:true});
  document.addEventListener('visibilitychange',()=>{clearInterval(timer);showSlide(current);if(!document.hidden)startAutoplay();});
  reduceMotion.addEventListener?.('change',()=>{if(reduceMotion.matches)stopAutoplay();else if(!userPaused)startAutoplay()});
  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(entries => {
      heroVisible = entries[0].isIntersecting;
      if (!heroVisible) clearInterval(timer);
      else startAutoplay();
      syncVideos();
    }, {threshold: 0.08});
    heroObserver.observe(hero);
  }
  if (!userPaused) startAutoplay();

  // Sylver Soul: use the actual Fafniir throne scene as the section artwork.
  // The existing abstract illustration remains visible if the asset is missing
  // or browser playback is unavailable. No source file is altered.
  (() => {
    const section = $('#sylver-soul');
    const art = $('.sylver-art', section);
    const src = data.sylverSoulFeature?.video;
    if (!section || !art || !src) return;

    const video = document.createElement('video');
    video.className = 'sylver-background-video';
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.setAttribute('aria-hidden', 'true');
    video.setAttribute('playsinline', '');
    const source = document.createElement('source');
    source.src = src;
    source.type = 'video/mp4';
    video.append(source);
    art.prepend(video);

    const showFrame = () => section.classList.add('sylver-video-ready');
    const handleFailure = () => {
      section.classList.remove('sylver-video-ready');
      video.pause();
    };
    video.addEventListener('loadeddata', showFrame);
    video.addEventListener('error', handleFailure);
    source.addEventListener('error', handleFailure);

    let onScreen = false;
    const syncVideo = () => {
      if (onScreen && !document.hidden && !reduceMotion.matches) {
        video.play().catch(handleFailure);
      } else {
        video.pause();
      }
    };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        onScreen = entries[0].isIntersecting;
        syncVideo();
      }, {rootMargin: '400px 0px', threshold: 0.01});
      observer.observe(section);
    } else {
      onScreen = true;
      syncVideo();
    }
    document.addEventListener('visibilitychange', syncVideo);
    reduceMotion.addEventListener?.('change', syncVideo);
  })();

  // Selected Work: one data record renders a card and its richer project dialog.
  const grid = $('#project-grid');
  const dlg = $('#project-dialog');
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let activeFilter = 'All';
  let activePreview = null;

  function mediaMarkup(project, context = 'card') {
    if (project.art === 'video') {
      // The preview is a real still poster; no video is started until the user hovers.
      // Touch devices keep the poster and can play the video in the detail dialog.
      if (context === 'dialog') {
        const poster = project.image ? ` poster="${safe(project.image)}"` : '';
        return `<video class="showcase-dialog-video" playsinline controls preload="metadata"${poster}><source src="${safe(project.video)}" type="video/mp4">Your browser cannot play this video.</video>`;
      }
      // Never point to a nonexistent poster. A no-PNG card shows a paused frame
      // from the user's original clip; no generated or converted media is required.
      if (!project.image) {
        return `<div class="showcase-media showcase-media--self-poster" aria-hidden="true"><video class="showcase-preview showcase-preview--self" muted loop playsinline preload="metadata" data-preview-time="${Number(project.previewTime || 0.4)}"><source src="${safe(project.hoverVideo || project.video)}" type="video/mp4"></video><span class="showcase-load-note">VIDEO PREVIEW</span></div>`;
      }
      const hover = project.hoverVideo
        ? `<video class="showcase-preview" muted loop playsinline preload="none" poster="${safe(project.image)}"><source src="${safe(project.hoverVideo)}" type="video/mp4"></video>`
        : '';
      return `<div class="showcase-media" aria-hidden="true"><img class="showcase-poster" src="${safe(project.image)}" alt="" loading="lazy" decoding="async">${hover}</div>`;
    }
    if (project.art === 'image') {
      const framed = project.imageFit === 'contain';
      const backdrop = framed && context === 'card'
        ? `<img class="showcase-backdrop" src="${safe(project.image)}" alt="" loading="lazy" decoding="async">`
        : '';
      return `<div class="showcase-media${framed ? ' showcase-media--framed' : ''}">${backdrop}<img class="showcase-still" src="${safe(project.image)}" alt="${context === 'dialog' ? safe(project.title) + ' artwork' : ''}" ${context === 'card' ? 'loading="lazy" decoding="async"' : ''}></div>`;
    }
    return conceptualArt(project.art,context === 'card' ? 'card-art' : '');
  }

  function stopPreview() {
    if (!activePreview) return;
    const video = activePreview.querySelector('video');
    if (video) {
      video.pause();
      if (video.classList.contains('showcase-preview--self')) {
        const t = Number(video.dataset.previewTime || .4);
        if (Number.isFinite(t) && video.readyState >= 1 && video.duration > t) video.currentTime = t;
      }
    }
    activePreview.classList.remove('is-previewing');
    activePreview = null;
  }
  function startPreview(card) {
    if (!hasFinePointer.matches || reduceMotion.matches || document.hidden) return;
    const video = card.querySelector('.showcase-preview');
    if (!video || !card.isConnected) return;
    if (activePreview && activePreview !== card) stopPreview();
    activePreview = card;
    video.play().then(() => {
      if (activePreview === card && card.matches(':hover')) card.classList.add('is-previewing');
      else video.pause();
    }).catch(() => {card.classList.remove('is-previewing');});
  }

  function projectCard(project, index, total) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `showcase-card showcase-card--${project.layout === 'lead' ? 'lead' : 'companion'}${project.visualStatus === 'placeholder' ? ' showcase-card--pending' : ''}`;
    card.setAttribute('aria-label', `Open ${project.title} project details`);
    if (project.focus) card.style.setProperty('--showcase-focus', project.focus);
    const pending = project.visualStatus === 'placeholder';
    const status = pending ? '<span class="showcase-status">Artwork coming soon</span>' : '';
    card.innerHTML = `
      ${mediaMarkup(project)}
      <span class="showcase-vignette" aria-hidden="true"></span>
      <span class="showcase-topline"><span class="showcase-index">${String(index+1).padStart(2,'0')} <span>/ ${String(total).padStart(2,'0')}</span></span><span class="showcase-type">${safe(project.mediaLabel || 'PROJECT')}</span></span>
      <span class="showcase-bottomline"><span class="showcase-copy"><span class="showcase-kicker">${safe(project.subtitle)}</span><span class="showcase-title">${safe(project.title)}</span><span class="showcase-teaser">${safe(project.teaser || '')}</span>${status}</span><span class="showcase-view" aria-hidden="true">↗</span></span>`;
    const selfPoster = card.querySelector('.showcase-preview--self');
    if (selfPoster) {
      // Seeking to a useful opening frame retains video detail without a PNG export.
      selfPoster.addEventListener('loadedmetadata', () => {
        const t = Number(selfPoster.dataset.previewTime || .4);
        if (Number.isFinite(t) && t > 0 && selfPoster.duration > t) selfPoster.currentTime = t;
      }, { once: true });
      selfPoster.addEventListener('loadeddata', () => card.classList.add('has-video-frame'));
      selfPoster.addEventListener('error', () => card.classList.add('video-preview-unavailable'));
      const source = selfPoster.querySelector('source');
      source?.addEventListener('error', () => card.classList.add('video-preview-unavailable'));
    }
    card.addEventListener('click', () => openProject(project));
    card.addEventListener('pointerenter', event => {if (event.pointerType === 'mouse') startPreview(card);});
    card.addEventListener('pointerleave', stopPreview);
    // Keep preview still when keyboard focusing; activation opens the media player.
    return card;
  }

  function renderProjects() {
    stopPreview();
    const filtered = data.projects.filter(p => activeFilter === 'All' || p.disciplines.includes(activeFilter) || p.collection === activeFilter);
    // Select four distinct specialties for the unfiltered homepage rather than
    // repeating the same four visuals that already appear in the hero carousel.
    const homeSelection = ['neylith', 'scientist-monkeys', 'locomotion', 'titans'];
    const featured = activeFilter === 'All'
      ? homeSelection.map(id => filtered.find(p => p.id === id)).filter(Boolean)
      : filtered.slice(0, 4);
    grid.classList.toggle('is-filtered', activeFilter !== 'All');
    grid.replaceChildren(...featured.map((p,i) => projectCard(p,i,featured.length)));
    const count = $('#gallery-count');
    if (count) count.textContent = activeFilter === 'All' ? `${String(featured.length).padStart(2,'0')} FEATURED · ${String(data.projects.length).padStart(2,'0')} TOTAL` : `${String(featured.length).padStart(2,'0')} SHOWN · ${String(filtered.length).padStart(2,'0')} MATCHES`;
  }

  function filterProjects(filter, scroll = false) {
    activeFilter = filter;
    $$('.filter-button').forEach(el => {
      const isCurrent = el.dataset.filter === filter;
      el.classList.toggle('is-active',isCurrent);
      el.setAttribute('aria-pressed',String(isCurrent));
    });
    renderProjects();
    if (scroll) $('#selected-work').scrollIntoView({behavior: reduceMotion.matches ? 'instant' : 'smooth'});
  }

  const filterRow = $('#portfolio-filters');
  const sylverFilter = document.createElement('button');
  sylverFilter.className = 'filter-button';
  sylverFilter.dataset.filter = 'Sylver Soul';
  sylverFilter.type = 'button';
  sylverFilter.textContent = 'Sylver Soul';
  sylverFilter.setAttribute('aria-pressed','false');
  filterRow.append(sylverFilter);
  const galleryCount = document.createElement('span');
  galleryCount.id = 'gallery-count';
  galleryCount.className = 'gallery-count';
  galleryCount.setAttribute('aria-live','polite');
  filterRow.append(galleryCount);
  $$('.filter-button').forEach(btn => btn.addEventListener('click',() => filterProjects(btn.dataset.filter)));
  // The production detail page is still in development: make the CTA transparent.
  $('#sylver-work-button').addEventListener('click',() => { window.location.href = 'under-construction/index.html?section=sylver-soul'; });
  renderProjects();
  // The full-gallery CTA is authored in HTML so it works even without JavaScript.
  document.addEventListener('visibilitychange',() => {if(document.hidden) stopPreview();});
  if ('IntersectionObserver' in window) {
    const previewObserver = new IntersectionObserver(entries => {
      if (entries.some(e => !e.isIntersecting && e.target === activePreview)) stopPreview();
    },{threshold:0.05});
    // Rebind each time cards are filtered using event delegation on grid.
    const watch = new MutationObserver(() => $$('.showcase-card',grid).forEach(el => previewObserver.observe(el)));
    watch.observe(grid,{childList:true});
    $$('.showcase-card',grid).forEach(el => previewObserver.observe(el));
  }

  function openProject(project) {
    stopPreview();
    const dialogArt = $('#dialog-art');
    dialogArt.innerHTML = mediaMarkup(project,'dialog');
    // Add related original recordings only when a project actually has them.
    // The larger beetle video is never fetched unless the visitor chooses it.
    let versions = $('#project-versions');
    if (!versions) {
      versions = document.createElement('div');
      versions.id = 'project-versions';
      versions.className = 'project-versions';
      dialogArt.insertAdjacentElement('afterend', versions);
    }
    versions.replaceChildren();
    const videoSources = project.art === 'video'
      ? [{title: 'Main preview', src: project.video}, ...(project.supportingVideos || [])]
      : [];
    if (videoSources.length > 1) {
      versions.setAttribute('aria-label', 'Switch between project recordings');
      videoSources.forEach((item, n) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `project-version${n === 0 ? ' is-active' : ''}`;
        button.textContent = item.title;
        button.setAttribute('aria-pressed', String(n === 0));
        button.addEventListener('click', () => {
          const previous = dialogArt.querySelector('video');
          if (previous) previous.pause();
          dialogArt.innerHTML = `<video class="showcase-dialog-video" playsinline controls preload="metadata"><source src="${safe(item.src)}" type="video/mp4">Your browser cannot play this video.</video>`;
          $$('.project-version', versions).forEach(b => {
            const active = b === button;
            b.classList.toggle('is-active', active);
            b.setAttribute('aria-pressed', String(active));
          });
        });
        versions.append(button);
      });
    }
    $('#dialog-subtitle').textContent = project.subtitle;
    $('#dialog-title').textContent = project.title;
    $('#dialog-description').textContent = project.description;
    $('#dialog-meta').replaceChildren(...[project.medium,...project.disciplines,project.collection].map(label => {
      const el = document.createElement('span');
      el.textContent = label;
      return el;
    }));
    const fullCaseLink = $('#dialog-case-link');
    if (fullCaseLink) { fullCaseLink.href = `projects/${encodeURIComponent(project.hrefId || project.id)}/index.html`; fullCaseLink.textContent = `Explore ${project.title} case study ↗`; }
    $('#dialog-footnote').textContent = project.visualStatus === 'placeholder'
      ? 'Temporary conceptual art. Original renders and process material will be added during the content pass.'
      : 'Selected original project media. Expanded breakdowns and credits will be added in the next phase.';
    dlg.showModal();
  }
  function closeProject() {
    const dialogVideo = $('#dialog-art video');
    if (dialogVideo) dialogVideo.pause();
    dlg.close();
  }
  $('#dialog-close').addEventListener('click',closeProject);
  dlg.addEventListener('click',event => {if (event.target === dlg) closeProject();});
  dlg.addEventListener('close',() => {const video = $('#dialog-art video'); if(video) video.pause();});

  // Navigation: no dead destinations in the prototype.
  const header=$('#site-header');
  const toggle=$('#menu-toggle');
  const mobileNav=$('#mobile-nav');
  function closeMenu(){toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open menu');mobileNav.hidden=true;}
  toggle.addEventListener('click',()=>{
    const open=toggle.getAttribute('aria-expanded')!=='true';
    toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close menu':'Open menu');mobileNav.hidden=!open;
  });
  $$('#mobile-nav a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
  function syncHeader(){header.classList.toggle('scrolled',window.scrollY>40)}
  window.addEventListener('scroll',syncHeader,{passive:true});syncHeader();

  // A direct email call to action turns on once the user enters their public address.
  if (data.contactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
    const contact=$('#contact-link');
    contact.href=`mailto:${data.contactEmail}?subject=Project%20inquiry`;
    contact.textContent='Send an inquiry ↗';
    contact.removeAttribute('target');contact.removeAttribute('rel');
    $('#contact-hint').textContent=data.contactEmail;
  }
  $('#year').textContent=String(new Date().getFullYear());
})();
