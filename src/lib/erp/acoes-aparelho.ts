"use server";

import { revalidatePath } from "next/cache";

import { auditar } from "../core/audit";
import { db } from "../db";
import { exigirPermissao } from "./auth";

type Estado = { erro?: string; ok?: boolean } | null;

const STATUS = new Set(["estoque", "vendido", "assistencia", "devolvido", "perdido"]);

/** Cadastra um aparelho (IMEI/serial) para um produto. */
export async function acaoAdicionarAparelho(
  produtoId: number,
  _estado: Estado,
  form: FormData,
): Promise<Estado> {
  const eu = await exigirPermissao("estoque.movimentar");

  const imei = String(form.get("imei") ?? "").trim() || null;
  const serial = String(form.get("serial") ?? "").trim() || null;
  const localizacao = String(form.get("localizacao") ?? "").trim() || null;

  if (!imei && !serial) return { erro: "Informe o IMEI ou o número de série." };
  if (imei && !/^\d{15}$/.test(imei)) {
    return { erro: "IMEI deve ter 15 dígitos." };
  }

  // Unicidade: não duplicar aparelho já cadastrado.
  const jaExiste = await db.aparelho.findFirst({
    where: { OR: [imei ? { imei } : {}, serial ? { serial } : {}].filter((o) => Object.keys(o).length) },
    select: { id: true },
  });
  if (jaExiste) return { erro: "Já existe um aparelho com esse IMEI ou série." };

  const criado = await db.aparelho.create({
    data: { produtoId, imei, serial, localizacao, status: "estoque" },
  });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: "cadastrar-aparelho",
    entidade: "Aparelho",
    entidadeId: criado.id,
    depois: { produtoId, imei, serial },
  });

  revalidatePath(`/erp/produtos/${produtoId}`);
  return { ok: true };
}

/** Muda o status de um aparelho (vendido, assistência, etc.). */
export async function acaoStatusAparelho(
  aparelhoId: number,
  status: string,
  produtoId: number,
): Promise<void> {
  const eu = await exigirPermissao("estoque.movimentar");
  if (!STATUS.has(status)) return;

  const antes = await db.aparelho.findUnique({
    where: { id: aparelhoId },
    select: { status: true },
  });
  await db.aparelho.update({ where: { id: aparelhoId }, data: { status } });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: "status-aparelho",
    entidade: "Aparelho",
    entidadeId: aparelhoId,
    antes: { status: antes?.status },
    depois: { status },
  });

  revalidatePath(`/erp/produtos/${produtoId}`);
}
