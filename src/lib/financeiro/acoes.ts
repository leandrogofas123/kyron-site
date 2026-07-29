"use server";

import { revalidatePath } from "next/cache";

import { auditar } from "../core/audit";
import { db } from "../db";
import { exigirPermissao } from "../erp/auth";
import { parsePreco } from "../format";

type Estado = { erro?: string; ok?: boolean } | null;

const TIPOS_LANC = new Set(["entrada", "saida"]);
const TIPOS_CONTA = new Set(["pagar", "receber"]);

/** Registra um lançamento no caixa (imutável). */
export async function acaoLancar(_estado: Estado, form: FormData): Promise<Estado> {
  const eu = await exigirPermissao("financeiro");

  const tipo = String(form.get("tipo") ?? "");
  const valor = parsePreco(String(form.get("valor") ?? ""));
  const descricao = String(form.get("descricao") ?? "").trim();
  const categoria = String(form.get("categoria") ?? "").trim() || null;
  const forma = String(form.get("forma") ?? "").trim() || null;

  if (!TIPOS_LANC.has(tipo)) return { erro: "Tipo inválido." };
  if (valor == null || valor <= 0) return { erro: "Informe um valor válido." };
  if (descricao.length < 2) return { erro: "Descreva o lançamento." };

  const criado = await db.lancamento.create({
    data: { tipo, valor, descricao, categoria, forma, usuarioId: eu.id, usuarioNome: eu.nome },
  });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: "lancamento-financeiro",
    entidade: "Lancamento",
    entidadeId: criado.id,
    depois: { tipo, valor, categoria },
  });

  revalidatePath("/erp/financeiro");
  return { ok: true };
}

/** Cria uma conta a pagar ou a receber. */
export async function acaoCriarConta(_estado: Estado, form: FormData): Promise<Estado> {
  const eu = await exigirPermissao("financeiro");

  const tipo = String(form.get("tipo") ?? "");
  const valor = parsePreco(String(form.get("valor") ?? ""));
  const descricao = String(form.get("descricao") ?? "").trim();
  const categoria = String(form.get("categoria") ?? "").trim() || null;
  const vencBruto = String(form.get("vencimento") ?? "").trim();

  if (!TIPOS_CONTA.has(tipo)) return { erro: "Tipo inválido." };
  if (valor == null || valor <= 0) return { erro: "Informe um valor válido." };
  if (descricao.length < 2) return { erro: "Descreva a conta." };
  const vencimento = vencBruto ? new Date(vencBruto) : null;
  if (!vencimento || Number.isNaN(vencimento.getTime())) {
    return { erro: "Informe o vencimento." };
  }

  const criado = await db.conta.create({
    data: { tipo, valor, descricao, categoria, vencimento },
  });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: "criar-conta",
    entidade: "Conta",
    entidadeId: criado.id,
    depois: { tipo, valor, vencimento: vencimento.toISOString() },
  });

  revalidatePath("/erp/financeiro");
  return { ok: true };
}

/**
 * Dá baixa numa conta: marca paga e GERA o lançamento no caixa. A pagar vira
 * saída; a receber vira entrada. Idempotente: não baixa duas vezes.
 */
export async function acaoBaixarConta(contaId: number, forma?: string): Promise<Estado> {
  const eu = await exigirPermissao("financeiro");

  const conta = await db.conta.findUnique({ where: { id: contaId } });
  if (!conta) return { erro: "Conta não encontrada." };
  if (conta.status !== "aberto") return { erro: "Conta já baixada ou cancelada." };

  const tipoLanc = conta.tipo === "receber" ? "entrada" : "saida";

  await db.$transaction([
    db.conta.update({
      where: { id: contaId },
      data: { status: "pago", pagoEm: new Date(), forma: forma ?? conta.forma ?? null },
    }),
    db.lancamento.create({
      data: {
        tipo: tipoLanc,
        valor: conta.valor,
        descricao: conta.descricao,
        categoria: conta.categoria,
        forma: forma ?? conta.forma ?? null,
        contaId: conta.id,
        usuarioId: eu.id,
        usuarioNome: eu.nome,
      },
    }),
  ]);

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: "baixar-conta",
    entidade: "Conta",
    entidadeId: contaId,
    depois: { status: "pago" },
  });

  revalidatePath("/erp/financeiro");
  return { ok: true };
}

/** Cancela uma conta em aberto (não gera lançamento). */
export async function acaoCancelarConta(contaId: number): Promise<Estado> {
  const eu = await exigirPermissao("financeiro");
  const conta = await db.conta.findUnique({ where: { id: contaId }, select: { status: true } });
  if (!conta || conta.status !== "aberto") return { erro: "Conta não pode ser cancelada." };

  await db.conta.update({ where: { id: contaId }, data: { status: "cancelado" } });
  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: "cancelar-conta",
    entidade: "Conta",
    entidadeId: contaId,
  });
  revalidatePath("/erp/financeiro");
  return { ok: true };
}
