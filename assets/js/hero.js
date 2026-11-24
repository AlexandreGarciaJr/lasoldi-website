// Hero: os textos entram e saem com efeito próprio.
// Entrada: letras do rótulo em cascata, linhas do título sobem pela máscara
// endireitando de uma leve inclinação, texto sai do desfoque, botões sobem,
// a assinatura surge do desfoque. A foto abre pela gema da moeda.
// Saída (ligada à rolagem, reversível): tudo se dissolve para cima.
import { facetReveal } from './facet.js';

export function initHero({ isMobile }) {
  const { gsap, SplitText } = window;
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const eyebrow = hero.querySelector('[data-hero="eyebrow"]');
  const title = hero.querySelector('[data-split="hero"]');
  const lead = hero.querySelector('[data-hero="lead"]');
  const actions = hero.querySelector('[data-hero="actions"]');
  const tag = hero.querySelector('[data-hero="tag"]');
  const photo = hero.querySelector('[data-facet="hero"]');

  // palavras + letras: a linha só quebra entre palavras
  const chars = SplitText.create(hero.querySelector('[data-hero-chars]'), { type: 'words,chars', aria: 'none' }).chars;
  gsap.set([eyebrow, lead, actions, tag, title], { visibility: 'visible' });

  let lines = [];
  let entranceDone = false;
  let exitTl = null;

  const buildExit = () => {
    exitTl?.scrollTrigger?.kill();
    exitTl?.kill();
    const blur = isMobile ? 'blur(4px)' : 'blur(8px)';
    exitTl = gsap.timeline({
      defaults: { ease: 'none', immediateRender: false },
      scrollTrigger: { trigger: hero, start: 'top top', end: isMobile ? '70% top' : '55% top', scrub: 0.35 },
    });
    exitTl
      .fromTo(chars, { opacity: 1, y: 0 }, { opacity: 0, y: -12, stagger: { each: 0.006, from: 'end' } }, 0)
      .fromTo(lines, { yPercent: 0, rotate: 0 }, { yPercent: -118, rotate: -2.5, stagger: 0.06 }, 0.04)
      .fromTo(lead, { opacity: 1, y: 0, filter: 'blur(0px)' }, { opacity: 0, y: -40, filter: blur }, 0.1)
      .fromTo(actions, { opacity: 1, y: 0 }, { opacity: 0, y: -36 }, 0.16)
      .fromTo(tag, { opacity: 1, y: 0, filter: 'blur(0px)' }, { opacity: 0, y: -24, filter: blur }, 0.2);
  };

  const tl = gsap.timeline({ delay: 0.15, onComplete: () => { entranceDone = true; buildExit(); } });

  SplitText.create(title, {
    type: 'lines', mask: 'lines', autoSplit: true,
    onSplit(self) {
      self.masks?.forEach((m) => m.classList.add('split-line-mask'));
      lines = self.lines;
      if (entranceDone) { buildExit(); return; }
      gsap.set(lines, { transformOrigin: '0% 100%' });
      tl.from(lines, { yPercent: 118, rotate: 4, duration: 1.15, stagger: 0.09, ease: 'power4.out' }, 0.1);
    },
  });

  tl.from(chars, { opacity: 0, y: 8, duration: 0.6, stagger: 0.012, ease: 'power2.out' }, 0)
    .from(lead, { opacity: 0, y: 18, filter: 'blur(10px)', duration: 1.1, ease: 'power3.out', clearProps: 'filter' }, 0.45)
    .from(actions, { opacity: 0, y: 22, duration: 0.9, ease: 'power3.out' }, 0.6)
    .from(tag, { opacity: 0, y: 12, filter: 'blur(12px)', duration: 1, ease: 'power3.out', clearProps: 'filter' }, 0.85);

  if (photo) {
    tl.add(facetReveal(photo, { duration: 1.4, rotate: -24, ox: 0.51, oy: 0.46 }), 0.25)
      .from(photo.querySelector('img'), { scale: 1.18, duration: 1.8, ease: 'power3.out' }, 0.25);
    if (!isMobile) {
      gsap.to(hero.querySelector('.hero__media'), {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });
    }
  }
}
