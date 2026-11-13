// Cabeçalho, menu mobile, seção ativa e WhatsApp flutuante.
export function initNav() {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const waFloat = document.querySelector('[data-wa-float]');

  // --- cabeçalho com fio ao rolar
  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // --- menu mobile
  const setMenu = (open) => {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.menu-toggle__label').textContent = open ? 'Fechar' : 'Menu';
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    waFloat?.classList.toggle('is-hidden', open || waHidden);
    if (open) menu.querySelector('a')?.focus({ preventScroll: true });
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
  matchMedia('(min-width: 900px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // --- seção ativa no menu
  const links = [...document.querySelectorAll('[data-nav]')];
  const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const link = map.get(en.target.id);
      if (!link) return;
      if (en.isIntersecting) {
        links.forEach((l) => l.removeAttribute('aria-current'));
        link.setAttribute('aria-current', 'true');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });

  // --- WhatsApp flutuante: escondido enquanto o CTA do hero ou o bloco de contato estão na tela
  let waHidden = true;
  if (waFloat) {
    waFloat.classList.add('is-hidden');
    const watched = [document.querySelector('.hero__actions'), document.getElementById('contato'), document.querySelector('.site-footer')].filter(Boolean);
    const visible = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target)));
      waHidden = visible.size > 0;
      waFloat.classList.toggle('is-hidden', waHidden || document.body.classList.contains('menu-open'));
    }, { threshold: 0 });
    watched.forEach((el) => io.observe(el));
  }
}
