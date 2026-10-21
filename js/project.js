(() => {
  'use strict';
  const root = document.getElementById('case-render-root');
  const main = document.getElementById('case-main');
  const id = main?.dataset.projectId;
  const studies = window.PORTFOLIO_DATA?.caseStudies || {};
  const project = studies[id];
  const galleryProject = (window.PORTFOLIO_DATA?.projects || []).find(item => item.id === id);
  if (!root || (!project && !galleryProject)) return;
  const escapeHtml = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // All project pages sit two directories deep; the source paths in content.js
  // are intentionally relative to the root portfolio directory.
  const asset = (v) => '../../' + String(v ?? '').replace(/^\/+/, '');

  const imageOrVideo = (entry, cls = '') => {
    if (entry.art === 'image') return `<img class="${cls}" src="${escapeHtml(asset(entry.image))}" alt="${escapeHtml(entry.title)}" loading="eager">`;
    if (entry.video) return `<video class="${cls}" controls playsinline preload="metadata" aria-label="${escapeHtml(entry.title)}"><source src="${escapeHtml(asset(entry.video))}" type="video/mp4">Your browser cannot play this video.</video>`;
    return '<p class="generic-no-media">Supporting artwork will be added to this project.</p>';
  };
  // Browse directly between full-collection project case studies without returning to Work.
  // Drawn from the same content source as the Work index (including standalone case studies).
  function initProjectNeighbours(container) {
    const hero=container.querySelector('.full-bleed-project');
    if (!hero) return;
    const library=[...(window.PORTFOLIO_DATA?.projects || []),
      ...Object.entries(window.PORTFOLIO_DATA?.caseStudies || {}).map(([caseId,entry])=>({id:caseId,title:entry.title}))];
    const index=library.findIndex(item=>item.id===id || item.hrefId===id);
    if (index<0 || library.length<2) return;
    const prev=library[(index - 1 + library.length) % library.length];
    const next=library[(index + 1) % library.length];
    const dest=item=>`../../projects/${encodeURIComponent(item.hrefId || item.id)}/index.html`;
    const nav=document.createElement('nav');
    nav.className='case-project-neighbours';
    nav.setAttribute('aria-label','Browse other projects');
    nav.innerHTML=`<a class="case-project-neighbour" href="${dest(prev)}" aria-label="Previous project: ${escapeHtml(prev.title)}" title="Previous: ${escapeHtml(prev.title)}"><span aria-hidden="true">←</span><span class="case-project-neighbour-caption">Previous project</span></a>`+
      `<a class="case-project-neighbour" href="${dest(next)}" aria-label="Next project: ${escapeHtml(next.title)}" title="Next: ${escapeHtml(next.title)}"><span class="case-project-neighbour-caption">Next project</span><span aria-hidden="true">→</span></a>`;
    hero.appendChild(nav);
  }
  // Poster imagery and motion are full-bleed in the project hero, like the homepage.
  // The videos below remain independently playable after scrolling.
  const heroMedia = (entry) => {
    const videoSrc = entry.heroVideo || entry.video || entry.media?.[0]?.src;
    const poster = entry.image ? ` poster="${escapeHtml(asset(entry.image))}"` : '';
    if (videoSrc) return `<video class="case-hero-motion generic-hero-media" autoplay muted loop playsinline preload="metadata"${poster} aria-label="Background motion preview of ${escapeHtml(entry.title)}"><source src="${escapeHtml(asset(videoSrc))}" type="video/mp4"></video>`;
    if (entry.image) return `<img class="generic-hero-media" src="${escapeHtml(asset(entry.image))}" alt="" decoding="async" fetchpriority="high">`;
    return '<div class="generic-hero-unavailable">Project artwork is being prepared.</div>';
  };
  // A hero is an invitation to inspect the actual art, not only the title.
  // Overlay hit target sits below text/navigation but above the media itself.
  const heroPreviewTrigger = (title) => `<button type="button" class="case-art-inspect" data-open-hero-media aria-label="View ${escapeHtml(title)} artwork without text"><span>↗ &nbsp; View artwork</span></button>`;
  function initMediaViewer(container, options) {
    const hero = container.querySelector('.full-bleed-project');
    if (!hero) return;
    const dialog = document.createElement('dialog');
    dialog.className = 'case-art-dialog';
    dialog.setAttribute('aria-label','Artwork preview');
    dialog.innerHTML = `<div class="case-art-dialog-inner"><div class="case-art-dialog-toolbar"><span class="case-art-dialog-title" aria-live="polite"></span><div class="case-art-dialog-controls"><button type="button" class="case-art-dialog-zoom-out" aria-label="Zoom out">−</button><button type="button" class="case-art-dialog-zoom-in" aria-label="Zoom in">+</button><button type="button" class="case-art-dialog-reset">Reset view</button><button type="button" class="case-art-dialog-full">Fullscreen ↗</button><button type="button" class="case-art-dialog-close" aria-label="Close artwork preview">Close ×</button></div></div><div class="case-art-dialog-stage"><button type="button" class="case-art-dialog-prev" aria-label="Previous image" hidden><span aria-hidden="true">‹</span></button><button type="button" class="case-art-dialog-next" aria-label="Next image" hidden><span aria-hidden="true">›</span></button></div></div>`;
    document.body.appendChild(dialog);
    const stage = dialog.querySelector('.case-art-dialog-stage');
    const zoomIn = dialog.querySelector('.case-art-dialog-zoom-in');
    const zoomOut = dialog.querySelector('.case-art-dialog-zoom-out');
    const reset = dialog.querySelector('.case-art-dialog-reset');
    const fullscreen = dialog.querySelector('.case-art-dialog-full');
    const close = dialog.querySelector('.case-art-dialog-close');
    const title = dialog.querySelector('.case-art-dialog-title');
    const prev = dialog.querySelector('.case-art-dialog-prev');
    const next = dialog.querySelector('.case-art-dialog-next');
    let previousFocus = null, media, zoom = 1, panX = 0, panY = 0, dragging = null;
    let currentGallery = [], currentIndex = 0;
    function transform() {
      if (!media || media.tagName !== 'IMG') return;
      media.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
      media.classList.toggle('can-pan',zoom > 1);
      zoomOut.disabled = zoom <= 1;
      zoomIn.disabled = zoom >= 4;
      reset.disabled = zoom === 1 && panX === 0 && panY === 0;
    }
    function setZoom(level) {
      zoom = Math.max(1,Math.min(4,Math.round(level*100)/100));
      if (zoom === 1) { panX=0;panY=0; }
      transform();
    }
    function render(kind, src, name) {
      if (media?.pause) media.pause();
      media?.remove();
      media = document.createElement(kind === 'video' ? 'video' : 'img');
      media.className = 'case-art-dialog-media';
      if (kind === 'video') { media.controls=true;media.playsInline=true;media.preload='metadata'; }
      else { media.alt=name || 'Full artwork preview';media.draggable=false; }
      media.src=asset(src);
      stage.prepend(media);
      const multiple = kind === 'image' && currentGallery.length > 1;
      prev.hidden = !multiple;
      next.hidden = !multiple;
      title.textContent = multiple ? `${String(currentIndex+1).padStart(2,'0')} / ${String(currentGallery.length).padStart(2,'0')}  ·  ${name || 'Artwork'}` : (name || 'Artwork');
      [zoomIn,zoomOut,reset].forEach(b=>b.hidden=kind!=='image');
      zoom=1;panX=0;panY=0;dragging=null;
      if (kind === 'image') transform();
      if (kind === 'video') media.play().catch(()=>{});
    }
    function open(kind, src, name, gallery = [], index = 0) {
      if (!src) return;
      previousFocus=document.activeElement;
      currentGallery=gallery;
      currentIndex=index;
      render(kind,src,name);
      if (!dialog.open) dialog.showModal();
      close.focus();
    }
    function move(delta) {
      if (!currentGallery.length || !dialog.open || media?.tagName!=='IMG') return;
      currentIndex=(currentIndex+delta+currentGallery.length)%currentGallery.length;
      const item=currentGallery[currentIndex];
      render('image',item.src,item.title);
    }
    container.querySelector('[data-open-hero-media]')?.addEventListener('click',()=>open(options.kind,options.src,options.title));
    container.querySelectorAll('[data-preview-image]').forEach(button=>button.addEventListener('click',()=>{
      const group=button.dataset.galleryGroup;
      const members=group ? [...container.querySelectorAll('[data-gallery-group]')].filter(el=>el.dataset.galleryGroup===group) : [];
      const gallery=members.map(el=>({src:el.dataset.previewImage,title:el.dataset.previewTitle}));
      const index=Math.max(0,members.indexOf(button));
      open('image',button.dataset.previewImage,button.dataset.previewTitle,gallery,index);
    }));
    prev.addEventListener('click',()=>move(-1));
    next.addEventListener('click',()=>move(1));
    dialog.addEventListener('keydown',event=>{
      if (event.key==='ArrowLeft' || event.key==='ArrowRight') {
        if (media?.tagName!=='IMG' || currentGallery.length<2) return;
        event.preventDefault();move(event.key==='ArrowRight'?1:-1);
      }
    });
    zoomIn.addEventListener('click',()=>setZoom(zoom+.5));
    zoomOut.addEventListener('click',()=>setZoom(zoom-.5));
    reset.addEventListener('click',()=>setZoom(1));
    stage.addEventListener('wheel',event=>{
      if (!dialog.open || media?.tagName!=='IMG') return;
      event.preventDefault();setZoom(zoom+(event.deltaY<0?.2:-.2));
    },{passive:false});
    stage.addEventListener('pointerdown',event=>{
      if (event.target.closest('button') || media?.tagName!=='IMG' || zoom<=1) return;
      dragging={id:event.pointerId,x:event.clientX,y:event.clientY,panX,panY};
      stage.setPointerCapture(event.pointerId);
    });
    stage.addEventListener('pointermove',event=>{
      if (!dragging || dragging.id!==event.pointerId) return;
      panX=dragging.panX+event.clientX-dragging.x;
      panY=dragging.panY+event.clientY-dragging.y;
      transform();
    });
    const stopDrag=()=>dragging=null;
    stage.addEventListener('pointerup',stopDrag);
    stage.addEventListener('pointercancel',stopDrag);
    fullscreen.addEventListener('click',()=>{
      // Fullscreen the stage, not just the image, so gallery arrows remain available.
      stage.requestFullscreen?.().catch(()=>{});
    });
    close.addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
    dialog.addEventListener('close',()=>{
      if(document.fullscreenElement===stage)document.exitFullscreen?.().catch(()=>{});
      if(media?.pause)media.pause();
      media?.removeAttribute('src');media?.load?.();media?.remove();media=null;
      currentGallery=[];dragging=null;prev.hidden=next.hidden=true;
      previousFocus?.focus?.();
    });
  }
  function initHeroMotion(container) {
    const video = container.querySelector('.case-hero-motion');
    const toggle = container.querySelector('.case-motion-toggle');
    if (!video || !toggle) return;
    const warning = container.querySelector('.case-video-warning');
    function reflect() {
      const paused = video.paused;
      toggle.textContent = paused ? 'Play motion ▶' : 'Pause motion Ⅱ';
      toggle.setAttribute('aria-pressed', String(!paused));
      toggle.setAttribute('aria-label', paused ? 'Play background animation' : 'Pause background animation');
    }
    function failure() {
      if (warning) warning.hidden = false;
      toggle.textContent = 'Video unavailable';
      toggle.setAttribute('aria-label','Background video unavailable; see full recording below');
      toggle.disabled = true;
    }
    toggle.addEventListener('click', async () => {
      if (video.paused) {
        try { await video.play(); if (warning) warning.hidden = true; }
        catch (error) {
          // Browser policies can deny autoplay; leave the control usable for another explicit click.
          if (error.name !== 'NotAllowedError') failure();
        }
      } else video.pause();
      reflect();
    });
    video.addEventListener('loadeddata', () => { if (warning) warning.hidden = true; toggle.disabled = false; reflect(); });
    video.addEventListener('play',reflect);
    video.addEventListener('pause',reflect);
    video.addEventListener('error', failure);
    video.querySelector('source')?.addEventListener('error', failure);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) video.pause();
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (!entries[0]?.isIntersecting) video.pause();
      }, {threshold:0});
      observer.observe(video.closest('.full-bleed-project') || video);
    }
    reflect();
  }
  // Compact, horizontally browseable project stills. Selecting any image opens
  // the shared lightbox, where the entire set stays navigable.
  function stillGallery(entry, number) {
    const gallery = entry.galleryImages || [];
    if (!gallery.length) return '';
    const group=`${entry.id}-stills`;
    return `<section class="case-section still-gallery-section" id="project-stills"><div class="case-section-topline"><span>${number} / PROJECT STILLS</span><small>${gallery.length} images · Select to inspect</small></div>
      <div class="still-gallery-intro"><h2>${escapeHtml(entry.galleryTitle || 'A closer look.')}</h2><p>${escapeHtml(entry.galleryIntro || 'Selected artwork and process stills from this project.')}</p></div>
      <div class="still-gallery" data-still-gallery>
        <button class="still-strip-arrow still-strip-prev" type="button" data-gallery-prev aria-label="Scroll images left"><span aria-hidden="true">‹</span></button>
        <div class="still-gallery-thumbs" data-gallery-track role="group" aria-label="Project images">
          ${gallery.map((item,i)=>`<button type="button" class="still-gallery-thumb" data-gallery-group="${escapeHtml(group)}" data-preview-image="${escapeHtml(item.src)}" data-preview-title="${escapeHtml(item.title)}" aria-label="Inspect ${escapeHtml(item.title)} (image ${i+1} of ${gallery.length})"><img src="${escapeHtml(asset(item.src))}" alt="" loading="lazy"><span class="still-gallery-thumb-label"><strong>${escapeHtml(item.title)}</strong><small>${String(i+1).padStart(2,'0')} / ${String(gallery.length).padStart(2,'0')}</small></span></button>`).join('')}
        </div>
        <button class="still-strip-arrow still-strip-next" type="button" data-gallery-next aria-label="Scroll images right"><span aria-hidden="true">›</span></button>
      </div><p class="still-gallery-tip">Scroll or use the arrows to browse. Select an image to view it larger, then use the arrows inside the viewer.</p></section>`;
  }
  function initStillGalleries(container) {
    container.querySelectorAll('[data-still-gallery]').forEach(gallery=>{
      const track=gallery.querySelector('[data-gallery-track]');
      const buttons=[...track.querySelectorAll('.still-gallery-thumb')];
      const prev=gallery.querySelector('[data-gallery-prev]');
      const next=gallery.querySelector('[data-gallery-next]');
      function updateArrows() {
        const max=track.scrollWidth-track.clientWidth;
        prev.disabled=track.scrollLeft<=2;
        next.disabled=track.scrollLeft>=max-2;
      }
      function scroll(delta) {
        // Move a little less than a full strip, leaving the next image visible.
        track.scrollBy({left:delta * Math.max(180,track.clientWidth*.75),behavior:'smooth'});
      }
      prev.addEventListener('click',()=>scroll(-1));
      next.addEventListener('click',()=>scroll(1));
      track.addEventListener('scroll',updateArrows,{passive:true});
      window.addEventListener('resize',updateArrows,{passive:true});
      requestAnimationFrame(updateArrows);
      // A native scrollable strip also supports touch swipe and trackpad scrolling.
    });
  }
  const genericProject = (entry) => {
    let sectionNumber=1;
    const number=()=>String(++sectionNumber).padStart(2,'0');
    const omitDuplicateHero = entry.id === 'sky-jellies';
    const role = entry.roleIntro ? `<section class="case-section" id="project-role"><div class="case-section-topline"><span>${number()} / MY ROLE</span><small>Selected creative contributions · Collaborative production</small></div><div class="generic-intro"><h2>My <em>contribution.</em></h2><p>${escapeHtml(entry.roleIntro)}</p></div></section>` : '';
    const primary = entry.video && !omitDuplicateHero ? `<section class="case-section" id="project-full-presentation"><div class="case-section-topline"><span>${number()} / FULL PRESENTATION</span><small>Play the original recording</small></div>${videoPanel({title:entry.title,label:'PROJECT MEDIA',src:entry.video,caption:'Original project media with full playback controls.'})}</section>` : '';
    const extras = (entry.supportingVideos || []).map(m=>`<article class="case-section"><div class="case-section-topline"><span>${number()} / ADDITIONAL DEMONSTRATION</span><small>${escapeHtml(m.title)}</small></div>${videoPanel({title:m.title,label:'SUPPORTING MEDIA',src:m.src,caption:m.caption || m.note || 'Additional production footage for this project.'})}</article>`).join('');
    const gallery=stillGallery(entry,number());
    const focus=escapeHtml(entry.heroFocus || entry.focus || '60% center');
    const secondaryJump=entry.video && !omitDuplicateHero ? '<a href="#project-full-presentation" class="generic-jump">Play full video ↗</a>' : (entry.supportingVideos?.length ? '<a href="#project-stills" class="generic-jump">Explore the gallery ↗</a>' : '');
    return `<section class="generic-hero full-bleed-project" style="--project-focus:${focus};" data-media-fit="${entry.imageFit === 'contain' ? 'contain' : 'cover'}"><div class="generic-hero-art">${heroMedia(entry)}</div>${heroPreviewTrigger(entry.title)}<div class="generic-hero-copy"><p class="case-kicker">PROJECT / ${escapeHtml(entry.subtitle)}</p><h1>${escapeHtml(entry.title)}</h1><p>${escapeHtml(entry.teaser)}</p><div class="generic-hero-actions"><a href="#project-details" class="generic-jump">Explore the work ↓</a>${secondaryJump}</div></div>${entry.video ? '<button class="case-motion-toggle" type="button" aria-label="Pause background animation" aria-pressed="true">Pause motion Ⅱ</button><p class="case-video-warning" hidden role="status">Background preview unavailable. Use the artwork viewer.</p>' : ''}</section>
      <section class="case-section generic-details" id="project-details"><div class="case-section-topline"><span>01 / PROJECT OVERVIEW</span><small>${escapeHtml(entry.medium)}</small></div><div class="generic-intro"><h2>Inside the <em>project.</em></h2><div><p>${escapeHtml(entry.description)}</p><div class="case-tags">${(entry.disciplines||[]).map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div><p class="generic-collection">${escapeHtml(entry.collection)} · Further renders and process breakdowns will be added as they are curated.</p></div></div></section>
      ${role}${primary}${extras}${gallery}<section class="case-end"><div><p class="case-kicker">KEEP EXPLORING</p><h2>More to <em>discover.</em></h2></div><a class="case-back" href="../../work/index.html">← All work</a></section>`;
  };
  // Extended case studies share the cinematic page shell with generic projects,
  // but provide a single-switch media library and project-specific context.
  const enhancedProject = (entry, feature) => {
    const focus = escapeHtml(entry.heroFocus || entry.focus || '60% center');
    const cards = (feature.sections || []).map(section => `<article class="feature-focus-item">
      <span class="feature-focus-number">${escapeHtml(section.number)}</span>
      <div><h3>${escapeHtml(section.title)}</h3><p>${escapeHtml(section.text)}</p></div>
    </article>`).join('');
    const clips = (feature.clips || []).map((clip, index) => `<button type="button" class="feature-clip-choice${index === 0 ? ' is-active' : ''}" data-clip-index="${index}" aria-pressed="${index === 0}" aria-controls="feature-clip-player"><span>${escapeHtml(clip.label)}</span><span aria-hidden="true">↗</span></button>`).join('');
    const first = feature.clips?.[0];
    const hero = `<section class="generic-hero full-bleed-project" style="--project-focus:${focus};" data-media-fit="${entry.imageFit === 'contain' ? 'contain' : 'cover'}"><div class="generic-hero-art">${heroMedia(entry)}</div>${heroPreviewTrigger(entry.title)}
      <div class="generic-hero-copy"><p class="case-kicker">PROJECT / ${escapeHtml(entry.subtitle)}</p><h1>${escapeHtml(entry.title)}</h1><p>${escapeHtml(entry.teaser)}</p><div class="generic-hero-actions"><a href="#project-details" class="generic-jump">Explore the work ↓</a><a href="#project-motion-library" class="generic-jump">Explore the clips ↗</a></div></div>
      ${entry.video ? '<button class="case-motion-toggle" type="button" aria-label="Pause background animation" aria-pressed="true">Pause motion Ⅱ</button><p class="case-video-warning" hidden role="status">Background preview unavailable. Use the full player below.</p>' : ''}</section>`;
    const overview = `<section class="case-section feature-opening" id="project-details"><div class="case-section-topline"><span>01 / ABOUT THE PROJECT</span><small>${escapeHtml(entry.medium)}</small></div>
        <div class="feature-intro-grid"><div><p class="case-kicker">${escapeHtml(feature.eyebrow)}</p><h2>${escapeHtml(feature.heading)}</h2><div class="case-tags">${(entry.disciplines||[]).map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div></div><p>${escapeHtml(feature.intro)}</p></div>
      </section>`;
    const library = `<section class="case-section" id="project-motion-library"><div class="case-section-topline"><span>${feature.roleIntro ? '02' : '03'} / MOVEMENT LIBRARY</span><small>${feature.clips.length} selectable clips · One video player</small></div>
        <div class="feature-clip-layout" data-clip-library="${escapeHtml(entry.id)}"><div class="feature-clip-controls"><p class="case-kicker">CHOOSE A DEMONSTRATION</p><div class="feature-clip-list" role="group" aria-label="Select an animation to watch">${clips}</div><p class="feature-clip-hint">${feature.loopClips ? 'Choose a movement to watch it loop continuously. Pause or switch clips at any time.' : 'Choose an animation to inspect its motion. Only the selected clip loads into the player.'}</p></div>
          <div class="feature-clip-view"><div class="feature-clip-screen"><video id="feature-clip-player" class="feature-clip-player" preload="metadata" controls playsinline${feature.loopClips ? ' loop' : ''} aria-label="${escapeHtml(first?.title || 'Movement demonstration')}"><source src="${escapeHtml(asset(first?.src))}" type="video/mp4">Your browser cannot play this video.</video></div>
            <div class="feature-clip-caption" aria-live="polite"><div><h3 id="feature-clip-title">${escapeHtml(first?.title)}</h3><p id="feature-clip-description">${escapeHtml(first?.description)}</p></div><span class="feature-clip-size" id="feature-clip-size"${first?.sizeNote ? '' : ' hidden'}>${escapeHtml(first?.sizeNote)}</span></div>
            <p class="case-video-error feature-clip-error" hidden role="status">This recording could not be loaded. Check its filename inside the assets folder.</p>
          </div></div></section>`;
    const role = feature.roleIntro ? `<section class="case-section feature-role" id="project-role"><div class="case-section-topline"><span>03 / MY ROLE</span><small>Character production · Animation</small></div>
        <div class="feature-role-head"><h2>${escapeHtml(feature.roleTitle).replace(/\n/g,'<br>')}</h2><p>${escapeHtml(feature.roleIntro)}</p></div><div class="feature-role-cards">${(feature.roleCards||[]).map((c,i)=>`<article><span>0${i+1}</span><h3>${escapeHtml(c.title)}</h3><p>${escapeHtml(c.text)}</p></article>`).join('')}</div></section>` : '';
    const gameplay = feature.gameplay ? `<section class="case-section feature-gameplay" id="project-gameplay"><div class="case-section-topline"><span>04 / IN-GAME FOOTAGE</span><small>Real multiplayer match · Sound on</small></div>
       ${videoPanel(feature.gameplay)}<p class="feature-gameplay-note">${escapeHtml(feature.gameplay.note || '')}</p></section>` : '';
    const presentation = feature.roleIntro ? '' : `<section class="case-section" id="project-full-presentation"><div class="case-section-topline"><span>02 / FINISHED PRESENTATION</span><small>Original project footage</small></div>
       ${videoPanel({title:entry.title,label:'FULL PROJECT VIDEO',src:entry.video,caption:entry.description})}</section>`;
    const process = cards ? `<section class="case-section feature-process"><div class="case-section-topline"><span>${feature.roleIntro ? '05' : '04'} / CREATIVE & TECHNICAL FOCUS</span><small>The ideas behind the work</small></div>
        <div class="feature-process-grid">${cards}</div>${feature.futureNote ? `<p class="feature-future">${escapeHtml(feature.futureNote)}</p>` : ''}</section>` : '';
    return `${hero}${overview}${presentation}${library}${role}${gameplay}${process}${stillGallery(entry,feature.roleIntro?'06':'05')}
      <section class="case-end"><div><p class="case-kicker">KEEP EXPLORING</p><h2>More to <em>discover.</em></h2></div><a class="case-back" href="../../work/index.html">← All work</a></section>`;
  };
  function initializeClipLibrary(container, feature) {
    const library = container.querySelector('[data-clip-library]');
    if (!library) return;
    const player = library.querySelector('#feature-clip-player');
    const source = player.querySelector('source');
    const title = library.querySelector('#feature-clip-title');
    const description = library.querySelector('#feature-clip-description');
    const size = library.querySelector('#feature-clip-size');
    const error = library.querySelector('.feature-clip-error');
    const buttons = [...library.querySelectorAll('[data-clip-index]')];
    const clips = feature.clips;
    player.loop = feature.loopClips === true;
    let active = 0;
    // Switching a single player avoids several simultaneous network/video requests.
    // In particular, the extended beetle recording stays unrequested until clicked.
    buttons.forEach(button => button.addEventListener('click', async () => {
      const next = Number(button.dataset.clipIndex);
      if (!Number.isInteger(next) || next < 0 || next >= clips.length) return;
      const clip = clips[next];
      if (next === active) {
        if (player.paused) {
          try { await player.play(); } catch (_) { /* Native player remains usable. */ }
        } else player.pause();
        return;
      }
      active = next;
      player.pause();
      source.src = asset(clip.src);
      player.setAttribute('aria-label', clip.title);
      player.load();
      title.textContent = clip.title;
      description.textContent = clip.description;
      size.hidden = !clip.sizeNote;
      size.textContent = clip.sizeNote || '';
      error.hidden = true;
      buttons.forEach((b,i) => { b.classList.toggle('is-active',i === next); b.setAttribute('aria-pressed',String(i === next)); });
      try { await player.play(); } catch (_) { /* Explicit playback via native controls is available. */ }
    }));
    player.addEventListener('error', () => { error.hidden = false; });
    source.addEventListener('error', () => { error.hidden = false; });
  }
  const videoPanel = (m) => `
    <div class="case-media-frame">
      <video class="case-video" controls playsinline preload="metadata"${m.poster?` poster="${escapeHtml(asset(m.poster))}"`:''} aria-label="${escapeHtml(m.title)}">
        <source src="${escapeHtml(asset(m.src))}" type="video/mp4">
        Your browser cannot play this video.
      </video>
      <p class="case-video-error" hidden role="status">This video could not load. Make sure <code>${escapeHtml(m.src.split('/').pop())}</code> is in your portfolio's <code>assets/</code> folder.</p>
      <div class="case-media-caption"><div><h3>${escapeHtml(m.title)}</h3><p>${escapeHtml(m.caption)}</p></div><span class="case-media-id">${escapeHtml(m.label)}</span></div>
    </div>`;
  const samuraiProject = (entry) => {
    const gallery = [
      ['assets/Samurai_Full_Web.jpg', 'Full-body character', 'Character silhouette, costume layers, and proportions.'],
      ['assets/Samurai_Pose_Study_Web.jpg', 'Character pose study', 'Dynamic pose, anatomy, surface response, and silhouette.'],
      ['assets/Samurai_Anatomy_Web.jpg', 'Anatomy and material study', 'A closer look at exposed anatomy, face, and lighting.'],
      ['assets/Samurai_Unreal_Test_Web.jpg', 'In-engine development', 'Development screenshot from Unreal Engine character testing.']
    ];
    const tests = [
      {title:'Combat-space test',src:'assets/Samurai_Unreal_Test_01_Web.mp4',caption:'A short in-engine movement test with practice targets.'},
      {title:'Run test',src:'assets/Samurai_Unreal_Test_02_Web.mp4',caption:'A locomotion demonstration in the Unreal test environment.'},
      {title:'Character movement',src:'assets/Samurai_Unreal_Test_03_Web.mp4',caption:'A vertical-format in-engine test showing the character from multiple angles.'}
    ];
    return `<section class="generic-hero full-bleed-project samurai-hero" style="--project-focus:70% center"><div class="generic-hero-art">${heroMedia(entry)}</div>${heroPreviewTrigger(entry.title)}
    <div class="generic-hero-copy"><p class="case-kicker">SAMURAI / COMMISSIONED CHARACTER / UNREAL ENGINE</p><h1>Built for <em>the world.</em></h1><p>A stylized samurai developed, prepared, and brought into a game engine.</p><div class="generic-hero-actions"><a href="#samurai-role" class="generic-jump">Explore the character ↓</a><a href="#samurai-role" class="generic-jump">My contribution ↗</a></div></div></section>
    <section class="case-section feature-role" id="samurai-role"><div class="case-section-topline"><span>01 / MY CONTRIBUTION</span><small>Character art to engine delivery</small></div>
    <div class="feature-role-head"><h2>From model <br><em>to engine.</em></h2><p>My work on this character included refinements to the face and proportions, resolving model issues, texture baking, rigging and deformation cleanup in Blender, facial expression setup, and integration into Unreal Engine. The technical work extended to grooming and attaching Alembic hair, character materials, and usable engine-side setup.</p></div>
    <div class="feature-role-cards"><article><span>01</span><h3>Character & surface</h3><p>Facial and proportion adjustments, character cleanup, texture baking, and detailed visual presentation.</p></article><article><span>02</span><h3>Rig & expressions</h3><p>Blender Auto-Rig Pro setup, supplementary deformation bones, and a facial shape-key system built for expressive character performance.</p></article><article><span>03</span><h3>Unreal integration</h3><p>Preparing the skinned character for Unreal, connecting Alembic groom hair and materials, and testing the character in engine.</p></article></div></section>
    <section class="case-section" id="samurai-tests"><div class="case-section-topline"><span>02 / IN-ENGINE TESTS</span><small>Archive footage · Short web-ready previews</small></div><div class="samurai-tests">${tests.map((v,i)=>`<article class="samurai-test"><p class="case-kicker">UNREAL TEST / 0${i+1}</p><video controls playsinline preload="none" poster="${escapeHtml(asset(`assets/Samurai_Unreal_Test_0${i+1}_Poster.jpg`))}" aria-label="${escapeHtml(v.title)}"><source src="${escapeHtml(asset(v.src))}" type="video/mp4">Your browser cannot play this test.</video><h3>${escapeHtml(v.title)}</h3><p>${escapeHtml(v.caption)}</p></article>`).join('')}</div>
    <p class="samurai-credit-note">Presented as a commissioned character-production case study. These materials document my character and integration work, not sole authorship of an entire game.</p></section>
    <section class="case-section samurai-creator-section" id="samurai-creator-credit" aria-label="Project creator credit">
      <div class="case-section-topline"><span>PROJECT CREDIT / COLLABORATION</span><small>Creator and commissioned character work</small></div>
      <div class="samurai-creator-panel"><div><p class="case-kicker">COMMISSIONING CREATOR</p><h2>${escapeHtml(entry.commissioningCreator?.name || 'Project creator')}</h2><p>Character production and Unreal Engine integration by Jaydn Nickie, commissioned for the creator's game project. Explore the creator's work below.</p></div>
        <nav class="samurai-creator-socials" aria-label="Creator social links">${(entry.commissioningCreator?.links || []).map(link=>`<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(entry.commissioningCreator.name + ' on ' + link.label)}">${escapeHtml(link.label)} <span aria-hidden="true">↗</span></a>`).join('')}</nav>
      </div>
    </section>
    ${stillGallery({...entry, galleryTitle:'Every angle matters.', galleryIntro:'Selected finished views, anatomy studies, and in-engine development screenshots. Explore the thumbnails and open any image to inspect it.', galleryImages:gallery.map(([src,title,caption])=>({src,title,caption}))},'03')}
    <section class="case-end"><div><p class="case-kicker">EXPLORE MORE WORK</p><h2>Characters and <em>worlds.</em></h2></div><a class="case-back" href="../../work/index.html">← All work</a></section>`;
  };
  if (!project && galleryProject) {
    document.title = `${galleryProject.title} — Jaydn Nickie`;
    const feature = window.PORTFOLIO_DATA?.projectFeatures?.[id];
    root.innerHTML = id === 'samurai' ? samuraiProject(galleryProject) : (feature ? enhancedProject(galleryProject, feature) : genericProject(galleryProject));
    initProjectNeighbours(root);
    initMediaViewer(root, {kind: (galleryProject.heroVideo || galleryProject.video) ? 'video' : 'image', src: galleryProject.heroVideo || galleryProject.video || galleryProject.image, title:galleryProject.title});
    initStillGalleries(root);
    const yearEl = document.getElementById('case-year'); if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    initHeroMotion(root);
    if (feature) initializeClipLibrary(root, feature);
    // The standard full presentation uses a paused preview frame.
    // The selectable clip player handles its own source and timing.
    root.querySelectorAll('video.case-video').forEach(v => v.addEventListener('loadedmetadata',()=>{ if(Number.isFinite(v.duration) && v.duration>1) v.currentTime=.5; },{once:true}));
    return;
  }

  const heading = (project.headingLines || [project.title]).map((part, i) =>
    i === 0 ? escapeHtml(part) : `<span>${escapeHtml(part)}</span>`).join(' ');
  const sourceUrl = /^https:\/\//.test(project.reference?.url || '') ? project.reference.url : '';
  const sourceCredit = project.reference?.artist
    ? `Original illustration by ${escapeHtml(project.reference.artist)}.${sourceUrl ? ` <a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">View source ↗</a>` : ''}`
    : 'Original 2D concept artist attribution pending. Add the creator and a source link when located.';
  const reference = project.reference?.image
    ? `<div class="case-reference case-reference--image"><img src="${escapeHtml(asset(project.reference.image))}" alt="Illustrated source reference for ${escapeHtml(project.title)}"><p>${escapeHtml(project.reference.artist || 'Original artist credit pending')}</p></div>`
    : `<div class="case-reference" role="note"><span class="case-reference-label">SOURCE ARTWORK / PENDING</span><h3>Original 2D reference</h3><p>${escapeHtml(project.reference?.status || 'Reference artwork to be added.')}</p><p>This is a placeholder, not a recreation of the source illustration.</p></div>`;

  root.innerHTML = `
    <section class="case-hero case-hero--visual full-bleed-project" style="--project-focus:68% center">
      <div class="case-hero-backdrop"><video class="case-hero-motion" autoplay muted loop playsinline preload="metadata" aria-label="Tipsy the Teapot animated turntable as full-screen background"><source src="${escapeHtml(asset(project.media[0].src))}" type="video/mp4"></video></div>${heroPreviewTrigger(project.title)}
      <div class="case-hero-display"><div class="case-hero-text"><p class="case-kicker">${escapeHtml(project.eyebrow)} / ${escapeHtml(project.kicker)}</p>
        <h1>${heading}</h1><p class="case-subheading">${escapeHtml(project.subtitle)}</p>
        <a class="case-watch" href="#case-finished">Explore the artwork <span aria-hidden="true">↓</span></a></div></div>
      <div class="case-stage-mark"><span>3D / FINISHED ARTWORK</span><span>ANIMATED TURNTABLE</span></div>
      <button class="case-motion-toggle" type="button" aria-label="Pause background animation" aria-pressed="false">Pause motion Ⅱ</button>
      <div class="case-video-warning" hidden role="status">The background preview could not load. Check <code>${escapeHtml(project.media[0].src.split('/').pop())}</code> inside <code>assets/</code>.</div>
    </section>
    <div class="case-hero-summary"><p>${escapeHtml(project.overview)}</p><div class="case-meta"><span class="case-meta-row"><small>PROJECT TYPE</small>${escapeHtml(project.context)}</span><span class="case-meta-row"><small>MY ROLE</small>${escapeHtml(project.role)}</span><span class="case-meta-row"><small>SOURCE</small>Single illustrated reference · credit pending</span></div></div>
    <div class="case-tags">${(project.disciplines || []).map(d => `<span>${escapeHtml(d)}</span>`).join('')}</div>
    <section class="case-section" id="case-finished" aria-label="Finished artwork"><div class="case-section-topline"><span>01 / FINISHED WORK</span><small>Turntable · 3D adaptation</small></div>${videoPanel(project.media[0])}</section>
    <section class="case-narrative"><div><p class="case-kicker">DESIGN CHALLENGE</p><h2>One view.<br><em>A whole form.</em></h2></div>
      <div class="case-narrative-copy"><p class="case-quote">${escapeHtml(project.challenge)}</p><p>${escapeHtml(project.approach)}</p></div></section>
    <section class="case-section" aria-label="Geometry and modeling breakdown"><div class="case-section-topline"><span>02 / THE BUILD</span><small>Geometry · form · presentation</small></div>${videoPanel(project.media[1])}</section>
    <section class="case-section" aria-label="Illustrated source reference"><div class="case-section-topline"><span>03 / THE ORIGINAL REFERENCE</span><small>Illustrated concept, artist credit pending</small></div>
      <div class="case-duo">${reference}<div class="case-ref-details"><p class="case-kicker">FROM REFERENCE TO MODEL</p><h3>Preserve the personality.</h3><p>${escapeHtml(project.closing)}</p><p><strong>Attribution note:</strong> The 3D adaptation is my work; the original 2D character concept is not. ${sourceCredit}</p></div></div>
    </section>
    <section class="case-end"><div><p class="case-kicker">MORE TO EXPLORE</p><h2>Different projects.<br><em>One creative practice.</em></h2></div><a href="../../work/index.html" class="case-back">← Return to all work</a></section>`;

  initHeroMotion(root);
  initProjectNeighbours(root);
  initMediaViewer(root, {kind:'video',src:project.media[0].src,title:project.title});
  root.querySelectorAll('video:not(.case-hero-motion)').forEach(video => {
    // Display a real paused frame without needing a generated poster image.
    video.addEventListener('loadedmetadata', () => {
      const t = Math.min(0.6, Math.max(0, video.duration - 0.1));
      if (Number.isFinite(t) && t > 0) video.currentTime = t;
    }, {once:true});
    const failed = () => { const msg = video.nextElementSibling; if (msg?.classList.contains("case-video-error")) msg.hidden = false; };
    video.addEventListener('error', failed);
    video.querySelector('source')?.addEventListener('error', failed);
  });
  const year = document.getElementById('case-year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
