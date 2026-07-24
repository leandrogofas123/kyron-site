import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/site/PageHero";
import { Section, SectionHeader } from "@/components/site/Section";
import { KYRON_COMPANY } from "@/lib/kyron/company";

export const metadata: Metadata = {
  title: "Sobre a Kyron Tecnologia",
  description:
    "Loja e integradora de tecnologia em Santa Cruz do Sul: Apple, casa inteligente, áudio e serviços de instalação, com atendimento consultivo.",
  alternates: { canonical: "/sobre" },
};

const VALORES = [
  {
    titulo: "Transparência",
    texto:
      "No seminovo, publicamos bateria, condição e garantia antes de você perguntar. Sem letra miúda.",
  },
  {
    titulo: "Atendimento próximo",
    texto:
      "Você fala com gente de verdade, no WhatsApp, que conhece o produto e resolve.",
  },
  {
    titulo: "Serviço completo",
    texto:
      "Não paramos na venda: instalamos, configuramos e damos assistência — inclusive na sua casa.",
  },
];

export default function Sobre() {
  return (
    <>
      <PageHero
        eyebrow="A loja"
        titulo={
          <>
            Tecnologia com{" "}
            <span className="text-kyron-blue">gente que entende</span>.
          </>
        }
      />

      <Section semBorda>
        <div className="max-w-[54ch] space-y-fluid-sm text-fluid-lg text-kyron-silver">
          <p>
            A Kyron nasceu em Santa Cruz do Sul para aproximar as pessoas da boa
            tecnologia — sem a frieza do e-commerce e sem o risco do comprei-e-me-arrependi.
          </p>
          <p>
            Trabalhamos com{" "}
            <span className="text-kyron-white">Apple novos e seminovos</span>,{" "}
            <span className="text-kyron-white">casa inteligente</span>, áudio e
            acessórios — e cuidamos da parte que a maioria das lojas deixa de
            lado: a instalação, a configuração e a assistência.
          </p>
          <p className="text-kyron-white">
            Você escolhe, a gente conversa no WhatsApp, e resolve junto.
          </p>
        </div>
      </Section>

      {/*
        RESERVADO — Rosto do dono (spec §3).
        Adicionar foto real do proprietário e um parágrafo pessoal quando
        houver a imagem. Sem foto de banco de imagem.
      */}

      <Section>
        <SectionHeader eyebrow="No que acreditamos" titulo="O jeito Kyron." />
        <ul className="grid-fluida-3">
          {VALORES.map((v) => (
            <li key={v.titulo} className="border-t border-[var(--kyron-hairline)] pt-fluid-sm">
              <h3 className="text-fluid-base font-semibold text-kyron-white">{v.titulo}</h3>
              <p className="mt-fluid-2xs text-fluid-sm text-kyron-silver">{v.texto}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <div className="rounded-kyron-lg border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
          <h2 className="kyron-display text-fluid-2xl text-kyron-white">
            Vem conversar com a gente.
          </h2>
          <p className="mx-auto mt-fluid-sm max-w-[44ch] text-fluid-base text-kyron-silver">
            {KYRON_COMPANY.enderecoPublico}. Atendimento na loja e em domicílio.
          </p>
          <Link
            href="/contato"
            className="kyron-label mt-fluid-lg inline-block rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px"
          >
            Ver contato
          </Link>
        </div>
      </Section>
    </>
  );
}
