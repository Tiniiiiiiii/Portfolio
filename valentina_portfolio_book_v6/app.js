const projects = window.__PROJECTS__ || [];
let index = 0;

const cover = document.getElementById('cover');
const book = document.getElementById('book');
const spread = document.getElementById('spread');

const navTitle = document.getElementById('navTitle');
const navMeta  = document.getElementById('navMeta');
const prevBtn  = document.getElementById('prevBtn');
const nextBtn  = document.getElementById('nextBtn');

const startBtn = document.getElementById('startBtn');


function prettyTitle(raw){
  if(!raw) return '';
  return raw
    .replace(/[_-]+/g,' ')
    .replace(/\bweb\b/ig,'Web')
    .trim()
    .split(' ')
    .map(w => w ? (w[0].toUpperCase() + w.slice(1)) : w)
    .join(' ');
}

function projectDesc(p){
  const f = (p.folder || '').toLowerCase();
  if(f.includes('ecommerce')) return 'Landing + osnovne komponente za web shop (layout, hero, grid, UI detalji).';
  if(f.includes('login1')) return 'Login UI varijanta 1 — čisti layout, fokus na input states i CTA.';
  if(f.includes('login2')) return 'Login UI varijanta 2 — drugačiji stil kartice, tipografija i naglasci.';
  if(f.includes('login3')) return 'Login UI varijanta 3 — alternativni raspored i vizualni kontrast.';
  if(f.includes('portfolio1')) return 'Portfolio layout varijanta 1 — sekcije, kartice i hijerarhija sadržaja.';
  if(f.includes('portfolio2')) return 'Portfolio layout varijanta 2 — hero + grid + naglašeni projekti.';
  if(f.includes('portfolio3')) return 'Portfolio layout varijanta 3 — minimalniji pristup i čitljivost.';
  if(f.includes('restoran')) return 'Restoran web — meni/sekcije, prezentacija ponude i vizualni identitet.';
  if(f.includes('wedding')) return 'Wedding web — elegantna pozivnica/landing s fokusom na informacije.';
  if(f.includes('3dfivestar')) return 'Web za prijatelja: 3D print usluge (struktura, sadržaj, prezentacija usluga).';
  return 'UI/Web projekt.';
}


function orderPortfolio3(images){
  const order = [
    'portfolio3b_front',
    'portfolio3w_front',
    'portfolio3b_body',
    'portfolio3w_body',
    'portfolio3b_body2',
    'portfolio3w_body2',
    'portfolio3b_back',
    'portfolio3w_back'
  ];
  const lower = images.map(i => i.toLowerCase());
  const result = [];
  order.forEach(key => {
    const idx = lower.findIndex(x => x.includes(key));
    if(idx !== -1) result.push(images[idx]);
  });
  // append any leftovers
  images.forEach(i => { if(!result.includes(i)) result.push(i); });
  return result;
}

function ensureTags(p){
  const t = Array.isArray(p.tags) ? [...p.tags] : [];
  const hasHtml = t.some(x => x.toLowerCase() === 'html');
  const hasCss  = t.some(x => x.toLowerCase() === 'css');
  const hasJs   = t.some(x => x.toLowerCase() === 'js');
  // Ako je web projekt (HTML/CSS), dodaj JS jer portfolio ima JS interakcije
  if((hasHtml || hasCss) && !hasJs) t.push('JS');
  return t;
}


function showBook(){
  cover.style.display = 'none';
  book.setAttribute('aria-hidden', 'false');
  book.style.display = 'block';
  render();
}

function showCover(){
  book.setAttribute('aria-hidden', 'true');
  book.style.display = 'none';
  cover.style.display = 'flex';
}

function render(){
  const p = projects[index];
  if(!p) return;

  navTitle.textContent = p.title;
  navMeta.textContent = `${p.label} • ${index+1} / ${projects.length}`;

  prevBtn.disabled = index === 0;
  const atEnd = index === projects.length - 1;
  nextBtn.textContent = atEnd ? '↺' : '→';
  nextBtn.setAttribute('aria-label', atEnd ? 'Natrag na početno' : 'Sljedeća stranica');

  const badges = ensureTags(p).map(t => `<span class="badge">${t}</span>`).join('');
  let imgs = p.images || [];
  if((p.folder||'').toLowerCase().includes('portfolio3')) imgs = orderPortfolio3(imgs);
  const main = imgs[0] || '';

  const thumbs = imgs.map((src, i) => `
    <div class="thumb ${i===0 ? 'active' : ''}" data-src="${src}">
      <img src="${src}" alt="Screenshot ${i+1}">
    </div>
  `).join('');

  const link = p.link ? `
    <a class="primary-link" href="${p.link}" target="_blank" rel="noopener">
      Otvori web stranicu <span aria-hidden="true">↗</span>
    </a>
  ` : '';

  spread.innerHTML = `
    <article class="page">
      <div class="pageno">Str. ${(index*2)+1}</div>
      <div class="pad">
        <div class="kicker">
          <span class="pill">${p.label}</span>
        </div>
        <h2 class="p-title">${prettyTitle(p.title)}</h2>
        <div class="p-sub">${projectDesc(p)}</div>
        <div class="badges">${badges}</div>

        ${link}

      </div>
    </article>

    <article class="page">
      <div class="pageno">Str. ${(index*2)+1}</div>
      <div class="viewer">
        <div class="viewer-main">
          ${main ? `<img id="mainImg" src="${main}" alt="${p.title} screenshot">` : `<div class="pad">Nema slika u folderu.</div>`}
        </div>
        <div class="thumbs" id="thumbs">${thumbs}</div>
      </div>
    </article>
  `;

  const mainImg = document.getElementById('mainImg');
  const thumbsEl = document.getElementById('thumbs');
  if(thumbsEl && mainImg){
    thumbsEl.addEventListener('click', (e) => {
      const t = e.target.closest('.thumb');
      if(!t) return;
      const src = t.getAttribute('data-src');
      if(!src) return;
      mainImg.src = src;
      thumbsEl.querySelectorAll('.thumb').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
    });
  }
}

function go(delta){
  const dir = delta < 0 ? 'turn-left' : 'turn-right';
  spread.classList.remove('turn-left','turn-right');
  // trigger reflow so animation always runs
  void spread.offsetWidth;
  spread.classList.add(dir);

  index = Math.max(0, Math.min(projects.length - 1, index + delta));
  render();

  // cleanup class after anim
  window.setTimeout(() => {
    spread.classList.remove('turn-left','turn-right');
  }, 280);
}

prevBtn.addEventListener('click', () => go(-1));
nextBtn.addEventListener('click', () => {
  if(index === projects.length - 1){ showCover(); return; }
  go(1);
});
startBtn.addEventListener('click', showBook);
quickBtn.addEventListener('click', () => {  });

tocBtn.addEventListener('click', () => {
  
});


// Keyboard
window.addEventListener('keydown', (e) => {
  if(book.getAttribute('aria-hidden') === 'true') return;
  if(e.key === 'ArrowLeft') go(-1);
  if(e.key === 'ArrowRight') go(1);
  if(e.key === 'Escape') showCover();
});

// Start on cover
showCover();
