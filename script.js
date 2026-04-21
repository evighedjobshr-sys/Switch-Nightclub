// progress bar
const prog = document.getElementById('prog');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const sc = h.scrollTop / (h.scrollHeight - innerHeight || 1);
  prog.style.transform = `scaleX(${sc})`;
}, {passive:true});

// custom cursor
const cursor = document.getElementById('cursor');
if (cursor && window.matchMedia('(pointer:fine)').matches) {
  window.addEventListener('mousemove', e => {
    cursor.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  }, {passive:true});
}

// nav state
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (!nav) return;
  nav.classList.toggle('on', window.scrollY > 24);
}, {passive:true});

// mobile menu
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
if (navToggle && mobileMenu) {
  const setMenu = (open) => {
    mobileMenu.classList.toggle('open', open);
    navToggle.classList.toggle('active', open);
    navToggle.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
  };
  navToggle.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
}

// ═══════════════════════════════════════════════
// INTRO CANVAS — fast neon waves from the start
// ═══════════════════════════════════════════════
const ic  = document.getElementById('introCanvas');
const ict = ic.getContext('2d');
function sizeIC(){ ic.width=innerWidth; ic.height=innerHeight; }
sizeIC();

// Wave definitions — faster speeds, higher amplitude
const IW = [
  // Bottom large swells
  {f:.009,a:90, s:.028,p:0,  c:'rgba(255,45,120,0.28)',  lw:2,  y:.72},
  {f:.013,a:70, s:.036,p:1.8,c:'rgba(0,240,255,0.24)',   lw:2,  y:.68},
  {f:.007,a:100,s:.022,p:3.5,c:'rgba(185,79,255,0.2)',   lw:1.5,y:.76},
  // Mid waves
  {f:.016,a:55, s:.044,p:.9, c:'rgba(0,240,255,0.16)',   lw:1.5,y:.56},
  {f:.02, a:45, s:.05, p:2.5,c:'rgba(255,45,120,0.18)',  lw:1.5,y:.52},
  {f:.011,a:65, s:.032,p:4.8,c:'rgba(201,168,76,0.22)',  lw:2,  y:.62},
  {f:.022,a:38, s:.055,p:1.6,c:'rgba(185,79,255,0.14)',  lw:1,  y:.59},
  // Upper fast ripples
  {f:.028,a:28, s:.065,p:.4, c:'rgba(0,240,255,0.12)',   lw:1,  y:.44},
  {f:.035,a:20, s:.08, p:2.1,c:'rgba(255,45,120,0.1)',   lw:1,  y:.38},
  {f:.018,a:35, s:.045,p:5.0,c:'rgba(201,168,76,0.12)',  lw:1,  y:.48},
  // Fine top ripples
  {f:.042,a:12, s:.1,  p:.6, c:'rgba(185,79,255,0.08)',  lw:.8, y:.32},
  {f:.05, a:8,  s:.12, p:3.7,c:'rgba(0,240,255,0.07)',   lw:.8, y:.28},
];

// Extra speed multiplier — increases as user scrolls into the wrap
let speedBoost = 1;
let iT = 0, iRaf;

function drawIntro(){
  ict.clearRect(0,0,ic.width,ic.height);
  iT += 0.022 * speedBoost;   // base speed already fast, then boosts more

  IW.forEach(w=>{
    ict.beginPath();
    const by = ic.height * w.y;
    for(let x=0;x<=ic.width;x+=3){
      const y = by
        + Math.sin(x*w.f + iT*w.s + w.p) * w.a
        + Math.sin(x*w.f*1.9 + iT*w.s*.6 + w.p) * (w.a*.38)
        + Math.sin(x*w.f*.55 + iT*w.s*1.4 + w.p) * (w.a*.18);
      x===0 ? ict.moveTo(x,y) : ict.lineTo(x,y);
    }
    ict.strokeStyle = w.c;
    ict.lineWidth   = w.lw;
    ict.stroke();
  });
  iRaf = requestAnimationFrame(drawIntro);
}
drawIntro();


// ═══════════════════════════════════════════════
// SCROLL-DRIVEN INTRO — title splits apart
// ═══════════════════════════════════════════════
const introWrap  = document.getElementById('intro-wrap');
const titleWrap  = document.getElementById('introTitle');
const introTag   = document.getElementById('introTag');
const introSub   = document.getElementById('introSub');
const scrollInd  = document.getElementById('scrollInd');
const topLine    = titleWrap.querySelector('.top-clip .title-line');
const botLine    = titleWrap.querySelector('.bot-clip .title-line');

// scroll progress 0→1 over the extra 180vh
const SPLIT_END  = 0.38;   // title fully split & faded
const SPEED_END  = 0.65;   // wave speed peaks
const FADE_END   = 0.88;   // waves fade out

function onScroll(){
  const rect = introWrap.getBoundingClientRect();
  const total = introWrap.offsetHeight - innerHeight;
  const p = Math.max(0, Math.min(1, -rect.top / total));

  // ── Title: split top line up, bottom line down, then fade
  if(p <= SPLIT_END){
    const t = p / SPLIT_END;          // 0→1
    const move = t * 90;              // px shift
    const fade = 1 - Math.pow(t,1.2);
    topLine.style.transform = `translateY(-${move}px)`;
    botLine.style.transform = `translateY(${move}px)`;
    titleWrap.style.opacity = fade;
    titleWrap.style.filter  = `blur(${t*8}px)`;

    // fade eyebrow/sub
    const fadeOther = 1 - Math.min(1, t*2.5);
    introTag.style.opacity  = fadeOther;
    introSub.style.opacity  = fadeOther;
    scrollInd.style.opacity = 1 - Math.min(1, t*4);
  } else {
    titleWrap.style.opacity = 0;
    introTag.style.opacity  = 0;
    introSub.style.opacity  = 0;
    scrollInd.style.opacity = 0;
  }

  // ── Wave speed boost
  if(p > SPLIT_END && p <= SPEED_END){
    const t = (p - SPLIT_END) / (SPEED_END - SPLIT_END);
    speedBoost = 1 + t * 14;          // up to 15x
  } else if(p <= SPLIT_END){
    speedBoost = 1;
  }

  // ── Canvas fade out
  if(p > SPEED_END){
    const t = (p - SPEED_END) / (FADE_END - SPEED_END);
    ic.style.opacity = Math.max(0, 1 - t);
    speedBoost = 15;
  }
  if(p >= FADE_END){
    cancelAnimationFrame(iRaf); iRaf = null;
  } else if(!iRaf){
    drawIntro();
  }
}

window.addEventListener('scroll', onScroll, {passive:true});
window.addEventListener('resize', ()=>{ sizeIC(); sizeSea(); }, {passive:true});
onScroll();

// scroll reveal
const srObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){
      e.target.classList.add('in');
      srObs.unobserve(e.target);
    }
  });
},{threshold:0.1});
document.querySelectorAll('.sr,.clip-line').forEach(el => srObs.observe(el));

// sea canvas
const sc  = document.getElementById('seaCanvas');
const sct = sc?.getContext('2d');
function sizeSea(){ if (sc) { sc.width=sc.parentElement.offsetWidth; sc.height=sc.parentElement.offsetHeight; } }
const SW = [
  {f:.005,a:120,s:.012,p:0,c:'rgba(0,240,255,0.22)',lw:2.5,y:.88},
  {f:.007,a:100,s:.015,p:1.8,c:'rgba(255,45,120,0.24)',lw:2,y:.84},
  {f:.006,a:110,s:.011,p:3.5,c:'rgba(185,79,255,0.18)',lw:2,y:.92},
  {f:.01,a:80,s:.018,p:.9,c:'rgba(0,240,255,0.18)',lw:2,y:.72},
  {f:.013,a:65,s:.022,p:2.5,c:'rgba(255,45,120,0.2)',lw:1.5,y:.68},
  {f:.009,a:85,s:.016,p:4.8,c:'rgba(201,168,76,0.22)',lw:2,y:.78},
  {f:.018,a:48,s:.03,p:.3,c:'rgba(0,240,255,0.14)',lw:1.5,y:.60},
  {f:.022,a:40,s:.036,p:2.1,c:'rgba(255,45,120,0.14)',lw:1.5,y:.55},
  {f:.04,a:14,s:.08,p:.5,c:'rgba(201,168,76,0.12)',lw:1,y:.36}
];
let sT = 0, seaRaf;
function drawSea(){
  if (!sc || !sct) return;
  sct.clearRect(0,0,sc.width,sc.height);
  sT += 0.018;
  SW.forEach(w => {
    sct.beginPath();
    const by = sc.height * w.y;
    for(let x=0;x<=sc.width;x+=4){
      const y = by
        + Math.sin(x*w.f + sT*w.s + w.p) * w.a
        + Math.sin(x*w.f*2.1 + sT*w.s*.7 + w.p) * (w.a*.42)
        + Math.sin(x*w.f*.5 + sT*w.s*1.5 + w.p) * (w.a*.22);
      x===0 ? sct.moveTo(x,y) : sct.lineTo(x,y);
    }
    sct.strokeStyle = w.c;
    sct.lineWidth   = w.lw;
    sct.stroke();
  });
  seaRaf = requestAnimationFrame(drawSea);
}
const galSec = document.getElementById('gallery');
if (galSec && sc) {
  const galObs = new IntersectionObserver(entries => {
    if(entries[0].isIntersecting){
      if(!seaRaf){ sizeSea(); drawSea(); }
    } else {
      cancelAnimationFrame(seaRaf); seaRaf = null;
    }
  },{threshold:0.04});
  galObs.observe(galSec);
}

// gallery tilt
if (window.matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.gal-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX-r.left)/r.width-.5;
      const y = (e.clientY-r.top)/r.height-.5;
      card.style.transform = `rotate(0deg) scale(1.03) translateY(-10px) perspective(700px) rotateY(${x*12}deg) rotateX(${-y*12}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      const rot = getComputedStyle(card).getPropertyValue('--r') || '0deg';
      card.style.transform = `rotate(${rot})`;
    });
  });
}

// accordion
const accRows = document.querySelectorAll('.acc-row');
document.querySelectorAll('.acc-hd').forEach(hd => {
  hd.addEventListener('click', () => {
    const row = hd.closest('.acc-row');
    const was = row.classList.contains('open');
    accRows.forEach(r => r.classList.remove('open'));
    if(!was) row.classList.add('open');
  });
});
document.querySelector('.acc-row')?.classList.add('open');

// magnetic buttons
if (window.matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.btn-g,.btn-o,.nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX-r.left-r.width/2;
      const y = e.clientY-r.top-r.height/2;
      btn.style.transform = `translate(${x*.2}px,${y*.2}px)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = '');
  });
}

// home glow parallax
const hGlow = document.querySelector('.home-glow');
window.addEventListener('scroll', () => {
  if(!hGlow) return;
  const homeTop = document.getElementById('home')?.getBoundingClientRect().top || 0;
  hGlow.style.transform = `translate(-50%,calc(-50% + ${-homeTop*.14}px))`;
},{passive:true});

// smooth scroll internal anchors
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    const t = href ? document.querySelector(href) : null;
    if(t){
      e.preventDefault();
      t.scrollIntoView({behavior:'smooth'});
    }
  });
});
