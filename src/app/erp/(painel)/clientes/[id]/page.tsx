import Link from "next/link";
import { notFound } from "next/navigation";

import { formatarPreco } from "@/lib/format";
import { historicoCliente, obterCliente } from "@/lib/erp/clientes";
import { rotuloTipo } from "@/lib/erp/estoque";

export const dynamic = "force-dynamic";

function data(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export default async function FichaCliente({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clienteId = Number(id);
  if (!Number.isInteger(clienteId)) notFound();

  const [cliente, historico] = await Promise.all([
    obterCliente(clienteId),
    historicoCliente(clienteId),
  ]);
  if (!cliente) notFound();

  const compras = historico.filter((h) => h.tipo === "venda");
  const totalGasto = compras.reduce(
    (s, c) => s + c.produto.preco * c.quantidade,
    0,
  );
  const agora = new Date();

  return (
    <>
      <div className="mb-fluid-lg">
        <Link href="/erp/clientes" className="text-fluid-2xs text-kyron-silver hover:text-kyron-white">
          ← Clientes
        </Link>
        <h1 className="kyron-display mt-fluid-2xs text-fluid-xl text-kyron-white">
          {cliente.nome}
        </h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          {[cliente.telefone, cliente.email, cliente.cidade].filter(Boolean).join(" · ") || "—"}
        </p>
      </div>

      <div className="mb-fluid-xl grid gap-fluid-sm sm:grid-cols-3">
        <Cartao rotulo="Compras" valor={String(compras.length)} />
        <Cartao rotulo="Total em compras" valor={formatarPreco(totalGasto)} />
        <Cartao rotulo="Interações" valor={String(historico.length)} />
      </div>

      <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
        Histórico
      </h2>

      {historico.length === 0 ? (
        <p className="text-fluid-sm text-kyron-silver/60">
          Nenhuma movimentação vinculada a este cliente ainda. Ao registrar uma
          venda em <Link href="/erp/estoque" className="text-kyron-blue hover:underline">Estoque</Link>,
          selecione o cliente para montar o histórico.
        </p>
      ) : (
        <ol className="space-y-fluid-2xs">
          {historico.map((h) => {
            const vencida = h.garantiaAte ? h.garantiaAte < agora : false;
            return (
              <li
                key={h.id}
                className="rounded-kyron-sm border border-[var(--kyron-hairline)] px-fluid-sm py-fluid-xs"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Link
                    href={`/erp/produtos/${h.produto.id}`}
                    className="min-w-0 truncate text-fluid-sm text-kyron-white hover:text-kyron-blue"
                  >
                    {h.produto.nome}
                  </Link>
                  <span className="shrink-0 text-fluid-2xs text-kyron-silver">
                    {rotuloTipo(h.tipo)} · {h.quantidade} un. · {data(h.criadoEm)}
                  </span>
                </div>
                <p className="text-fluid-2xs text-kyron-silver/60">
                  {h.usuario ? `${h.usuario.nome}` : ""}
                  {h.documento ? ` · ${h.documento}` : ""}
                  {h.garantiaAte && (
                    <span className={vencida ? "" : "text-kyron-blue"}>
                      {h.usuario || h.documento ? " · " : ""}
                      garantia {vencida ? "venceu" : "até"} {data(h.garantiaAte)}
                    </span>
                  )}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}

function Cartao({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
      <p className="kyron-label text-fluid-2xs text-kyron-silver/60">{rotulo}</p>
      <p className="kyron-display mt-1 text-fluid-xl text-kyron-white">{valor}</p>
    </div>
  );
}
