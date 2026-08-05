import Link from "next/link";

import { ServicoForm } from "@/components/erp/ServicoForm";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import { db } from "@/lib/db";
import { formatarPreco } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ErpServicos({
  searchParams,
}: {
  searchParams: Promise<{ editar?: string }>;
}) {
  const eu = await colaboradorLogado();
  if (!eu || !podeFazer(eu.papel, "produtos.editar")) {
    return (
      <div className="mx-auto max-w-[40rem] rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
        <h1 className="kyron-display text-fluid-lg text-kyron-white">Acesso restrito</h1>
        <p className="mt-fluid-sm text-fluid-base text-kyron-silver">
          O catálogo de serviços é editável por administradores e gerentes.
        </p>
      </div>
    );
  }

  const { editar } = await searchParams;
  const editarId = editar ? Number(editar) : null;
  const servicos = await db.servico.findMany({ orderBy: { ordem: "asc" } });
  const emEdicao = editarId ? servicos.find((s) => s.id === editarId) : undefined;

  return (
    <>
      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Serviços</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          Catálogo de serviços de assistência e instalação exibido em /servicos.
        </p>
      </div>

      <div className="grid gap-fluid-xl xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
        <div>
          <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
            Cadastrados ({servicos.length})
          </h2>
          {servicos.length === 0 ? (
            <p className="text-fluid-2xs text-kyron-silver/60">Nenhum serviço cadastrado.</p>
          ) : (
            <ul className="space-y-fluid-2xs">
              {servicos.map((s) => (
                <li
                  key={s.id}
                  className={`flex items-center justify-between gap-fluid-sm rounded-kyron-md border p-fluid-sm ${
                    s.id === editarId ? "border-[var(--kyron-blue-line)]" : "border-[var(--kyron-hairline)]"
                  } ${s.ativo ? "" : "opacity-55"}`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-fluid-sm font-semibold text-kyron-white">{s.nome}</p>
                    <p className="text-fluid-2xs text-kyron-silver/60">
                      {s.precoAPartirDe != null ? `A partir de ${formatarPreco(s.precoAPartirDe)}` : "Sob orçamento"}
                      {s.atendeEmDomicilio && " · domicílio"}
                      {!s.ativo && " · inativo"}
                    </p>
                  </div>
                  <Link href={`/erp/servicos?editar=${s.id}`} className="shrink-0 text-fluid-2xs text-kyron-blue hover:underline">
                    Editar
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
          <div className="mb-fluid-md flex items-center justify-between">
            <h2 className="kyron-display text-fluid-base text-kyron-white">
              {emEdicao ? "Editar serviço" : "Novo serviço"}
            </h2>
            {emEdicao && (
              <Link href="/erp/servicos" className="text-fluid-2xs text-kyron-silver/60 hover:text-kyron-silver">
                + Novo
              </Link>
            )}
          </div>
          <ServicoForm
            key={emEdicao?.id ?? "novo"}
            servico={
              emEdicao
                ? {
                    id: emEdicao.id,
                    nome: emEdicao.nome,
                    descricao: emEdicao.descricao,
                    precoAPartirDe: emEdicao.precoAPartirDe,
                    atendeEmDomicilio: emEdicao.atendeEmDomicilio,
                    tempoMedio: emEdicao.tempoMedio,
                    ativo: emEdicao.ativo,
                  }
                : undefined
            }
          />
        </div>
      </div>
    </>
  );
}
