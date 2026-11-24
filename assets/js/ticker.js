// Faixa de soluções: duas linhas em sentidos opostos, em loop contínuo.
// A velocidade da rolagem acelera a faixa (e inverte o sentido quando a página sobe)
// e inclina o texto de leve, como se a página tivesse inércia.

export function initTicker() {
  const { gsap, ScrollTrigger } = window;
  const section = document.querySelector('.ticker');
  if (!section) return;

  const rows = [...section.querySelectorAll('[data-ticker]')].map((row) => {
    const track = row.querySelector('.ticker__track');
    row.appendChild(track.cloneNode(true)); // segunda cópia para o loop sem emenda
    return { row, dir: Number(row.dataset.ticker), x: 0, w: track.offsetWidth };
  });
  const measure = () => rows.forEach((r) => { r.w = r.row.querySelector('.ticker__track').offsetWidth; });
  window.addEventListener('resize', measure);

  let velocity = 0;   // px/s da rolagem
  let scrollDir = 1;  // 1 descendo, -1 subindo
  let visible = false;
  ScrollTrigger.create({
    trigger: section, start: 'top bottom', end: 'bottom top',
    onToggle: (self) => { visible = self.isActive; },
    onUpdate: (self) => { velocity = self.getVelocity(); scrollDir = self.direction; },
  });

  const skew = gsap.quickTo(rows.map((r) => r.row), 'skewX', { duration: 0.5, ease: 'power3.out' });
  const BASE = 48; // px/s

  gsap.ticker.add((time, deltaMs) => {
    if (!visible) return;
    const dt = Math.min(deltaMs, 50) / 1000;
    const boost = Math.min(Math.abs(velocity) / 220, 12);
    velocity *= 0.9;
    rows.forEach((r) => {
      r.x -= r.dir * scrollDir * BASE * (1 + boost) * dt;
      if (r.x <= -r.w) r.x += r.w;
      if (r.x > 0) r.x -= r.w;
      gsap.set(r.row, { x: r.x });
    });
    skew(gsap.utils.clamp(-6, 6, -velocity / 260));
  });
}
