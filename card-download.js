'use strict';
(() => {
  const assetBase = new URL('.', document.currentScript.src);
  let pending, preparedUrl, preparedAge;
  const buttons = [...document.querySelectorAll('[data-card-download]')];
  const loadImage = src => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Не удалось загрузить фотографию'));
    img.src = src;
  });
  const loadLocalImages = () => new Promise((resolve, reject) => {
    if (window.cardImageData) return resolve();
    const script = document.createElement('script');
    script.src = new URL('card-images.js', assetBase).href;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
  function makePdf(jpeg, width, height) {
    const bytes = Uint8Array.from(atob(jpeg.split(',')[1]), c => c.charCodeAt(0));
    const enc = new TextEncoder(), chunks = [], offsets = [0];
    let position = 0;
    const append = value => { const part = typeof value === 'string' ? enc.encode(value) : value; chunks.push(part); position += part.length; };
    const object = (number, content) => { offsets[number] = position; append(number + ' 0 obj\n' + content + '\nendobj\n'); };
    append('%PDF-1.4\n');
    object(1, '<< /Type /Catalog /Pages 2 0 R >>');
    object(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    object(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Photo 4 0 R >> >> /Contents 5 0 R >>');
    offsets[4] = position;
    append('4 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + width + ' /Height ' + height + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + bytes.length + ' >>\nstream\n');
    append(bytes); append('\nendstream\nendobj\n');
    const commands = 'q 595.28 0 0 841.89 0 0 cm /Photo Do Q\n';
    object(5, '<< /Length ' + enc.encode(commands).length + ' >>\nstream\n' + commands + 'endstream');
    const xref = position;
    append('xref\n0 6\n0000000000 65535 f \n');
    for (let i = 1; i <= 5; i++) append(String(offsets[i]).padStart(10, '0') + ' 00000 n \n');
    append('trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF');
    return new Blob(chunks, {type: 'application/pdf'});
  }
  async function buildCard() {
    const profile = window.modelProfile;
    if (location.protocol === 'file:') await loadLocalImages();
    const photos = await Promise.all(profile.digitals.map(photo => loadImage(location.protocol === 'file:' ? window.cardImageData[photo.src] || new URL(photo.src, assetBase).href : new URL(photo.src, assetBase).href)));
    const canvas = document.createElement('canvas');
    canvas.width = 1240; canvas.height = 1754;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 1240, 1754);
    const text = (value, x, y, size, color = '#19151b', family = 'Arial') => {ctx.fillStyle = color; ctx.font = size + 'px ' + family; ctx.fillText(value, x, y);};
    text('Elizaveta Pidkova', 70, 90, 52, '#532443', 'Georgia');
    text('Елизавета Пидкова · Ростов-на-Дону', 70, 126, 20, '#62565f');
    text('КАРТОЧКА МОДЕЛИ', 900, 87, 17, '#62565f');
    ctx.strokeStyle = '#c6b5c1'; ctx.beginPath(); ctx.moveTo(70, 150); ctx.lineTo(1170, 150); ctx.stroke();
    photos.forEach((img, i) => {
      const x = 70 + (i % 2) * 565, y = 180 + Math.floor(i / 2) * 574;
      ctx.fillStyle = '#efeeec'; ctx.fillRect(x, y, 535, 530);
      const scale = Math.min(535 / img.naturalWidth, 530 / img.naturalHeight);
      const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
      ctx.drawImage(img, x + (535 - w) / 2, y + (530 - h) / 2, w, h);
      text(profile.digitals[i].caption, x, y + 554, 18, '#62565f');
    });
    text('Модельные данные', 70, 1365, 32, '#532443', 'Georgia');
    const age = window.modelAgeAt(new Date());
    const word = age % 100 >= 11 && age % 100 <= 14 ? 'лет' : age % 10 === 1 ? 'год' : age % 10 >= 2 && age % 10 <= 4 ? 'года' : 'лет';
    const stats = [['Возраст', age + ' ' + word], ['Рост', '175 см'], ['Вес', '57 кг'], ['Грудь / талия / бёдра', '90 / 72 / 94 см'], ['Размер одежды', 'S–M / 42–44'], ['Размер обуви', '38'], ['Волосы', 'Чёрные'], ['Глаза', 'Карие'], ['Город', 'Ростов-на-Дону']];
    stats.forEach(([label, value], i) => {const x = 70 + i % 3 * 375, y = 1406 + Math.floor(i / 3) * 68; text(label, x, y, 16, '#62565f'); text(value, x, y + 27, 22);});
    ctx.beginPath(); ctx.moveTo(70, 1628); ctx.lineTo(1170, 1628); ctx.stroke();
    text('Telegram: @LisavetaP', 70, 1662, 18, '#532443');
    text('Instagram: @its_llizaveta', 450, 1662, 18, '#532443');
    text('t.me/liiiisssaaa00', 900, 1662, 18, '#532443');
    return makePdf(canvas.toDataURL('image/jpeg', .92), 1240, 1754);
  }
  async function prepareCard() {
    if (pending) return pending;
    pending = buildCard().then(blob => {
      if (preparedUrl) URL.revokeObjectURL(preparedUrl);
      preparedUrl = URL.createObjectURL(blob);
      preparedAge = window.modelAgeAt(new Date());
      buttons.forEach(link => {link.href = preparedUrl; link.download = 'Elizaveta-Pidkova-model-card.pdf';});
    }).finally(() => {pending = null;});
    return pending;
  }
  buttons.forEach(button => {
    button.addEventListener('click', async event => {
      if (preparedUrl && preparedAge === window.modelAgeAt(new Date())) return;
      event.preventDefault();
      const original = button.innerHTML;
      button.textContent = 'Готовим PDF…'; button.setAttribute('aria-busy', 'true');
      try {await prepareCard(); button.click();}
      catch (error) {console.error(error); window.alert('Не удалось скачать карточку. Откройте карточку модели и выберите «Печать / сохранить PDF».');}
      finally {button.innerHTML = original; button.removeAttribute('aria-busy');}
    });
  });
  prepareCard().catch(error => console.error('PDF preparation:', error));
  setInterval(() => {
    if (preparedUrl && preparedAge !== window.modelAgeAt(new Date())) prepareCard().catch(error => console.error(error));
  }, 30000);
})();
