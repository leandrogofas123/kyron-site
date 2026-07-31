import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Galeria } from "@/components/catalogo/Galeria";
import { PainelSeminovo } from "@/components/catalogo/PainelSeminovo";
import { Preco } from "@/components/catalogo/Preco";
import { ProdutoCard } from "@/components/catalogo/ProdutoCard";
import { SelosConfianca } from "@/components/catalogo/SelosConfianca";
import { Section, SectionHeader } from "@/components/site/Section";
import { getCompativeis, getProduto } from "@/lib/catalogo";
import { formatarPreco, precoVigente } from "@/lib/format";
import { SITE_URL, linkWhatsAppProduto } from "@/lib/kyron/site";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const produto = await getProduto(slug);
  if (!produto) return {};

  const capa = produto.imagens.find((i) => i.principal) ?? produto.imagens[0];
  const { atual } = precoVigente(produto.preco, produto.precoPromo);

  const keywords = produto.palavrasChave
    ? produto.palavrasChave.split(",").map((k) => k.trim()).filter(Boolean)
    : undefined;

  return {
    // SEO editável no ERP (módulo SITE); cai no padrão quando não preenchido.
    title: produto.metaTitle ?? `${produto.nome} — ${formatarPreco(atual)}`,
    description:
      produto.metaDescription ??
      produto.descricaoCurta ??
      `${produto.nome} na Kyron Tecnologia, em Santa Cruz do Sul. Fale no WhatsApp.`,
    keywords,
    alternates: { canonical: `/produtos/${produto.slug}` },
    openGraph: capa ? { images: [{ url: capa.url }] } : undefined,
  };
}

export default async function PaginaProduto({ params }: Props) {
  const { slug } = await params;
  const produto = await getProduto(slug);
  if (!produto) notFound();

  const whats = linkWhatsAppProduto(produto);
  const { atual } = precoVigente(produto.preco, produto.precoPromo);
  const s = produto.seminovo;

  // Produtos compatíveis (acessórios que servem neste item, itens que ele
  // declara compatíveis, ou — sem match — a mesma categoria).
  const relacionados = await getCompativeis(produto, 4);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: produto.nome,
    ...(produto.marca ? { brand: { "@type": "Brand", name: produto.marca } } : {}),
    ...(produto.descricaoCurta ? { description: produto.descricaoCurta } : {}),
    ...(produto.imagens.length
      ? { image: produto.imagens.map((i) => `${SITE_URL}${i.url}`) }
      : {}),
    offers: {
      "@type": "Offer",
      price: (atual / 100).toFixed(2),
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/produtos/${produto.slug}`,
    },
  };

  return (
    <>
      <Section semBorda className="pt-fluid-lg">
        <nav aria-label="Trilha" className="mb-fluid-md text-fluid-2xs text-kyron-silver/60">
          <Link href="/produtos" className="hover:text-kyron-silver">
            Produtos
          </Link>{" "}
          /{" "}
          <Link
            href={`/produtos?categoria=${produto.categoria.slug}`}
            className="hover:text-kyron-silver"
          >
            {produto.categoria.nome}
          </Link>
        </nav>

        <div className="grid items-start gap-fluid-xl [grid-template-columns:repeat(auto-fit,minmax(min(100%,22rem),1fr))]">
          <Galeria imagens={produto.imagens} nome={produto.nome} />

          <div>
            {produto.marca && (
              <p className="kyron-label text-fluid-2xs text-kyron-silver/50">
                {produto.marca}
              </p>
            )}
            <h1 className="kyron-display mt-fluid-2xs text-fluid-2xl text-kyron-white">
              {produto.nome}
            </h1>

            {produto.seminovo && (
              <span className="kyron-label mt-fluid-sm inline-block rounded-full border border-[var(--kyron-hairline-strong)] px-fluid-sm py-1 text-fluid-2xs text-kyron-silver">
                Seminovo revisado
              </span>
            )}

            <div className="mt-fluid-md">
              <Preco preco={produto.preco} precoPromo={produto.precoPromo} tamanho="lg" />
            </div>

            {produto.descricaoCurta && (
              <p className="mt-fluid-sm max-w-[52ch] text-fluid-base text-kyron-silver">
                {produto.descricaoCurta}
              </p>
            )}

            {/* Seminovo: os campos que respondem as objeções de quem compra
                usado. Exibidos com destaque — spec §9.2. */}
            {s && <PainelSeminovo s={s} />}

            {/* CTA único — spec §9.1. A conversa chega já identificando o item. */}
            {whats ? (
              <a
                href={whats}
                target="_blank"
                rel="noopener noreferrer"
                className="kyron-label mt-fluid-lg inline-flex w-full items-center justify-center gap-fluid-xs rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(30,107,255,0.28)] sm:w-auto"
              >
                <IconeWhats />
                Falar no WhatsApp
              </a>
            ) : (
              <Link
                href="/contato"
                className="kyron-label mt-fluid-lg inline-block rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white"
              >
                Entrar em contato
              </Link>
            )}

            <p className="mt-fluid-sm text-fluid-2xs text-kyron-silver/55">
              Atendimento em Santa Cruz do Sul e região. Chame no WhatsApp para
              confirmar disponibilidade.
            </p>
          </div>
        </div>

        <div className="mt-fluid-xl">
          <SelosConfianca />
        </div>

        {produto.descricaoLonga && (
          <div className="mt-fluid-xl max-w-[68ch]">
            <h2 className="kyron-display text-fluid-lg text-kyron-white">Detalhes</h2>
            <p className="mt-fluid-sm whitespace-pre-wrap text-fluid-base text-kyron-silver">
              {produto.descricaoLonga}
            </p>
          </div>
        )}
      </Section>

      {relacionados.length > 0 && (
        <Section>
          <SectionHeader eyebrow="Combina com este produto" titulo="Produtos compatíveis" />
          <ul className="grid-fluida-4">
            {relacionados.map((p) => (
              <li key={p.id}>
                <ProdutoCard produto={p} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}

function IconeWhats() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4 0 .5l-.4.5c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.2 0 .4 0 .5-.1l.7-.9c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.2.1.7-.1 1.2Z" />
    </svg>
  );
}
