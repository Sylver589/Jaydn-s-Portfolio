(() => {
  'use strict';
  const data = window.PORTFOLIO_DATA || {};
  const grid = document.getElementById('work-grid');
  const controls = document.getElementById('work-filters');
  if (!grid || !controls) return;
  const projects = [ ...(data.projects || []), ...Object.entries(data.caseStudies || {}).map(([id, p])=>({id,title:p.title,subtitle:p.kicker,teaser:p.subtitle,disciplines:p.disciplines || [],collection:'Independent Work',medium:'3D adaptation',art:'video',video:p.media?.[0]?.src,previewTime:1.5,isCaseStudy:true})) ];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const categories = ['All work','Character Art','Technical Art','Environments & VFX','Animation','Stylized Prop Art','Sylver Soul'];
  let selected = 'All work';
  function media(item){
    if (item.image) return `<img src="../${esc(item.image)}" alt="" loading="lazy" decoding="async">`;
    if (item.video) return `<video class="work-card-video" muted playsinline loop preload="metadata" data-start="${Number(item.previewTime || .6)}"><source src="../${esc(item.video)}" type="video/mp4"></video>`;
    return `<span class="work-card-empty">PROJECT ARTWORK COMING SOON</span>`;
  }
  function render(){
    const visible = projects.filter(p=>selected==='All work' || (p.disciplines||[]).includes(selected) || p.collection===selected);
    grid.innerHTML = visible.map((p,i)=>`<a class="work-page-card" href="../projects/${encodeURIComponent(p.hrefId || p.id)}/index.html" aria-label="View ${esc(p.title)} project"><div class="work-page-card-media">${media(p)}</div><div class="work-page-card-info"><span class="work-page-card-num">${String(i+1).padStart(2,'0')} / ${String(visible.length).padStart(2,'0')}</span><div><span class="work-page-card-type">${esc(p.subtitle)}</span><h2>${esc(p.title)}</h2><p>${esc(p.teaser || p.description)}</p></div><span class="work-card-arrow" aria-hidden="true">↗</span></div></a>`).join('');
    document.getElementById('work-total').textContent=`${visible.length} / ${projects.length} PROJECTS`;
    const status=document.getElementById('work-filter-status');
    if (status) status.textContent = selected==='All work'
      ? `Showing all ${projects.length} projects. Choose a discipline below, or select a project to view its page.`
      : `${visible.length} ${visible.length===1?'project':'projects'} in ${selected}. Select All work to reset.`;
    grid.querySelectorAll('video').forEach(v=>{
      v.addEventListener('loadedmetadata',()=>{const t=Number(v.dataset.start||.6);if(Number.isFinite(v.duration)&&v.duration>t) v.currentTime=t;},{once:true});
      const card=v.closest('a'); card?.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')v.play().catch(()=>{});});
      card?.addEventListener('pointerleave',()=>{v.pause();});
      card?.addEventListener('focusout',()=>v.pause());
    });
  }
  controls.innerHTML=categories.map(category=>`<button class="work-filter${category===selected?' is-active':''}" type="button" data-filter="${esc(category)}" aria-pressed="${category===selected}">${esc(category)}</button>`).join('');
  controls.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
    selected=b.dataset.filter;
    controls.querySelectorAll('button').forEach(x=>{const yes=x===b;x.classList.toggle('is-active',yes);x.setAttribute('aria-pressed',String(yes));});
    render();
  }));
  render();
  const year=document.getElementById('case-year');if(year)year.textContent=String(new Date().getFullYear());
})();
