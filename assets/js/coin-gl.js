// Prata viva: shader WebGL leve (sem bibliotecas) que dá reflexo metálico real
// à moeda-diamante do hero. A forma vem do SVG oficial (usado como máscara),
// então o desenho da marca nunca é alterado — só o acabamento ganha luz.
//
// Orçamento: 1 draw call, 1 textura, ~30 fps, pausa fora da tela e com a aba oculta.
// Fallback: o próprio <img> SVG (que já é o LCP) permanece se algo falhar.

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  v_uv.y = 1.0 - v_uv.y;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D u_mask;
uniform vec2 u_px;        // tamanho de 1 pixel em uv
uniform float u_shift;    // deslocamento do degradê (rolagem + tempo + ponteiro)
uniform float u_sweep;    // posição do brilho que atravessa a moeda
uniform float u_sweepAmt; // intensidade do brilho
varying vec2 v_uv;

// Degradê oficial "prata sobre fundo claro" (kit 04_Cores)
vec3 prata(float t) {
  vec3 c0 = vec3(0.894, 0.906, 0.918);
  vec3 c1 = vec3(0.616, 0.639, 0.667);
  vec3 c2 = vec3(0.827, 0.843, 0.859);
  vec3 c3 = vec3(0.435, 0.463, 0.494);
  vec3 c4 = vec3(0.769, 0.784, 0.804);
  vec3 c5 = vec3(0.522, 0.549, 0.580);
  t = clamp(t, 0.0, 1.0);
  if (t < 0.20) return mix(c0, c1, smoothstep(0.0, 0.20, t));
  if (t < 0.40) return mix(c1, c2, smoothstep(0.20, 0.40, t));
  if (t < 0.58) return mix(c2, c3, smoothstep(0.40, 0.58, t));
  if (t < 0.75) return mix(c3, c4, smoothstep(0.58, 0.75, t));
  return mix(c4, c5, smoothstep(0.75, 1.0, t));
}

float hash(float n) { return fract(sin(n) * 43758.5453); }

void main() {
  float a = texture2D(u_mask, v_uv).a;
  if (a < 0.003) { gl_FragColor = vec4(0.0); return; }

  // eixo diagonal do degradê (135°), como no SVG oficial
  float d = (v_uv.x + v_uv.y) * 0.5;
  float t = d + u_shift;
  t = abs(fract(t * 0.5) * 2.0 - 1.0);   // ping-pong: sem emenda
  vec3 col = prata(t);

  // metal escovado: linhas horizontais finas com variação
  float line = floor(v_uv.y / (u_px.y * 2.0));
  col += (hash(line) - 0.5) * 0.032;

  // relevo: borda da moeda e da gema captam luz vinda do alto à esquerda
  vec2 L = normalize(vec2(-1.0, -1.0)) * u_px * 2.5;
  float emboss = texture2D(u_mask, v_uv + L).a - texture2D(u_mask, v_uv - L).a;
  col += emboss * 0.32;

  // brilho que atravessa a peça
  float band = exp(-pow((d - u_sweep) * 7.0, 2.0));
  col += band * u_sweepAmt;

  col = clamp(col, 0.0, 1.0);
  gl_FragColor = vec4(col * a, a);
}`;

export function initCoinGL(canvas, { motion = true } = {}) {
  if (!canvas || !motion) return;
  const host = canvas.closest('.coin');
  const img = host?.querySelector('.coin__svg');
  if (!host || !img) return;

  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false, powerPreference: 'low-power' });
  if (!gl) return;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };

  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (err) {
    console.warn('[coin-gl] fallback SVG:', err);
    return;
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const U = {
    px: gl.getUniformLocation(prog, 'u_px'),
    shift: gl.getUniformLocation(prog, 'u_shift'),
    sweep: gl.getUniformLocation(prog, 'u_sweep'),
    sweepAmt: gl.getUniformLocation(prog, 'u_sweepAmt'),
  };

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const isTouch = matchMedia('(pointer: coarse)').matches;
  const dprCap = isTouch ? 1.25 : 1.75;
  const mask = document.createElement('canvas');
  const mctx = mask.getContext('2d');

  let w = 0, h = 0;
  const resize = () => {
    const rect = host.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const nw = Math.max(2, Math.round(rect.width * dpr));
    const nh = Math.max(2, Math.round(rect.height * dpr));
    if (nw === w && nh === h) return;
    w = nw; h = nh;
    canvas.width = w; canvas.height = h;
    mask.width = w; mask.height = h;
    mctx.clearRect(0, 0, w, h);
    mctx.drawImage(img, 0, 0, w, h);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);
    gl.viewport(0, 0, w, h);
    gl.uniform2f(U.px, 1 / w, 1 / h);
    dirty = true;
  };

  // ---- estado animado
  let dirty = true;
  let scrollShift = 0, ptr = 0, ptrTarget = 0;
  const t0 = performance.now();

  const onScroll = () => {
    scrollShift = Math.min(window.scrollY / (window.innerHeight * 1.2), 1) * 0.55;
    dirty = true;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  if (!isTouch) {
    window.addEventListener('pointermove', (e) => { ptrTarget = (e.clientX / window.innerWidth - 0.5) * 0.12; }, { passive: true });
  }

  let visible = true, running = false, last = 0, raf = 0;
  const frame = (now) => {
    raf = 0;
    if (!visible || document.hidden) { running = false; return; }
    raf = requestAnimationFrame(frame);
    if (now - last < 33) return; // ~30 fps é suficiente para luz lenta
    last = now;

    const time = (now - t0) / 1000;
    ptr += (ptrTarget - ptr) * 0.06;
    const idle = Math.sin(time * 0.22) * 0.05;
    const shift = 0.18 + scrollShift + idle + ptr;

    // brilho: entrada forte + passagem lenta a cada ~9 s
    const introP = Math.min(time / 2.4, 1);
    const introSweep = -0.4 + 1.9 * (1 - Math.pow(1 - introP, 3));
    const loop = ((time + 4) % 9) / 9;
    const loopSweep = -0.4 + 1.9 * loop;
    const sweep = introP < 1 ? introSweep : loopSweep;
    const amt = introP < 1 ? 0.38 * Math.sin(introP * Math.PI) : 0.16 * Math.sin(loop * Math.PI);

    gl.uniform1f(U.shift, shift);
    gl.uniform1f(U.sweep, sweep);
    gl.uniform1f(U.sweepAmt, amt);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    dirty = false;
  };
  const start = () => { if (!running) { running = true; raf = requestAnimationFrame(frame); } };

  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) start(); }).observe(host);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
  new ResizeObserver(resize).observe(host);
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); host.classList.remove('has-gl'); cancelAnimationFrame(raf); });

  const ready = img.complete && img.naturalWidth ? Promise.resolve() : new Promise((r) => img.addEventListener('load', r, { once: true }));
  ready.then(() => {
    resize();
    onScroll();
    start();
    requestAnimationFrame(() => host.classList.add('has-gl'));
  });
}
