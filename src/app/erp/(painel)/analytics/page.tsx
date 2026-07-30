import Link from "next/link";

import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import { alertasNegocio, panoramaExecutivo } from "@/lib/analytics/kpis";
import { formatarPreco } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ErpAnalytics() {
  const eu = await colaboradorLogado();
  if (!eu || !podeFazer(eu.papel, "financeiro")) {
    return (
      <div className="mx-auto max-w-[40rem] rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
        <h1 className="kyron-display text-fluid-lg text-kyron-white">Acesso restrito</h1>
        <p className="mt-fluid-sm text-fluid-base text-kyron-silver">
          O painel executivo é visível para administradores e o perfil financeiro.
        </p>
      </div>
    );
  }

  const [p, alertas] = await Promise.all([panoramaExecutivo(), alertasNegocio()]);

  return (
    <>
      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Painel executivo</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          Como está o negócio, num lugar só. Números do mês corrente.
        </p>
      </div>

      {/* Alertas — o que precisa de atenção */}
      <div className="mb-fluid-xl grid gap-fluid-xs sm:grid-cols-2 xl:grid-cols-3">
        {alertas.map((a, i) => (
          <Bloco
            key={i}
            href={a.href}
            className={
              a.nivel === "atencao"
                ? "border-[var(--kyron-blue-line)]"
                : "border-[var(--kyron-hairline)]"
            }
          >
            <p
              className={`text-fluid-sm ${
                a.nivel === "atencao" ? "text-kyron-blue" : "text-kyron-white"
              }`}
            >
              {a.titulo}
            </p>
            <p className="text-fluid-2xs text-kyron-silver/60">{a.detalhe}</p>
          </Bloco>
        ))}
      </div>

      <Grupo titulo="Financeiro">
        <Kpi rotulo="Saldo em caixa" valor={formatarPreco(p.financeiro.saldo)} destaque />
        <Kpi rotulo="Receitas do mês" valor={formatarPreco(p.financeiro.receitasMes)} />
        <Kpi rotulo="Despesas do mês" valor={formatarPreco(p.financeiro.despesasMes)} />
        <Kpi
          rotulo="Lucro do mês"
          valor={formatarPreco(p.financeiro.lucroMes)}
          destaque={p.financeiro.lucroMes >= 0}
        />
        <Kpi rotulo="A receber (aberto)" valor={formatarPreco(p.financeiro.aReceber)} />
        <Kpi rotulo="A pagar (aberto)" valor={formatarPreco(p.financeiro.aPagar)} />
      </Grupo>

      <Grupo titulo="Comercial · CRM">
        <Kpi rotulo="Leads no mês" valor={String(p.comercial.leadsMes)} />
        <Kpi rotulo="Novos (na fila)" valor={String(p.comercial.novos)} />
        <Kpi rotulo="Vendidos" valor={String(p.comercial.vendidos)} />
        <Kpi rotulo="Conversão" valor={`${p.comercial.conversao}%`} destaque />
        <Kpi rotulo="Score médio" valor={String(p.comercial.scoreMedio)} />
      </Grupo>

      <Grupo titulo="Estoque · ERP">
        <Kpi rotulo="Valor em estoque" valor={formatarPreco(p.estoque.valorEstoque)} destaque />
        <Kpi rotulo="Produtos ativos" valor={String(p.estoque.produtos)} />
        <Kpi rotulo="Itens em estoque" valor={String(p.estoque.itensEstoque)} />
        <Kpi rotulo="Estoque baixo" valor={String(p.estoque.estoqueBaixo)} />
      </Grupo>

      <Grupo titulo="Assistência · Comunicação">
        <Kpi rotulo="OS abertas" valor={String(p.assistencia.osAbertas)} />
        <Kpi rotulo="OS concluídas no mês" valor={String(p.assistencia.osConcluidasMes)} />
        <Kpi rotulo="Envios no mês" valor={String(p.comunicacao.enviadosMes)} />
        <Kpi rotulo="Falhas de envio" valor={String(p.comunicacao.falhasMes)} />
      </Grupo>
    </>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="mb-fluid-xl">
      <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">{titulo}</h2>
      <div className="grid gap-fluid-sm sm:grid-cols-2 xl:grid-cols-4">{children}</div>
    </div>
  );
}

function Kpi({
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

function Bloco({
  href,
  className,
  children,
}: {
  href?: string;
  className: string;
  children: React.ReactNode;
}) {
  const cls = `block rounded-kyron-md border p-fluid-md ${className}`;
  return href ? (
    <Link href={href} className={`${cls} transition-colors hover:border-[var(--kyron-hairline-strong)]`}>
      {children}
    </Link>
  ) : (
    <div className={cls}>{children}</div>
  );
}
