// Revelações por rolagem (GSAP + ScrollTrigger + SplitText).
// Tokens espelham assets/css/tokens.css.
import { facetReveal } from './facet.js';
import { initHero } from './hero.js';

const T = {
  easeLapida: 'power2.inOut',   // cubic-bezier(.65,0,.35,1)
  easeOut: 'power4.out',        // cubic-bezier(.22,1,.36,1)
  durBase: 0.6,
  durReveal: 0.9,
  durFacet: 1.2,
  staggerLine: 0.07,
  staggerItem: 0.11,
  start: 'top 82%',
};

export function initReveals() {
  const { gsap, ScrollTrigger, SplitText } = window;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: T.easeOut });

  const isMobile = matchMedia('(max-width: 899px)').matches;
  const shift = isMobile ? 16 : 24;

  // ---------- hero: entrada e saída próprias ----------
  initHero({ isMobile });

  // ---------- títulos: linhas sobem por trás de máscara ----------
  document.querySelectorAll('[data-split]').forEach((el) => {
    if (el.closest('.hero')) return;
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit(self) {
        gsap.set(el, { visibility: 'visible' });
        self.masks?.forEach((m) => m.classList.add('split-line-mask'));
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: T.durReveal,
          stagger: T.staggerLine,
          scrollTrigger: { trigger: el, start: T.start, once: true },
        });
      },
    });
  });

  // ---------- fades simples (eyebrows, parágrafos, CTAs) ----------
  ScrollTrigger.batch(gsap.utils.toArray('[data-reveal="fade"]').filter((el) => !el.closest('.hero')), {
    start: T.start,
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: T.durReveal, stagger: T.staggerItem }),
  });

  // ---------- manifesto: as palavras ganham tinta conforme a leitura ----------
  const manifesto = document.querySelector('[data-manifesto]');
  if (manifesto) {
    const { words } = SplitText.create(manifesto, { type: 'words', aria: 'none' });
    gsap.set(manifesto, { visibility: 'visible' });
    gsap.fromTo(words, { opacity: 0.22 }, {
      opacity: 1, ease: 'none', stagger: 0.12,
      scrollTrigger: {
        trigger: manifesto, start: 'top 78%', end: 'bottom 52%', scrub: 0.6,
        // depois de lido, o texto fica com tinta cheia (não volta a apagar ao subir)
        onLeave: (self) => { self.animation.progress(1); self.kill(false, true); },
      },
    });
  }

  // ---------- princípios: o fio superior se desenha, depois o conteúdo ----------
  ScrollTrigger.batch('[data-reveal="line"]', {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: T.durReveal, stagger: T.staggerItem }),
  });

  // ---------- método: fio contínuo com laços ----------
  const track = document.querySelector('.method__track');
  const thread = document.querySelector('[data-thread] path');
  if (track) {
    if (!isMobile && thread) {
      gsap.to(thread, {
        strokeDashoffset: 0, ease: 'none',
        scrollTrigger: { trigger: track, start: 'top 85%', end: 'bottom 60%', scrub: 0.8 },
      });
    } else {
      gsap.to(track, {
        '--thread-progress': 1, duration: 1.6, ease: T.easeLapida,
        scrollTrigger: { trigger: track, start: 'top 80%', once: true },
      });
    }
    ScrollTrigger.batch('[data-reveal="step"]', {
      start: 'top 86%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: T.durReveal, stagger: T.staggerItem * 1.4 }),
    });
  }

  // ---------- facetas (movimento-assinatura, 3 vezes) ----------
  // 1. Moeda do hero
  const heroCoin = document.querySelector('[data-facet="hero"]');
  if (heroCoin) facetReveal(heroCoin, { duration: T.durFacet + 0.2, rotate: -24, ox: 0.513, oy: 0.463 }).delay(0.25);

  // 2. Pico: a seção ameixa se abre a partir da gema, depois a citação entra palavra a palavra
  const quotePanel = document.querySelector('[data-facet="quote"]');
  const quoteText = document.querySelector('[data-split-words]');
  if (quotePanel) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: quotePanel, start: 'top 72%', once: true } });
    tl.add(facetReveal(quotePanel, { duration: T.durFacet, rotate: -14 }));
    if (quoteText) {
      const split = SplitText.create(quoteText, { type: 'words', aria: 'none' });
      gsap.set(quoteText, { visibility: 'visible' });
      gsap.set(split.words, { opacity: 0, y: shift });
      tl.to(split.words, { opacity: 1, y: 0, duration: T.durReveal, stagger: T.staggerLine }, '-=0.35');
    }
    tl.from('.quote__coin, .quote__by', { opacity: 0, y: shift * 0.6, duration: T.durBase, stagger: 0.1 }, '-=0.5');
  } else if (quoteText) {
    gsap.set(quoteText, { visibility: 'visible' });
  }

  // 3. Painel do formulário
  const formPanel = document.querySelector('[data-facet="form"]');
  if (formPanel) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: formPanel, start: 'top 80%', once: true } });
    tl.add(facetReveal(formPanel, { duration: T.durFacet, rotate: 12, ox: 0.5, oy: 0.4 }));
  }

  // ---------- parallax discreto (só desktop) ----------
  if (!isMobile) {
    gsap.to('.hero__coin', {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.hero__pattern', {
      yPercent: -4, rotate: 6, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  // Recalcula depois que imagens/fontes assentarem.
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}
