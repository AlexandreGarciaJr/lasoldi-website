# Relatório de conversão e QA (13/11/2026)

## Revisão de conversão (checklist da receita)

| Critério | Status | Observação |
|---|---|---|
| **5 segundos** (o que é, para quem, o que fazer) | ✅ | Eyebrow "Casa de investimentos · Sul do Brasil", H1, subtítulo com público e botão WhatsApp na 1ª dobra |
| **Uma ação principal** | ✅ | WhatsApp em todos os pontos (cabeçalho, hero, método, contato, flutuante). O formulário é a alternativa, sem competir |
| **Botão com verbo + benefício** | ✅ | "Conversar pelo WhatsApp", "Agendar uma primeira conversa", "Quero ser contatado" |
| **CTA na 1ª dobra, desktop e celular** | ✅ | Desktop 1440×900: CTA a ~720px. Celular 390×844: CTA termina a 726px |
| **Prova ao lado da promessa** | ⚠️ pendente | Não há provas reais (anos, certificações, pessoas). O site **não exibe números**. Entra quando o cliente enviar (questionário, bloco 6) |
| **Oferta clara** | ⚠️ parcial | Método em 4 etapas explica o que acontece. Lista real de serviços: pendente (bloco 2) |
| **Objeções respondidas** | ⚠️ parcial | "Primeiro encontro, sem compromisso" e "linguagem simples" atacam as objeções típicas. FAQ só com as perguntas reais do cliente (bloco 5) |
| **Atrito mínimo** | ✅ | 2 campos obrigatórios + consentimento; WhatsApp em 1 toque com mensagem pronta; máscara de telefone |
| **Polegar** | ✅ | Botão flutuante de WhatsApp no canto inferior direito; some quando o CTA do hero ou o contato estão na tela, e com o menu aberto |
| **Sem trecho morto antes do CTA** | ✅ | CTA no hero; o próximo CTA aparece ao fim do método |
| **Sem dark patterns** | ✅ | Sem urgência, contador ou promessa de rentabilidade. Aviso de risco no rodapé |

## QA (modo Site)

Ferramenta: Playwright + Chromium headless + axe-core (WCAG 2.0/2.1 A e AA), servidor `php -S`.

| Viewport | Console | Elementos presos invisíveis | Overflow horizontal | WebGL | axe |
|---|---|---|---|---|---|
| Desktop 1440×900 | 0 erros | 0 | 0 | ativo | 0 violações |
| Celular 390×844 (iPhone 13, DPR 2) | 0 erros | 0 | 0 | ativo | 0 violações |
| Tablet 820×1180 | 0 erros | 0 | 0 | ativo | 0 violações |
| `prefers-reduced-motion` | 0 erros | 0 | 0 | **desligado** (SVG estático) | 0 violações |

Correções feitas durante o QA:
- Contraste: rótulos em oliva escurecido (`#47533c`); tagline em musgo; textos sobre musgo em linho sólido.
- `aria-label` indevido gerado pelo SplitText no `<p>` da citação.
- Botão "Fale conosco" vazando no cabeçalho mobile (especificidade do CSS).
- Traçado do fio do método com `non-scaling-stroke` quebrando o desenho.
- Moeda do hero no celular sobrepondo o eyebrow.

Formulário:
- Front: envio vazio foca o 1º campo inválido e mostra 3 mensagens; máscara `(51) 99999-0000`; sucesso substitui o formulário.
- Back (`api/contato.php`): validação ✅, honeypot ✅, tempo mínimo ✅, limite por IP ✅, sem `config.php` → 503 amigável ✅,
  SMTP fora do ar → 502 amigável ✅, sem JS → redirect 303 ✅.
- **Não testado:** envio real de e-mail (faltam as credenciais SMTP do cliente).

## Não verificado (exige ambiente real)
- Safari iOS em aparelho físico (testado só com emulação de iPhone no Chromium).
- Core Web Vitals em produção (LCP/CLS/INP): medir com PageSpeed depois de publicar.
- Envio real pelo SMTP da hospedagem.

## Peso da página (sem compressão)
HTML 19 KB · CSS 28 KB · JS próprio 23 KB · GSAP + ScrollTrigger + SplitText 126 KB · fontes 57 KB (woff2) · logo + moeda < 30 KB.
Com gzip no servidor, o GSAP cai para 49 KB. Nenhuma foto, vídeo ou biblioteca 3D.
