// FILE: /assets/site.js
// Small shared behaviours: year stamp + subtle parallax background layers.
(() => {
  'use strict';

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Parallax layers (optional)
  const layers = Array.from(document.querySelectorAll('.parallax-layer[data-parallax]'));
  if (prefersReduced || layers.length === 0) return;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function onMove(e){
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    const x = (e.clientX / w) * 2 - 1; // -1..1
    const y = (e.clientY / h) * 2 - 1;
    targetX = clamp(x, -1, 1);
    targetY = clamp(y, -1, 1);
  }

  window.addEventListener('mousemove', onMove, { passive: true });

  function tick(){
    // gentle smoothing
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    for (const el of layers){
      const k = parseFloat(el.getAttribute('data-parallax')) || 0.08;
      const tx = (-currentX * 18 * k).toFixed(2);
      const ty = (-currentY * 18 * k).toFixed(2);
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();