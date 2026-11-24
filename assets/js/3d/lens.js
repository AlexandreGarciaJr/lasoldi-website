import{C as _,F as A,c as I,d as F,h as l,k as z,o as C,p as W,v as B,w as G}from"./three-OKSC6MBK.js";var O=`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,H=`
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;        // tamanho do canvas (px)
uniform vec2 uImg;        // tamanho da imagem (px)
uniform vec2 uMouse;      // posi\xE7\xE3o do cursor (px, origem embaixo \xE0 esquerda)
uniform float uLens;      // 0..1 for\xE7a da lente
uniform float uRadius;    // raio da lente (px)
uniform float uRot;       // rota\xE7\xE3o da gema
uniform float uWave;      // 0 \u2192 1 entrada
uniform float uVel;       // velocidade da rolagem (normalizada)
uniform float uParallax;  // -1..1 posi\xE7\xE3o na tela
uniform float uTime;
varying vec2 vUv;

const float PI = 3.14159265;

// object-fit: cover
vec2 coverUv(vec2 uv) {
  float rs = uRes.x / uRes.y, ri = uImg.x / uImg.y;
  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  return (uv - 0.5) * s + 0.5;
}

// pent\xE1gono regular (Inigo Quilez)
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

  // rolagem: ondula\xE7\xE3o proporcional \xE0 velocidade
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
        offs = n * 0.016 + (-px / uRes) * 0.07; // faceta: desvia na dire\xE7\xE3o da face
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
}`;function Q(n,p,{reduced:c=!1,lens:X=!0}={}){let v=document.createElement("canvas");v.className="lens__canvas",v.setAttribute("aria-hidden","true"),n.appendChild(v);let g=new A({canvas:v,antialias:!1,alpha:!1,powerPreference:"high-performance"}),s=new z(p);s.colorSpace=F,s.minFilter=I,s.magFilter=I,s.generateMipmaps=!1,s.needsUpdate=!0;let a={uTex:{value:s},uRes:{value:new l(1,1)},uImg:{value:new l(p.naturalWidth||880,p.naturalHeight||1100)},uMouse:{value:new l(-999,-999)},uLens:{value:0},uRadius:{value:88},uRot:{value:0},uWave:{value:c?1:0},uVel:{value:0},uParallax:{value:0},uTime:{value:0}},T=new C;T.add(new W(new B(2,2),new G({vertexShader:O,fragmentShader:H,uniforms:a})));let D=new _(-1,1,1,-1,0,1),o=1,k=()=>{let e=n.getBoundingClientRect();o=Math.min(window.devicePixelRatio||1,1.75),g.setPixelRatio(o),g.setSize(e.width,e.height,!1),a.uRes.value.set(e.width*o,e.height*o),a.uRadius.value=Math.max(56,Math.min(110,e.width*.17))*o};k();let d=new l(-999,-999),S=new l(-999,-999),h=0,x=0,w=0,R=n.closest(".ceo__frame")||n;X&&!c&&(R.addEventListener("pointermove",e=>{let t=n.getBoundingClientRect(),u=(e.clientX-t.left)*o,V=(t.height-(e.clientY-t.top))*o;d.x<-900&&d.set(u,V),S.set(u,V),x+=(e.clientX-w)*.002,w=e.clientX}),R.addEventListener("pointerenter",e=>{h=1,w=e.clientX}),R.addEventListener("pointerleave",()=>{h=0}));let U=window.scrollY,b=0,Y=()=>{let e=window.scrollY;b=Math.min(1,Math.abs(e-U)/60),U=e};window.addEventListener("scroll",Y,{passive:!0});let m=-1,q=new IntersectionObserver(([e])=>{f=e.isIntersecting,f&&m<0&&!c&&(m=performance.now()+250),f?L():P()},{threshold:.05}),f=!1,i=!1,r=0,M=performance.now(),y=e=>{let t=Math.min(.05,(e-M)/1e3);M=e,a.uTime.value=e/1e3,m>0&&(a.uWave.value=Math.min(1,Math.max(0,(e-m)/1600))),d.lerp(S,Math.min(1,t*10)),a.uMouse.value.copy(d),a.uLens.value+=(h-a.uLens.value)*Math.min(1,t*6),x*=Math.pow(.04,t),a.uRot.value+=(.25+x*8)*t,b*=Math.pow(.02,t),a.uVel.value+=(b-a.uVel.value)*Math.min(1,t*8);let u=n.getBoundingClientRect();a.uParallax.value=Math.max(-1,Math.min(1,((u.top+u.height/2)/window.innerHeight-.5)*2)),g.render(T,D)},E=e=>{r=0,i&&(y(e),r=requestAnimationFrame(E))},L=()=>{i||c||!f||document.hidden||(i=!0,M=performance.now(),r=requestAnimationFrame(E))},P=()=>{i=!1,r&&cancelAnimationFrame(r),r=0};return q.observe(n),document.addEventListener("visibilitychange",()=>document.hidden?P():L()),new ResizeObserver(()=>{k(),i||y(performance.now())}).observe(n),y(performance.now()),n.classList.add("lens--ready"),{stop:P,start:L}}export{Q as createLens};
