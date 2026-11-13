# BRIEF — La Soldi Capital · site institucional

> Receita: landing Awwwards (Receita 03), em versão **restrained / conversion-first**.
> Regra-mãe: *simplicidade na experiência, sofisticação na execução.*

## 1. Nível (questionário do cliente)

| Pergunta | Resposta | Leitura |
|---|---|---|
| O que importa quando alguém entra | **A**: achar rápido e entrar em contato | conversão > impressão |
| O site é como... | **A**: cartão de visitas bonito, limpo, direto | institucional enxuto |
| Movimento | **B**: efeitos suaves na rolagem | motion presente, nunca protagonista |
| Cliente ideal | **A**: prático, quer resolver logo | zero atrito, contato em 1 toque |

**Maioria A → motor C (landing limpa e rápida)**, sem vídeo gerado por IA. O "toque Awwwards" fica na
execução: tipografia, composição editorial, revelações com GSAP, um shader de prata e um único
movimento-assinatura.

## 2. A empresa (o que está documentado)

Fonte: `LaSoldi_Capital_Brand_Guide_v4.pdf` (nov/2026, direção de arte Shiva Marques).

- **Conceito:** "Patrimônio que se lapida." · "Uma casa de investimentos com mão de quem cuida."
- **Público:** famílias e investidores do **Sul do Brasil** que valorizam proximidade, tradição e segurança.
- **Narrativa da marca:** assinatura escrita à mão (gesto de quem se compromete pessoalmente) + moeda de
  prata com diamante no pingo do i (patrimônio que, cuidado com paciência, ganha valor e permanece).
- **Significados oficiais dos elementos:**
  - Assinatura: confiança e proximidade
  - Moeda: valor, solidez, patrimônio que circula
  - Diamante: lapidação e permanência ("o que é cuidado, dura")
  - CAPITAL: rigor do mercado financeiro
  - Prata: distinção e sobriedade
- **Pistas do manual:** título-exemplo "Investimentos com cuidado de perto"; menu-exemplo
  *Início · Quem somos · Investimentos · Contato*; cargo-exemplo "Assessora de investimentos";
  domínio-exemplo `lasoldicapital.com.br`.

## 3. Decisões tomadas

| Item | Decisão |
|---|---|
| Formato | **One-page** com âncoras + páginas legais (Privacidade, Avisos) |
| Ação principal | **WhatsApp** com mensagem pronta (botão fixo e na 1ª dobra) |
| Ação secundária | **Formulário curto** no bloco de contato → PHPMailer |
| Stack | **HTML + CSS + JS puros**, GSAP auto-hospedado, PHPMailer (ver DESIGN.md §7) |
| Fotos | **Nenhuma por enquanto.** Direção de arte construída só com a identidade |
| 3D / Three.js | **Não usar.** Um shader WebGL leve no lugar (ver DESIGN.md §5) |

## 4. Pendências do cliente (bloqueiam publicação, não bloqueiam design)

1. **Natureza da atividade.** Assessoria vinculada a uma corretora? Consultoria? Gestora? Isso define
   textos legais obrigatórios (CVM/ANBIMA), o rodapé e o vocabulário ("assessoria", "consultoria", "gestão").
   Até lá, a copy usa termos neutros ("cuidado com o patrimônio", "estratégia", "acompanhamento").
2. **Serviços reais**: o que de fato oferecem (investimentos, previdência, sucessão, câmbio, seguros...).
3. **Contato:** número de WhatsApp, e-mail, endereço/cidade, horário, redes sociais.
4. **Quem atende:** nome(s), cargo(s), registro profissional e, se possível, retrato(s).
5. **Domínio e hospedagem:** confirmar `lasoldicapital.com.br` e onde vai ficar (HostGator/Hostinger),
   com SMTP para o PHPMailer.
6. **Provas:** anos de mercado, certificações (CEA, CFP, CGA...), volume sob cuidado. **Só se forem reais**
   e autorizados. Sem isso, o site não exibe números.
7. **Texto de privacidade/LGPD:** quem é o controlador dos dados do formulário.

## 5. Restrições

- Nada inventado: números, certificações, depoimentos, rentabilidade, logos de parceiros.
- **Nunca prometer rentabilidade** nem usar linguagem de garantia (vale para qualquer tipo de atividade financeira).
- Logo só dos arquivos oficiais (`_kit/`), sem redesenho; prata só no pingo do i e na moeda; nunca
  lettering em prata, nunca sobre preto ou branco puro.
- Performance: LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms no celular.
