import type { Metadata } from "next";

import { ProdutoCard } from "@/components/catalogo/ProdutoCard";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { getSeminovos } from "@/lib/catalogo";

// Lê o banco (estoque de seminovos) — renderiza a cada acesso, não no build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "iPhone Seminovos — Revisados e com Garantia",
  description:
    "iPhone seminovos revisados, com saúde de bateria, condição e garantia informadas. Santa Cruz do Sul. Fale no WhatsApp.",
  alternates: { canonical: "/seminovos" },
};

export const revalidate = 300;

export default async function Seminovos() {
  const produtos = await getSeminovos();

  return (
    <>
      <PageHero
        eyebrow="iPhone seminovos"
        titulo={
          <>
            Seminovo com{" "}
            <span className="text-kyron-blue">tudo à mostra</span>.
          </>
        }
        lede="Saúde da bateria, condição estética e garantia de cada aparelho, publicadas antes de você perguntar. Transparência é o que separa um bom seminovo de uma aposta."
      />

      <Section semBorda>
        {produtos.length === 0 ? (
          <p className="mx-auto max-w-[48ch] text-center text-fluid-base text-kyron-silver">
            No momento não há seminovos disponíveis. Chame no WhatsApp que a
            gente te avisa quando chegar o próximo.
          </p>
        ) : (
          <ul className="grid-fluida-4">
            {produtos.map((p, i) => (
              <li key={p.id}>
                <ProdutoCard produto={p} prioridade={i < 4} />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
