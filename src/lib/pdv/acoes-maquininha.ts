"use server";

import { revalidatePath } from "next/cache";

import { auditar } from "../core/audit";
import { db } from "../db";
import { exigirPermissao } from "../erp/auth";
import { PARCELAS_MAX } from "./maquininhas";

type Estado = { erro?: string; ok?: boolean } | null;

/** Converte "3,49" (%) em basis points (349). */
function pctParaBps(v: FormDataEntryValue | null): number {
  const n = Number(String(v ?? "").replace(",", ".")) || 0;
  return Math.max(0, Math.round(n * 100));
}

/** Cria ou atualiza uma maquininha com sua tabela de taxas. */
export async function acaoSalvarMaquininha(_estado: Estado, form: FormData): Promise<Estado> {
  const eu = await exigirPermissao("financeiro");

  const id = form.get("id") ? Number(form.get("id")) : null;
  const nome = String(form.get("nome") ?? "").trim();
  if (nome.length < 2) return { erro: "Informe o nome da maquininha." };

  const taxaDebito = pctParaBps(form.get("debito"));
  const taxasCredito: Record<string, number> = {};
  for (let p = 1; p <= PARCELAS_MAX; p++) {
    const bps = pctParaBps(form.get(`credito_${p}`));
    if (bps > 0) taxasCredito[String(p)] = bps;
  }

  const dados = {
    nome,
    ativo: form.get("ativo") !== "off",
    taxaDebito,
    taxasCredito: JSON.stringify(taxasCredito),
  };

  const salva = id
    ? await db.maquininha.update({ where: { id }, data: dados })
    : await db.maquininha.create({ data: dados });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: id ? "editar-maquininha" : "criar-maquininha",
    entidade: "Maquininha",
    entidadeId: salva.id,
    depois: { nome, debito: taxaDebito },
  });

  revalidatePath("/erp/maquininhas");
  revalidatePath("/erp/pdv");
  return { ok: true };
}

export async function acaoAlternarMaquininha(id: number, ativo: boolean): Promise<void> {
  const eu = await exigirPermissao("financeiro");
  await db.maquininha.update({ where: { id }, data: { ativo } });
  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: ativo ? "ativar-maquininha" : "desativar-maquininha",
    entidade: "Maquininha",
    entidadeId: id,
  });
  revalidatePath("/erp/maquininhas");
  revalidatePath("/erp/pdv");
}

export async function acaoExcluirMaquininha(id: number): Promise<void> {
  await exigirPermissao("financeiro");
  await db.maquininha.delete({ where: { id } });
  revalidatePath("/erp/maquininhas");
  revalidatePath("/erp/pdv");
}
