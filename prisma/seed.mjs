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

  console.log("Semeando Manual de Instalação (exemplos)…");
  await db.post.upsert({
    where: { slug: "bem-vindo-ao-manual" },
    update: {},
    create: {
      slug: "bem-vindo-ao-manual",
      titulo: "Bem-vindo ao Manual de Instalação",
      resumo: "Novidades, dicas e tutoriais da Kyron.",
      conteudo:
        "Aqui você acompanha novidades e informações. As aulas em vídeo de instalação e configuração são liberadas para clientes com acesso aprovado.",
      restrito: false,
      publicado: true,
      ordem: 0,
    },
  });
  await db.post.upsert({
    where: { slug: "aula-exemplo-automacao" },
    update: {},
    create: {
      slug: "aula-exemplo-automacao",
      titulo: "Aula: primeiros passos na automação (exemplo)",
      resumo: "Como configurar sua primeira tomada inteligente.",
      conteudo:
        "Aula de exemplo — o dono substitui pelo vídeo real (YouTube não listado) no painel.",
      restrito: true,
      publicado: true,
      ordem: 1,
    },
  });

  // Produtos de exemplo só no primeiro deploy (catálogo vazio). Depois que o
  // dono cadastrar itens reais — ou apagar os exemplos — o seed não os recria.
  const catalogoVazio = (await db.produto.count()) === 0;

  // Ilustrações de exemplo (vetoriais, na identidade Kyron, servidas de
  // /public/exemplos — geradas por scripts/gerar-ilustracoes.mjs). São só um
  // conjunto digno enquanto não há foto real: o dono troca pelas dele no admin.
  const FOTO_EXEMPLO = {
    "iphone-15-128gb-exemplo": "/exemplos/iphone-novo.webp",
    "iphone-13-128gb-seminovo-exemplo": "/exemplos/iphone-seminovo.webp",
    "ipad-109-exemplo": "/exemplos/ipad.webp",
    "apple-watch-se-exemplo": "/exemplos/watch.webp",
    "airpods-exemplo": "/exemplos/airpods.webp",
    "camera-wifi-interna-exemplo": "/exemplos/camera-wifi.webp",
    "fechadura-inteligente-exemplo": "/exemplos/fechadura.webp",
    "caixa-de-som-inteligente-exemplo": "/exemplos/caixa-som.webp",
    "fone-over-ear-exemplo": "/exemplos/fone.webp",
    "carregador-usb-c-exemplo": "/exemplos/acessorio.webp",
  };

  // Anexa a foto de exemplo a um produto que ainda não tenha nenhuma imagem.
  // Idempotente: roda sempre, mas só age quando falta foto.
  async function garantirFotoExemplo(slugProduto) {
    const p = await db.produto.findUnique({
      where: { slug: slugProduto },
      include: { imagens: true },
    });
    if (!p || p.imagens.length > 0) return;
    const url = FOTO_EXEMPLO[slugProduto];
    if (!url) return;
    await db.produtoImagem.create({
      data: { produtoId: p.id, url, principal: true, ordem: 0 },
    });
  }

  if (!catalogoVazio) {
    // Catálogo já tem produtos: não recria exemplos, mas garante que os
    // exemplos existentes ganhem a foto (caso ainda estejam sem).
    for (const s of Object.keys(FOTO_EXEMPLO)) await garantirFotoExemplo(s);
    const nCat = await db.categoria.count();
    const nServ = await db.servico.count();
    console.log(
      `Estrutura pronta: ${nCat} categorias, ${nServ} serviços. Fotos de exemplo garantidas.`,
    );
    return;
  }

  console.log("Semeando produtos de exemplo…");
  const catSeminovos = idPorSlug[slug("Apple-iPhone seminovos")];
  const catNovos = idPorSlug[slug("Apple-iPhone novos")];
  const catAppleOutros = idPorSlug[slug("Apple-iPad / Watch / AirPods")];
  const catCameras = idPorSlug[slug("Casa Inteligente-Câmeras Wi-Fi")];
  const catFechaduras = idPorSlug[slug("Casa Inteligente-Fechaduras inteligentes")];
  const catFones = idPorSlug[slug("Áudio-Fones")];
  const catCaixas = idPorSlug[slug("Áudio-Caixas de som")];
  const catCabos = idPorSlug[slug("Acessórios-Carregadores e cabos")];

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

  // Apple — iPad / Watch / AirPods
  await db.produto.upsert({
    where: { slug: "ipad-109-exemplo" },
    update: {},
    create: {
      slug: "ipad-109-exemplo",
      nome: 'iPad 10,9" 64GB (exemplo)',
      marca: "Apple",
      categoriaId: catAppleOutros,
      preco: 429900,
      descricaoCurta: "Tela Liquid Retina, chip veloz e o dia todo de bateria.",
      destaque: true,
    },
  });
  await db.produto.upsert({
    where: { slug: "apple-watch-se-exemplo" },
    update: {},
    create: {
      slug: "apple-watch-se-exemplo",
      nome: "Apple Watch SE (exemplo)",
      marca: "Apple",
      categoriaId: catAppleOutros,
      preco: 289900,
      descricaoCurta: "Saúde, atividade e notificações no seu pulso.",
      destaque: false,
    },
  });
  await db.produto.upsert({
    where: { slug: "airpods-exemplo" },
    update: {},
    create: {
      slug: "airpods-exemplo",
      nome: "AirPods (exemplo)",
      marca: "Apple",
      categoriaId: catAppleOutros,
      preco: 149900,
      descricaoCurta: "Som imersivo e cancelamento de ruído.",
      destaque: false,
    },
  });

  // Casa inteligente — fechadura
  await db.produto.upsert({
    where: { slug: "fechadura-inteligente-exemplo" },
    update: {},
    create: {
      slug: "fechadura-inteligente-exemplo",
      nome: "Fechadura Inteligente (exemplo)",
      marca: "Yale",
      categoriaId: catFechaduras,
      preco: 89900,
      precoPromo: 79900,
      descricaoCurta: "Senha, biometria e abertura pelo celular.",
      destaque: true,
    },
  });

  // Áudio — fone e caixa de som
  await db.produto.upsert({
    where: { slug: "fone-over-ear-exemplo" },
    update: {},
    create: {
      slug: "fone-over-ear-exemplo",
      nome: "Fone Over-Ear (exemplo)",
      marca: "JBL",
      categoriaId: catFones,
      preco: 69900,
      descricaoCurta: "Graves potentes e horas de bateria sem fio.",
      destaque: false,
    },
  });
  await db.produto.upsert({
    where: { slug: "caixa-de-som-inteligente-exemplo" },
    update: {},
    create: {
      slug: "caixa-de-som-inteligente-exemplo",
      nome: "Caixa de Som Inteligente (exemplo)",
      marca: "Amazon",
      categoriaId: catCaixas,
      preco: 54900,
      descricaoCurta: "Assistente de voz e som ambiente para a casa.",
      destaque: false,
    },
  });

  // Acessórios — carregador + cabo
  await db.produto.upsert({
    where: { slug: "carregador-usb-c-exemplo" },
    update: {},
    create: {
      slug: "carregador-usb-c-exemplo",
      nome: "Carregador 20W + Cabo USB-C (exemplo)",
      marca: "Apple",
      categoriaId: catCabos,
      preco: 24900,
      descricaoCurta: "Carga rápida para iPhone e iPad, com cabo incluso.",
      destaque: false,
    },
  });

  // Fotos de exemplo nos produtos recém-criados.
  for (const s of Object.keys(FOTO_EXEMPLO)) await garantirFotoExemplo(s);

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
