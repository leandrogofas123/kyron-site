import type { Metadata } from "next";

import { FormularioOrcamento } from "@/components/catalogo/FormularioOrcamento";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { getProduto, getServico } from "@/lib/catalogo";

export const metadata: Metadata = {
  title: "Pedir orçamento",
  description:
    "Peça um orçamento sem compromisso para produtos e serviços da Kyron Tecnologia, em Santa Cruz do Sul.",
  alternates: { canonical: "/orcamento" },
};

export default async function Orcamento({
  searchParams,
}: {
  searchParams: Promise<{ servico?: string; produto?: string }>;
}) {
  const { servico, produto } = await searchParams;

  let origem: "produto" | "servico" | "geral" = "geral";
  let referenciaId: number | undefined;
  let mensagemInicial = "";

  if (servico) {
    const s = await getServico(servico);
    if (s) {
      origem = "servico";
      referenciaId = s.id;
      mensagemInicial = `Tenho interesse no serviço: ${s.nome}. `;
    }
  } else if (produto) {
    const p = await getProduto(produto);
    if (p) {
      origem = "produto";
      referenciaId = p.id;
      mensagemInicial = `Tenho interesse no produto: ${p.nome}. `;
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Orçamento"
        titulo={
          <>
            Conta pra gente o que{" "}
            <span className="text-kyron-blue">você precisa</span>.
          </>
        }
        lede="Formulário curto, resposta rápida. Se preferir, o WhatsApp está sempre no canto da tela."
      />

      <Section semBorda>
        <div className="max-w-[36rem]">
          <FormularioOrcamento
            origem={origem}
            referenciaId={referenciaId}
            mensagemInicial={mensagemInicial}
          />
        </div>
      </Section>
    </>
  );
}
