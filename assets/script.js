// Year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Copy brief (only exists on contact page)
const copyBtn = document.getElementById('copy');
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    const briefEl = document.getElementById('brief');
    const text = briefEl ? briefEl.textContent : '';
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Copied';
      setTimeout(() => (copyBtn.textContent = 'Copy'), 900);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      copyBtn.textContent = 'Copied';
      setTimeout(() => (copyBtn.textContent = 'Copy'), 900);
    }
  });
}

// Reveal
const revealItems = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
revealItems.forEach(el => io.observe(el));

/**
 * Parallax: fixed background layers + subtle section drift
 */
const layers = Array.from(document.querySelectorAll('[data-parallax]'));
const sectionParallax = Array.from(document.querySelectorAll('[data-parallax-section]'));

let latestY = 0;
let ticking = false;

function applyParallax() {
  const y = latestY;

  for (const el of layers) {
    const s = parseFloat(el.getAttribute('data-parallax') || '0.1');
    el.style.transform = `translate3d(0, ${-y * s}px, 0)`;
  }

  const vh = window.innerHeight || 800;
  for (const el of sectionParallax) {
    const s = parseFloat(el.getAttribute('data-parallax-section') || '0.06');
    const rect = el.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const t = (center - vh / 2) / (vh / 2);
    const offset = Math.max(-1, Math.min(1, t)) * 10 * s * 10;
    el.style.transform = `translate3d(0, ${offset}px, 0)`;
  }

  ticking = false;
}

function onScroll() {
  latestY = window.scrollY || 0;
  if (!ticking) {
    requestAnimationFrame(applyParallax);
    ticking = true;
  }
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

// Hero tilt (only on pages with data-tilt)
const tiltCard = document.querySelector('[data-tilt]');
if (tiltCard) {
  let raf = null;
  tiltCard.addEventListener('mousemove', (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = tiltCard.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;

    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const rx = (-py * 6).toFixed(2);
      const ry = (px * 8).toFixed(2);
      tiltCard.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    });
  });
  tiltCard.addEventListener('mouseleave', () => {
    tiltCard.style.transform = 'translate3d(0,0,0)';
  });
}

// Canvas net (only on pages with #net)
const canvas = document.getElementById('net');
const ctx = canvas ? canvas.getContext('2d') : null;
const nodes = [];

function resizeCanvas(){
  if (!canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(canvas.clientWidth * dpr);
  canvas.height = Math.floor(canvas.clientHeight * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}

function initNodes(){
  if (!canvas || !ctx) return;
  resizeCanvas();
  const w = canvas.clientWidth, h = canvas.clientHeight;
  nodes.length = 0;
  const n = Math.max(18, Math.round((w*h) / 23000));
  for(let i=0;i<n;i++){
    nodes.push({
      x: Math.random()*w,
      y: Math.random()*h,
      vx: (Math.random()-.5)*0.35,
      vy: (Math.random()-.5)*0.35,
      r: 1.2 + Math.random()*1.2,
      c: i % 3
    });
  }
}

function colorFor(i, a=1){
  if(i===0) return `rgba(124,58,237,${a})`;
  if(i===1) return `rgba(34,211,238,${a})`;
  return `rgba(253,224,71,${a})`;
}

function drawNet(){
  if (!canvas || !ctx) return;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  ctx.clearRect(0,0,w,h);

  const g = ctx.createRadialGradient(w*0.5, h*0.35, 40, w*0.5, h*0.5, Math.max(w,h));
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,.35)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,w,h);

  for(let i=0;i<nodes.length;i++){
    const a = nodes[i];
    for(let j=i+1;j<nodes.length;j++){
      const b = nodes[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d2 = dx*dx + dy*dy;
      if(d2 < 130*130){
        const d = Math.sqrt(d2);
        const alpha = (1 - d/130) * 0.22;
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  for(const p of nodes){
    p.x += p.vx; p.y += p.vy;
    if(p.x < -20) p.x = w + 20;
    if(p.x > w + 20) p.x = -20;
    if(p.y < -20) p.y = h + 20;
    if(p.y > h + 20) p.y = -20;

    ctx.fillStyle = colorFor(p.c, 0.85);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = colorFor(p.c, 0.10);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r*6, 0, Math.PI*2);
    ctx.fill();
  }

  requestAnimationFrame(drawNet);
}

// Tiny metrics (only if elements exist)
const lat = document.getElementById('lat');
const score = document.getElementById('score');
const t0 = performance.now();
function metrics(t){
  const s = (Math.sin((t-t0)/900)+1)/2;
  if (lat) lat.textContent = String(Math.round(14 + s*12));
  if (score) score.textContent = (0.88 + s*0.06).toFixed(2);
  requestAnimationFrame(metrics);
}

window.addEventListener('resize', () => { resizeCanvas(); initNodes(); });
initNodes();
requestAnimationFrame(drawNet);
requestAnimationFrame(metrics);
