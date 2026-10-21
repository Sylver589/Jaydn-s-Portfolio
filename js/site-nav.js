(() => {
  'use strict';
  const bar=document.getElementById('case-site-header');
  if (!bar) return;
  const menu=bar.querySelector('.case-nav-menu');
  let scheduled=false;
  const check=()=>{bar.classList.toggle('is-scrolled',window.scrollY>28);scheduled=false;};
  window.addEventListener('scroll',()=>{if (!scheduled){scheduled=true;requestAnimationFrame(check);}}, {passive:true});
  check();
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.open){menu.open=false;menu.querySelector('summary')?.focus();}});
  menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.open=false;}));
  window.addEventListener('resize',()=>{if(window.innerWidth>830&&menu?.open)menu.open=false;},{passive:true});
})();
