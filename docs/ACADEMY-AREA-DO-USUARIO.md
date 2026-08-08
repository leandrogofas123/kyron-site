# Kyron Academy — Área do Usuário (como funciona por dentro)

> Roteiro + documentação da experiência do aluno na área logada (`/app`).
> Serve como script para apresentar/gravar um walkthrough e como referência técnica.
> Escrito a partir do código real (Next.js/Prisma). Onde algo ainda é vitrine,
> está marcado como **[em preparação]** — sem prometer o que não existe.

---

## 1. O que é a "parte interna do usuário"

É a área logada da Academy, servida em **`/app`** (e também em `app.kyrontecnologia.com`, quando o subdomínio apontar para o mesmo serviço). É onde o aluno aprovado consome trilhas, aulas em vídeo e materiais. Tudo roda sobre a **mesma conta e a mesma sessão** do restante da Kyron (loja e ERP) — o que muda é o *papel* de cada pessoa.

---

## 2. Roteiro da jornada (narração passo a passo)

**Cena 1 — Chegada.** O usuário abre `www.kyroncompany.com/app`. Se não estiver logado, é levado para **`/app/login`**. A tela abre sempre no modo **Entrar** (login), com 3 formas de acesso: **e-mail e senha**, **Google** e **LinkedIn**. Um botão alterna para **Criar conta**.

**Cena 2 — Primeiro acesso (cadastro).** Ao criar conta (por e-mail ou pelo primeiro login social), nasce um usuário com papel **CLIENTE** e status **não aprovado**. A conta é criada, a sessão é aberta, mas o conteúdo ainda não abre.

**Cena 3 — "Conta em análise".** Enquanto não for aprovado, o aluno vê a tela **"Sua conta está em análise"** (passos: Conta criada → Aprovação Kyron → Trilhas liberadas). É uma espera transparente, não um erro.

**Cena 4 — Aprovação pela Kyron.** Alguém da equipe aprova o aluno no **ERP → Alunos** (`/erp/alunos`). A partir daí o vínculo está liberado.

**Cena 5 — O painel do aluno.** Logado e aprovado, o usuário cai no painel `/app`:
- **Boas-vindas** personalizadas ("Olá, {primeiro nome}").
- **"Comece por aqui"** — um card de destaque que aponta para a primeira aula.
- **Trilhas de desenvolvimento** — N1 (Júnior), N2 (Intermediário), N3 (Hunter). *[em preparação: hoje as trilhas são a vitrine da estrutura; o conteúdo real vem das aulas publicadas]*.
- **Novidades** — os conteúdos publicados de verdade (vindos do módulo Manual).
- **Meu progresso** — números do momento (trilhas, aulas publicadas, materiais). *[em preparação: percentual de conclusão por aluno]*.
- **Biblioteca** e **Certificados** *[em preparação]*.

**Cena 6 — Assistir/estudar.** Ao abrir um conteúdo:
- **Treinamento em vídeo** (`/app/treinamentos/{slug}`) — player do YouTube incorporado (modo privacidade, `youtube-nocookie`).
- **Manual prático** (`/app/manuais/{slug}`) — texto/resumo do material.

**Cena 7 — Sair.** O botão de logout encerra a sessão e volta para `/app/login`.

**Cena paralela — Gestão.** Quem é da equipe (Gerente, Admin, etc.) tem, na própria tela de login, o cartão **"Acesso da gestão"** que leva ao **ERP** (`/erp`). Como a sessão é unificada, um gestor que entra por Google/LinkedIn (e tem papel de equipe) chega direto ao ERP.

---

## 3. Como funciona por dentro (mecânica)

### 3.1 Autenticação e sessão
- **Sessão única** para toda a plataforma: um cookie `kyron_session` (30 dias, renovado no uso).
- A sessão vive **no banco** (tabela `Sessao`) → dá para **revogar na hora** (logout de um aparelho ou "encerrar todas as sessões"). O cookie carrega um token aleatório **assinado**; o banco guarda apenas o **hash** desse token.
- A assinatura usa a variável **`ADMIN_SECRET`**. Sem ela, **nenhuma** sessão é válida (nem social, nem e-mail/senha).

### 3.2 As 3 formas de entrar — todas caem na mesma conta
- **E-mail e senha** — senha guardada com hash **scrypt** (salgado); nunca em texto puro.
- **Google / LinkedIn (OAuth)** — o provedor confirma identidade e e-mail **verificado**; o sistema cria/vincula a identidade social ao mesmo usuário (casando pelo e-mail). Rotas: `/api/auth/{google|linkedin}` → callback → sessão.
- Independente da porta de entrada, **o acesso a cada área é decidido pelos papéis**, não por "onde a pessoa entrou".

### 3.3 Papéis e aprovação
- Aluno = papel **CLIENTE**, com permissões `manual.ver` e `aulas.assistir`.
- **Aprovação (`aprovado`)**: novos cadastros nascem `false`. A equipe aprova no ERP. Só aprovado consome conteúdo restrito.
- Papéis de **equipe** (Admin, Gerente, Vendedor, Técnico…) dão acesso ao **ERP**; o resto é aluno da Academy.

### 3.4 Conteúdo
- Vem do módulo **Manual** (posts). Cada post pode ser:
  - **Treinamento** (tem `youtubeId`) → aula em vídeo.
  - **Manual** (sem vídeo) → material em texto.
  - **`restrito`** → exige estar logado e aprovado.

### 3.5 Portões em cada página (defesa em profundidade)
Toda página da área faz, na ordem:
1. `usuarioLogado()` — se não houver, redireciona para `/app/login`.
2. Se `!aprovado` — mostra a tela "Acesso em análise".
3. Só então carrega o conteúdo.

### 3.6 Mapa de rotas
| Rota | O que é |
|---|---|
| `/app/login` | Entrada (login/cadastro, 3 vias) |
| `/app` | Painel do aluno |
| `/app/treinamentos/{slug}` | Aula em vídeo |
| `/app/manuais/{slug}` | Material em texto |
| `/erp/entrar` · `/erp` | Acesso e painel da gestão |
| `/api/auth/{google\|linkedin}` | Início/callback do login social |

---

## 4. Estado atual — honesto

**Já funciona:** login por e-mail/senha + Google + LinkedIn; alternância login/cadastro (login por padrão); fluxo de aprovação; painel do aluno; aulas em vídeo e manuais (módulo Manual); sessão única revogável; acesso da gestão pelo ERP (inclusive via social).

**Em preparação (roadmap):** trilhas N1–N3 como estrutura navegável (conteúdo real ainda concentrado nas aulas publicadas); **percentual de conclusão por aluno** (a North Star); **certificados**; **quizzes**; **multiempresa/white-label**.

---

## 5. Segurança e privacidade
- Senhas com **scrypt** salgado; sessão = token assinado, banco só com hash; **revogável**.
- OAuth só aceita **e-mail verificado** pelo provedor.
- Conteúdo restrito exige **login + aprovação**.
- **LGPD:** progresso de aprendizado é dado pessoal — a governança de retenção/consentimento entra junto com o módulo de progresso.

---

## 6. O que liga tudo em produção (variáveis)
`ADMIN_SECRET` (sessão) · `GOOGLE_CLIENT_ID/SECRET` · `LINKEDIN_CLIENT_ID/SECRET` · `APP_PUBLIC_URL` · `NEXT_PUBLIC_SITE_URL` · `ADMIN_EMAIL/ADMIN_PASSWORD` (cria o admin master no 1º login do ERP).

Callbacks OAuth de produção:
`https://www.kyroncompany.com/api/auth/google/callback` e `.../linkedin/callback`.
