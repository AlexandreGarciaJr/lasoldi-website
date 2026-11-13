// Hovers no padrão estúdio:
// 1. texto que rola (a palavra sobe e uma cópia entra por baixo)
// 2. preenchimento do botão nasce do ponto em que o cursor entrou e sai por onde saiu
// 3. botões principais magnéticos (só mouse, só com movimento permitido)
// 4. linhas de "Para quem cuidamos" preenchem a partir do lado em que o cursor entrou

function wrapRoll(el) {
  if (el.querySelector('.roll')) return;
  const text = el.textContent.trim();
  if (!text) return;
  const roll = document.createElement('span');
  roll.className = 'roll';
  const a = document.createElement('span');
  a.className = 'roll__a';
  a.textContent = text;
  const b = document.createElement('span');
  b.className = 'roll__b';
  b.setAttribute('aria-hidden', 'true');
  b.textContent = text;
  roll.append(a, b);
  el.textContent = '';
  el.append(roll);
}

export function initHover({ motion }) {
  // --- 1. texto que rola
  document.querySelectorAll('.btn:not([data-form-submit]) > span:not(.btn__icon), a[data-nav], [data-roll]')
    .forEach(wrapRoll);

  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!finePointer) return;

  // --- 2. preenchimento a partir do cursor
  const setOrigin = (btn, e) => {
    const r = btn.getBoundingClientRect();
    btn.style.setProperty('--x', `${((e.clientX - r.left) / r.width) * 100}%`);
    btn.style.setProperty('--y', `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('pointerenter', (e) => setOrigin(btn, e));
    btn.addEventListener('pointerleave', (e) => setOrigin(btn, e));
  });

  const { gsap } = window;
  if (!motion || !gsap) return;
  document.documentElement.classList.add('hoverfx');

  // --- 3. magnético
  document.querySelectorAll('.btn--lg, .site-header__cta').forEach((btn) => {
    btn.setAttribute('data-magnetic', '');
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
    const inner = btn.querySelectorAll('.roll, .btn__icon');
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * 0.22);
      yTo(dy * 0.32);
      gsap.to(inner, { x: dx * 0.08, y: dy * 0.1, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
    });
    btn.addEventListener('pointerleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
      gsap.to(inner, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
    });
  });

  // --- 4. lista com preenchimento direcional
  const INSET_FULL = 'inset(0% 0% 0% 0%)';
  const INSET_TOP = 'inset(0% 0% 100% 0%)';   // recolhido para cima
  const INSET_BOTTOM = 'inset(100% 0% 0% 0%)'; // recolhido para baixo
  document.querySelectorAll('.audience__link').forEach((link) => {
    const fill = link.querySelector('.audience__fill');
    if (!fill) return;
    const fromTop = (e) => {
      const r = link.getBoundingClientRect();
      return e.clientY < r.top + r.height / 2;
    };
    link.addEventListener('pointerenter', (e) => {
      link.classList.add('is-active');
      gsap.fromTo(fill, { clipPath: fromTop(e) ? INSET_TOP : INSET_BOTTOM },
        { clipPath: INSET_FULL, duration: 0.6, ease: 'power3.out', overwrite: true });
    });
    link.addEventListener('pointerleave', (e) => {
      link.classList.remove('is-active');
      gsap.to(fill, { clipPath: fromTop(e) ? INSET_TOP : INSET_BOTTOM, duration: 0.55, ease: 'power3.inOut', overwrite: true });
    });
  });
}
