import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { KYRON_COMPANY } from "@/lib/kyron/company";
import { CONTATO, linkWhatsApp } from "@/lib/kyron/site";

export const metadata: Metadata = {
  title: "Contato — Kyron Tecnologia em Santa Cruz do Sul",
  description:
    "Fale com a Kyron pelo WhatsApp ou e-mail. Atendimento na loja e em domicílio, em Santa Cruz do Sul e região.",
  alternates: { canonical: "/contato" },
};

export default function Contato() {
  const whats = linkWhatsApp(
    "Olá! Vim pelo site da Kyron e gostaria de falar com vocês.",
  );

  return (
    <>
      <PageHero
        eyebrow="Contato"
        titulo={
          <>
            Fale com a gente pelo{" "}
            <span className="text-kyron-blue">WhatsApp</span>.
          </>
        }
        lede="É o jeito mais rápido de resolver: tirar dúvida de produto, confirmar disponibilidade de um seminovo ou pedir um orçamento de instalação."
      >
        {whats && (
          <div className="mt-fluid-lg">
            <a
              href={whats}
              target="_blank"
              rel="noopener noreferrer"
              className="kyron-label inline-flex items-center gap-fluid-xs rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(30,107,255,0.28)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4 0 .5l-.4.5c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.2 0 .4 0 .5-.1l.7-.9c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.2.1.7-.1 1.2Z" />
              </svg>
              Abrir conversa no WhatsApp
            </a>
          </div>
        )}
      </PageHero>

      <Section semBorda>
        <dl className="grid-fluida-2 max-w-[60rem]">
          {CONTATO.email && (
            <Bloco rotulo="E-mail">
              <a
                href={`mailto:${CONTATO.email}`}
                className="break-words text-kyron-blue underline underline-offset-2"
              >
                {CONTATO.email}
              </a>
            </Bloco>
          )}
          <Bloco rotulo="Onde estamos">
            {KYRON_COMPANY.enderecoPublico}
            <br />
            <span className="text-fluid-sm text-kyron-silver/70">
              Atendimento na loja e em domicílio.
            </span>
          </Bloco>
          <Bloco rotulo="Orçamento de serviço">
            <Link href="/orcamento" className="text-kyron-blue underline underline-offset-2">
              Preencher formulário rápido
            </Link>
          </Bloco>
          <Bloco rotulo="Empresa">
            {KYRON_COMPANY.razaoSocial}
            <br />
            <span className="text-fluid-sm text-kyron-silver/70">
              CNPJ {KYRON_COMPANY.cnpj}
            </span>
          </Bloco>
        </dl>

        {/*
          RESERVADO — endereço completo, horário de funcionamento e mapa.
          Adicionar quando confirmados. Endereço residencial não vai ao ar sem
          decisão do dono (ver company.ts).
        */}
      </Section>
    </>
  );
}

function Bloco({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[var(--kyron-hairline)] pt-fluid-sm">
      <dt className="kyron-label text-fluid-2xs text-kyron-silver/55">{rotulo}</dt>
      <dd className="mt-1 text-fluid-base text-kyron-white">{children}</dd>
    </div>
  );
}
