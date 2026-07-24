"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  criarSessao,
  emailConfere,
  encerrarSessao,
  senhaConfere,
  sessaoValida,
} from "./admin-auth";
import { db } from "./db";
import { gerarSlug, parsePreco } from "./format";
import { salvarImagemProduto } from "./uploads";

async function exigirAdmin() {
  if (!(await sessaoValida())) throw new Error("Não autorizado.");
}

/** Slug único: acrescenta -2, -3… se já existir. */
async function slugUnicoProduto(nome: string, ignorarId?: number): Promise<string> {
  const base = gerarSlug(nome) || "produto";
  let slug = base;
  let n = 1;
  while (true) {
    const existente = await db.produto.findUnique({ where: { slug } });
    if (!existente || existente.id === ignorarId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

async function slugUnicoServico(nome: string, ignorarId?: number): Promise<string> {
  const base = gerarSlug(nome) || "servico";
  let slug = base;
  let n = 1;
  while (true) {
    const existente = await db.servico.findUnique({ where: { slug } });
    if (!existente || existente.id === ignorarId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

// ─────────────────────────── Autenticação ───────────────────────────

export async function acaoLogin(_estado: unknown, form: FormData) {
  const email = String(form.get("email") ?? "");
  const senha = String(form.get("senha") ?? "");
  // Mensagem única para e-mail ou senha errados — não revela qual falhou.
  if (!emailConfere(email) || !senhaConfere(senha)) {
    return { erro: "E-mail ou senha incorretos." };
  }
  await criarSessao();
  redirect("/admin/produtos");
}

export async function acaoLogout() {
  await encerrarSessao();
  redirect("/admin/login");
}

// ──────────────────────────── Produtos ──────────────────────────────

/**
 * Cria ou atualiza um produto. Campos mínimos para o cadastro de 90s:
 * foto + nome + preço + categoria. O resto é opcional.
 */
export async function acaoSalvarProduto(_estado: unknown, form: FormData) {
  await exigirAdmin();

  const idBruto = form.get("id");
  const id = idBruto ? Number(idBruto) : null;

  const nome = String(form.get("nome") ?? "").trim();
  const categoriaId = Number(form.get("categoriaId"));
  const preco = parsePreco(String(form.get("preco") ?? ""));

  if (nome.length < 2) return { erro: "Informe o nome do produto." };
  if (!Number.isInteger(categoriaId)) return { erro: "Escolha uma categoria." };
  if (preco == null) return { erro: "Informe um preço válido." };

  const precoPromoRaw = String(form.get("precoPromo") ?? "").trim();
  const precoPromo = precoPromoRaw ? parsePreco(precoPromoRaw) : null;

  const dados = {
    nome,
    categoriaId,
    preco,
    precoPromo: precoPromo && precoPromo > 0 ? precoPromo : null,
    marca: String(form.get("marca") ?? "").trim() || null,
    descricaoCurta: String(form.get("descricaoCurta") ?? "").trim() || null,
    descricaoLonga: String(form.get("descricaoLonga") ?? "").trim() || null,
    destaque: form.get("destaque") === "on",
    ativo: form.get("ativo") !== "off",
  };

  let produtoId: number;

  if (id) {
    const slug = await slugUnicoProduto(nome, id);
    await db.produto.update({ where: { id }, data: { ...dados, slug } });
    produtoId = id;
  } else {
    const slug = await slugUnicoProduto(nome);
    const criado = await db.produto.create({ data: { ...dados, slug } });
    produtoId = criado.id;
  }

  // Foto (opcional). Vira a principal se for a primeira do produto.
  const foto = form.get("foto");
  if (foto instanceof File && foto.size > 0) {
    const up = await salvarImagemProduto(foto);
    if (up.ok) {
      const qtd = await db.produtoImagem.count({ where: { produtoId } });
      await db.produtoImagem.create({
        data: { produtoId, url: up.url, principal: qtd === 0, ordem: qtd },
      });
    } else {
      return { erro: up.erro };
    }
  }

  // Campos de seminovo (quando marcado).
  const ehSeminovo = form.get("ehSeminovo") === "on";
  if (ehSeminovo) {
    const seminovo = {
      saudeBateria: form.get("saudeBateria") ? Number(form.get("saudeBateria")) : null,
      condicaoEstetica: String(form.get("condicaoEstetica") ?? "bom"),
      cor: String(form.get("cor") ?? "").trim() || null,
      capacidade: String(form.get("capacidade") ?? "").trim() || null,
      garantiaMeses: form.get("garantiaMeses") ? Number(form.get("garantiaMeses")) : 0,
      vendido: form.get("vendido") === "on",
    };
    await db.seminovo.upsert({
      where: { produtoId },
      update: seminovo,
      create: { produtoId, ...seminovo },
    });
  } else {
    await db.seminovo.deleteMany({ where: { produtoId } });
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  revalidatePath("/seminovos");
  revalidatePath("/");
  redirect("/admin/produtos");
}

export async function acaoAlternarAtivo(id: number, ativo: boolean) {
  await exigirAdmin();
  await db.produto.update({ where: { id }, data: { ativo } });
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  revalidatePath("/");
}

export async function acaoExcluirProduto(id: number) {
  await exigirAdmin();
  await db.produto.delete({ where: { id } });
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  revalidatePath("/");
}

export async function acaoDefinirImagemPrincipal(imagemId: number, produtoId: number) {
  await exigirAdmin();
  await db.produtoImagem.updateMany({ where: { produtoId }, data: { principal: false } });
  await db.produtoImagem.update({ where: { id: imagemId }, data: { principal: true } });
  revalidatePath(`/admin/produtos`);
  revalidatePath(`/produtos`);
}

export async function acaoExcluirImagem(imagemId: number) {
  await exigirAdmin();
  await db.produtoImagem.delete({ where: { id: imagemId } });
  revalidatePath(`/admin/produtos`);
  revalidatePath(`/produtos`);
}

// ──────────────────────────── Seminovos ─────────────────────────────

export async function acaoMarcarVendido(produtoId: number, vendido: boolean) {
  await exigirAdmin();
  await db.seminovo.update({ where: { produtoId }, data: { vendido } });
  revalidatePath("/admin/seminovos");
  revalidatePath("/seminovos");
  revalidatePath("/");
}

// ───────────────────────────── Serviços ─────────────────────────────

export async function acaoSalvarServico(_estado: unknown, form: FormData) {
  await exigirAdmin();

  const id = form.get("id") ? Number(form.get("id")) : null;
  const nome = String(form.get("nome") ?? "").trim();
  if (nome.length < 2) return { erro: "Informe o nome do serviço." };

  const precoRaw = String(form.get("precoAPartirDe") ?? "").trim();
  const dados = {
    nome,
    descricao: String(form.get("descricao") ?? "").trim() || null,
    precoAPartirDe: precoRaw ? parsePreco(precoRaw) : null,
    atendeEmDomicilio: form.get("atendeEmDomicilio") === "on",
    tempoMedio: String(form.get("tempoMedio") ?? "").trim() || null,
    ativo: form.get("ativo") !== "off",
  };

  if (id) {
    const slug = await slugUnicoServico(nome, id);
    await db.servico.update({ where: { id }, data: { ...dados, slug } });
  } else {
    const slug = await slugUnicoServico(nome);
    await db.servico.create({ data: { ...dados, slug } });
  }

  revalidatePath("/admin/servicos");
  revalidatePath("/servicos");
  redirect("/admin/servicos");
}

// ─────────────────────────────── Leads ──────────────────────────────

export async function acaoStatusLead(id: number, status: string) {
  await exigirAdmin();
  const validos = ["novo", "respondido", "vendido", "perdido"];
  if (!validos.includes(status)) return;
  await db.lead.update({ where: { id }, data: { status } });
  revalidatePath("/admin/leads");
}
