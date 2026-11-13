// La Soldi Capital · boot
import { initNav } from './nav.js';
import { initForm } from './form.js';
import { initReveals } from './reveal.js';
import { initCoinGL } from './coin-gl.js';

const yearEl = document.querySelector('[data-year]');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

initNav();
initForm();

const motionOK = document.documentElement.classList.contains('motion');

if (motionOK && window.gsap && window.ScrollTrigger && window.SplitText) {
  // Espera as fontes para quebrar linhas com as métricas reais (evita re-split visível).
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1200))]).then(() => {
    initReveals();
    window.__lsMotionReady = true;
  });
} else {
  document.documentElement.classList.remove('motion');
  window.__lsMotionReady = true;
}

// O brilho da prata entra depois do primeiro paint (não compete com o LCP).
const startGL = () => initCoinGL(document.querySelector('[data-coin-gl]'), { motion: motionOK });
if ('requestIdleCallback' in window) requestIdleCallback(startGL, { timeout: 1500 });
else setTimeout(startGL, 600);
