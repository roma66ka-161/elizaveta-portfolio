'use strict';
(() => {
  if (location.protocol === 'file:') document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href === '../' || href.startsWith('../#')) link.setAttribute('href', href.replace('../', '../index.html'));
  });
  const dialog = document.querySelector('#photo-dialog');
  let opener;
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-photo]');
    if (!link || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || typeof dialog.showModal !== 'function') return;
    e.preventDefault(); opener = link;
    const image = dialog.querySelector('img'); image.src = link.dataset.photo; image.alt = link.dataset.caption;
    document.querySelector('#photo-caption').textContent = link.dataset.caption;
    dialog.showModal(); document.body.classList.add('modal-open');
    dialog.querySelector('button').focus();
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {
    const r = dialog.getBoundingClientRect();
    if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); if (opener) opener.focus(); });
})();
