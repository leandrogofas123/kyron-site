import Link from "next/link";
import { redirect } from "next/navigation";

import { FormImportarNota } from "@/components/erp/FormImportarNota";
import { db } from "@/lib/db";
import { formatarPreco } from "@/lib/format";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";

export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = {
  importada: "A conferir",
  finalizada: "Finalizada",
};

function quando(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(d);
}

export default async function ErpNotas() {
  const eu = await colaboradorLogado();
  if (!eu || !podeFazer(eu.papel, "notas.ver")) redirect("/erp");
  const podeImportar = podeFazer(eu.papel, "notas.importar");

  const notas = await db.notaFiscal.findMany({
    orderBy: { criadoEm: "desc" },
    take: 100,
    include: {
      fornecedor: { select: { nome: true } },
      _count: { select: { itens: true } },
    },
  });

  return (
    <>
      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">
          Notas fiscais
        </h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          Importe o XML da compra e dê entrada no estoque sem digitar produto a
          produto.
        </p>
      </div>

      {podeImportar && (
        <div className="mb-fluid-xl">
          <FormImportarNota />
        </div>
      )}

      {notas.length === 0 ? (
        <p className="text-fluid-sm text-kyron-silver">
          Nenhuma nota importada ainda.
        </p>
      ) : (
        <ul className="space-y-fluid-xs">
          {notas.map((nf) => (
            <li key={nf.id}>
              <Link
                href={`/erp/notas/${nf.id}`}
                className="flex flex-wrap items-center justify-between gap-fluid-sm rounded-kyron-md border border-[var(--kyron-hairline)] p-fluid-sm transition-colors hover:border-[var(--kyron-blue-line)]"
              >
                <div className="min-w-0">
                  <p className="text-fluid-sm font-semibold text-kyron-white">
                    NF {nf.numero ?? "s/nº"}
                    {nf.serie ? `-${nf.serie}` : ""} ·{" "}
                    {nf.fornecedor?.nome ?? "Fornecedor não identificado"}
                  </p>
                  <p className="text-fluid-2xs text-kyron-silver/60">
                    {nf._count.itens} item(ns)
                    {nf.valorTotal != null ? ` · ${formatarPreco(nf.valorTotal)}` : ""}
                    {" · "}
                    {quando(nf.criadoEm)}
                  </p>
                </div>
                <span
                  className={`kyron-label shrink-0 rounded-full border px-fluid-xs py-1 text-fluid-2xs ${
                    nf.status === "finalizada"
                      ? "border-[var(--kyron-hairline-strong)] text-kyron-silver"
                      : "border-[var(--kyron-blue-line)] text-kyron-blue"
                  }`}
                >
                  {STATUS[nf.status] ?? nf.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
