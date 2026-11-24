// Hovers no padrão estúdio:
// 1. texto que rola (a palavra sobe e uma cópia entra por baixo)
// 2. preenchimento do botão nasce do ponto em que o cursor entrou e sai por onde saiu
// 3. botões magnéticos (só mouse, só com movimento permitido)
// 4. linhas de "Para quem" preenchem a partir do lado em que o cursor entrou

function wrapRoll(el) {
  if (el.querySelector('.roll')) return;
  const text = el.textContent.trim();
  if (!text) return;
  const roll = document.createElement('span'); roll.className = 'roll';
  const a = document.createElement('span'); a.className = 'roll__a'; a.textContent = text;
  const b = document.createElement('span'); b.className = 'roll__b'; b.setAttribute('aria-hidden', 'true'); b.textContent = text;
  roll.append(a, b);
  el.textContent = '';
  el.append(roll);
}

export function initHover({ motion }) {
  document.querySelectorAll('.btn > span:not(.btn__fill), a[data-nav], [data-roll]').forEach(wrapRoll);

  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine) return;

  const setOrigin = (el, e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - r.left}px`);
    el.style.setProperty('--y', `${e.clientY - r.top}px`);
  };
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('pointerenter', (e) => setOrigin(btn, e));
    btn.addEventListener('pointerleave', (e) => setOrigin(btn, e));
  });

  const { gsap } = window;
  if (!motion || !gsap) return;
  document.documentElement.classList.add('hoverfx');

  // magnético: o botão acompanha o cursor e o conteúdo um pouco mais
  document.querySelectorAll('[data-magnetic]').forEach((btn) => {
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
    const inner = btn.querySelectorAll('.roll');
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * 0.22); yTo(dy * 0.32);
      gsap.to(inner, { x: dx * 0.08, y: dy * 0.1, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
    });
    btn.addEventListener('pointerleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
      gsap.to(inner, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
    });
  });

  // linhas com preenchimento direcional
  const FULL = 'inset(0% 0% 0% 0%)', TOP = 'inset(0% 0% 100% 0%)', BOTTOM = 'inset(100% 0% 0% 0%)';
  document.querySelectorAll('.row').forEach((row) => {
    const fill = row.querySelector('.row__fill');
    if (!fill) return;
    const fromTop = (e) => { const r = row.getBoundingClientRect(); return e.clientY < r.top + r.height / 2; };
    row.addEventListener('pointerenter', (e) => {
      row.classList.add('is-active');
      gsap.fromTo(fill, { clipPath: fromTop(e) ? TOP : BOTTOM }, { clipPath: FULL, duration: 0.6, ease: 'power3.out', overwrite: true });
    });
    row.addEventListener('pointerleave', (e) => {
      row.classList.remove('is-active');
      gsap.to(fill, { clipPath: fromTop(e) ? TOP : BOTTOM, duration: 0.55, ease: 'power3.inOut', overwrite: true });
    });
  });
}
