// La Soldi Capital · boot
import { initNav } from './nav.js';
import { initForm } from './form.js';
import { initReveals } from './reveal.js';
import { initHover } from './hover.js';
import { initSmooth } from './smooth.js';
import { initCoins } from './coins.js';

const yearEl = document.querySelector('[data-year]');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

initNav();
initForm();

const motionOK = document.documentElement.classList.contains('motion');
const hasGsap = !!(window.gsap && window.ScrollTrigger && window.SplitText);
initHover({ motion: motionOK && hasGsap });

if (motionOK && hasGsap) {
  initSmooth();
  // espera as fontes para quebrar as linhas com as métricas reais
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1200))]).then(() => {
    initReveals();
    window.__lsMotionReady = true;
  });
} else {
  document.documentElement.classList.remove('motion');
  window.__lsMotionReady = true;
}

// A cena 3D entra depois do primeiro paint: não compete com o conteúdo.
const startCoins = () => initCoins({ reduced: !motionOK });
if ('requestIdleCallback' in window) requestIdleCallback(startCoins, { timeout: 1800 });
else setTimeout(startCoins, 700);
