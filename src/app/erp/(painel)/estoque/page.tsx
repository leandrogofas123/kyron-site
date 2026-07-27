import Link from "next/link";

import { FormMovimentar } from "@/components/erp/FormMovimentar";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import { movimentacoesRecentes, rotuloTipo } from "@/lib/erp/estoque";
import { produtosParaSelecao } from "@/lib/erp/produtos";

export const dynamic = "force-dynamic";

function quando(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function ErpEstoque() {
  const [eu, produtos, movimentacoes] = await Promise.all([
    colaboradorLogado(),
    produtosParaSelecao(),
    movimentacoesRecentes(),
  ]);
  const podeMovimentar = eu ? podeFazer(eu.papel, "estoque.movimentar") : false;

  return (
    <>
      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Estoque</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          Toda entrada e saída gera histórico — nada muda sem registro.
        </p>
      </div>

      <div className="grid gap-fluid-xl xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] xl:items-start">
        <section>
          <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
            Nova movimentação
          </h2>
          {podeMovimentar ? (
            produtos.length === 0 ? (
              <p className="text-fluid-sm text-kyron-silver">
                Cadastre um produto antes.{" "}
                <Link href="/erp/produtos/novo" className="text-kyron-blue hover:underline">
                  Novo produto
                </Link>
              </p>
            ) : (
              <FormMovimentar produtos={produtos} />
            )
          ) : (
            <p className="text-fluid-sm text-kyron-silver">
              Seu perfil não permite movimentar estoque.
            </p>
          )}
        </section>

        <section>
          <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
            Últimas movimentações
          </h2>
          {movimentacoes.length === 0 ? (
            <p className="text-fluid-sm text-kyron-silver">
              Nenhuma movimentação registrada ainda.
            </p>
          ) : (
            <ol className="space-y-fluid-2xs">
              {movimentacoes.map((m) => (
                <li
                  key={m.id}
                  className="rounded-kyron-sm border border-[var(--kyron-hairline)] px-fluid-sm py-fluid-xs"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <Link
                      href={`/erp/produtos/${m.produto.id}`}
                      className="min-w-0 truncate text-fluid-sm text-kyron-white hover:text-kyron-blue"
                    >
                      {m.produto.nome}
                    </Link>
                    <span className="shrink-0 text-fluid-2xs text-kyron-silver">
                      {rotuloTipo(m.tipo)} · {m.saldoAntes} → {m.saldoDepois}
                    </span>
                  </div>
                  <p className="text-fluid-2xs text-kyron-silver/60">
                    {quando(m.criadoEm)}
                    {m.colaborador ? ` · ${m.colaborador.nome}` : ""}
                    {m.motivo ? ` · ${m.motivo}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  );
}
