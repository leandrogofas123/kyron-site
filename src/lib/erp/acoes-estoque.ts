"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "../db";
import { gerarSlug, parsePreco } from "../format";
import { exigirPermissao } from "./auth";
import { movimentarEstoque } from "./estoque";

type Estado = { erro?: string; ok?: boolean } | null;

/** Slug único (o produto também aparece na loja). */
async function slugUnico(nome: string, ignorarId?: number): Promise<string> {
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

function texto(form: FormData, campo: string): string | null {
  const v = String(form.get(campo) ?? "").trim();
  return v || null;
}

function inteiro(form: FormData, campo: string): number | null {
  const v = String(form.get(campo) ?? "").trim();
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

// ──────────────────────────── Produtos ────────────────────────────

export async function acaoSalvarProdutoErp(_estado: Estado, form: FormData) {
  await exigirPermissao("produtos.editar");

  const id = form.get("id") ? Number(form.get("id")) : null;
  const nome = String(form.get("nome") ?? "").trim();
  const categoriaId = Number(form.get("categoriaId"));
  const preco = parsePreco(String(form.get("preco") ?? ""));

  if (nome.length < 2) return { erro: "Informe o nome do produto." };
  if (!Number.isInteger(categoriaId)) return { erro: "Escolha uma categoria." };
  if (preco == null) return { erro: "Informe um preço de venda válido." };

  const custoRaw = String(form.get("precoCusto") ?? "").trim();
  const minimoRaw = String(form.get("precoMinimo") ?? "").trim();
  const fornecedorId = inteiro(form, "fornecedorId");

  const dados = {
    nome,
    categoriaId,
    preco,
    precoCusto: custoRaw ? parsePreco(custoRaw) : null,
    precoMinimo: minimoRaw ? parsePreco(minimoRaw) : null,
    marca: texto(form, "marca"),
    modelo: texto(form, "modelo"),
    cor: texto(form, "cor"),
    capacidade: texto(form, "capacidade"),
    voltagem: texto(form, "voltagem"),
    sku: texto(form, "sku"),
    ean: texto(form, "ean"),
    ncm: texto(form, "ncm"),
    codigoInterno: texto(form, "codigoInterno"),
    localizacao: texto(form, "localizacao"),
    compatibilidade: texto(form, "compatibilidade"),
    descricaoCurta: texto(form, "descricaoCurta"),
    observacoes: texto(form, "observacoes"),
    garantiaMeses: inteiro(form, "garantiaMeses"),
    quantidadeMinima: inteiro(form, "quantidadeMinima") ?? 0,
    fornecedorId: fornecedorId && fornecedorId > 0 ? fornecedorId : null,
    ativo: form.get("ativo") === "on",
  };

  try {
    if (id) {
      await db.produto.update({
        where: { id },
        data: { ...dados, slug: await slugUnico(nome, id) },
      });
    } else {
      const criado = await db.produto.create({
        data: { ...dados, slug: await slugUnico(nome) },
      });
      // Saldo inicial vira movimentação — nunca um número solto.
      const inicial = inteiro(form, "quantidadeInicial") ?? 0;
      if (inicial > 0) {
        await movimentarEstoque({
          produtoId: criado.id,
          tipo: "entrada",
          quantidade: inicial,
          motivo: "Saldo inicial do cadastro",
        });
      }
    }
  } catch (erro) {
    const msg = erro instanceof Error ? erro.message : "";
    if (msg.includes("Unique constraint")) {
      return { erro: "Já existe um produto com este SKU ou código interno." };
    }
    return { erro: "Não foi possível salvar. Confira os dados." };
  }

  revalidatePath("/erp/produtos");
  revalidatePath("/produtos");
  redirect("/erp/produtos");
}

/** Exclusão lógica: o produto sai das telas, o histórico permanece. */
export async function acaoExcluirProdutoErp(id: number) {
  await exigirPermissao("produtos.editar");
  await db.produto.update({
    where: { id },
    data: { excluidoEm: new Date(), ativo: false },
  });
  revalidatePath("/erp/produtos");
  revalidatePath("/produtos");
}

// ──────────────────────────── Estoque ─────────────────────────────

export async function acaoMovimentar(_estado: Estado, form: FormData) {
  const eu = await exigirPermissao("estoque.movimentar");

  const produtoId = Number(form.get("produtoId"));
  const tipo = String(form.get("tipo") ?? "");
  const quantidade = Number(form.get("quantidade"));

  if (!Number.isInteger(produtoId)) return { erro: "Escolha o produto." };
  if (!Number.isFinite(quantidade)) return { erro: "Informe a quantidade." };

  const clienteId = inteiro(form, "clienteId");

  const r = await movimentarEstoque({
    produtoId,
    tipo,
    quantidade: Math.trunc(quantidade),
    motivo: texto(form, "motivo"),
    documento: texto(form, "documento"),
    observacao: texto(form, "observacao"),
    colaboradorId: eu.id,
    clienteId: clienteId && clienteId > 0 ? clienteId : null,
  });

  if (!r.ok) return { erro: r.erro };

  revalidatePath("/erp/estoque");
  revalidatePath("/erp/produtos");
  revalidatePath("/erp/clientes");
  revalidatePath("/erp");
  return { ok: true };
}

// ────────────────────────── Fornecedores ──────────────────────────

export async function acaoSalvarFornecedor(_estado: Estado, form: FormData) {
  await exigirPermissao("fornecedores.editar");

  const id = form.get("id") ? Number(form.get("id")) : null;
  const nome = String(form.get("nome") ?? "").trim();
  if (nome.length < 2) return { erro: "Informe o nome do fornecedor." };

  const dados = {
    nome,
    cnpj: texto(form, "cnpj"),
    contato: texto(form, "contato"),
    telefone: texto(form, "telefone"),
    email: texto(form, "email"),
    cidade: texto(form, "cidade"),
    estado: texto(form, "estado"),
    observacoes: texto(form, "observacoes"),
  };

  try {
    if (id) await db.fornecedor.update({ where: { id }, data: dados });
    else await db.fornecedor.create({ data: dados });
  } catch {
    return { erro: "Já existe um fornecedor com este CNPJ." };
  }

  revalidatePath("/erp/fornecedores");
  return { ok: true };
}

export async function acaoExcluirFornecedor(id: number) {
  await exigirPermissao("fornecedores.editar");
  await db.fornecedor.update({ where: { id }, data: { excluidoEm: new Date() } });
  revalidatePath("/erp/fornecedores");
}

// ──────────────────────────── Clientes ────────────────────────────

export async function acaoSalvarCliente(_estado: Estado, form: FormData) {
  await exigirPermissao("clientes.editar");

  const id = form.get("id") ? Number(form.get("id")) : null;
  const nome = String(form.get("nome") ?? "").trim();
  if (nome.length < 2) return { erro: "Informe o nome do cliente." };

  const dados = {
    nome,
    telefone: texto(form, "telefone"),
    email: texto(form, "email"),
    cpf: texto(form, "cpf"),
    cidade: texto(form, "cidade"),
    observacoes: texto(form, "observacoes"),
  };

  if (id) await db.clienteErp.update({ where: { id }, data: dados });
  else await db.clienteErp.create({ data: dados });

  revalidatePath("/erp/clientes");
  return { ok: true };
}

export async function acaoExcluirCliente(id: number) {
  await exigirPermissao("clientes.editar");
  await db.clienteErp.update({ where: { id }, data: { excluidoEm: new Date() } });
  revalidatePath("/erp/clientes");
}
