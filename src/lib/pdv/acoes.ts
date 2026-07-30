"use server";

import { revalidatePath } from "next/cache";

import { auditar } from "../core/audit";
import { db } from "../db";
import { exigirPermissao } from "../erp/auth";
import { movimentarEstoque } from "../erp/estoque";
import { liquido } from "./maquininhas";
import { buscarClientesPDV, buscarProdutosPDV } from "./pdv";

// Ações de busca — a UI nunca toca o banco; passa por aqui.
export async function acaoBuscarProdutos(termo: string) {
  await exigirPermissao("estoque.movimentar");
  return buscarProdutosPDV(termo);
}

export async function acaoBuscarClientes(termo: string) {
  await exigirPermissao("estoque.movimentar");
  return buscarClientesPDV(termo);
}

/** Cadastro rápido de cliente no meio da venda. Retorna já selecionável. */
export async function acaoClienteRapido(dados: {
  nome: string;
  telefone?: string;
  cpf?: string;
  email?: string;
}): Promise<{ ok: true; id: number; nome: string } | { ok: false; erro: string }> {
  const eu = await exigirPermissao("clientes.editar");
  const nome = dados.nome.trim();
  if (nome.length < 2) return { ok: false, erro: "Informe o nome do cliente." };

  const c = await db.clienteErp.create({
    data: {
      nome,
      telefone: dados.telefone?.trim() || null,
      cpf: dados.cpf?.trim() || null,
      email: dados.email?.trim() || null,
    },
  });
  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: "cliente-rapido",
    entidade: "ClienteErp",
    entidadeId: c.id,
  });
  return { ok: true, id: c.id, nome: c.nome };
}

const A_PRAZO = new Set(["credito", "boleto", "crediario"]);

type ItemVenda = { produtoId: number; quantidade: number };
type Payload = {
  itens: ItemVenda[];
  clienteId: number | null;
  descontoCentavos: number;
  forma: string;
  maquininhaId?: number | null;
  parcelas?: number;
  vendedorId?: number | null;
};

const CARTAO = new Set(["credito", "debito"]);

/** Taxa (bps) da maquininha para a forma/parcelas escolhidas. */
async function taxaMaquininha(id: number, forma: string, parcelas: number): Promise<number> {
  const m = await db.maquininha.findUnique({ where: { id }, select: { taxaDebito: true, taxasCredito: true } });
  if (!m) return 0;
  if (forma === "debito") return m.taxaDebito;
  try {
    const tab = JSON.parse(m.taxasCredito) as Record<string, number>;
    return tab[String(parcelas)] ?? tab["1"] ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Finaliza a venda: orquestra os módulos via seus serviços, sem tocar o banco
 * dos outros direto. Estoque (baixa transacional) → Financeiro (entrada à vista
 * ou conta a receber a prazo) → CRM (timeline do cliente) → auditoria.
 * A baixa de estoque é a etapa que pode falhar (saldo) — ela manda.
 */
export async function finalizarVenda(
  payload: Payload,
): Promise<{ ok: true; numero: number; total: number } | { ok: false; erro: string }> {
  const eu = await exigirPermissao("estoque.movimentar");

  if (!payload.itens.length) return { ok: false, erro: "Adicione ao menos um produto." };

  // Preços do banco (nunca confiar no valor vindo do cliente).
  const ids = payload.itens.map((i) => i.produtoId);
  const produtos = await db.produto.findMany({
    where: { id: { in: ids } },
    select: { id: true, nome: true, preco: true, precoPromo: true },
  });
  const mapa = new Map(produtos.map((p) => [p.id, p]));

  let subtotal = 0;
  const itensVenda: Array<{ produtoId: number; nome: string; quantidade: number; precoUnit: number; subtotal: number }> = [];
  for (const it of payload.itens) {
    const p = mapa.get(it.produtoId);
    if (!p) return { ok: false, erro: "Produto inválido na venda." };
    if (!Number.isInteger(it.quantidade) || it.quantidade < 1) {
      return { ok: false, erro: "Quantidade inválida." };
    }
    const preco = p.precoPromo && p.precoPromo > 0 ? p.precoPromo : p.preco;
    subtotal += preco * it.quantidade;
    itensVenda.push({ produtoId: p.id, nome: p.nome, quantidade: it.quantidade, precoUnit: preco, subtotal: preco * it.quantidade });
  }

  const desconto = Math.max(0, Math.min(payload.descontoCentavos, subtotal));
  const total = subtotal - desconto;
  const numero = (await db.venda.count()) + 1042; // nº sequencial simples

  const doc = `Venda #${numero}`;

  // 1) Baixa de estoque, item a item (transacional dentro de movimentarEstoque).
  for (const it of payload.itens) {
    const r = await movimentarEstoque({
      produtoId: it.produtoId,
      tipo: "venda",
      quantidade: it.quantidade,
      documento: doc,
      motivo: "PDV",
      usuarioId: eu.id,
      clienteId: payload.clienteId,
    });
    if (!r.ok) return { ok: false, erro: `${mapa.get(it.produtoId)?.nome}: ${r.erro}` };
  }

  // 2) Financeiro. Se for cartão, desconta a taxa da maquininha e lança o
  //    LÍQUIDO (o que realmente entra). À vista → caixa; a prazo → a receber.
  let valorFin = total;
  let obsTaxa = "";
  if (CARTAO.has(payload.forma) && payload.maquininhaId) {
    const bps = await taxaMaquininha(payload.maquininhaId, payload.forma, payload.parcelas ?? 1);
    valorFin = liquido(total, bps);
    obsTaxa = ` (líquido, taxa ${(bps / 100).toFixed(2).replace(".", ",")}%)`;
  }

  let contaId: number | null = null;
  let taxaBps = 0;
  if (CARTAO.has(payload.forma) && payload.maquininhaId) {
    taxaBps = await taxaMaquininha(payload.maquininhaId, payload.forma, payload.parcelas ?? 1);
  }
  if (A_PRAZO.has(payload.forma)) {
    const venc = new Date();
    venc.setDate(venc.getDate() + 30);
    const conta = await db.conta.create({
      data: {
        tipo: "receber",
        descricao: doc + obsTaxa,
        valor: valorFin,
        categoria: "Venda de produtos",
        vencimento: venc,
        forma: payload.forma,
        clienteId: payload.clienteId,
      },
    });
    contaId = conta.id;
  } else {
    await db.lancamento.create({
      data: {
        tipo: "entrada",
        valor: valorFin,
        categoria: "Venda de produtos",
        descricao: doc + obsTaxa,
        forma: payload.forma,
        usuarioId: eu.id,
        usuarioNome: eu.nome,
      },
    });
  }

  // 3) CRM: registra a venda na timeline do cliente (se houver).
  if (payload.clienteId) {
    await db.interacao
      .create({
        data: {
          tipo: "loja",
          conteudo: `${doc} — ${payload.itens.length} item(ns), total ${(total / 100).toFixed(2)}`,
          clienteId: payload.clienteId,
          autorNome: eu.nome,
        },
      })
      .catch(() => {});
  }

  // 4) Registro comercial navegável da venda (para o popup de detalhe/estorno).
  let vendedorNome = eu.nome;
  if (payload.vendedorId && payload.vendedorId !== eu.id) {
    const v = await db.usuario.findUnique({ where: { id: payload.vendedorId }, select: { nome: true } });
    if (v) vendedorNome = v.nome;
  }
  await db.venda.create({
    data: {
      numero,
      clienteId: payload.clienteId,
      vendedorId: payload.vendedorId ?? eu.id,
      vendedorNome,
      subtotal,
      desconto,
      total,
      forma: payload.forma,
      maquininhaId: payload.maquininhaId ?? null,
      taxaBps,
      liquido: valorFin,
      contaId,
      itens: { create: itensVenda },
    },
  });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: "venda-pdv",
    entidade: "Venda",
    entidadeId: numero,
    depois: { total, forma: payload.forma, itens: payload.itens.length },
  });

  revalidatePath("/erp/estoque");
  revalidatePath("/erp/financeiro");
  revalidatePath("/erp");
  return { ok: true, numero, total };
}
