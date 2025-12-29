/**
 * Self-tests (helps catch DOM/script regressions).
 */
function runSelfTests(){
  console.assert(!!document.getElementById('year'), '[test] #year missing');
  console.assert(!!document.getElementById('net'), '[test] #net canvas missing');
  console.assert(!!document.getElementById('copy'), '[test] #copy button missing');
  console.assert(!!document.getElementById('brief'), '[test] #brief missing');
  console.assert(!!document.getElementById('cases'), '[test] #cases section missing');
  console.assert(!!document.getElementById('contact'), '[test] #contact section missing');
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Copy brief helper
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
    } catch (err) {
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

// Scroll reveal
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

// Showpiece canvas: network particles
const canvas = document.getElementById('net');
const ctx = canvas ? canvas.getContext('2d') : null;
const nodes = [];

function resize(){
  if (!canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(canvas.clientWidth * dpr);
  canvas.height = Math.floor(canvas.clientHeight * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}

function init(){
  if (!canvas || !ctx) return;
  resize();
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
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
  if(i===0) return `rgba(124,58,237,${a})`; // violet
  if(i===1) return `rgba(34,211,238,${a})`;  // cyan
  return `rgba(253,224,71,${a})`;            // yellow
}

function step(){
  if (!canvas || !ctx) return;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
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
      const dx = a.x - b.x;
      const dy = a.y - b.y;
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
    p.x += p.vx;
    p.y += p.vy;
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

  requestAnimationFrame(step);
}

// Tiny faux metrics
const lat = document.getElementById('lat');
const score = document.getElementById('score');
const t0 = performance.now();
function metrics(t){
  const s = (Math.sin((t-t0)/900)+1)/2;
  if (lat) lat.textContent = String(Math.round(14 + s*12));
  if (score) score.textContent = (0.88 + s*0.06).toFixed(2);
  requestAnimationFrame(metrics);
}

window.addEventListener('resize', () => { resize(); init(); });

runSelfTests();
init();
requestAnimationFrame(step);
requestAnimationFrame(metrics);
