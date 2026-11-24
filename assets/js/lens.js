// Carrega a "lente lapidada" (assets/js/3d/lens.js, gerado de src/lens/) nas fotos das sócias.
// Desktop: lente + onda de entrada + ondulação na rolagem. Celular: só onda e rolagem.
// Sem WebGL ou com movimento reduzido: fica a foto normal (nada muda).

export async function initLens({ reduced = false } = {}) {
  if (reduced) return;
  const shapes = [...document.querySelectorAll('.ceo__shape')];
  if (!shapes.length) return;
  try {
    const c = document.createElement('canvas');
    if (!(c.getContext('webgl2') || c.getContext('webgl'))) return;
  } catch { return; }

  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  try {
    const { createLens } = await import('./3d/lens.js');
    await Promise.all(shapes.map(async (shape) => {
      const img = shape.querySelector('img');
      if (!img) return;
      img.loading = 'eager';
      try { await img.decode(); } catch { /* usa quando carregar */ }
      if (!img.naturalWidth) return;
      try { createLens(shape, img, { lens: fine }); }
      catch (err) { console.warn('[lente] foto normal:', err); }
    }));
  } catch (err) {
    console.warn('[lente] foto normal:', err);
  }
}
