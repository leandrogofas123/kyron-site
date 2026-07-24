# Kyron Tecnologia — Site Catálogo

Site de catálogo (não e-commerce) da Kyron Tecnologia — loja e integradora em
Santa Cruz do Sul/RS: Apple novos e seminovos, casa inteligente, áudio,
acessórios e serviços de instalação. **A conversão acontece no WhatsApp.**

Next.js 15 (App Router) · TypeScript · Tailwind v4 · Prisma + SQLite ·
assistente de IA (Claude) · HubSpot.

## Pré-requisito

Node.js 20+. No Windows, o `npm` roda como `npm.cmd` (a política de execução
bloqueia o wrapper `.ps1`).

## Rodar

```bash
npm install
```

```bash
copy .env.example .env.local
```

Preencha `.env.local` (ver seção Variáveis). Depois:

```bash
npm run db:push
```

```bash
npm run db:seed
```

```bash
npm run dev
```

- Loja: `http://localhost:3000`
- Painel: `http://localhost:3000/admin`

## Variáveis de ambiente

| Variável | Para quê | Sem ela |
|---|---|---|
| `ANTHROPIC_API_KEY` | Cérebro do assistente | Assistente desativado |
| `HUBSPOT_TOKEN` | Leads viram contatos no CRM | Lead fica só no banco local |
| `ADMIN_PASSWORD` | Senha do painel | Painel desativado |
| `ADMIN_SECRET` | Assina o cookie de sessão do painel | Painel desativado |
| `NEXT_PUBLIC_SITE_URL` | Sitemap, canonical, schema | Usa domínio padrão |
| `NEXT_PUBLIC_GA_ID` | Google Analytics (após consentimento) | Sem medição |

WhatsApp e e-mail estão em `src/lib/kyron/company.ts`.

## Decisões de projeto (spec do cliente)

- **Não é e-commerce** — sem carrinho, sem checkout, sem pagamento. Produto
  principal é seminovo (estoque único) e serviço (orçamento sob medida).
- **Conversão no WhatsApp** — todo CTA de produto gera um link `wa.me` com a
  mensagem já qualificada: *"Olá! Vi o iPhone 15 128GB no site — R$ 5.499,00.
  Ainda tem?"*. A conversa chega identificando o produto.
- **Admin mobile, cadastro em ~90s** — foto + nome + preço + categoria. O resto
  é opcional. Se o admin for lento, o site para de ser atualizado.
- **Produto sem preço não existe** — o preço é sempre exibido.
- **Dinheiro em centavos** (Int), nunca ponto flutuante — formatado só na tela.

## Estrutura

```
prisma/
├─ schema.prisma ............ Modelo (Categoria, Produto, Seminovo, Serviço, Lead)
└─ seed.mjs ................. Categorias, serviços e produtos de exemplo
src/app/
├─ layout.tsx .............. Raiz mínima (html/body/fontes)
├─ (site)/ ................. LOJA — cabeçalho, rodapé, WhatsApp, robô, cookies
│  ├─ page.tsx ............. Home (destaques, categorias, domicílio, localização)
│  ├─ produtos/ ........... Catálogo + filtro + página do produto
│  ├─ seminovos/ .......... Vitrine de seminovos
│  ├─ servicos/ ........... Serviços + página do serviço
│  ├─ orcamento/ .......... Formulário curto → Lead
│  ├─ sobre/ · contato/ ... Institucional
│  └─ politica…/ termos…/ . Legais
├─ admin/
│  ├─ login/ .............. Entrada (senha)
│  └─ (painel)/ ........... Protegido: produtos, seminovos, serviços, leads
└─ api/
   ├─ chat/ ............... Assistente (streaming)
   └─ orcamento/ ......... Grava Lead + espelha no HubSpot
src/lib/
├─ db.ts · catalogo.ts .... Prisma + consultas do catálogo
├─ format.ts .............. Dinheiro/centavos, slug
├─ uploads.ts ............. Foto → WebP, redimensiona (sharp)
├─ admin-auth.ts · admin-actions.ts .. Sessão + ações do painel
└─ kyron/ ................. company, site, knowledge (robô), lead, hubspot
```

## O painel admin

`/admin` → login com `ADMIN_PASSWORD`. Sessão assinada por HMAC em cookie
httpOnly, 12h. Rotas do painel redirecionam para o login sem sessão.

- **Produtos** — lista com busca, ativar/desativar e excluir em 1 clique; novo e
  editar com upload de foto (converte para WebP, redimensiona para 1200px).
- **Seminovos** — mesmos produtos marcados como seminovo; "marcar vendido" em 1
  clique some da vitrine.
- **Serviços** — lista + formulário lado a lado.
- **Leads** — pedidos de orçamento, com telefone clicável (abre WhatsApp) e
  mudança de status (novo → respondido → vendido/perdido).

## Leads → HubSpot

Todo orçamento grava um `Lead` no banco (visível no painel) **e** cria um
contato no HubSpot com o resumo anexado como nota. Verificado de ponta a ponta.
Sem `HUBSPOT_TOKEN`, o lead fica só no banco.

## O assistente

`claude-opus-4-8`, treinado em `src/lib/kyron/knowledge.ts` para a **loja**
(produtos, seminovos, serviços) — responde só a partir dessa base, recusa
inventar preço/estoque/condição, e encaminha para o WhatsApp. Fica empilhado
acima do botão flutuante de WhatsApp.

## Hospedagem — atenção ao banco e às fotos

O SQLite (`prisma/kyron.db`) e as fotos (`public/uploads/`) são arquivos em
disco. Em hospedagem serverless (Vercel) o disco é **efêmero** — o banco
zeraria e as fotos sumiriam a cada deploy. Para este site, hospedar num **VPS
com disco persistente** (ou trocar para Postgres gerenciado + bucket de
imagens). Decisão de hospedagem ainda pendente.

## Ainda não feito

- **Fotos reais** dos produtos (os de exemplo não têm foto — placeholder da marca).
- **Trocar a senha do admin** (`ADMIN_PASSWORD` está com um valor temporário).
- **Prova social / instalações** — reservado na home, sem conteúdo inventado.
- **Rosto do dono** na página Sobre — reservado, aguarda foto real.
- **Horário, endereço completo, formas de pagamento** — pendentes na base do robô.
- **Revisão jurídica** das páginas legais.
- **Hospedagem** e domínio.
- **Notificação de lead por WhatsApp** ao dono — hoje o lead chega ao painel e ao
  HubSpot; empurrar por WhatsApp exigiria a API do WhatsApp Business.
- **Logo em SVG** e reexportar na cor do Manual (`#1E6BFF`) — o arquivo atual usa
  `#0563FE`. O site inteiro usa `#1E6BFF` (Manual).

## Sistema fluido e acessibilidade

Mantidos da base anterior: medidas em `clamp()` (nada fixo), grades que se
reorganizam sem media query, testado de 320px a 2560px, alvo de toque ≥ 24px,
foco visível, `prefers-reduced-motion` respeitado, consentimento de cookies
antes de qualquer medição.
