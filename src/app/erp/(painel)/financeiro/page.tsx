import { AcoesConta } from "@/components/erp/AcoesConta";
import { FormsFinanceiro } from "@/components/erp/FormsFinanceiro";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import {
  listarContas,
  listarLancamentos,
  resumoPeriodo,
  saldoAtual,
  totaisContas,
} from "@/lib/financeiro/financeiro";
import { rotuloForma } from "@/lib/financeiro/plano";
import { formatarPreco } from "@/lib/format";

export const dynamic = "force-dynamic";

function data(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(d);
}

export default async function ErpFinanceiro() {
  const eu = await colaboradorLogado();
  if (!eu || !podeFazer(eu.papel, "financeiro")) {
    return (
      <div className="mx-auto max-w-[40rem] rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
        <h1 className="kyron-display text-fluid-lg text-kyron-white">Acesso restrito</h1>
        <p className="mt-fluid-sm text-fluid-base text-kyron-silver">
          O financeiro é visível apenas para administradores e o perfil financeiro.
        </p>
      </div>
    );
  }

  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59);

  const [saldo, resumo, aPagar, aReceber, totPagar, totReceber, lancamentos] =
    await Promise.all([
      saldoAtual(),
      resumoPeriodo(inicioMes, fimMes),
      listarContas("pagar"),
      listarContas("receber"),
      totaisContas("pagar"),
      totaisContas("receber"),
      listarLancamentos(40),
    ]);

  return (
    <>
      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Financeiro</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          Fluxo de caixa e contas. Lançamentos são imutáveis — corrige-se com um
          novo lançamento.
        </p>
      </div>

      <div className="mb-fluid-xl grid gap-fluid-sm sm:grid-cols-2 xl:grid-cols-4">
        <Cartao rotulo="Saldo em caixa" valor={formatarPreco(saldo)} destaque />
        <Cartao rotulo="Receitas do mês" valor={formatarPreco(resumo.receitas)} />
        <Cartao rotulo="Despesas do mês" valor={formatarPreco(resumo.despesas)} />
        <Cartao
          rotulo="Resultado do mês"
          valor={formatarPreco(resumo.lucro)}
          destaque={resumo.lucro >= 0}
        />
      </div>

      <FormsFinanceiro />

      <div className="grid gap-fluid-xl xl:grid-cols-2">
        <Contas
          titulo="A pagar"
          contas={aPagar}
          total={totPagar.total}
          vencido={totPagar.vencido}
          agora={agora}
        />
        <Contas
          titulo="A receber"
          contas={aReceber}
          total={totReceber.total}
          vencido={totReceber.vencido}
          agora={agora}
        />
      </div>

      <div className="mt-fluid-xl">
        <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
          Últimos lançamentos
        </h2>
        {lancamentos.length === 0 ? (
          <p className="text-fluid-2xs text-kyron-silver/60">
            Nenhum lançamento ainda. Registre a primeira entrada ou saída acima.
          </p>
        ) : (
          <ul className="space-y-fluid-2xs">
            {lancamentos.map((l) => (
              <li
                key={l.id}
                className="flex items-baseline justify-between gap-2 rounded-kyron-sm border border-[var(--kyron-hairline)] px-fluid-sm py-fluid-xs"
              >
                <span className="min-w-0 truncate text-fluid-sm text-kyron-white">
                  {l.descricao}
                  <span className="text-fluid-2xs text-kyron-silver/50">
                    {" "}
                    · {l.categoria ?? "—"} · {rotuloForma(l.forma)} · {data(l.data)}
                  </span>
                </span>
                <span
                  className={`shrink-0 text-fluid-sm ${
                    l.tipo === "entrada" ? "text-kyron-blue" : "text-kyron-silver"
                  }`}
                >
                  {l.tipo === "entrada" ? "+" : "−"}
                  {formatarPreco(l.valor)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function Cartao({
  rotulo,
  valor,
  destaque,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
      <p className="kyron-label text-fluid-2xs text-kyron-silver/60">{rotulo}</p>
      <p
        className={`kyron-display mt-1 text-fluid-xl ${
          destaque ? "text-kyron-blue" : "text-kyron-white"
        }`}
      >
        {valor}
      </p>
    </div>
  );
}

type ContaLinha = {
  id: number;
  descricao: string;
  valor: number;
  categoria: string | null;
  vencimento: Date;
};

function Contas({
  titulo,
  contas,
  total,
  vencido,
  agora,
}: {
  titulo: string;
  contas: ContaLinha[];
  total: number;
  vencido: number;
  agora: Date;
}) {
  return (
    <div>
      <div className="mb-fluid-sm flex items-baseline justify-between">
        <h2 className="kyron-label text-fluid-2xs text-kyron-silver/70">{titulo}</h2>
        <span className="text-fluid-2xs text-kyron-silver/60">
          {formatarPreco(total)}
          {vencido > 0 && (
            <span className="text-kyron-blue"> · {formatarPreco(vencido)} vencido</span>
          )}
        </span>
      </div>
      {contas.length === 0 ? (
        <p className="text-fluid-2xs text-kyron-silver/60">Nada em aberto.</p>
      ) : (
        <ul className="space-y-fluid-2xs">
          {contas.map((c) => {
            const venceu = c.vencimento < agora;
            return (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-kyron-sm border border-[var(--kyron-hairline)] px-fluid-sm py-fluid-xs"
              >
                <div className="min-w-0">
                  <p className="truncate text-fluid-sm text-kyron-white">{c.descricao}</p>
                  <p className="text-fluid-2xs text-kyron-silver/60">
                    {formatarPreco(c.valor)} ·{" "}
                    <span className={venceu ? "text-kyron-blue" : ""}>
                      vence {data(c.vencimento)}
                    </span>
                    {c.categoria ? ` · ${c.categoria}` : ""}
                  </p>
                </div>
                <AcoesConta contaId={c.id} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
