# DESIGN — La Soldi Capital

## 1. Design Read

> Casa de investimentos do Sul, de mão de quem cuida: **editorial, quente e sóbria**. Papel de carta
> areia e linho, tinta ameixa, um único brilho de prata. O luxo vem do espaço e do acabamento, não do excesso.

**Dials** (variância / motion / densidade): **6 / 4 / 3**
(abaixo do padrão premium 7/6/3, porque o cliente pediu cartão de visitas e efeitos só suaves).

**Referências de atitude** (de postura, não de layout): family offices europeus, papelaria de banco
privado, edições de livro de arte. **Anti-referências:** fintech com gradiente neon, cards com ícones
genéricos, dark mode "premium", foto de banco de imagens com aperto de mão, glassmorphism.

## 2. Conceito criativo — "Lapidação"

A marca nasce de dois gestos: **o traço contínuo** (a assinatura) e **a lapidação** (o diamante dentro da moeda).
O site traduz isso assim:

- **Traço** → linhas finas que se desenham (fios divisórios, o laço do padrão), ritmo de leitura contínuo.
- **Lapidação** → as revelações cortam por **facetas**: máscaras em polígono de 5 lados (a gema da moeda)
  que se abrem como uma pedra sendo aparada. É o **movimento-assinatura** e aparece **só 3 vezes** no site.
- **Prata** → o único material "vivo": a moeda do hero tem reflexo metálico real (shader), que muda com a
  rolagem como uma peça girando sob a luz. Em todo o resto, a prata é só um detalhe.

A identidade aparece mesmo sem o logo: o par areia+ameixa, a moeda-gema, o laço, a Cormorant em itálico.

## 3. Paleta aplicada

Proporção do manual: areia 38% · linho 28% · ameixa 18% · prata + verdes + lavanda no resto.

| Token | Valor | Uso no site |
|---|---|---|
| `--c-linho` | `#F1E8E2` | fundo base da página |
| `--c-areia` | `#E0CFC4` | fundo de seções alternadas, cabeçalho, cartões de contato |
| `--c-ameixa` | `#521942` | texto de títulos, CTA, seção de destaque (negativo) |
| `--c-ameixa-ink` | `#3A1030` | texto corrido (ameixa escurecida, contraste AA garantido sobre linho/areia) |
| `--c-musgo` | `#566449` | seção de contato/rodapé (fundo), números de etapa |
| `--c-oliva` | `#78866A` | rótulos, legendas, citação editorial |
| `--c-salvia` | `#A3A18A` | fios e divisórias |
| `--c-lilas` | `#DFC8DF` | 1 uso pontual (laços no bloco de citação) |
| `--c-lavanda` | `#B981BA` | estado de foco/hover sutil (nunca texto) |
| `--prata` | degradê oficial 7 paradas + textura escovada | moeda, pingo do i, fio do CTA principal |
| `--prata-claro` | degradê "sobre fundo claro" do kit | moeda sobre areia/linho |

**Um acento só para ação:** ameixa. Botão primário = ameixa com texto linho; o fio de prata aparece no hover.
Contraste a validar no QA: oliva sobre linho fica abaixo de 4,5:1 → só em texto ≥ 18px ou rótulos em caixa alta
com peso 500; texto corrido sempre em `--c-ameixa-ink`.

## 4. Tipografia (arquivos do kit, auto-hospedados, `woff2` subset latin)

| Papel | Família | Tamanho (fluido) | Peso |
|---|---|---|---|
| Display/H1 | Jost | `clamp(2.6rem, 5.2vw, 4.75rem)` | 500 |
| H2 | Jost | `clamp(2rem, 3.4vw, 3rem)` | 500 |
| Eyebrow | Jost caixa alta, `letter-spacing: .32em` | 0.78rem | 500 |
| Corpo | Jost | `clamp(1.0625rem, 1.1vw, 1.1875rem)`, entrelinha 1,5 | 400 |
| Destaque editorial | Cormorant Garamond Italic | `clamp(1.9rem, 3.6vw, 3.4rem)` | 500 |

Cormorant **só** em 3 momentos: tagline do hero, citação central e assinatura do contato. Lettering
"La Soldi" nunca é digitado: sempre o SVG oficial.

## 5. Tecnologia de motion (decisão pela hierarquia CSS → GSAP → Canvas → 3D)

| Camada | Uso | Peso |
|---|---|---|
| **CSS** | hovers, foco, botão WhatsApp, menu mobile | 0 KB |
| **GSAP + ScrollTrigger** (auto-hospedado) | revelações de texto por linha, máscaras facetadas, parallax leve, contadores (só com dado real) | ~45 KB gz |
| **WebGL puro (1 shader)** | reflexo metálico da moeda do hero, reagindo a scroll e ponteiro | ~4 KB, carregado após o LCP |
| ~~Three.js~~ | **descartado**: a moeda é um disco plano com gema vazada; um shader 2D com normal map faz o brilho com 1/40 do peso. Um 3D girando competiria com o CTA | — |
| ~~Lenis~~ | **descartado**: público prático, rolagem nativa é mais previsível (e melhor no iOS) | — |

**Fallback da moeda:** SVG oficial `Moeda_Prata` com o degradê do kit. É ele que aparece primeiro (é o LCP) e
o canvas entra por cima com crossfade. Sem WebGL, com `prefers-reduced-motion` ou em aparelho fraco, o SVG fica.

## 6. Tokens de motion

```css
--ease-lapida: cubic-bezier(.65, 0, .35, 1);   /* entra e assenta: corte firme, pouso suave */
--ease-out:    cubic-bezier(.22, 1, .36, 1);   /* textos e microinterações */
--dur-micro: 180ms;  --dur-base: 600ms;  --dur-reveal: 900ms;  --dur-facet: 1200ms;
--shift-y: 24px (desktop) / 16px (mobile);   --stagger-line: 70ms;  --stagger-item: 110ms;
--opacity-from: 0;   --scale-from: 1.04 (imagens/superfícies, nunca texto);
--parallax-max: 8% da altura do elemento (desktop) / 0 (mobile);
```

Regras: cada seção anima **uma vez** (sem replay ao subir); nada anima por mais de 1,2 s; texto nunca começa
invisível sem JS (classe `.js` no `<html>` habilita o estado inicial); `prefers-reduced-motion` = só fade de 200 ms.

## 7. Stack e arquitetura

**HTML + CSS + JS puros, sem framework.** É a escolha certa aqui: uma página, conteúdo estático, SEO
nativo, zero hidratação, hospedagem compartilhada comum (PHP já disponível para o PHPMailer).
Next/React só acrescentariam build e JS sem ganho para o visitante.

```
lasoldi-website/
├─ index.html                 # one-page, todo o conteúdo em HTML semântico
├─ privacidade.html · avisos.html
├─ assets/
│  ├─ css/  tokens.css · base.css · layout.css · components.css · motion.css
│  ├─ js/   main.js (boot) · reveal.js · facet.js · coin-gl.js · nav.js · form.js
│  ├─ vendor/ gsap.min.js · ScrollTrigger.min.js
│  ├─ fonts/  jost-var.woff2 · cormorant-italic.woff2
│  └─ brand/  logo + moeda (SVG oficiais) · padrões (SVG tile otimizado)
├─ api/
│  ├─ contato.php             # validação, honeypot, limite por IP, PHPMailer via SMTP
│  └─ config.example.php      # credenciais SMTP (config.php fora do git)
├─ robots.txt · sitemap.xml · site.webmanifest · og-image.jpg (1200×630)
└─ _kit/                      # kit de marca original (não vai para produção)
```

Formulário com envio progressivo: funciona sem JS (POST normal + página de retorno) e, com JS, envia via
`fetch` e mostra a confirmação no lugar. Campos: nome, WhatsApp/telefone, e-mail (opcional), mensagem
(opcional), consentimento LGPD. Honeypot + tempo mínimo de preenchimento.

## 8. Breakpoints, grid, espaçamento

- Breakpoints: 390 (base mobile) · 768 · 1024 · 1440 · 1920 (limite do conteúdo em 1320px).
- Grid de 12 colunas, gutter `clamp(16px, 2vw, 32px)`, margem lateral `clamp(20px, 5vw, 88px)`.
- Escala de espaço (base 4): 4 · 8 · 12 · 16 · 24 · 32 · 48 · 72 · 112 · 160. Seções: 112–160 desktop, 72 mobile.
- Raio: **0** em superfícies (papelaria), **999px** só em botões e na moeda. Sem sombras; profundidade por cor e fio.

---

## 9. Storyboard (8 momentos)

### M1 · Hero — "Cartão de visitas"
- **Conteúdo:** logo oficial no cabeçalho · eyebrow "Casa de investimentos · Sul do Brasil" · H1 · subtítulo ·
  CTA WhatsApp + link "ou envie uma mensagem" · tagline Cormorant "Patrimônio que se lapida."
- **Composição:** fundo areia. Texto em 7 colunas à esquerda; à direita, a **moeda-diamante grande**
  (≈ 34vw) com reflexo de prata vivo. Atrás dela, anéis finos (geometria da borda da moeda). *O padrão
  "assinatura tom sobre tom" foi trocado pelos anéis: o tile oficial pesa 190 KB.*
- **UX:** em 5 s: o que é, para quem e como falar. CTA visível sem rolar (desktop e 390×844).
- **Entrada:** letras do eyebrow em cascata; linhas do H1 sobem pela máscara endireitando de 4°; subtítulo sai do
  desfoque; botões sobem; tagline surge palavra a palavra do desfoque. Moeda entra com a **faceta** (1ª aparição do
  movimento-assinatura).
- **Saída (scrub, reversível):** linhas do H1 somem para cima pela máscara, o resto se dissolve para cima com desfoque.
  Completa em ~45% da altura do topo no desktop (~400 px de rolagem) e 70% no celular.
- **Movimento contínuo:** moeda flutua e inclina (9 s, ±10 px / 1,6°); brilho da prata a cada ~9 s; duas moedinhas
  orbitam os anéis (64 s e 92 s, sentidos opostos; só desktop). Tudo desligado com movimento reduzido.
- **Hover do CTA:** preenchimento prata (degradê oficial) nasce do ponto de entrada do cursor, texto vira vinho e
  rola, botão magnético. *Testadas alternativas mais discretas (vinho profundo, linho); mantido o prata até o
  retorno do cliente.*
- **Tecnologia:** GSAP + WebGL (fallback SVG).
- **Mobile:** moeda menor, acima do H1, cortada à direita; CTA ocupa a largura; shader com resolução 0,75× e sem ponteiro.

### M2 · Quem somos — "Mão de quem cuida"
- **Conteúdo:** texto institucional curto (2 parágrafos) + 4 princípios derivados dos elementos da marca.
- **Composição:** fundo linho. Coluna editorial estreita (texto ~62ch) + bloco lateral com os 4 princípios em lista
  com fio de sálvia (não cards). Cada princípio leva um micro-glifo do próprio logo (laço, moeda, gema, CAPITAL).
- **Animação:** fios se desenham da esquerda para a direita (traço), texto em fade+8px. Nada mais.
- **Mobile:** lista empilhada; fios curtos.

### M2b · Manifesto — "Nosso jeito" *(segunda rodada)*
- **Conteúdo:** parágrafo grande de tom de voz, com 3 palavras em Cormorant Italic musgo (paciência, atenção, permaneça).
- **Composição:** fundo areia, texto ameixa em Jost 500 de até 3,5rem, coluna de ~30ch.
- **Animação:** as palavras começam a 55% de opacidade (80% nas palavras em itálico, para manter o contraste) e ganham tinta com a rolagem (scrub), nos dois sentidos:
  ao subir a página, voltam a apagar.
- **Mobile:** mesmo efeito, texto menor.

### M2c · Para quem cuidamos — lista editorial *(segunda rodada)*
- **Conteúdo:** 4 perfis (validar com o cliente), cada um um link de WhatsApp com mensagem própria.
- **Composição:** fundo linho, linhas largas com número, título grande, descrição e "Conversar →".
- **Hover (desktop):** a linha se enche de ameixa a partir do lado em que o cursor entrou e esvazia pelo lado em que
  saiu; o título rola, a seta troca e o texto vira linho.
- **Mobile:** linhas empilhadas, descrição e "Conversar" sempre visíveis.

### M3 · Como cuidamos — método em 4 tempos
- **Conteúdo:** Conversa → Diagnóstico → Estratégia → Acompanhamento (genérico até o cliente confirmar os serviços).
- **Composição:** fundo areia. Faixa horizontal com os 4 tempos numerados (01–04 em oliva, Jost leve, grande),
  ligados por **um único fio contínuo** que se desenha com a rolagem (o "traço contínuo" da assinatura).
- **Animação:** ScrollTrigger com `scrub` suave só no fio; os números revelam por linha.
- **Mobile:** vertical; o fio desce pela esquerda; sem scrub (anima ao entrar).

### M4 · Pausa editorial — o pico
- **Conteúdo:** citação "Patrimônio se lapida com paciência." (frase do próprio manual).
- **Composição:** fundo **ameixa** (única seção escura, "negativo" oficial), lettering linho, moeda pequena prata.
  Padrão "laços" em lilás a 10%, desenhando-se nas bordas.
- **Animação:** 2ª faceta: a seção abre em polígono da gema a partir do centro (clip-path), revelando a ameixa;
  a citação entra palavra a palavra (stagger 70 ms). É o **pico** do site, curto (≈1 viewport).
- **Mobile:** mesma faceta, mais curta; laços estáticos.

### M5 · Contato — "Vamos conversar"
- **Conteúdo:** título, texto curto, botão WhatsApp grande, formulário curto, dados (e-mail, cidade, horário) quando houver.
- **Composição:** fundo **musgo** com texto linho; formulário em painel linho à direita. Moedas prata sobre musgo
  (padrão oficial) só numa faixa estreita de borda.
- **Animação:** 3ª e última faceta: o painel do formulário se abre facetado. Botão com fio de prata no hover.
- **Mobile:** WhatsApp primeiro, formulário embaixo; teclado numérico no telefone; campos 48px.

### M6 · Rodapé — "Assinatura"
- **Conteúdo:** logo branco/linho, menu, contatos, links legais, **avisos regulatórios** (pendência), CNPJ.
- **Composição:** continua o musgo, tipografia pequena, alinhamento à grade.
- **Animação:** nenhuma. Momento estático de propósito.

**Elementos persistentes:** cabeçalho fino em areia (logo + 4 âncoras + botão "Fale conosco"), que encolhe ao rolar.
No celular, **botão WhatsApp flutuante** (canto inferior direito, ao alcance do polegar) que some quando o bloco
de contato está na tela.

**Ritmo:** M1 vivo → M2 quieto → M3 um fio → **M4 pico** → M5 objetivo → M6 parado.
Movimento-assinatura (faceta da gema): M1, M4 e M5. Só.
