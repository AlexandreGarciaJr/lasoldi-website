// =========================================================
// "Lente lapidada": as fotos das sócias são desenhadas em WebGL e o cursor
// vira uma pequena gema de 5 faces que refrata a imagem como um diamante.
//
// - Dentro da lente: a mesa central amplia a foto; cada faceta lateral desvia
//   a imagem numa direção, com leve dispersão de cor e brilho prata nas arestas.
// - Fora da lente: a foto fica intacta (nada deforma o rosto).
// - Entrada: uma onda atravessa a imagem e assenta.
// - Rolagem: leve paralaxe e ondulação proporcional à velocidade (some ao parar).
//
// Fonte: src/lens/index.js · Gerado em assets/js/3d/ (npm run build:3d)
// =========================================================
import {
  WebGLRenderer, Scene, OrthographicCamera, PlaneGeometry, ShaderMaterial, Mesh,
  Texture, Vector2, NoColorSpace, LinearFilter,
} from 'three';

const VERT = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const FRAG = /* glsl */`
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;        // tamanho do canvas (px)
uniform vec2 uImg;        // tamanho da imagem (px)
uniform vec2 uMouse;      // posição do cursor (px, origem embaixo à esquerda)
uniform float uLens;      // 0..1 força da lente
uniform float uRadius;    // raio da lente (px)
uniform float uRot;       // rotação da gema
uniform float uWave;      // 0 → 1 entrada
uniform float uVel;       // velocidade da rolagem (normalizada)
uniform float uParallax;  // -1..1 posição na tela
uniform float uTime;
varying vec2 vUv;

const float PI = 3.14159265;

// object-fit: cover
vec2 coverUv(vec2 uv) {
  float rs = uRes.x / uRes.y, ri = uImg.x / uImg.y;
  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  return (uv - 0.5) * s + 0.5;
}

// pentágono regular (Inigo Quilez)
float sdPentagon(vec2 p, float r) {
  const vec3 k = vec3(0.809016994, 0.587785252, 0.726542528);
  p.x = abs(p.x);
  p -= 2.0 * min(dot(vec2(-k.x, k.y), p), 0.0) * vec2(-k.x, k.y);
  p -= 2.0 * min(dot(vec2(k.x, k.y), p), 0.0) * vec2(k.x, k.y);
  p -= vec2(clamp(p.x, -r * k.z, r * k.z), r);
  return length(p) * sign(p.y);
}

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

vec3 sampleRGB(vec2 uv, vec2 split) {
  return vec3(
    texture2D(uTex, uv + split).r,
    texture2D(uTex, uv).g,
    texture2D(uTex, uv - split).b
  );
}

void main() {
  vec2 uv = vUv;

  // paralaxe leve (a imagem tem folga de 6%)
  uv.y += uParallax * 0.03;
  uv = (uv - 0.5) * 0.94 + 0.5;

  // entrada: uma onda atravessa a foto e assenta
  float w = 1.0 - uWave;
  uv.x += sin(uv.y * 9.0 + uTime * 2.0) * 0.035 * w * w;
  uv.y += (1.0 - smoothstep(0.0, 1.0, uWave)) * 0.06;

  // rolagem: ondulação proporcional à velocidade
  uv.x += sin(uv.y * 14.0 + uTime * 3.0) * 0.006 * uVel;

  vec2 base = coverUv(uv);
  vec3 col = sampleRGB(base, vec2(0.0018 * (w * w + uVel * 0.4), 0.0));

  // ---- lente lapidada
  if (uLens > 0.001) {
    vec2 px = vUv * uRes - uMouse;
    vec2 p = rot(uRot) * px;
    float r = uRadius * (0.6 + 0.4 * uLens);
    float d = sdPentagon(p, r);
    if (d < 0.0) {
      float table = r * 0.42;                // mesa central
      float dt = sdPentagon(p, table);
      vec2 offs;
      float ang = atan(p.y, p.x);
      float sector = floor((ang + PI) / (2.0 * PI / 5.0));
      float mid = (sector + 0.5) * (2.0 * PI / 5.0) - PI;
      vec2 n = vec2(cos(mid), sin(mid)) * rot(-uRot);
      if (dt < 0.0) {
        offs = -px / uRes * 0.18;           // mesa: amplia
      } else {
        offs = n * 0.016 + (-px / uRes) * 0.07; // faceta: desvia na direção da face
      }
      vec2 luv = coverUv(uv + offs * uLens);
      vec3 lens = sampleRGB(luv, n * 0.0025 * uLens);
      // arestas: contorno da gema, contorno da mesa e linhas entre facetas
      float edge = 1.0 - smoothstep(0.0, 2.2, abs(d));
      float tEdge = 1.0 - smoothstep(0.0, 1.6, abs(dt));
      float bnd = abs(fract((ang + PI) / (2.0 * PI / 5.0)) - 0.0);
      float line = (1.0 - smoothstep(0.0, 0.035, min(bnd, 1.0 - bnd))) * step(0.0, dt) * smoothstep(-r, -r * 0.6, d);
      float facetShade = 0.92 + 0.08 * cos(mid * 3.0 + uRot * 2.0);
      lens *= dt < 0.0 ? 1.04 : facetShade;
      lens += vec3(0.86, 0.88, 0.92) * (edge * 0.42 + tEdge * 0.22 + line * 0.14);
      float inside = smoothstep(0.0, -1.5, d);
      col = mix(col, lens, inside * uLens);
    } else {
      // halo sutil ao redor da gema
      col += vec3(0.95) * 0.06 * uLens * (1.0 - smoothstep(0.0, 18.0, d));
    }
  }

  gl_FragColor = vec4(col, 1.0);
}`;

export function createLens(host, img, { reduced = false, lens = true } = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = 'lens__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);

  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  // o shader trabalha com os valores da foto como estão (sem conversão de espaço de cor), igual ao <img>

  const tex = new Texture(img);
  tex.colorSpace = NoColorSpace;
  tex.minFilter = LinearFilter; tex.magFilter = LinearFilter; tex.generateMipmaps = false;
  tex.needsUpdate = true;

  const U = {
    uTex: { value: tex }, uRes: { value: new Vector2(1, 1) },
    uImg: { value: new Vector2(img.naturalWidth || 880, img.naturalHeight || 1100) },
    uMouse: { value: new Vector2(-999, -999) }, uLens: { value: 0 }, uRadius: { value: 88 },
    uRot: { value: 0 }, uWave: { value: reduced ? 1 : 0 }, uVel: { value: 0 }, uParallax: { value: 0 }, uTime: { value: 0 },
  };
  const scene = new Scene();
  scene.add(new Mesh(new PlaneGeometry(2, 2), new ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: U })));
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  let dpr = 1;
  const resize = () => {
    const r = host.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(r.width, r.height, false);
    U.uRes.value.set(r.width * dpr, r.height * dpr);
    U.uRadius.value = Math.max(56, Math.min(110, r.width * 0.17)) * dpr;
  };
  resize();

  // ---- estado
  const mouse = new Vector2(-999, -999); const target = new Vector2(-999, -999);
  let lensTarget = 0; let rotVel = 0; let lastX = 0;
  const frame = host.closest('.ceo__frame') || host;
  if (lens && !reduced) {
    frame.addEventListener('pointermove', (e) => {
      const r = host.getBoundingClientRect();
      const x = (e.clientX - r.left) * dpr; const y = (r.height - (e.clientY - r.top)) * dpr;
      if (mouse.x < -900) mouse.set(x, y);
      target.set(x, y);
      rotVel += (e.clientX - lastX) * 0.002; lastX = e.clientX;
    });
    frame.addEventListener('pointerenter', (e) => { lensTarget = 1; lastX = e.clientX; });
    frame.addEventListener('pointerleave', () => { lensTarget = 0; });
  }

  let lastY = window.scrollY; let vel = 0;
  const onScroll = () => { const y = window.scrollY; vel = Math.min(1, Math.abs(y - lastY) / 60); lastY = y; };
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---- entrada: a onda roda uma vez quando a foto aparece
  let waveStart = -1;
  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible && waveStart < 0 && !reduced) waveStart = performance.now() + 250;
    if (visible) start(); else stop();
  }, { threshold: 0.05 });
  let visible = false; let running = false; let raf = 0; let last = performance.now();

  const step = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    U.uTime.value = now / 1000;
    if (waveStart > 0) U.uWave.value = Math.min(1, Math.max(0, (now - waveStart) / 1600));
    mouse.lerp(target, Math.min(1, dt * 10));
    U.uMouse.value.copy(mouse);
    U.uLens.value += (lensTarget - U.uLens.value) * Math.min(1, dt * 6);
    rotVel *= Math.pow(0.04, dt);
    U.uRot.value += (0.25 + rotVel * 8) * dt;
    vel *= Math.pow(0.02, dt);
    U.uVel.value += (vel - U.uVel.value) * Math.min(1, dt * 8);
    const r = host.getBoundingClientRect();
    U.uParallax.value = Math.max(-1, Math.min(1, ((r.top + r.height / 2) / window.innerHeight - 0.5) * 2));
    renderer.render(scene, camera);
  };
  const loop = (now) => { raf = 0; if (!running) return; step(now); raf = requestAnimationFrame(loop); };
  const start = () => { if (running || reduced || !visible || document.hidden) return; running = true; last = performance.now(); raf = requestAnimationFrame(loop); };
  const stop = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; };
  io.observe(host);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  const ro = new ResizeObserver(() => { resize(); if (!running) step(performance.now()); });
  ro.observe(host);

  step(performance.now());
  host.classList.add('lens--ready');
  return { stop, start };
}
