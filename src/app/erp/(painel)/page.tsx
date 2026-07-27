import Link from "next/link";

import { db } from "@/lib/db";
import { formatarPreco } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Dashboard do ERP — visão geral do estoque (Fase 1). */
export default async function ErpDashboard() {
  const [produtos, movimentacoes] = await Promise.all([
    db.produto.findMany({
      where: { excluidoEm: null },
      select: {
        id: true,
        nome: true,
        slug: true,
        quantidade: true,
        quantidadeMinima: true,
        precoCusto: true,
        preco: true,
      },
    }),
    db.movimentacaoEstoque.findMany({
      orderBy: { criadoEm: "desc" },
      take: 8,
      include: { produto: { select: { nome: true } } },
    }),
  ]);

  const valorEstoque = produtos.reduce(
    (soma, p) => soma + (p.precoCusto ?? p.preco) * p.quantidade,
    0,
  );
  const totalItens = produtos.reduce((soma, p) => soma + p.quantidade, 0);
  const baixos = produtos.filter(
    (p) => p.quantidadeMinima > 0 && p.quantidade <= p.quantidadeMinima,
  );

  return (
    <>
      <h1 className="kyron-display mb-fluid-lg text-fluid-xl text-kyron-white">
        Visão geral
      </h1>

      <div className="grid gap-fluid-sm sm:grid-cols-2 xl:grid-cols-4">
        <Cartao rotulo="Valor em estoque" valor={formatarPreco(valorEstoque)} />
        <Cartao rotulo="Produtos cadastrados" valor={String(produtos.length)} />
        <Cartao rotulo="Itens em estoque" valor={String(totalItens)} />
        <Cartao
          rotulo="Estoque baixo"
          valor={String(baixos.length)}
          alerta={baixos.length > 0}
        />
      </div>

      <div className="mt-fluid-xl grid gap-fluid-lg xl:grid-cols-2">
        <section>
          <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
            Estoque baixo
          </h2>
          {baixos.length === 0 ? (
            <p className="text-fluid-sm text-kyron-silver/60">
              Nenhum produto abaixo do mínimo.
            </p>
          ) : (
            <ul className="space-y-fluid-2xs">
              {baixos.slice(0, 8).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-fluid-sm rounded-kyron-sm border border-[var(--kyron-hairline)] px-fluid-sm py-fluid-xs"
                >
                  <span className="min-w-0 truncate text-fluid-sm text-kyron-white">
                    {p.nome}
                  </span>
                  <span className="shrink-0 text-fluid-2xs text-kyron-blue">
                    {p.quantidade} / mín. {p.quantidadeMinima}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
            Últimas movimentações
          </h2>
          {movimentacoes.length === 0 ? (
            <p className="text-fluid-sm text-kyron-silver/60">
              Nenhuma movimentação registrada ainda.{" "}
              <Link href="/erp/produtos" className="text-kyron-blue hover:underline">
                Cadastrar produtos
              </Link>
            </p>
          ) : (
            <ul className="space-y-fluid-2xs">
              {movimentacoes.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-fluid-sm rounded-kyron-sm border border-[var(--kyron-hairline)] px-fluid-sm py-fluid-xs"
                >
                  <span className="min-w-0 truncate text-fluid-sm text-kyron-white">
                    {m.produto.nome}
                  </span>
                  <span className="shrink-0 text-fluid-2xs text-kyron-silver">
                    {m.tipo} · {m.quantidade}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function Cartao({
  rotulo,
  valor,
  alerta = false,
}: {
  rotulo: string;
  valor: string;
  alerta?: boolean;
}) {
  return (
    <div
      className={`rounded-kyron-md border bg-kyron-graphite p-fluid-md ${
        alerta ? "border-[var(--kyron-blue-line)]" : "border-[var(--kyron-hairline)]"
      }`}
    >
      <p className="kyron-label text-fluid-2xs text-kyron-silver/60">{rotulo}</p>
      <p className="kyron-display mt-1 text-fluid-xl text-kyron-white">{valor}</p>
    </div>
  );
}
