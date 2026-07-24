import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { getServicos } from "@/lib/catalogo";
import { formatarPreco } from "@/lib/format";

// Lê o banco (serviços) — renderiza a cada acesso, não no build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Serviços — Automação, Instalação e Assistência",
  description:
    "Instalação de automação residencial, câmeras e fechaduras, assistência técnica e configuração de iPhone. Atendimento em domicílio em Santa Cruz do Sul.",
  alternates: { canonical: "/servicos" },
};

export const revalidate = 300;

export default async function Servicos() {
  const servicos = await getServicos();

  return (
    <>
      <PageHero
        eyebrow="Serviços"
        titulo={
          <>
            Instalamos, configuramos e{" "}
            <span className="text-kyron-blue">resolvemos</span>.
          </>
        }
        lede="Da automação da casa à migração do seu iPhone. Boa parte é feita na sua casa — a gente leva a tecnologia até você."
      />

      <Section semBorda>
        <ul className="grid-fluida-2">
          {servicos.map((s) => (
            <li key={s.id}>
              <Link
                href={`/servicos/${s.slug}`}
                className="group flex h-full flex-col rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md transition-all duration-[400ms] ease-in-out hover:-translate-y-0.5 hover:border-[var(--kyron-blue-line)]"
              >
                <div className="flex items-start justify-between gap-fluid-sm">
                  <h2 className="kyron-display text-fluid-base text-kyron-white">
                    {s.nome}
                  </h2>
                  {s.atendeEmDomicilio && (
                    <span className="kyron-label shrink-0 rounded-full border border-[var(--kyron-blue-line)] bg-[var(--kyron-blue-soft)] px-fluid-xs py-1 text-fluid-2xs text-kyron-blue">
                      Em domicílio
                    </span>
                  )}
                </div>

                {s.descricao && (
                  <p className="mt-fluid-sm text-fluid-sm text-kyron-silver">
                    {s.descricao}
                  </p>
                )}

                <p className="mt-fluid-md pt-fluid-sm text-fluid-sm text-kyron-silver/70">
                  {s.precoAPartirDe != null
                    ? `A partir de ${formatarPreco(s.precoAPartirDe)}`
                    : "Sob orçamento"}
                </p>

                <span className="kyron-label mt-fluid-sm inline-flex items-center gap-1.5 text-fluid-xs text-kyron-blue">
                  Ver serviço
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-[400ms] group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
