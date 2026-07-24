import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { getServico, getServicos } from "@/lib/catalogo";
import { formatarPreco } from "@/lib/format";
import { SITE_URL, linkWhatsAppServico } from "@/lib/kyron/site";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const servico = await getServico(slug);
  if (!servico) return {};
  return {
    title: `${servico.nome} — Kyron Tecnologia`,
    description:
      servico.descricao ??
      `${servico.nome} com a Kyron, em Santa Cruz do Sul. Peça um orçamento.`,
    alternates: { canonical: `/servicos/${servico.slug}` },
  };
}

export default async function PaginaServico({ params }: Props) {
  const { slug } = await params;
  const servico = await getServico(slug);
  if (!servico) notFound();

  const whats = linkWhatsAppServico(servico);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: servico.nome,
    ...(servico.descricao ? { description: servico.descricao } : {}),
    provider: { "@type": "LocalBusiness", name: "Kyron Tecnologia", url: SITE_URL },
    areaServed: { "@type": "City", name: "Santa Cruz do Sul" },
  };

  return (
    <>
      <PageHero eyebrow="Serviço" titulo={servico.nome} lede={servico.descricao ?? undefined} />

      <Section semBorda>
        <dl className="grid-fluida-3 max-w-[68ch]">
          <Info
            rotulo="Investimento"
            valor={
              servico.precoAPartirDe != null
                ? `A partir de ${formatarPreco(servico.precoAPartirDe)}`
                : "Sob orçamento"
            }
          />
          <Info
            rotulo="Atendimento"
            valor={servico.atendeEmDomicilio ? "Na sua casa" : "Na loja"}
          />
          {servico.tempoMedio && <Info rotulo="Tempo médio" valor={servico.tempoMedio} />}
        </dl>

        <div className="mt-fluid-xl flex flex-wrap gap-fluid-xs">
          <Link
            href={`/orcamento?servico=${servico.slug}`}
            className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(30,107,255,0.28)]"
          >
            Pedir orçamento
          </Link>
          {whats && (
            <a
              href={whats}
              target="_blank"
              rel="noopener noreferrer"
              className="kyron-label rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-md py-fluid-sm text-fluid-xs text-kyron-silver transition-colors duration-300 hover:border-[var(--kyron-blue-line)] hover:text-kyron-white"
            >
              Falar no WhatsApp
            </a>
          )}
        </div>
      </Section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}

function Info({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="border-t border-[var(--kyron-hairline)] pt-fluid-sm">
      <dt className="kyron-label text-fluid-2xs text-kyron-silver/55">{rotulo}</dt>
      <dd className="mt-1 text-fluid-base font-semibold text-kyron-white">{valor}</dd>
    </div>
  );
}
