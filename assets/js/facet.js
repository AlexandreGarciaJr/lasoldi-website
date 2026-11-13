// Movimento-assinatura: "lapidação".
// A revelação abre a partir da gema de 5 faces da moeda-diamante,
// que cresce e gira levemente até cobrir o elemento — como uma pedra sendo aparada.

// Vértices da gema, extraídos do SVG oficial (moeda_diamante), normalizados pelo diâmetro da moeda
// e centrados no centroide da gema.
const GEM = (() => {
  const pts = [[43.4, 27.5], [70.4, 39.0], [74.1, 56.0], [40.1, 72.6], [28.6, 36.6]];
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return pts.map(([x, y]) => [(x - cx) / 100, (y - cy) / 100]);
})();

// Menor distância do centro até uma aresta (apótema mínimo): define a escala que cobre o retângulo.
const MIN_APOTHEM = (() => {
  let min = Infinity;
  for (let i = 0; i < GEM.length; i++) {
    const [x1, y1] = GEM[i];
    const [x2, y2] = GEM[(i + 1) % GEM.length];
    const d = Math.abs(x1 * y2 - x2 * y1) / Math.hypot(x2 - x1, y2 - y1);
    min = Math.min(min, d);
  }
  return min;
})();

function polygon(w, h, scale, angleDeg, ox = 0.5, oy = 0.5) {
  const a = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(a), sin = Math.sin(a);
  const cx = w * ox, cy = h * oy;
  return 'polygon(' + GEM.map(([x, y]) => {
    const rx = (x * cos - y * sin) * scale + cx;
    const ry = (x * sin + y * cos) * scale + cy;
    return `${rx.toFixed(1)}px ${ry.toFixed(1)}px`;
  }).join(', ') + ')';
}

/**
 * Cria a timeline da faceta para um elemento.
 * @param {HTMLElement} el
 * @param {{duration?:number, rotate?:number, ox?:number, oy?:number}} opts
 */
export function facetReveal(el, { duration = 1.2, rotate = -18, ox = 0.5, oy = 0.5 } = {}) {
  const { gsap } = window;
  const state = { p: 0 };
  const draw = () => {
    const w = el.offsetWidth, h = el.offsetHeight;
    // distância do ponto de origem ao canto mais distante
    const far = Math.max(Math.hypot(w * ox, h * oy), Math.hypot(w * (1 - ox), h * oy),
                         Math.hypot(w * ox, h * (1 - oy)), Math.hypot(w * (1 - ox), h * (1 - oy)));
    const endScale = (far / MIN_APOTHEM) * 1.02;
    const startScale = Math.min(w, h) * 0.12;
    const s = startScale + (endScale - startScale) * state.p;
    el.style.clipPath = polygon(w, h, s, rotate * (1 - state.p), ox, oy);
  };

  return gsap.timeline({
    onStart: () => { gsap.set(el, { opacity: 1 }); draw(); },
    onComplete: () => { el.style.clipPath = 'none'; },
  })
    .set(el, { opacity: 1 })
    .to(state, { p: 1, duration, ease: 'power2.inOut', onUpdate: draw });
}
