import type { Metadata } from "next";
import Link from "next/link";

import { ProdutoCard } from "@/components/catalogo/ProdutoCard";
import { Section, SectionHeader } from "@/components/site/Section";
import { getSeminovos, getServicos } from "@/lib/catalogo";

// Catálogo é dado vivo (muda pelo admin) e lê o banco. Renderiza a cada acesso,
// não no build — o banco só existe quando o site liga, não durante a montagem.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kyron Tecnologia — Apple, Casa Inteligente e Automação em Santa Cruz do Sul",
  description:
    "Apple novos e seminovos, casa inteligente, áudio e serviços de instalação em Santa Cruz do Sul. Atendimento consultivo e conversa direta no WhatsApp.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [seminovos, servicos] = await Promise.all([
    getSeminovos(),
    getServicos(),
  ]);

  // Home é vitrine de entrada, não o catálogo inteiro: só uma amostra.
  // A ordem vem do campo "ordem" (curado no admin) — os que o dono destaca
  // aparecem primeiro. Medição real de "mais vistos" exige rastrear cliques,
  // uma evolução futura; por enquanto, a curadoria faz esse papel.
  const seminovosAmostra = seminovos.slice(0, 4);
  const servicosAmostra = servicos.slice(0, 4);

  return (
    <>
      {/* BANNER — compacto, centralizado no eixo */}
      <section className="relative overflow-hidden pb-fluid-lg pt-fluid-lg">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -top-[16vw] aspect-square w-[min(30rem,75vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(30,107,255,0.12),transparent_68%)]"
        />
        <div className="container-kyron relative flex flex-col items-center text-center">
          <p className="kyron-label text-fluid-2xs tracking-[0.18em] text-kyron-silver/70">
            Santa Cruz do Sul · RS
          </p>
          <h1 className="kyron-display mt-fluid-xs max-w-[20ch] text-fluid-3xl text-kyron-white">
            Tecnologia premium, <span className="text-kyron-blue">perto</span> de você.
          </h1>
          <p className="mt-fluid-sm max-w-[48ch] text-fluid-base text-kyron-silver">
            Apple novos e seminovos, casa inteligente, áudio e instalação em
            domicílio. Atendimento consultivo, conversa direta no WhatsApp.
          </p>
          <div className="mt-fluid-md flex flex-wrap justify-center gap-fluid-xs">
            <Link
              href="/produtos"
              className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(30,107,255,0.28)]"
            >
              Ver produtos
            </Link>
            <Link
              href="/seminovos"
              className="kyron-label rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-md py-fluid-sm text-fluid-xs text-kyron-silver transition-colors duration-300 hover:border-[var(--kyron-blue-line)] hover:text-kyron-white"
            >
              iPhone seminovos
            </Link>
          </div>
        </div>
      </section>

      {/* AMOSTRA DE SEMINOVOS — cada card leva ao seminovo */}
      {seminovosAmostra.length > 0 && (
        <Section>
          <SectionHeader
            eyebrow="iPhone seminovos"
            titulo="Os mais procurados."
          />
          <ul className="grid-fluida-4">
            {seminovosAmostra.map((p, i) => (
              <li key={p.id}>
                <ProdutoCard produto={p} prioridade={i < 2} />
              </li>
            ))}
          </ul>
          <div className="mt-fluid-lg text-center">
            <Link
              href="/seminovos"
              className="kyron-label text-fluid-xs text-kyron-blue hover:underline"
            >
              Ver todos os seminovos →
            </Link>
          </div>
        </Section>
      )}

      {/* SERVIÇOS — caixas com explicação básica; clicar leva ao serviço */}
      {servicosAmostra.length > 0 && (
        <Section>
          <SectionHeader
            eyebrow="Serviços"
            titulo="A gente instala e configura para você."
          />

          <ul className="grid-fluida-2">
            {servicosAmostra.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/servicos/${s.slug}`}
                  className="group flex h-full flex-col rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md transition-all duration-[400ms] ease-in-out hover:-translate-y-0.5 hover:border-[var(--kyron-blue-line)]"
                >
                  <div className="flex items-start justify-between gap-fluid-sm">
                    <h3 className="kyron-display text-fluid-base text-kyron-white">
                      {s.nome}
                    </h3>
                    {s.atendeEmDomicilio && (
                      <span className="kyron-label shrink-0 rounded-full border border-[var(--kyron-blue-line)] bg-[var(--kyron-blue-soft)] px-fluid-xs py-1 text-fluid-2xs text-kyron-blue">
                        Em domicílio
                      </span>
                    )}
                  </div>
                  {s.descricao && (
                    <p className="mt-fluid-sm line-clamp-3 text-fluid-sm text-kyron-silver">
                      {s.descricao}
                    </p>
                  )}
                  <span className="kyron-label mt-auto pt-fluid-md inline-flex items-center gap-1.5 text-fluid-xs text-kyron-blue">
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

          <div className="mt-fluid-lg flex flex-col items-center gap-fluid-sm">
            <Link
              href="/orcamento"
              className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(30,107,255,0.28)]"
            >
              Pedir orçamento
            </Link>
            <Link
              href="/servicos"
              className="kyron-label text-fluid-xs text-kyron-blue hover:underline"
            >
              Ver todos os serviços →
            </Link>
          </div>
        </Section>
      )}
    </>
  );
}
