// Rolagem suave com Lenis, sincronizada com o GSAP/ScrollTrigger.
//
// - Só com movimento permitido (sem prefers-reduced-motion).
// - No toque, a rolagem continua nativa (Lenis só suaviza roda do mouse e trackpad).
// - Links de âncora (#quem-somos, #contato...) rolam com Lenis, descontando o cabeçalho fixo,
//   e levam o foco para a seção (teclado e leitor de tela continuam funcionando).
// - Com o menu mobile aberto, a rolagem da página fica parada.

export function initSmooth() {
  const { Lenis, gsap, ScrollTrigger } = window;
  if (!Lenis || !gsap || !ScrollTrigger) return null;
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo.out: começa firme, assenta devagar
    smoothWheel: true,
    wheelMultiplier: 1,
    autoRaf: false,
  });

  // um único relógio: o ticker do GSAP move o Lenis, e cada rolagem atualiza o ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // âncoras internas (o desconto do cabeçalho vem do scroll-margin-top das seções, que o Lenis respeita)
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const id = link.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    lenis.start();
    const isTop = id === 'topo';
    lenis.scrollTo(isTop ? 0 : target, {
      duration: 1.3,
      onComplete: () => {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      },
    });
    history.replaceState(null, '', isTop ? location.pathname + location.search : `#${id}`);
  });

  window.lenis = lenis;
  return lenis;
}
