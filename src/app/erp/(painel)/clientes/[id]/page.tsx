import Link from "next/link";
import { notFound } from "next/navigation";

import { RegistrarInteracao } from "@/components/erp/RegistrarInteracao";
import { timelineCliente } from "@/lib/crm";
import { formatarPreco } from "@/lib/format";
import { historicoCliente, obterCliente } from "@/lib/erp/clientes";

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

  const [cliente, historico, timeline] = await Promise.all([
    obterCliente(clienteId),
    historicoCliente(clienteId),
    timelineCliente(clienteId),
  ]);
  if (!cliente) notFound();

  const compras = historico.filter((h) => h.tipo === "venda");
  const totalGasto = compras.reduce(
    (s, c) => s + c.produto.preco * c.quantidade,
    0,
  );

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
        <Cartao rotulo="Eventos" valor={String(timeline.length)} />
      </div>

      <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
        Linha do tempo
      </h2>

      <RegistrarInteracao clienteId={clienteId} />

      {timeline.length === 0 ? (
        <p className="text-fluid-sm text-kyron-silver/60">
          Nada por aqui ainda. Registre uma interação acima, ou vincule uma venda
          a este cliente em{" "}
          <Link href="/erp/estoque" className="text-kyron-blue hover:underline">
            Estoque
          </Link>{" "}
          para montar a linha do tempo.
        </p>
      ) : (
        <ol className="space-y-fluid-2xs">
          {timeline.map((e, i) => (
            <li
              key={i}
              className="rounded-kyron-sm border border-[var(--kyron-hairline)] px-fluid-sm py-fluid-xs"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span
                  className={`text-fluid-sm ${
                    e.tipo === "venda"
                      ? "text-kyron-blue"
                      : "text-kyron-white"
                  }`}
                >
                  {e.titulo}
                </span>
                <span className="shrink-0 text-fluid-2xs text-kyron-silver">
                  {data(e.data)}
                </span>
              </div>
              {(e.detalhe || e.autor) && (
                <p className="text-fluid-2xs text-kyron-silver/60">
                  {[e.detalhe, e.autor].filter(Boolean).join(" · ")}
                </p>
              )}
            </li>
          ))}
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
