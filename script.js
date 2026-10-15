'use strict';
(() => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  const closeMenu = () => {
    header.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  header.classList.add('menu-ready');
  toggle.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && header.classList.contains('menu-open')) {
      closeMenu();
      toggle.focus();
    }
  });

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const items = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.documentElement.classList.add('motion');
    items.forEach(item => observer.observe(item));
    reduced.addEventListener('change', e => {
      if (e.matches) {
        document.documentElement.classList.remove('motion');
        observer.disconnect();
      }
    });
  }

  const photoDialog = document.querySelector('#photo-dialog');
  const eventDialog = document.querySelector('#event-dialog');
  const openers = new Map();
  const openDialog = (dialog, trigger) => {
    openers.set(dialog, trigger);
    dialog.showModal();
    document.body.classList.add('modal-open');
    dialog.querySelector('.close-dialog').focus();
  };
  [photoDialog, eventDialog].forEach(dialog => {
    dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => {
      if (e.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open');
      const trigger = openers.get(dialog);
      if (trigger && trigger.isConnected) trigger.focus();
      openers.delete(dialog);
    });
  });
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-photo]');
    if (!link || typeof photoDialog.showModal !== 'function') return;
    e.preventDefault();
    const caption = link.dataset.caption;
    const img = document.querySelector('#large-photo');
    img.src = link.dataset.photo;
    img.alt = caption;
    document.querySelector('#photo-caption').textContent = caption;
    openDialog(photoDialog, link);
  });

  const projects = {
    sisters: {title: 'Показ «Три сестры»', label: 'BEYOND THE RUNWAY', description: 'Винтажная коллекция «Три сестры».', source: 'https://www.instagram.com/p/DcYyCmICJus/?vrfl=MTJlazFjcjViYnduYg%3D%3D'},
    vera: {title: 'Показ Веры Першиной', label: 'Дизайнерский показ', description: 'Участие Елизаветы в показе Веры Першиной.', source: 'https://www.instagram.com/p/DcYyCmICJus/?vrfl=MTJlazFjcjViYnduYg%3D%3D'},
    zaza: {title: 'Показ Za_Za', label: 'Ростовская неделя моды', description: 'Участие Елизаветы в показе Za_Za для Ростовской недели моды.', source: 'https://www.instagram.com/p/DYQMkSfCOST/?img_index=5&mdxt=NzEwdmNmeHdsb2h6'},
    kod: {title: 'Показ KOD', label: 'Ростовская неделя моды', description: 'Участие Елизаветы в показе KOD для Ростовской недели моды.', source: 'https://www.instagram.com/p/DRXLs2biHAi/?xtok=MTh5OXRweW1hZDE0cA%3D%3D'},
    dgtu: {title: 'Университетская коллекция ДГТУ', label: 'ДГТУ', description: 'Участие Елизаветы в показе университетской коллекции ДГТУ.', source: 'https://www.instagram.com/p/DRXLs2biHAi/?xtok=MTh5OXRweW1hZDE0cA%3D%3D'}
  };
  document.querySelectorAll('[data-event]').forEach(button => {
    button.addEventListener('click', e => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || typeof eventDialog.showModal !== 'function') return;
      e.preventDefault();
      const project = projects[button.dataset.event];
      document.querySelector('#event-title').textContent = project.title;
      document.querySelector('#event-label').textContent = project.label;
      document.querySelector('#event-description').textContent = project.description;
      const media = eventDialog.querySelector('.event-media');
      media.replaceChildren(...[1, 2].map((number) => {
        const src = 'event-' + button.dataset.event + '-' + number + '.jpg';
        const caption = project.title + (number === 1 ? ' · Кадр с показа' : ' · Образ');
        const link = document.createElement('a');
        link.className = 'photo-open';
        link.href = src;
        link.dataset.photo = src;
        link.dataset.caption = caption;
        link.setAttribute('aria-label', 'Открыть фото: ' + caption);
        const img = document.createElement('img');
        img.src = src; img.alt = caption; img.decoding = 'async';
        const hint = document.createElement('span');
        hint.className = 'photo-hint'; hint.textContent = 'Смотреть крупнее ↗';
        link.append(img, hint);
        return link;
      }));
      document.querySelector('#event-page').href = 'projects/' + button.dataset.event + '.html';
      const source = document.querySelector('#event-source');
      source.hidden = !project.source;
      if (project.source) source.href = project.source;
      else source.removeAttribute('href');
      openDialog(eventDialog, button);
    });
  });
})();

// Inline silent loops. Pause remains available without native player chrome.
(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.walk-film').forEach(film => {
    const video = film.querySelector('video');
    const button = film.querySelector('.film-toggle');
    let manualPause = reducedMotion.matches;
    let visible = false;
    video.muted = true;
    button.hidden = false;
    const syncLabel = () => {
      button.textContent = video.paused ? 'Воспроизвести' : 'Пауза';
      button.setAttribute('aria-label', (video.paused ? 'Воспроизвести: ' : 'Приостановить: ') + video.getAttribute('aria-label'));
    };
    const syncPlayback = () => {
      if (visible && !document.hidden && !manualPause) video.play().catch(syncLabel);
      else video.pause();
      syncLabel();
    };
    video.addEventListener('play', syncLabel);
    video.addEventListener('pause', syncLabel);
    button.addEventListener('click', () => {
      manualPause = !video.paused;
      syncPlayback();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        syncPlayback();
      }, {threshold:0.05}).observe(video);
    } else { visible = true; syncPlayback(); }
    document.addEventListener('visibilitychange', syncPlayback);
    reducedMotion.addEventListener('change', event => { manualPause = event.matches; syncPlayback(); });
    if (manualPause) video.pause();
  });
})();
