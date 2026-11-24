// Revelações por rolagem (GSAP + ScrollTrigger + SplitText), na linguagem do V02.
import { facetReveal } from './facet.js';
import { initHero } from './hero.js';
import { initTicker } from './ticker.js';

const T = { ease: 'power4.out', dur: 0.9, start: 'top 84%' };

export function initReveals() {
  const { gsap, ScrollTrigger, SplitText } = window;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const isMobile = matchMedia('(max-width: 899px)').matches;

  initHero({ isMobile });
  initTicker();

  // ---------- títulos: linhas sobem por trás da máscara ----------
  document.querySelectorAll('[data-split]:not([data-split="hero"])').forEach((el) => {
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit(self) {
        gsap.set(el, { visibility: 'visible' });
        self.masks?.forEach((m) => m.classList.add('split-line-mask'));
        gsap.set(self.lines, { transformOrigin: '0% 100%' });
        return gsap.from(self.lines, {
          yPercent: 112, rotate: 2.5, duration: 1, stagger: 0.08, ease: T.ease,
          scrollTrigger: { trigger: el, start: T.start, once: true },
        });
      },
    });
  });

  // ---------- fades ----------
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%', once: true,
    onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: T.dur, stagger: 0.1, ease: T.ease }),
  });

  // ---------- números da faixa: contam até o valor real ----------
  document.querySelectorAll('[data-count]').forEach((el) => {
    const to = Number(el.dataset.count);
    const o = { v: 0 };
    el.textContent = '0';
    gsap.to(o, {
      v: to, duration: to > 5 ? 1.8 : 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      onUpdate: () => { el.textContent = String(Math.round(o.v)); },
    });
  });

  // ---------- manifesto: as palavras ganham tinta conforme a leitura (reversível) ----------
  const man = document.querySelector('[data-manifesto]');
  if (man) {
    const { words } = SplitText.create(man, { type: 'words', aria: 'none' });
    gsap.set(man, { visibility: 'visible' });
    gsap.fromTo(words, { opacity: (i, el) => (el.closest('em') ? 0.75 : 0.68) }, {
      opacity: 1, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: man, start: 'top 80%', end: 'bottom 50%', scrub: 0.6 },
    });
  }

  // ---------- fundadoras: o painel abre pela gema, a foto assenta ----------
  document.querySelectorAll('[data-ceo]').forEach((ceo, i) => {
    const cut = ceo.querySelector('.ceo__cut');
    const img = cut.querySelector('img');
    gsap.set(cut, { opacity: 0 });
    gsap.timeline({ scrollTrigger: { trigger: ceo, start: 'top 82%', once: true } })
      .add(facetReveal(cut, { rotate: i ? 12 : -12, ox: 0.5, oy: 0.45, duration: 1.25 }))
      .from(img, { scale: 1.18, duration: 1.6, ease: 'power3.out' }, 0)
      .from(ceo.querySelector('.ceo__line'), { opacity: 0, x: 14, y: 14, duration: 1, ease: T.ease }, 0.5)
      .from(ceo.querySelectorAll('figcaption > span'), { opacity: 0, y: 16, stagger: 0.08, duration: 0.8, ease: T.ease }, 0.7);
    if (!isMobile) gsap.to(img, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: ceo, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // ---------- princípios: o fio se desenha, depois o texto ----------
  ScrollTrigger.batch('[data-principle]', {
    start: 'top 90%', once: true,
    onEnter: (b) => {
      gsap.to(b, { '--draw': 1, duration: 1.2, stagger: 0.12, ease: 'power2.inOut' });
      gsap.fromTo(b.flatMap((x) => [...x.children]), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.06, delay: 0.25, ease: T.ease });
    },
  });

  // ---------- para quem: a foto abre pela gema ----------
  const who = document.querySelector('[data-facet="who"]');
  if (who) {
    gsap.timeline({ scrollTrigger: { trigger: who, start: 'top 80%', once: true } })
      .add(facetReveal(who, { rotate: 14, ox: 0.5, oy: 0.5, duration: 1.3 }))
      .from(who.querySelector('img'), { scale: 1.2, duration: 1.7, ease: 'power3.out' }, 0);
  }

  // ---------- método: o fio atravessa as etapas ----------
  const thread = document.querySelector('[data-thread]');
  if (thread && !isMobile) {
    gsap.to(thread, { '--p': 1, ease: 'none', scrollTrigger: { trigger: '.method__track', start: 'top 80%', end: 'bottom 55%', scrub: 0.8 } });
  } else if (thread) gsap.set(thread, { '--p': 1 });

  // ---------- citação: o painel abre pela gema, palavras entram uma a uma ----------
  const panel = document.querySelector('[data-facet="quote"]');
  if (panel) {
    const q = panel.querySelector('[data-words]');
    const { words } = SplitText.create(q, { type: 'words', aria: 'none' });
    gsap.set(q, { visibility: 'visible' });
    gsap.set(words, { opacity: 0, y: 24 });
    gsap.timeline({ scrollTrigger: { trigger: panel, start: 'top 72%', once: true } })
      .add(facetReveal(panel, { rotate: -14 }))
      .to(words, { opacity: 1, y: 0, duration: T.dur, stagger: 0.06, ease: T.ease }, '-=0.35')
      .to(panel.querySelectorAll('[data-q]'), { opacity: 1, duration: 0.6, stagger: 0.1 }, '-=0.5');
  }

  // ---------- formulário: abre pela gema ----------
  const form = document.querySelector('[data-facet="form"]');
  if (form) {
    gsap.timeline({ scrollTrigger: { trigger: form, start: 'top 82%', once: true } })
      .add(facetReveal(form, { rotate: 12, ox: 0.5, oy: 0.4 }));
  }

  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}
