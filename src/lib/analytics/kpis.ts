import "server-only";

import { db } from "../db";

/**
 * Analytics — panorama executivo e alertas (módulo Analytics).
 *
 * Consolida, em consultas agregadas diretas, os KPIs que os outros módulos
 * passaram a produzir. Sem EventBus nem data warehouse: nesta escala, agregação
 * direta é mais simples e rápida. Só LEITURA — nunca altera dado de negócio.
 */

function inicioDoMes(agora: Date): Date {
  return new Date(agora.getFullYear(), agora.getMonth(), 1);
}

export type Panorama = Awaited<ReturnType<typeof panoramaExecutivo>>;

export async function panoramaExecutivo(agora = new Date()) {
  const desdeMes = inicioDoMes(agora);

  const [
    entrada,
    saida,
    entradaMes,
    saidaMes,
    aReceber,
    aPagar,
    leadsMes,
    leadsPorStatus,
    scoreMedio,
    produtos,
    osAbertas,
    osConcluidasMes,
    notifMes,
    notifFalhasMes,
  ] = await Promise.all([
    db.lancamento.aggregate({ _sum: { valor: true }, where: { tipo: "entrada" } }),
    db.lancamento.aggregate({ _sum: { valor: true }, where: { tipo: "saida" } }),
    db.lancamento.aggregate({ _sum: { valor: true }, where: { tipo: "entrada", data: { gte: desdeMes } } }),
    db.lancamento.aggregate({ _sum: { valor: true }, where: { tipo: "saida", data: { gte: desdeMes } } }),
    db.conta.aggregate({ _sum: { valor: true }, where: { tipo: "receber", status: "aberto" } }),
    db.conta.aggregate({ _sum: { valor: true }, where: { tipo: "pagar", status: "aberto" } }),
    db.lead.count({ where: { criadoEm: { gte: desdeMes } } }),
    db.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    db.lead.aggregate({ _avg: { score: true } }),
    db.produto.findMany({
      where: { ativo: true, excluidoEm: null },
      select: { preco: true, precoCusto: true, quantidade: true, quantidadeMinima: true },
    }),
    db.ordemServico.count({ where: { status: { notIn: ["entregue", "cancelada"] } } }),
    db.ordemServico.count({ where: { concluidaEm: { gte: desdeMes } } }),
    db.notificacao.count({ where: { criadoEm: { gte: desdeMes } } }),
    db.notificacao.count({ where: { criadoEm: { gte: desdeMes }, status: "falhou" } }),
  ]);

  const saldo = (entrada._sum.valor ?? 0) - (saida._sum.valor ?? 0);
  const receitasMes = entradaMes._sum.valor ?? 0;
  const despesasMes = saidaMes._sum.valor ?? 0;

  const statusMap: Record<string, number> = {};
  for (const l of leadsPorStatus) statusMap[l.status] = l._count._all;
  const vendidos = statusMap.vendido ?? 0;
  const perdidos = statusMap.perdido ?? 0;
  const baseConversao = vendidos + perdidos;

  let valorEstoque = 0;
  let itensEstoque = 0;
  let estoqueBaixo = 0;
  for (const p of produtos) {
    const custo = p.precoCusto ?? p.preco;
    valorEstoque += custo * p.quantidade;
    itensEstoque += p.quantidade;
    if (p.quantidadeMinima > 0 && p.quantidade <= p.quantidadeMinima) estoqueBaixo += 1;
  }

  return {
    financeiro: {
      saldo,
      receitasMes,
      despesasMes,
      lucroMes: receitasMes - despesasMes,
      aReceber: aReceber._sum.valor ?? 0,
      aPagar: aPagar._sum.valor ?? 0,
    },
    comercial: {
      leadsMes,
      novos: statusMap.novo ?? 0,
      vendidos,
      perdidos,
      conversao: baseConversao > 0 ? Math.round((vendidos / baseConversao) * 100) : 0,
      scoreMedio: Math.round(scoreMedio._avg.score ?? 0),
    },
    estoque: {
      produtos: produtos.length,
      valorEstoque,
      itensEstoque,
      estoqueBaixo,
    },
    assistencia: {
      osAbertas,
      osConcluidasMes,
    },
    comunicacao: {
      enviadosMes: notifMes,
      falhasMes: notifFalhasMes,
    },
  };
}

export type Alerta = {
  nivel: "atencao" | "info" | "bom";
  titulo: string;
  detalhe: string;
  href?: string;
};

/** Regras simples sobre os mesmos dados: o que precisa de atenção hoje. */
export async function alertasNegocio(agora = new Date()): Promise<Alerta[]> {
  const alertas: Alerta[] = [];

  const [comMinima, contasVencidas, leads7d, osParadas] = await Promise.all([
    db.produto.findMany({
      where: { ativo: true, excluidoEm: null, quantidadeMinima: { gt: 0 } },
      select: { quantidade: true, quantidadeMinima: true },
    }),
    db.conta.count({ where: { status: "aberto", vencimento: { lt: agora } } }),
    db.lead.count({ where: { criadoEm: { gte: new Date(agora.getTime() - 7 * 864e5) } } }),
    db.ordemServico.count({
      where: {
        status: { notIn: ["entregue", "cancelada"] },
        criadoEm: { lt: new Date(agora.getTime() - 14 * 864e5) },
      },
    }),
  ]);

  const nBaixo = comMinima.filter((p) => p.quantidade <= p.quantidadeMinima).length;
  if (nBaixo > 0) {
    alertas.push({
      nivel: "atencao",
      titulo: `${nBaixo} produto(s) com estoque baixo`,
      detalhe: "No mínimo ou abaixo. Reponha antes de faltar.",
      href: "/erp/produtos?baixos=1",
    });
  }

  if (contasVencidas > 0) {
    alertas.push({
      nivel: "atencao",
      titulo: `${contasVencidas} conta(s) vencida(s)`,
      detalhe: "Contas em aberto com vencimento passado.",
      href: "/erp/financeiro",
    });
  }

  if (osParadas > 0) {
    alertas.push({
      nivel: "atencao",
      titulo: `${osParadas} OS parada(s) há +14 dias`,
      detalhe: "Ordens de serviço abertas sem conclusão.",
      href: "/erp/ordens",
    });
  }

  if (leads7d === 0) {
    alertas.push({
      nivel: "info",
      titulo: "Nenhum lead nos últimos 7 dias",
      detalhe: "Vale revisar divulgação e o assistente do site.",
      href: "/erp/leads",
    });
  }

  if (alertas.length === 0) {
    alertas.push({
      nivel: "bom",
      titulo: "Nada pedindo atenção",
      detalhe: "Estoque, contas e OS sob controle.",
    });
  }
  return alertas;
}
