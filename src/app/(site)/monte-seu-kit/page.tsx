import type { Metadata } from "next";

import { MonteSeuKit, type ProdutoKit } from "@/components/kit/MonteSeuKit";
import { PageHero } from "@/components/site/PageHero";
import { getProdutosParaKit } from "@/lib/catalogo";
import { linkWhatsApp } from "@/lib/kyron/site";

export const metadata: Metadata = {
  title: "Monte seu Kit Celular",
  description:
    "Escolha seu iPhone e acess?rios compat?veis: pel?cula, capa, carregador, fone e extras. Envie o kit para a Kyron pelo WhatsApp.",
  alternates: { canonical: "/monte-seu-kit" },
};

export const dynamic = "force-dynamic";

export default async function MonteSeuKitPage() {
  const produtos = await getProdutosParaKit();
  const dados: ProdutoKit[] = produtos.map((produto) => ({
    id: produto.id,
    slug: produto.slug,
    nome: produto.nome,
    marca: produto.marca,
    preco: produto.preco,
    precoPromo: produto.precoPromo,
    descricaoCurta: produto.descricaoCurta,
    compatibilidade: produto.compatibilidade,
    categoria: { slug: produto.categoria.slug, nome: produto.categoria.nome },
    imagens: produto.imagens.map((imagem) => ({
      url: imagem.url,
      principal: imagem.principal,
    })),
    seminovo: produto.seminovo ? { vendido: produto.seminovo.vendido } : null,
  }));

  return (
    <>
      <PageHero
        eyebrow="Monte seu Kit Celular"
        titulo={
          <>
            Seu iPhone, do <span className="text-kyron-blue">seu jeito</span>.
          </>
        }
        lede="Escolha o celular e complemente com acess?rios compat?veis. A Kyron confere cada detalhe antes do atendimento pelo WhatsApp."
      />
      <MonteSeuKit
        produtos={dados}
        whatsappBase={linkWhatsApp() ?? "/contato"}
      />
    </>
  );
}
