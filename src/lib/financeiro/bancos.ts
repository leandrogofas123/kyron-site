import "server-only";

import { cache } from "../core/cache";
import { db } from "../db";
import { FORMAS_PAGAMENTO } from "./plano";

/**
 * Bancos (contas/carteiras) do módulo Financeiro. O saldo é DERIVADO dos
 * lançamentos vinculados — nunca um número solto. O mapa forma→banco fica em
 * Configuracao (chave-valor), reaproveitando a infra existente.
 */

export const TIPOS_BANCO = [
  { id: "caixa", rotulo: "Caixa (dinheiro)" },
  { id: "conta", rotulo: "Conta bancária" },
  { id: "adquirente", rotulo: "Adquirente (maquininha)" },
  { id: "carteira", rotulo: "Carteira digital" },
] as const;

export function rotuloTipoBanco(id: string): string {
  return TIPOS_BANCO.find((t) => t.id === id)?.rotulo ?? id;
}

export function listarBancos() {
  return db.banco.findMany({ orderBy: [{ ativo: "desc" }, { ordem: "asc" }, { nome: "asc" }] });
}

export function bancosAtivos() {
  return db.banco.findMany({ where: { ativo: true }, orderBy: [{ ordem: "asc" }, { nome: "asc" }] });
}

/** Saldo de um banco = entradas − saídas dos lançamentos vinculados. */
export async function saldoBanco(bancoId: number): Promise<number> {
  const [ent, sai] = await Promise.all([
    db.lancamento.aggregate({ _sum: { valor: true }, where: { bancoId, tipo: "entrada" } }),
    db.lancamento.aggregate({ _sum: { valor: true }, where: { bancoId, tipo: "saida" } }),
  ]);
  return (ent._sum.valor ?? 0) - (sai._sum.valor ?? 0);
}

/**
 * Saldos de TODOS os bancos numa consulta (corrige o N+1 da listagem) +
 * o total "a receber" pendente por banco (contas a receber ainda em aberto).
 */
export async function saldosTodos(): Promise<Record<number, { saldo: number; aReceber: number }>> {
  const [porTipo, aReceber] = await Promise.all([
    db.lancamento.groupBy({ by: ["bancoId", "tipo"], _sum: { valor: true }, where: { bancoId: { not: null } } }),
    db.conta.groupBy({ by: ["bancoId"], _sum: { valor: true }, where: { tipo: "receber", status: "aberto", bancoId: { not: null } } }),
  ]);
  const mapa: Record<number, { saldo: number; aReceber: number }> = {};
  for (const l of porTipo) {
    if (l.bancoId == null) continue;
    mapa[l.bancoId] ??= { saldo: 0, aReceber: 0 };
    mapa[l.bancoId].saldo += (l._sum.valor ?? 0) * (l.tipo === "entrada" ? 1 : -1);
  }
  for (const c of aReceber) {
    if (c.bancoId == null) continue;
    mapa[c.bancoId] ??= { saldo: 0, aReceber: 0 };
    mapa[c.bancoId].aReceber += c._sum.valor ?? 0;
  }
  return mapa;
}

/** Banco padrão de uma forma de pagamento (do mapa), ou null. */
export async function bancoDaForma(forma: string): Promise<number | null> {
  const mapa = await mapaFormaBanco();
  return mapa[forma] ?? null;
}

/** Um banco pode ser excluído? Não, se tiver qualquer movimentação vinculada. */
export async function bancoTemMovimento(bancoId: number): Promise<boolean> {
  const [lanc, conta] = await Promise.all([
    db.lancamento.count({ where: { bancoId } }),
    db.conta.count({ where: { bancoId } }),
  ]);
  return lanc + conta > 0;
}

const CHAVE_MAPA = "financeiro_forma_banco";

/** Mapa forma de pagamento → banco padrão (JSON em Configuracao). */
export async function mapaFormaBanco(): Promise<Record<string, number>> {
  return cache.lembrar("config:formabanco", 30, async () => {
    try {
      const c = await db.configuracao.findUnique({ where: { chave: CHAVE_MAPA } });
      const obj = c ? (JSON.parse(c.valor) as Record<string, number>) : {};
      return obj && typeof obj === "object" ? obj : {};
    } catch {
      return {};
    }
  });
}

/** Formas de pagamento (do plano de contas) para montar o mapa na tela. */
export function formasParaMapa() {
  return FORMAS_PAGAMENTO;
}
