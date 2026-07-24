import Link from "next/link";

import { AcoesProduto } from "@/components/admin/LinhaAcoes";
import { db } from "@/lib/db";
import { formatarPreco, precoVigente } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminProdutos({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const busca = q?.trim();

  const produtos = await db.produto.findMany({
    where: busca
      ? { OR: [{ nome: { contains: busca } }, { marca: { contains: busca } }] }
      : undefined,
    orderBy: [{ ativo: "desc" }, { criadoEm: "desc" }],
    include: {
      categoria: true,
      imagens: { where: { principal: true }, take: 1 },
      seminovo: { select: { vendido: true } },
    },
  });

  return (
    <>
      <div className="mb-fluid-lg flex flex-wrap items-center justify-between gap-fluid-sm">
        <div>
          <h1 className="kyron-display text-fluid-xl text-kyron-white">Produtos</h1>
          <p className="text-fluid-2xs text-kyron-silver/60">{produtos.length} no catálogo</p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-xs text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px"
        >
          + Novo produto
        </Link>
      </div>

      <form className="mb-fluid-md">
        <input
          name="q"
          defaultValue={busca}
          placeholder="Buscar por nome ou marca…"
          className="w-full max-w-[24rem] rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-xs text-fluid-sm text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none"
        />
      </form>

      {produtos.length === 0 ? (
        <p className="text-fluid-sm text-kyron-silver">
          Nenhum produto {busca ? "encontrado" : "cadastrado"}.{" "}
          <Link href="/admin/produtos/novo" className="text-kyron-blue underline">
            Cadastrar o primeiro
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-fluid-xs">
          {produtos.map((p) => {
            const { atual } = precoVigente(p.preco, p.precoPromo);
            return (
              <li
                key={p.id}
                className={`flex flex-wrap items-center gap-fluid-sm rounded-kyron-md border border-[var(--kyron-hairline)] p-fluid-sm ${
                  p.ativo ? "" : "opacity-55"
                }`}
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-kyron-sm bg-kyron-graphite">
                  {p.imagens[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imagens[0].url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-fluid-sm font-semibold text-kyron-white">{p.nome}</p>
                  <p className="text-fluid-2xs text-kyron-silver/60">
                    {p.categoria.nome} · {formatarPreco(atual)}
                    {p.seminovo && (p.seminovo.vendido ? " · vendido" : " · seminovo")}
                    {!p.ativo && " · inativo"}
                  </p>
                </div>

                <AcoesProduto id={p.id} ativo={p.ativo} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
