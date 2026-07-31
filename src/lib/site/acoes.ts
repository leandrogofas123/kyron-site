"use server";

import { revalidatePath } from "next/cache";

import { auditar } from "../core/audit";
import { db } from "../db";
import { exigirPermissao } from "../erp/auth";
import { salvarImagemProduto } from "../uploads";
import { POSICOES } from "./banners";

type Estado = { erro?: string; ok?: boolean } | null;

const POS_IDS = new Set(POSICOES.map((p) => p.id));

/** Cria ou atualiza um banner (com upload opcional de arte desktop/mobile). */
export async function acaoSalvarBanner(_estado: Estado, form: FormData): Promise<Estado> {
  const eu = await exigirPermissao("produtos.editar");

  const id = form.get("id") ? Number(form.get("id")) : null;
  const titulo = String(form.get("titulo") ?? "").trim();
  const posicao = String(form.get("posicao") ?? "");
  if (titulo.length < 2) return { erro: "Informe o título do banner." };
  if (!POS_IDS.has(posicao)) return { erro: "Posição inválida." };

  // Uploads (otimizados via sharp). Mantém a imagem atual se nenhum arquivo novo.
  const atual = id ? await db.banner.findUnique({ where: { id } }) : null;
  let imagemDesktop = atual?.imagemDesktop ?? "";
  let imagemMobile = atual?.imagemMobile ?? null;

  const fd = form.get("arquivoDesktop");
  if (fd instanceof File && fd.size > 0) {
    const up = await salvarImagemProduto(fd);
    if (!up.ok) return { erro: up.erro };
    imagemDesktop = up.url;
  }
  const fm = form.get("arquivoMobile");
  if (fm instanceof File && fm.size > 0) {
    const up = await salvarImagemProduto(fm);
    if (!up.ok) return { erro: up.erro };
    imagemMobile = up.url;
  }
  if (!imagemDesktop) return { erro: "Envie a imagem (desktop) do banner." };

  const parseData = (v: FormDataEntryValue | null) => {
    const s = String(v ?? "").trim();
    if (!s) return null;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const dados = {
    titulo,
    posicao,
    imagemDesktop,
    imagemMobile,
    link: String(form.get("link") ?? "").trim() || null,
    botaoTexto: String(form.get("botaoTexto") ?? "").trim() || null,
    ordem: Number(form.get("ordem")) || 0,
    ativo: form.get("ativo") !== "off",
    rotacaoSegundos: Math.max(2, Number(form.get("rotacaoSegundos")) || 6),
    inicioEm: parseData(form.get("inicioEm")),
    fimEm: parseData(form.get("fimEm")),
  };

  const salvo = id
    ? await db.banner.update({ where: { id }, data: dados })
    : await db.banner.create({ data: dados });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "loja",
    acao: id ? "editar-banner" : "criar-banner",
    entidade: "Banner",
    entidadeId: salvo.id,
    depois: { titulo, posicao },
  });

  revalidatePath("/erp/site/banners");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function acaoAlternarBanner(id: number, ativo: boolean): Promise<void> {
  await exigirPermissao("produtos.editar");
  await db.banner.update({ where: { id }, data: { ativo } });
  revalidatePath("/erp/site/banners");
  revalidatePath("/", "layout");
}

export async function acaoExcluirBanner(id: number): Promise<void> {
  await exigirPermissao("produtos.editar");
  await db.banner.delete({ where: { id } });
  revalidatePath("/erp/site/banners");
  revalidatePath("/", "layout");
}

/** Duplica um banner (mesma arte, desativado, para editar a campanha nova). */
export async function acaoDuplicarBanner(id: number): Promise<void> {
  await exigirPermissao("produtos.editar");
  const b = await db.banner.findUnique({ where: { id } });
  if (!b) return;
  const { id: _i, criadoEm: _c, ...resto } = b;
  await db.banner.create({ data: { ...resto, titulo: `${b.titulo} (cópia)`, ativo: false } });
  revalidatePath("/erp/site/banners");
}
