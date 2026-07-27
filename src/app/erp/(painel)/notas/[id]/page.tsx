import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ConferenciaNota } from "@/components/erp/ConferenciaNota";
import { db } from "@/lib/db";
import { formatarPreco } from "@/lib/format";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import { carregarIndice, sugerirPara } from "@/lib/erp/nfe/matching";
import { categoriasParaSelecao } from "@/lib/erp/produtos";

export const dynamic = "force-dynamic";

export default async function ConferenciaNotaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const notaId = Number(id);
  if (!Number.isInteger(notaId)) notFound();

  const eu = await colaboradorLogado();
  if (!eu || !podeFazer(eu.papel, "notas.ver")) redirect("/erp");

  const [nota, indice, categorias] = await Promise.all([
    db.notaFiscal.findUnique({
      where: { id: notaId },
      include: {
        fornecedor: { select: { nome: true } },
        itens: {
          orderBy: { id: "asc" },
          include: { produto: { select: { nome: true } } },
        },
      },
    }),
    carregarIndice(),
    categoriasParaSelecao(),
  ]);

  if (!nota) notFound();

  const finalizada = nota.status === "finalizada";

  const itens = nota.itens.map((it) => ({
    id: it.id,
    descricao: it.descricao,
    ean: it.ean,
    ncm: it.ncm,
    quantidade: it.quantidade,
    valorUnitario: it.valorUnitario,
    processado: it.processado,
    produtoVinculadoNome: it.produto?.nome ?? null,
    sugestoes: finalizada
      ? []
      : sugerirPara(
          {
            codigoFornecedor: null,
            descricao: it.descricao,
            ean: it.ean,
            ncm: it.ncm,
            cfop: it.cfop,
            quantidade: it.quantidade,
            valorUnitario: it.valorUnitario,
          },
          indice,
        ),
  }));

  return (
    <>
      <div className="mb-fluid-lg">
        <Link href="/erp/notas" className="text-fluid-2xs text-kyron-silver hover:text-kyron-white">
          ← Notas fiscais
        </Link>
        <h1 className="kyron-display mt-fluid-2xs text-fluid-xl text-kyron-white">
          NF {nota.numero ?? "s/nº"}
          {nota.serie ? `-${nota.serie}` : ""}
        </h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          {nota.fornecedor?.nome ?? "Fornecedor não identificado"}
          {nota.valorTotal != null ? ` · total ${formatarPreco(nota.valorTotal)}` : ""}
          {" · "}
          {nota.itens.length} item(ns)
        </p>
      </div>

      <ConferenciaNota
        notaId={nota.id}
        itens={itens}
        categorias={categorias}
        finalizada={finalizada}
      />
    </>
  );
}
