import Link from "next/link";

import { BotaoVendido } from "@/components/admin/LinhaAcoes";
import { db } from "@/lib/db";
import { formatarPreco, precoVigente } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminSeminovos() {
  const seminovos = await db.produto.findMany({
    where: { seminovo: { isNot: null } },
    orderBy: [{ seminovo: { vendido: "asc" } }, { criadoEm: "desc" }],
    include: {
      imagens: { where: { principal: true }, take: 1 },
      seminovo: true,
    },
  });

  return (
    <>
      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Seminovos</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          {seminovos.filter((s) => !s.seminovo?.vendido).length} disponíveis ·{" "}
          {seminovos.filter((s) => s.seminovo?.vendido).length} vendidos
        </p>
      </div>

      {seminovos.length === 0 ? (
        <p className="text-fluid-sm text-kyron-silver">
          Nenhum seminovo cadastrado. Crie um produto e marque a opção{" "}
          <em>É um seminovo</em>.{" "}
          <Link href="/admin/produtos/novo" className="text-kyron-blue underline">
            Novo produto
          </Link>
        </p>
      ) : (
        <ul className="space-y-fluid-xs">
          {seminovos.map((p) => {
            const { atual } = precoVigente(p.preco, p.precoPromo);
            const vendido = p.seminovo?.vendido ?? false;
            return (
              <li
                key={p.id}
                className={`flex flex-wrap items-center gap-fluid-sm rounded-kyron-md border border-[var(--kyron-hairline)] p-fluid-sm ${
                  vendido ? "opacity-55" : ""
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
                    {formatarPreco(atual)}
                    {p.seminovo?.saudeBateria != null && ` · bateria ${p.seminovo.saudeBateria}%`}
                    {p.seminovo && ` · ${p.seminovo.condicaoEstetica}`}
                  </p>
                </div>
                <div className="flex items-center gap-fluid-sm">
                  <Link href={`/admin/produtos/${p.id}/editar`} className="text-fluid-2xs text-kyron-blue hover:underline">
                    Editar
                  </Link>
                  <BotaoVendido produtoId={p.id} vendido={vendido} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
