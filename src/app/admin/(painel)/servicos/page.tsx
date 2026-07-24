import Link from "next/link";

import { ServicoForm } from "@/components/admin/ServicoForm";
import { db } from "@/lib/db";
import { formatarPreco } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminServicos({
  searchParams,
}: {
  searchParams: Promise<{ editar?: string }>;
}) {
  const { editar } = await searchParams;
  const editarId = editar ? Number(editar) : null;

  const servicos = await db.servico.findMany({ orderBy: { ordem: "asc" } });
  const emEdicao = editarId ? servicos.find((s) => s.id === editarId) : undefined;

  return (
    <div className="grid gap-fluid-xl [grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr))]">
      <div>
        <h1 className="kyron-display mb-fluid-md text-fluid-xl text-kyron-white">Serviços</h1>
        {servicos.length === 0 ? (
          <p className="text-fluid-sm text-kyron-silver">Nenhum serviço cadastrado.</p>
        ) : (
          <ul className="space-y-fluid-xs">
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
                <Link href={`/admin/servicos?editar=${s.id}`} className="shrink-0 text-fluid-2xs text-kyron-blue hover:underline">
                  Editar
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="mb-fluid-md flex items-center justify-between">
          <h2 className="kyron-display text-fluid-base text-kyron-white">
            {emEdicao ? "Editar serviço" : "Novo serviço"}
          </h2>
          {emEdicao && (
            <Link href="/admin/servicos" className="text-fluid-2xs text-kyron-silver/60 hover:text-kyron-silver">
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
  );
}
