import type { Metadata } from "next";
import Link from "next/link";

import { ProdutoCard } from "@/components/catalogo/ProdutoCard";
import { Section, SectionHeader } from "@/components/site/Section";
import { getCategoriasArvore, getProdutosDestaque, getServicos } from "@/lib/catalogo";
import { KYRON_COMPANY } from "@/lib/kyron/company";
import { CTA_PRIMARIO } from "@/lib/kyron/site";

export const metadata: Metadata = {
  title: "Kyron Tecnologia — Apple, Casa Inteligente e Automação em Santa Cruz do Sul",
  description:
    "Apple novos e seminovos, casa inteligente, áudio e serviços de instalação em Santa Cruz do Sul. Atendimento consultivo e conversa direta no WhatsApp.",
  alternates: { canonical: "/" },
};

export const revalidate = 300;

export default async function Home() {
  const [destaques, arvore, servicos] = await Promise.all([
    getProdutosDestaque(8),
    getCategoriasArvore(),
    getServicos(),
  ]);

  const emDomicilio = servicos.filter((s) => s.atendeEmDomicilio).slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pb-section pt-fluid-xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-[15vw] -top-[20vw] aspect-square w-[min(45rem,90vw)] rounded-full bg-[radial-gradient(circle,rgba(30,107,255,0.12),transparent_68%)]"
        />
        <div className="container-kyron relative max-w-[52rem]">
          <p className="kyron-label text-fluid-2xs tracking-[0.18em] text-kyron-silver/70">
            Santa Cruz do Sul · RS
          </p>
          <h1 className="kyron-display mt-fluid-sm max-w-[18ch] text-fluid-hero text-kyron-white">
            Tecnologia premium, <span className="text-kyron-blue">perto</span> de você.
          </h1>
          <p className="mt-fluid-md max-w-[48ch] text-fluid-lg text-kyron-silver">
            Apple novos e seminovos, casa inteligente, áudio e instalação em
            domicílio. Atendimento consultivo, conversa direta no WhatsApp.
          </p>
          <div className="mt-fluid-lg flex flex-wrap gap-fluid-xs">
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

      {/* DESTAQUES */}
      {destaques.length > 0 && (
        <Section>
          <div className="mb-fluid-lg flex flex-wrap items-end justify-between gap-fluid-sm">
            <SectionHeader eyebrow="Em destaque" titulo="Escolhidos para você." />
            <Link
              href="/produtos"
              className="kyron-label mb-fluid-xl text-fluid-xs text-kyron-blue hover:underline"
            >
              Ver tudo →
            </Link>
          </div>
          <ul className="grid-fluida-4">
            {destaques.map((p, i) => (
              <li key={p.id}>
                <ProdutoCard produto={p} prioridade={i < 4} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* CATEGORIAS */}
      <Section>
        <SectionHeader eyebrow="Categorias" titulo="Encontre pelo que procura." />
        <ul className="grid-fluida-4">
          {arvore.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/produtos?categoria=${cat.slug}`}
                className="group flex h-full flex-col justify-between rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md transition-all duration-[400ms] hover:-translate-y-0.5 hover:border-[var(--kyron-blue-line)]"
              >
                <h3 className="kyron-display text-fluid-base text-kyron-white">
                  {cat.nome}
                </h3>
                <p className="mt-fluid-sm text-fluid-2xs text-kyron-silver/60">
                  {cat.filhas.map((f) => f.nome).join(" · ")}
                </p>
                <span className="kyron-label mt-fluid-md text-fluid-xs text-kyron-blue">
                  Explorar →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* SERVIÇO EM DOMICÍLIO */}
      {emDomicilio.length > 0 && (
        <Section>
          <div className="rounded-kyron-lg border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg">
            <div className="grid items-center gap-fluid-lg [grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr))]">
              <div>
                <p className="kyron-label text-fluid-2xs tracking-[0.18em] text-kyron-silver/70">
                  Atendimento em domicílio
                </p>
                <h2 className="kyron-display mt-fluid-sm text-fluid-2xl text-kyron-white">
                  A gente vai até a sua casa.
                </h2>
                <p className="mt-fluid-sm max-w-[46ch] text-fluid-base text-kyron-silver">
                  Instalação de automação, câmeras e fechaduras, e configuração do
                  seu iPhone — sem você precisar sair de casa.
                </p>
                <Link
                  href="/servicos"
                  className="kyron-label mt-fluid-lg inline-block rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px"
                >
                  Conhecer os serviços
                </Link>
              </div>
              <ul className="space-y-fluid-xs">
                {emDomicilio.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/servicos/${s.slug}`}
                      className="flex items-center gap-fluid-sm rounded-kyron-sm border border-[var(--kyron-hairline)] p-fluid-sm text-fluid-sm text-kyron-silver transition-colors duration-300 hover:border-[var(--kyron-blue-line)] hover:text-kyron-white"
                    >
                      <span aria-hidden="true" className="text-kyron-blue">
                        →
                      </span>
                      {s.nome}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      )}

      {/*
        RESERVADO — Prova social / instalações realizadas.
        Publicar só com fotos reais de instalações e autorização. Sem banco de
        imagem, sem depoimento inventado (Manual §11).
      */}

      {/* LOCALIZAÇÃO */}
      <Section>
        <SectionHeader eyebrow="Onde estamos" titulo="Santa Cruz do Sul e região." />
        <div className="grid-fluida-3 max-w-[68ch]">
          <Bloco titulo="Cidade" texto={KYRON_COMPANY.enderecoPublico} />
          <Bloco titulo="Atendimento" texto="Loja e domicílio. Confirme pelo WhatsApp." />
          <Bloco titulo="Empresa" texto={`${KYRON_COMPANY.nomeFantasia} · CNPJ ${KYRON_COMPANY.cnpj}`} />
        </div>
        <Link
          href={CTA_PRIMARIO.href}
          target={CTA_PRIMARIO.href.startsWith("http") ? "_blank" : undefined}
          rel={CTA_PRIMARIO.href.startsWith("http") ? "noopener noreferrer" : undefined}
          className="kyron-label mt-fluid-lg inline-block rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(30,107,255,0.28)]"
        >
          {CTA_PRIMARIO.label}
        </Link>
      </Section>
    </>
  );
}

function Bloco({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="border-t border-[var(--kyron-hairline)] pt-fluid-sm">
      <h3 className="kyron-label text-fluid-2xs text-kyron-silver/55">{titulo}</h3>
      <p className="mt-1 text-fluid-sm text-kyron-white">{texto}</p>
    </div>
  );
}
