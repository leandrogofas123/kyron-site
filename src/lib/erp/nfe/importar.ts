"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "../../db";
import { gerarSlug } from "../../format";
import { exigirPermissao } from "../auth";
import { movimentarEstoque } from "../estoque";
import { parseNfeXml } from "./parse-xml";

type Estado = { erro?: string; ok?: boolean } | null;

async function slugUnico(nome: string): Promise<string> {
  const base = gerarSlug(nome) || "produto";
  let slug = base;
  let n = 1;
  while (await db.produto.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

/** Fornecedor por CNPJ (normalizado); cria se não existir. */
async function resolverFornecedor(f: {
  nome: string | null;
  cnpj: string | null;
  cidade: string | null;
  estado: string | null;
}): Promise<number | null> {
  const cnpj = f.cnpj?.replace(/\D/g, "") || null;
  if (cnpj) {
    const existente = await db.fornecedor.findFirst({
      where: { cnpj, excluidoEm: null },
    });
    if (existente) return existente.id;
  }
  if (!f.nome && !cnpj) return null;
  const criado = await db.fornecedor.create({
    data: {
      nome: f.nome ?? "Fornecedor da nota",
      cnpj,
      cidade: f.cidade,
      estado: f.estado,
    },
  });
  return criado.id;
}

/** Passo 1: lê o XML, cria a nota e seus itens (ainda não mexe no estoque). */
export async function acaoImportarNota(_estado: Estado, form: FormData) {
  await exigirPermissao("notas.importar");

  const arquivo = form.get("xml");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { erro: "Envie o arquivo XML da nota." };
  }
  if (arquivo.size > 2_000_000) {
    return { erro: "Arquivo muito grande para uma NF-e." };
  }

  const texto = await arquivo.text();
  const nota = parseNfeXml(texto);
  if (!nota || nota.itens.length === 0) {
    return { erro: "Não consegui ler esta NF-e. Confira se é o XML da nota." };
  }

  if (nota.chave) {
    const jaImportada = await db.notaFiscal.findUnique({
      where: { chave: nota.chave },
    });
    if (jaImportada) {
      redirect(`/erp/notas/${jaImportada.id}`);
    }
  }

  const fornecedorId = await resolverFornecedor(nota.fornecedor);

  const criada = await db.notaFiscal.create({
    data: {
      chave: nota.chave,
      numero: nota.numero,
      serie: nota.serie,
      emitidaEm: nota.emitidaEm,
      valorTotal: nota.valorTotal,
      xml: texto.slice(0, 500_000),
      fornecedorId,
      itens: {
        create: nota.itens.map((i) => ({
          descricao: i.descricao,
          ean: i.ean,
          ncm: i.ncm,
          cfop: i.cfop,
          quantidade: i.quantidade,
          valorUnitario: i.valorUnitario,
        })),
      },
    },
  });

  redirect(`/erp/notas/${criada.id}`);
}

/** Passo final: aplica as decisões (criar/vincular) e dá entrada no estoque. */
export async function acaoConfirmarNota(_estado: Estado, form: FormData) {
  await exigirPermissao("notas.importar");

  const notaId = Number(form.get("notaId"));
  const nota = await db.notaFiscal.findUnique({
    where: { id: notaId },
    include: { itens: true },
  });
  if (!nota) return { erro: "Nota não encontrada." };
  if (nota.status === "finalizada") return { erro: "Esta nota já foi finalizada." };

  const doc = nota.numero ? `NF ${nota.numero}` : (nota.chave ?? undefined);

  for (const item of nota.itens) {
    if (item.processado) continue;
    const acao = String(form.get(`acao-${item.id}`) ?? "ignorar");
    let produtoId: number | null = null;

    if (acao === "vincular") {
      const pid = Number(form.get(`produto-${item.id}`));
      if (!Number.isInteger(pid)) {
        return { erro: `Escolha o produto para "${item.descricao}".` };
      }
      produtoId = pid;
      // Atualiza o custo com o valor da nota; NCM/fornecedor se estavam vazios.
      await db.produto.update({
        where: { id: pid },
        data: {
          precoCusto: item.valorUnitario,
          ...(item.ncm ? { ncm: item.ncm } : {}),
          ...(nota.fornecedorId ? { fornecedorId: nota.fornecedorId } : {}),
        },
      });
    } else if (acao === "criar") {
      const categoriaId = Number(form.get(`categoria-${item.id}`));
      if (!Number.isInteger(categoriaId)) {
        return { erro: `Escolha a categoria de "${item.descricao}".` };
      }
      const criado = await db.produto.create({
        data: {
          slug: await slugUnico(item.descricao),
          nome: item.descricao,
          // Preço de venda entra igual ao custo e o produto nasce INATIVO —
          // não aparece na loja até definirem a margem. "Sem preço não existe."
          preco: item.valorUnitario,
          precoCusto: item.valorUnitario,
          ean: item.ean,
          ncm: item.ncm,
          categoriaId,
          fornecedorId: nota.fornecedorId,
          ativo: false,
        },
      });
      produtoId = criado.id;
    } else {
      continue; // ignorar
    }

    const r = await movimentarEstoque({
      produtoId,
      tipo: "entrada",
      quantidade: item.quantidade,
      motivo: "Entrada por NF-e",
      documento: doc,
      notaId: nota.id,
    });
    if (!r.ok) return { erro: `${item.descricao}: ${r.erro}` };

    await db.notaItem.update({
      where: { id: item.id },
      data: { processado: true, produtoId, acao },
    });
  }

  await db.notaFiscal.update({
    where: { id: notaId },
    data: { status: "finalizada" },
  });

  revalidatePath(`/erp/notas/${notaId}`);
  revalidatePath("/erp/produtos");
  revalidatePath("/erp/estoque");
  revalidatePath("/erp");
  redirect("/erp/notas");
}
