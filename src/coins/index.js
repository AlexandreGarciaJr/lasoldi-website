// =========================================================
// Chuva de moedas do Grupo Diamond, em 3D real (Three.js).
//
// Cada moeda é a moeda-diamante do grupo: disco metálico com a gema vazada,
// gerado em código (sem GLB) e renderizado no navegador com material PBR,
// reflexo de ambiente e tone mapping. Três metais, um por empresa:
//   prata  → LA Soldi Capital
//   ouro   → DI Private
//   bronze → LA Diamond Securitizadora
//
// Duas camadas de profundidade: moedas próximas (nítidas, opacas) e
// distantes (menores, mais foscas e translúcidas), para dar profundidade
// sem pós-processamento caro.
//
// Fonte deste arquivo: src/coins/index.js
// Gerado para: assets/js/coins.bundle.js  (npm run build:coins)
// =========================================================
import {
  WebGLRenderer, Scene, PerspectiveCamera, PMREMGenerator, Shape, Path, ExtrudeGeometry,
  MeshPhysicalMaterial, InstancedMesh, Object3D, Vector2, Vector3, Quaternion, Euler, Color,
  DirectionalLight, ACESFilmicToneMapping, SRGBColorSpace, DynamicDrawUsage, MathUtils,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export const COIN_CONFIG = {
  metals: {
    prata: { color: '#c9ced4', roughness: 0.34, share: 0.5 },
    ouro: { color: '#c9a25a', roughness: 0.32, share: 0.25 },
    bronze: { color: '#a8693f', roughness: 0.36, share: 0.25 },
  },
  desktop: { count: 22, maxDpr: 1.75, antialias: true },
  mobile: { count: 11, maxDpr: 1.6, antialias: true },
  fov: 30,
  cameraZ: 16,
  near: { z: [-1.5, 3.5], scale: [0.72, 1.15], speed: [1.0, 1.5] },
  far: { z: [-12, -4], scale: [0.5, 0.85], speed: [0.55, 0.9], opacity: 0.55 },
  exposure: 0.92,
};

// gema do símbolo do grupo (moeda com diamante), normalizada pelo raio da moeda
const GEM = [[-0.295, 0.363], [0.295, 0.363], [0.496, 0.078], [0, -0.496], [-0.496, 0.078]];

function coinGeometry(segments) {
  const shape = new Shape();
  shape.absarc(0, 0, 1, 0, Math.PI * 2, false);
  const hole = new Path();
  GEM.forEach(([x, y], i) => (i ? hole.lineTo(x * 0.92, y * 0.92) : hole.moveTo(x * 0.92, y * 0.92)));
  hole.closePath();
  shape.holes.push(hole);
  const geo = new ExtrudeGeometry(shape, {
    depth: 0.17, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.045, bevelSegments: 4, curveSegments: segments,
  });
  geo.center();
  geo.computeVertexNormals();
  return geo;
}

const rand = (a, b) => a + Math.random() * (b - a);

export function createCoinRain(host, { reduced = false, boostSource = null, pointer = true, density = 1, size = 1 } = {}) {
  const isMobile = matchMedia('(max-width: 899px), (pointer: coarse)').matches;
  const Q = isMobile ? COIN_CONFIG.mobile : COIN_CONFIG.desktop;

  const canvas = document.createElement('canvas');
  canvas.className = 'coins__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: Q.antialias, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = COIN_CONFIG.exposure;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const key = new DirectionalLight(0xfff4e8, 2.2);
  key.position.set(-5, 7, 6);
  scene.add(key);
  const rim = new DirectionalLight(0xd9c7e0, 0.9); // contraluz lilás frio: separa a borda do fundo
  rim.position.set(6, -3, -4);
  scene.add(rim);

  const camera = new PerspectiveCamera(COIN_CONFIG.fov, 1, 0.1, 60);
  camera.position.set(0, 0, COIN_CONFIG.cameraZ);

  const geoNear = coinGeometry(isMobile ? 48 : 72);
  const geoFar = coinGeometry(32);

  // ---- monta as camadas: para cada metal, uma malha instanciada perto e uma longe
  const layers = [];
  const metals = Object.entries(COIN_CONFIG.metals);
  for (const depth of ['near', 'far']) {
    const D = COIN_CONFIG[depth];
    const total = Math.round(Q.count * density * (depth === 'near' ? 0.45 : 0.55));
    for (const [name, M] of metals) {
      const n = Math.max(1, Math.round(total * M.share));
      const mat = new MeshPhysicalMaterial({
        color: new Color(M.color), metalness: 1, roughness: depth === 'far' ? M.roughness + 0.18 : M.roughness,
        clearcoat: depth === 'near' ? 0.25 : 0, clearcoatRoughness: 0.25, envMapIntensity: depth === 'near' ? 0.95 : 0.7,
        anisotropy: depth === 'near' ? 0.55 : 0, anisotropyRotation: Math.PI / 2,
        transparent: depth === 'far', opacity: depth === 'far' ? D.opacity : 1, depthWrite: depth !== 'far',
      });
      const mesh = new InstancedMesh(depth === 'near' ? geoNear : geoFar, mat, n);
      mesh.instanceMatrix.setUsage(DynamicDrawUsage);
      mesh.frustumCulled = false;
      mesh.renderOrder = depth === 'far' ? 0 : 1;
      scene.add(mesh);
      const coins = Array.from({ length: n }, () => ({
        x: 0, y: 0, z: rand(D.z[0], D.z[1]), s: rand(D.scale[0], D.scale[1]) * size, v: rand(D.speed[0], D.speed[1]),
        rot: new Euler(rand(0, Math.PI * 2), rand(0, Math.PI * 2), rand(0, Math.PI * 2)),
        spin: new Vector3(rand(-0.9, 0.9), rand(-1.4, 1.4), rand(-0.5, 0.5)),
        sway: rand(0.2, 0.6), phase: rand(0, Math.PI * 2), push: new Vector2(),
      }));
      layers.push({ mesh, coins, name, depth });
    }
  }

  // ---- dimensões do mundo visível em cada profundidade
  let W = 1, H = 1;
  const viewAt = (z) => {
    const h = 2 * Math.tan(MathUtils.degToRad(COIN_CONFIG.fov / 2)) * (COIN_CONFIG.cameraZ - z);
    return { h, w: h * camera.aspect };
  };
  const scatter = (initial) => {
    for (const L of layers) for (const c of L.coins) {
      const v = viewAt(c.z);
      c.x = rand(-v.w / 2, v.w / 2) * 0.96;
      c.y = initial ? rand(-v.h / 2, v.h / 2) : v.h / 2 + rand(1, 3);
    }
  };
  const resize = () => {
    const r = host.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, Q.maxDpr));
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  };
  resize();
  scatter(true);

  // ---- ponteiro: as moedas próximas desviam do cursor; a câmera acompanha de leve
  const ptr = new Vector2(9, 9); const ptrTarget = new Vector2(9, 9); const cam = new Vector2();
  const onMove = (e) => {
    const r = host.getBoundingClientRect();
    ptrTarget.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
  };
  const onLeave = () => ptrTarget.set(9, 9);
  const usePointer = pointer && !isMobile && !reduced;
  if (usePointer) { window.addEventListener('pointermove', onMove, { passive: true }); host.addEventListener('pointerleave', onLeave); }

  // ---- loop
  const dummy = new Object3D(); const q = new Quaternion();
  let boost = 0; let last = performance.now(); let raf = 0; let running = false; let visible = true;
  const step = (dt, t) => {
    const ext = boostSource ? boostSource() : 0;
    boost += (ext - boost) * Math.min(1, dt * 4);
    ptr.lerp(ptrTarget, Math.min(1, dt * 6));
    const parallax = ptr.x > 5 ? new Vector2() : ptr;
    cam.lerp(parallax, Math.min(1, dt * 2));
    camera.position.x = cam.x * 0.6; camera.position.y = cam.y * 0.4;
    camera.lookAt(0, 0, 0);

    for (const L of layers) {
      L.coins.forEach((c, i) => {
        const v = viewAt(c.z);
        const speed = c.v * (1 + boost);
        c.y -= speed * dt;
        c.x += Math.sin(t * c.sway + c.phase) * 0.12 * dt;
        if (c.y < -v.h / 2 - 1.6) { c.y = v.h / 2 + rand(0.8, 2.4); c.x = rand(-v.w / 2, v.w / 2) * 0.96; }
        // desvio do cursor (só camada próxima)
        if (L.depth === 'near' && ptr.x < 5) {
          const px = ptr.x * v.w / 2; const py = ptr.y * v.h / 2;
          const dx = c.x + c.push.x - px; const dy = c.y + c.push.y - py; const d = Math.hypot(dx, dy);
          const R = 2.4;
          if (d < R) { const f = (1 - d / R) * 2.2; c.push.x += (dx / (d || 1)) * f * dt; c.push.y += (dy / (d || 1)) * f * dt; }
        }
        c.push.multiplyScalar(Math.pow(0.12, dt));
        c.rot.x += c.spin.x * dt * (1 + boost * 0.8);
        c.rot.y += c.spin.y * dt * (1 + boost * 0.8);
        c.rot.z += c.spin.z * dt;
        dummy.position.set(c.x + c.push.x, c.y + c.push.y, c.z);
        q.setFromEuler(c.rot); dummy.quaternion.copy(q);
        dummy.scale.setScalar(c.s);
        dummy.updateMatrix();
        L.mesh.setMatrixAt(i, dummy.matrix);
      });
      L.mesh.instanceMatrix.needsUpdate = true;
    }
    renderer.render(scene, camera);
  };
  const frame = (now) => {
    raf = 0;
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    step(dt, now / 1000);
    raf = requestAnimationFrame(frame);
  };
  const start = () => {
    if (running || reduced || !visible || document.hidden) return;
    running = true; last = performance.now(); raf = requestAnimationFrame(frame);
  };
  const stop = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; };

  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; visible ? start() : stop(); }, { rootMargin: '120px' });
  io.observe(host);
  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVis);
  const ro = new ResizeObserver(() => { resize(); if (!running) step(0, performance.now() / 1000); });
  ro.observe(host);

  // primeiro quadro (também o único, com movimento reduzido)
  step(0, 0);
  host.classList.add('coins--ready');
  start();

  return {
    start, stop,
    dispose() {
      stop(); io.disconnect(); ro.disconnect(); document.removeEventListener('visibilitychange', onVis);
      if (usePointer) { window.removeEventListener('pointermove', onMove); host.removeEventListener('pointerleave', onLeave); }
      layers.forEach((L) => { L.mesh.material.dispose(); }); geoNear.dispose(); geoFar.dispose();
      renderer.dispose(); canvas.remove();
    },
  };
}
