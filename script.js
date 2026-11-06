(() => {
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  function closeMenu() { mobileMenu.classList.remove('is-open'); mobileMenu.inert = true; menuToggle.setAttribute('aria-expanded','false'); menuToggle.setAttribute('aria-label','Открыть меню'); menuToggle.querySelector('use').setAttribute('href','#i-menu'); document.body.classList.remove('menu-open'); }
  menuToggle.addEventListener('click', () => { if (mobileMenu.classList.contains('is-open')) closeMenu(); else { mobileMenu.classList.add('is-open'); mobileMenu.inert = false; menuToggle.setAttribute('aria-expanded','true'); menuToggle.setAttribute('aria-label','Закрыть меню'); menuToggle.querySelector('use').setAttribute('href','#i-close'); document.body.classList.add('menu-open'); } });
  mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });
  const serviceTabs = [...document.querySelectorAll('.service-tab')];
  const serviceItems = [...document.querySelectorAll('.service-item')];
  serviceTabs.forEach(tab => tab.addEventListener('click', () => {
    const category = tab.dataset.category;
    serviceTabs.forEach(btn => {const active = btn === tab; btn.classList.toggle('is-active',active); btn.setAttribute('aria-pressed',String(active));});
    serviceItems.forEach(item => item.hidden = item.dataset.category !== category);
  }));
  const cards = [...document.querySelectorAll('.gallery-card')];
  const track = document.getElementById('galleryTrack');
  function scrollGallery(direction) { const first = cards[0]; if (!first) return; const distance = first.getBoundingClientRect().width + 18; track.scrollBy({left: distance * direction, behavior:'smooth'}); }
  document.getElementById('galleryPrev').addEventListener('click', () => scrollGallery(-1));
  document.getElementById('galleryNext').addEventListener('click', () => scrollGallery(1));
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImage');
  const lightboxEmpty = document.getElementById('lightboxEmpty');
  const count = document.getElementById('lightboxCount');
  let currentImage = 0;
  function showImage(index) { currentImage = (index + cards.length) % cards.length; const img = cards[currentImage].querySelector('img'); count.textContent = `${String(currentImage+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`; lightboxImg.style.display = 'none'; lightboxEmpty.style.display = 'grid'; if (img.classList.contains('img-failed')) return; lightboxImg.onload = () => { lightboxImg.style.display='block';lightboxEmpty.style.display='none'; }; lightboxImg.onerror = () => { lightboxImg.style.display='none';lightboxEmpty.style.display='grid'; }; lightboxImg.src=img.currentSrc || img.src; lightboxImg.alt=img.alt; if (lightboxImg.complete && lightboxImg.naturalWidth > 0) {lightboxImg.style.display='block';lightboxEmpty.style.display='none';} }
  cards.forEach((card,i) => card.addEventListener('click', () => {showImage(i); if(!lightbox.open) lightbox.showModal(); }));
  document.getElementById('lightboxPrev').addEventListener('click', () => showImage(currentImage-1));
  document.getElementById('lightboxNext').addEventListener('click', () => showImage(currentImage+1));
  document.getElementById('lightboxClose').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', e => { if(e.target===lightbox) lightbox.close(); });
  document.addEventListener('keydown', e => { if(!lightbox.open) return; if(e.key==='ArrowLeft') showImage(currentImage-1); if(e.key==='ArrowRight') showImage(currentImage+1); });
  const menuLinks = [...document.querySelectorAll('.desktop-links a')];
  if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(entries=>{ for (const entry of entries) { if (!entry.isIntersecting) continue; menuLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id)); } }, {rootMargin:'-35% 0px -55% 0px'}); ['services','gallery','about','reviews','contacts'].forEach(id=>{let el=document.getElementById(id);if(el)observer.observe(el);}); }
})();
