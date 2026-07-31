"use server";

import { revalidatePath } from "next/cache";

import { auditar } from "../core/audit";
import { cache } from "../core/cache";
import { db } from "../db";
import { exigirPermissao } from "../erp/auth";
import { parsePreco } from "../format";
import { bancoTemMovimento, TIPOS_BANCO } from "./bancos";

type Estado = { erro?: string; ok?: boolean } | null;

const TIPOS: Set<string> = new Set(TIPOS_BANCO.map((t) => t.id));
const CHAVE_MAPA = "financeiro_forma_banco";

/** Cria ou atualiza um banco (conta/carteira). */
export async function acaoSalvarBanco(_estado: Estado, form: FormData): Promise<Estado> {
  const eu = await exigirPermissao("financeiro");

  const id = form.get("id") ? Number(form.get("id")) : null;
  const nome = String(form.get("nome") ?? "").trim();
  const tipo = String(form.get("tipo") ?? "conta");
  if (nome.length < 2) return { erro: "Informe o nome do banco." };
  if (!TIPOS.has(tipo)) return { erro: "Tipo inválido." };

  const dados = {
    nome,
    tipo,
    ativo: form.get("ativo") !== "off",
    ordem: Number(form.get("ordem")) || 0,
  };

  const salvo = id
    ? await db.banco.update({ where: { id }, data: dados })
    : await db.banco.create({ data: dados });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: id ? "editar-banco" : "criar-banco",
    entidade: "Banco",
    entidadeId: salvo.id,
    depois: { nome, tipo },
  });

  revalidatePath("/erp/configuracoes/bancos");
  return { ok: true };
}

export async function acaoAlternarBanco(id: number, ativo: boolean): Promise<void> {
  await exigirPermissao("financeiro");
  await db.banco.update({ where: { id }, data: { ativo } });
  revalidatePath("/erp/configuracoes/bancos");
}

/** Exclui um banco — bloqueado se houver qualquer movimentação vinculada. */
export async function acaoExcluirBanco(id: number): Promise<{ ok: boolean; erro?: string }> {
  const eu = await exigirPermissao("financeiro");
  if (await bancoTemMovimento(id)) {
    return { ok: false, erro: "Este banco tem movimentações e não pode ser excluído. Desative-o." };
  }
  await db.banco.delete({ where: { id } });
  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: "excluir-banco",
    entidade: "Banco",
    entidadeId: id,
  });
  revalidatePath("/erp/configuracoes/bancos");
  return { ok: true };
}

const TIPOS_MOV = new Set(["transferencia", "deposito", "saque", "ajuste"]);

/**
 * Movimentação entre/nos bancos: transferência (saída origem + entrada destino),
 * depósito (entrada), saque (saída) ou ajuste (entrada/saída). Tudo vira
 * lançamento, então o saldo derivado continua sendo a verdade.
 */
export async function acaoMovimentarBanco(_estado: Estado, form: FormData): Promise<Estado> {
  const eu = await exigirPermissao("financeiro");

  const tipo = String(form.get("tipo") ?? "");
  const bancoId = Number(form.get("bancoId"));
  const destinoId = Number(form.get("bancoDestinoId"));
  const valor = parsePreco(String(form.get("valor") ?? ""));
  const descricao = String(form.get("descricao") ?? "").trim() || null;
  const direcao = String(form.get("direcao") ?? "entrada"); // só para ajuste

  if (!TIPOS_MOV.has(tipo)) return { erro: "Tipo inválido." };
  if (!Number.isInteger(bancoId)) return { erro: "Escolha o banco." };
  if (valor == null || valor <= 0) return { erro: "Informe um valor válido." };
  if (tipo === "transferencia" && (!Number.isInteger(destinoId) || destinoId === bancoId)) {
    return { erro: "Escolha um banco de destino diferente." };
  }

  const usuario = { usuarioId: eu.id, usuarioNome: eu.nome };
  const ops = [];
  if (tipo === "transferencia") {
    ops.push(
      db.lancamento.create({ data: { tipo: "saida", valor, categoria: "Transferência entre bancos", descricao: descricao ?? "Transferência", bancoId, ...usuario } }),
      db.lancamento.create({ data: { tipo: "entrada", valor, categoria: "Transferência entre bancos", descricao: descricao ?? "Transferência", bancoId: destinoId, ...usuario } }),
    );
  } else if (tipo === "deposito") {
    ops.push(db.lancamento.create({ data: { tipo: "entrada", valor, categoria: "Depósito", descricao: descricao ?? "Depósito", bancoId, ...usuario } }));
  } else if (tipo === "saque") {
    ops.push(db.lancamento.create({ data: { tipo: "saida", valor, categoria: "Saque", descricao: descricao ?? "Saque", bancoId, ...usuario } }));
  } else {
    ops.push(db.lancamento.create({ data: { tipo: direcao === "saida" ? "saida" : "entrada", valor, categoria: "Ajuste de banco", descricao: descricao ?? "Ajuste", bancoId, ...usuario } }));
  }
  await db.$transaction(ops);

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: `banco-${tipo}`,
    entidade: "Banco",
    entidadeId: bancoId,
    depois: { tipo, valor, destinoId: tipo === "transferencia" ? destinoId : undefined },
  });

  revalidatePath("/erp/financeiro");
  return { ok: true };
}

/** Salva o mapa forma de pagamento → banco padrão (JSON em Configuracao). */
export async function acaoSalvarFormaBanco(mapa: Record<string, number | null>): Promise<{ ok: boolean }> {
  const eu = await exigirPermissao("financeiro");
  const limpo: Record<string, number> = {};
  for (const [forma, bancoId] of Object.entries(mapa)) {
    if (bancoId && Number.isInteger(bancoId)) limpo[forma] = bancoId;
  }
  await db.configuracao.upsert({
    where: { chave: CHAVE_MAPA },
    update: { valor: JSON.stringify(limpo) },
    create: { chave: CHAVE_MAPA, valor: JSON.stringify(limpo) },
  });
  cache.invalidate("config:formabanco");
  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: "mapear-forma-banco",
    entidade: "Configuracao",
  });
  revalidatePath("/erp/configuracoes/bancos");
  return { ok: true };
}
