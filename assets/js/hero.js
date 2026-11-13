// Hero: os textos entram e saem com efeito próprio.
//
// Entrada (no carregamento):
//   eyebrow  → letras em cascata
//   título   → linhas sobem por trás da máscara, endireitando de uma leve inclinação
//   texto    → foco: sai do desfoque
//   botões   → sobem em sequência
//   tagline  → palavras surgem do desfoque, uma a uma
//
// Saída (ligada à rolagem, reversível):
//   as linhas do título sobem e somem dentro da máscara, o resto se dissolve
//   para cima com desfoque. Ao voltar para o topo, tudo se recompõe.

export function initHero({ isMobile }) {
  const { gsap, ScrollTrigger, SplitText } = window;
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const eyebrow = hero.querySelector('[data-hero="eyebrow"]');
  const eyebrowChars = hero.querySelector('[data-hero-chars]');
  const title = hero.querySelector('.hero__title');
  const lead = hero.querySelector('[data-hero="lead"]');
  const actions = hero.querySelector('[data-hero="actions"]');
  const tagline = hero.querySelector('[data-hero="tagline"]');

  const chars = SplitText.create(eyebrowChars, { type: 'chars', aria: 'none' }).chars;
  const words = SplitText.create(tagline, { type: 'words', aria: 'none' }).words;

  gsap.set([eyebrow, lead, actions, tagline, title], { visibility: 'visible' });

  let lines = [];
  let entranceDone = false;
  let exitTl = null;

  // ---------- saída ----------
  const buildExit = () => {
    exitTl?.scrollTrigger?.kill();
    exitTl?.kill();
    const blurOut = isMobile ? 'blur(4px)' : 'blur(8px)';
    exitTl = gsap.timeline({
      defaults: { ease: 'none', immediateRender: false },
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: isMobile ? '70% top' : '45% top',
        scrub: 0.35,
      },
    });
    exitTl
      .fromTo(chars, { opacity: 1, y: 0 }, { opacity: 0, y: -12, stagger: { each: 0.006, from: 'end' } }, 0)
      .fromTo(lines, { yPercent: 0, rotate: 0 }, { yPercent: -118, rotate: -2.5, stagger: 0.06 }, 0.04)
      .fromTo(lead, { opacity: 1, y: 0, filter: 'blur(0px)' }, { opacity: 0, y: -40, filter: blurOut }, 0.1)
      .fromTo(actions, { opacity: 1, y: 0 }, { opacity: 0, y: -36 }, 0.16)
      .fromTo(words, { opacity: 1, y: 0, filter: 'blur(0px)' }, { opacity: 0, y: -18, filter: blurOut, stagger: 0.04 }, 0.05);
  };

  // ---------- título (linhas com máscara, re-split ao redimensionar) ----------
  const tl = gsap.timeline({ delay: 0.15, onComplete: () => { entranceDone = true; buildExit(); } });

  SplitText.create(title, {
    type: 'lines',
    mask: 'lines',
    autoSplit: true,
    onSplit(self) {
      self.masks?.forEach((m) => m.classList.add('split-line-mask'));
      lines = self.lines;
      if (entranceDone) { buildExit(); return; }
      gsap.set(lines, { transformOrigin: '0% 100%' });
      tl.from(lines, { yPercent: 118, rotate: 4, duration: 1.15, stagger: 0.09, ease: 'power4.out' }, 0.1);
    },
  });

  // ---------- entrada ----------
  tl.from(chars, { opacity: 0, y: 8, duration: 0.6, stagger: 0.014, ease: 'power2.out' }, 0)
    .from(lead, { opacity: 0, y: 18, filter: 'blur(10px)', duration: 1.1, ease: 'power3.out', clearProps: 'filter' }, 0.45)
    .from(actions, { opacity: 0, y: 22, duration: 0.9, ease: 'power3.out' }, 0.6)
    .from(words, { opacity: 0, y: 12, filter: 'blur(12px)', duration: 1, stagger: 0.09, ease: 'power3.out', clearProps: 'filter' }, 0.85);

  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}
