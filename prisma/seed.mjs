// Seed do catálogo Kyron.
//
// Cria a árvore de categorias (spec §6), os serviços (spec §7) e alguns
// produtos de exemplo para o site não nascer vazio. É idempotente: rodar de
// novo atualiza, não duplica (upsert por slug).
//
// Rodar:  node prisma/seed.mjs
//
// Os produtos de exemplo têm preço fictício e NÃO têm foto — servem só para o
// dono ver o layout. Ele substitui tudo pelo painel admin.

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function slug(t) {
  return t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// [nome, [subcategorias], icone]
const ARVORE = [
  ["Apple", ["iPhone novos", "iPhone seminovos", "iPad / Watch / AirPods", "Acessórios Apple"], "apple"],
  ["Casa Inteligente", ["Assistentes", "Câmeras Wi-Fi", "Fechaduras inteligentes", "Iluminação e tomadas", "Kits prontos"], "casa"],
  ["Áudio", ["Fones", "Caixas de som"], "audio"],
  ["Acessórios", ["Capas", "Películas", "Carregadores e cabos"], "acessorios"],
];

const SERVICOS = [
  {
    nome: "Instalação de automação residencial",
    descricao:
      "Projeto e instalação de casa inteligente: iluminação, tomadas, cortinas, cenas e integração com assistentes. Feito na sua casa, do ponto de partida ao funcionamento.",
    precoAPartirDe: null,
    atendeEmDomicilio: true,
    tempoMedio: "Conforme o projeto",
  },
  {
    nome: "Configuração de câmeras e fechaduras",
    descricao:
      "Instalação e configuração de câmeras Wi-Fi, fechaduras inteligentes e videoporteiros, com acesso pelo celular e orientação de uso.",
    precoAPartirDe: 15000,
    atendeEmDomicilio: true,
    tempoMedio: "1 a 3 horas",
  },
  {
    nome: "Assistência técnica",
    descricao:
      "Diagnóstico e reparo de dispositivos Apple e de casa inteligente. Avaliação antes de qualquer serviço.",
    precoAPartirDe: null,
    atendeEmDomicilio: false,
    tempoMedio: "Conforme o diagnóstico",
  },
  {
    nome: "Visita técnica em domicílio",
    descricao:
      "Vamos até você avaliar o ambiente, entender a necessidade e propor a melhor solução de tecnologia e automação.",
    precoAPartirDe: 8000,
    atendeEmDomicilio: true,
    tempoMedio: "Cerca de 1 hora",
  },
  {
    nome: "Migração e configuração de iPhone",
    descricao:
      "Passamos todos os seus dados para o novo iPhone — contatos, fotos, apps e contas — e deixamos tudo pronto para usar.",
    precoAPartirDe: 5000,
    atendeEmDomicilio: false,
    tempoMedio: "30 a 60 minutos",
  },
];

async function main() {
  console.log("Semeando categorias…");
  const idPorSlug = {};

  let ordemPai = 0;
  for (const [nomePai, filhas, icone] of ARVORE) {
    const pai = await db.categoria.upsert({
      where: { slug: slug(nomePai) },
      update: { nome: nomePai, icone, ordem: ordemPai },
      create: { slug: slug(nomePai), nome: nomePai, icone, ordem: ordemPai },
    });
    idPorSlug[pai.slug] = pai.id;
    ordemPai += 1;

    let ordemFilha = 0;
    for (const nomeFilha of filhas) {
      const s = slug(`${nomePai}-${nomeFilha}`);
      const filha = await db.categoria.upsert({
        where: { slug: s },
        update: { nome: nomeFilha, parentId: pai.id, ordem: ordemFilha },
        create: { slug: s, nome: nomeFilha, parentId: pai.id, ordem: ordemFilha },
      });
      idPorSlug[filha.slug] = filha.id;
      ordemFilha += 1;
    }
  }

  console.log("Semeando serviços…");
  let ordemServ = 0;
  for (const serv of SERVICOS) {
    await db.servico.upsert({
      where: { slug: slug(serv.nome) },
      update: { ...serv, ordem: ordemServ },
      create: { slug: slug(serv.nome), ...serv, ordem: ordemServ },
    });
    ordemServ += 1;
  }

  // Produtos de exemplo só no primeiro deploy (catálogo vazio). Depois que o
  // dono cadastrar itens reais — ou apagar os exemplos — o seed não os recria.
  if ((await db.produto.count()) > 0) {
    const nCat = await db.categoria.count();
    const nServ = await db.servico.count();
    console.log(
      `Estrutura pronta: ${nCat} categorias, ${nServ} serviços. Catálogo já tem produtos — exemplos não recriados.`,
    );
    return;
  }

  console.log("Semeando produtos de exemplo…");
  const catSeminovos = idPorSlug[slug("Apple-iPhone seminovos")];
  const catNovos = idPorSlug[slug("Apple-iPhone novos")];
  const catCameras = idPorSlug[slug("Casa Inteligente-Câmeras Wi-Fi")];
  const catFones = idPorSlug[slug("Áudio-Fones")];

  // Produto novo em destaque
  const ip15 = await db.produto.upsert({
    where: { slug: "iphone-15-128gb-exemplo" },
    update: {},
    create: {
      slug: "iphone-15-128gb-exemplo",
      nome: "iPhone 15 128GB (exemplo)",
      marca: "Apple",
      categoriaId: catNovos,
      preco: 549900,
      descricaoCurta: "Novo, lacrado, com nota e garantia Apple.",
      descricaoLonga:
        "iPhone 15 novo e lacrado. Produto de exemplo — o dono publica os itens reais pelo painel.",
      destaque: true,
    },
  });

  // Seminovo com os campos de condição (o diferencial da loja)
  const ip13 = await db.produto.upsert({
    where: { slug: "iphone-13-128gb-seminovo-exemplo" },
    update: {},
    create: {
      slug: "iphone-13-128gb-seminovo-exemplo",
      nome: "iPhone 13 128GB Seminovo (exemplo)",
      marca: "Apple",
      categoriaId: catSeminovos,
      preco: 279900,
      precoPromo: 259900,
      descricaoCurta: "Seminovo revisado, com garantia da loja.",
      descricaoLonga:
        "iPhone 13 seminovo, testado e revisado. Produto de exemplo para demonstrar a vitrine de seminovos.",
      destaque: true,
    },
  });
  await db.seminovo.upsert({
    where: { produtoId: ip13.id },
    update: {},
    create: {
      produtoId: ip13.id,
      saudeBateria: 89,
      condicaoEstetica: "ótimo",
      cor: "Meia-noite",
      capacidade: "128GB",
      garantiaMeses: 3,
    },
  });

  // Casa inteligente
  await db.produto.upsert({
    where: { slug: "camera-wifi-interna-exemplo" },
    update: {},
    create: {
      slug: "camera-wifi-interna-exemplo",
      nome: "Câmera Wi-Fi Interna (exemplo)",
      marca: "Intelbras",
      categoriaId: catCameras,
      preco: 19900,
      descricaoCurta: "Full HD, visão noturna, acesso pelo celular.",
      destaque: true,
    },
  });

  // Áudio
  await db.produto.upsert({
    where: { slug: "airpods-exemplo" },
    update: {},
    create: {
      slug: "airpods-exemplo",
      nome: "AirPods (exemplo)",
      marca: "Apple",
      categoriaId: catFones,
      preco: 149900,
      descricaoCurta: "Som imersivo e cancelamento de ruído.",
      destaque: false,
    },
  });

  const nProd = await db.produto.count();
  const nCat = await db.categoria.count();
  const nServ = await db.servico.count();
  console.log(`Pronto: ${nCat} categorias, ${nProd} produtos, ${nServ} serviços.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
