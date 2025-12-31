(() => {
  const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.menu a[data-page]').forEach(a => {
    if ((a.getAttribute('data-page') || '').toLowerCase() === file) a.classList.add('active');
  });

  const y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
