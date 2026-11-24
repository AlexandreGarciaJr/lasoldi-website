// Carrega a chuva de moedas 3D (assets/js/3d/coins.js, gerado de src/coins/)
// em cada área [data-coins]. A velocidade de rolagem acelera a queda.
// Se o WebGL não existir ou o carregamento falhar, entram moedas renderizadas
// (imagens) paradas no lugar: a página nunca fica vazia nem quebra.

const FALLBACK = {
  hero: [[2, 0.74, 0.95, 1], [4, 0.2, 0.8, 1], [7, 0.9, 0.42, 0.4], [1, 0.08, 0.46, 0.5], [3, 0.5, 0.52, 0.7]],
  who: [[2, 0.82, 0.7, 1], [5, 0.12, 0.6, 0.8], [6, 0.55, 0.4, 0.5]],
  quote: [[2, 0.08, 0.62, 0.8], [4, 0.86, 0.72, 0.9], [1, 0.22, 0.36, 0.4], [7, 0.72, 0.34, 0.35]],
};

function staticCoins(box) {
  const spec = FALLBACK[box.dataset.coins] || [];
  spec.forEach(([k, x, s, depth], i) => {
    const img = new Image();
    img.src = `assets/img/moedas/moeda-${k}.webp`;
    img.alt = '';
    img.className = 'coins__static';
    img.style.setProperty('--w', `${Math.round(200 * s)}px`);
    img.style.setProperty('--x', `${x * 100}%`);
    img.style.setProperty('--y', `${((i * 0.37) % 0.8) * 100}%`);
    img.style.setProperty('--r', `${(i % 2 ? -1 : 1) * (12 + i * 9)}deg`);
    if (depth < 0.6) { img.style.setProperty('--f', `blur(${(1 - depth) * 3}px)`); img.style.setProperty('--o', String(0.5 + depth)); }
    box.appendChild(img);
  });
}

// densidade e tamanho por área: no topo e no Para quem as moedas não podem cobrir a foto
const ZONES = {
  hero: { density: 0.6, size: 0.5 },
  who: { density: 0.45, size: 0.5 },
  quote: { density: 1, size: 0.62 },
};

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

export async function initCoins({ reduced = false } = {}) {
  const boxes = [...document.querySelectorAll('[data-coins]')];
  if (!boxes.length) return;
  if (!hasWebGL()) { boxes.forEach(staticCoins); return; }

  // velocidade de rolagem → impulso na queda (0 a ~3)
  let boost = 0;
  const { ScrollTrigger } = window;
  if (ScrollTrigger && !reduced) {
    ScrollTrigger.create({
      onUpdate: (self) => { boost = Math.min(3, Math.abs(self.getVelocity()) / 900); },
    });
    const decay = () => { boost *= 0.92; requestAnimationFrame(decay); };
    requestAnimationFrame(decay);
  }

  try {
    const { createCoinRain } = await import('./3d/coins.js');
    boxes.forEach((box) => {
      try { createCoinRain(box, { reduced, boostSource: () => boost, ...(ZONES[box.dataset.coins] || {}) }); }
      catch (err) { console.warn('[moedas] fallback:', err); staticCoins(box); }
    });
  } catch (err) {
    console.warn('[moedas] fallback:', err);
    boxes.forEach(staticCoins);
  }
}
