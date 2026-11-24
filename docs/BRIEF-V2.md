# BRIEF V2 · Repaginada geral (24/11/2026)

> Substitui a direção visual da V1 (docs/DESIGN.md, docs/ESTRUTURA.md, que ficam como histórico).

## O que mudou e por quê

| Fonte | O que pediu |
|---|---|
| Cliente (aprovação visual) | Seguir o protótipo **LaSoldi_Capital_LandingV02** (PDF + HTML): página clara, títulos pretos com destaque ameixa, fotos, faixa de números, sócias em moldura lapidada, painel ameixa com moedas, rodapé do Grupo Diamond |
| Cliente | Manter e caprichar nos efeitos (GSAP, WebGL, Three.js). Sem a moeda gigante: **moedas caindo** |
| Designer (Chama) | Moedas nas três cores do grupo: cada cor representa uma empresa |
| Proprietária | Textos corrigidos (abaixo) |
| Dossiê Grupo Diamond | Papel da La Soldi, sócias, segmentos atendidos, soluções, assinatura e canais |

## O que a La Soldi é (dossiê)
Porta de entrada comercial e de relacionamento do **Grupo Diamond** (DI Private: banco digital · La Soldi Capital: relacionamento e condução comercial · La Diamond Securitizadora: crédito e securitização). Foco **empresarial**: fluxo de caixa, acesso a crédito e conexão com o mercado de capitais. **Não** é gestão de patrimônio nem family office: o patrimônio do cliente entra como **garantia** na estruturação.

## Textos corrigidos pela proprietária (aplicados)
- "Casa de investimentos" → **"Casa de soluções financeiras · Sul do Brasil"**
- Subtítulo: **"Uma casa de soluções financeiras que une proximidade, tradição e segurança para reorganizar o seu patrimônio e o seu fluxo de caixa com visão de longo prazo."**
- Números: **25 anos** de experiência; **R$ 1 bi em patrimônio assessorado** (como ela falou); **sem selo ANBIMA**
- "Cada patrimônio recebe um cuidado próprio" → **"Cada necessidade recebe um cuidado próprio"**
- Para quem: **sem famílias, aposentadoria e transições**. Entram os segmentos do dossiê: fornecedores de órgãos públicos, empresas com recebíveis, incorporadoras e construtoras, crédito com garantia
- "Planejamento para cada momento da vida" → **"Planejamento para cada necessidade da sua empresa"**
- Diagnóstico: **"Mapeamos a necessidade atual, os riscos e as oportunidades."**
- Fechamento: **"A solução que a sua empresa precisa se lapida com paciência."**
- Atendimento: **segunda a sexta, das 9h às 18h**
- Rodapé: **Grupo Diamond · Conectando empresas ao mercado de capitais.**
- Sem registro CVM (só virá pela securitizadora). Política de privacidade padrão citando a **LGPD (Lei 13.709/2018)**

## Decisões
- Assinatura do topo: **"Da conversa ao capital."** (assinatura oficial no dossiê)
- E-mail: **atendimento@lasoldicapital.com.br** (dossiê). Sem WhatsApp (decisão anterior do cliente: tudo vai ao formulário)
- Sócias: **Patrícia Almeida** e **Luciana Amaral**, Co-founder & CEO (dossiê)
- Conteúdos ("Cartas e leituras"): **mantida provisória**, com títulos pendentes

## Pendências
1. **Fotos das sócias:** as do V02 podem ser de banco. Confirmar se são elas e **quem é quem**
2. **Foto do "Para quem":** gerar no Higgsfield (exige plano **Basic**; a conta está no Free). Hoje usa a foto do contrato do V02
3. Razão social, CNPJ e endereço (rodapé e avisos legais)
4. Títulos e textos reais dos Conteúdos
5. SMTP da hospedagem (`api/config.php`) e domínio
6. Validar "R$ 1 bi em patrimônio assessorado" com o compliance do grupo (a proprietária disse que não fazem gestão de patrimônio)
