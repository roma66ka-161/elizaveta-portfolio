'use strict';
(() => {
  const profile = window.modelProfile;
  function ageAt(date) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(date);
    const part = type => Number(parts.find(p => p.type === type).value);
    const [year, month, day] = profile.birthDate.split('-').map(Number);
    return part('year') - year - (part('month') < month || (part('month') === month && part('day') < day) ? 1 : 0);
  }
  function updateAge() {
    const age = ageAt(new Date());
    const last = age % 10, lastTwo = age % 100;
    const word = lastTwo >= 11 && lastTwo <= 14 ? 'лет' : last === 1 ? 'год' : last >= 2 && last <= 4 ? 'года' : 'лет';
    document.querySelectorAll('[data-age]').forEach(el => { el.textContent = age + ' ' + word; });
  }
  document.querySelectorAll('[data-digitals]').forEach(container => {
    const isCard = container.dataset.digitals === 'card';
    const figures = profile.digitals.map(photo => {
      const figure = document.createElement('figure');
      const link = document.createElement('a');
      link.href = photo.src;
      link.className = 'photo-open';
      link.dataset.photo = photo.src;
      link.dataset.caption = photo.caption;
      link.setAttribute('aria-label', 'Открыть фото: ' + photo.caption);
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.alt;
      img.width = photo.width; img.height = photo.height;
      img.decoding = 'async';
      img.loading = isCard ? 'eager' : 'lazy';
      if (isCard || location.protocol === 'file:') link.append(img);
      else {
        const picture = document.createElement('picture');
        const source = document.createElement('source');
        const src = 'images/' + photo.src.replace(/\.jpg$/i, '');
        source.type = 'image/webp';
        source.srcset = src + '-400.webp ' + Math.min(400, photo.width) + 'w, ' + src + '-800.webp ' + Math.min(800, photo.width) + 'w';
        source.sizes = '(max-width: 700px) 45vw, 280px';
        picture.append(source, img); link.append(picture);
      }
      if (!isCard) {
        const hint = document.createElement('span');
        hint.className = 'photo-hint';
        hint.textContent = 'Смотреть крупнее ↗';
        link.append(hint);
      }
      const caption = document.createElement('figcaption');
      caption.textContent = photo.caption;
      figure.append(link, caption);
      return figure;
    });
    container.replaceChildren(...figures);
  });
  updateAge();
  // Обновление также работает, если страницу оставили открытой в день рождения.
  setInterval(updateAge, 30000);
  window.addEventListener('pageshow', updateAge);
  window.addEventListener('beforeprint', updateAge);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateAge(); });
  window.modelAgeAt = ageAt;
})();
