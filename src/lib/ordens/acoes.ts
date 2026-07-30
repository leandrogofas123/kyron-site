"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auditar } from "../core/audit";
import { db } from "../db";
import { exigirPermissao } from "../erp/auth";
import { parsePreco } from "../format";
import { STATUS_VALIDOS } from "./status";

type Estado = { erro?: string; ok?: boolean } | null;

/** Registra um evento na timeline do cliente (via CRM), se houver cliente. */
async function registrarNaTimeline(
  clienteId: number | null,
  autorNome: string,
  conteudo: string,
) {
  if (!clienteId) return;
  await db.interacao
    .create({ data: { tipo: "suporte", conteudo, clienteId, autorNome } })
    .catch(() => {});
}

/** Registra a comunicação no histórico de notificações (canal interno). */
async function registrarNotificacao(destinatario: string, assunto: string) {
  await db.notificacao
    .create({
      data: {
        canal: "interno",
        template: "os-status",
        destinatario,
        assunto,
        status: "enviado",
        provider: "interno",
        tentativas: 1,
      },
    })
    .catch(() => {});
}

export async function acaoCriarOS(_estado: Estado, form: FormData): Promise<Estado> {
  const eu = await exigirPermissao("estoque.movimentar");

  const clienteIdRaw = Number(form.get("clienteId"));
  const clienteId = Number.isInteger(clienteIdRaw) && clienteIdRaw > 0 ? clienteIdRaw : null;
  const clienteNome = String(form.get("clienteNome") ?? "").trim();
  const equipamento = String(form.get("equipamento") ?? "").trim();
  const defeito = String(form.get("defeito") ?? "").trim();

  if (clienteNome.length < 2) return { erro: "Informe o cliente." };
  if (equipamento.length < 2) return { erro: "Informe o equipamento." };
  if (defeito.length < 2) return { erro: "Descreva o defeito relatado." };

  const os = await db.ordemServico.create({
    data: {
      clienteId,
      clienteNome,
      equipamento,
      marca: String(form.get("marca") ?? "").trim() || null,
      modelo: String(form.get("modelo") ?? "").trim() || null,
      imei: String(form.get("imei") ?? "").trim() || null,
      serial: String(form.get("serial") ?? "").trim() || null,
      defeito,
      status: "recebida",
    },
  });

  await registrarNaTimeline(clienteId, eu.nome, `OS #${os.id} aberta — ${equipamento}: ${defeito}`);
  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: "abrir-os",
    entidade: "OrdemServico",
    entidadeId: os.id,
    depois: { equipamento, cliente: clienteNome },
  });

  revalidatePath("/erp/ordens");
  redirect(`/erp/ordens/${os.id}`);
}

/** Edita os campos técnicos da OS (diagnóstico, solução, valor, garantia, técnico). */
export async function acaoAtualizarOS(id: number, _estado: Estado, form: FormData): Promise<Estado> {
  const eu = await exigirPermissao("estoque.movimentar");

  const valorRaw = String(form.get("valor") ?? "").trim();
  const valor = valorRaw ? parsePreco(valorRaw) : null;
  const tecnicoId = Number(form.get("tecnicoId"));

  await db.ordemServico.update({
    where: { id },
    data: {
      diagnostico: String(form.get("diagnostico") ?? "").trim() || null,
      solucao: String(form.get("solucao") ?? "").trim() || null,
      valor: valor && valor > 0 ? valor : null,
      garantiaMeses: Number(form.get("garantiaMeses")) || 0,
      tecnicoId: Number.isInteger(tecnicoId) && tecnicoId > 0 ? tecnicoId : null,
      tecnicoNome: String(form.get("tecnicoNome") ?? "").trim() || null,
    },
  });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: "atualizar-os",
    entidade: "OrdemServico",
    entidadeId: id,
  });

  revalidatePath(`/erp/ordens/${id}`);
  return { ok: true };
}

/**
 * Muda o status da OS. Ao CONCLUIR, orquestra os outros módulos:
 * gera conta a receber (Financeiro), registra na timeline (CRM) e no histórico
 * (Notification). Ao ENTREGAR, ativa a garantia. Tudo via serviços, idempotente.
 */
export async function acaoStatusOS(id: number, status: string): Promise<Estado> {
  const eu = await exigirPermissao("estoque.movimentar");
  if (!STATUS_VALIDOS.has(status)) return { erro: "Status inválido." };

  const os = await db.ordemServico.findUnique({ where: { id } });
  if (!os) return { erro: "OS não encontrada." };

  const dados: Record<string, unknown> = { status };

  // Concluída: gera a conta a receber (uma vez) e registra nos módulos.
  if (status === "concluida" && os.status !== "concluida") {
    dados.concluidaEm = new Date();
    if (os.valor && os.valor > 0 && !os.contaId) {
      const venc = new Date();
      venc.setDate(venc.getDate() + 7);
      const conta = await db.conta.create({
        data: {
          tipo: "receber",
          descricao: `OS #${os.id} — ${os.equipamento} (${os.clienteNome})`,
          valor: os.valor,
          categoria: "Assistência técnica",
          vencimento: venc,
          clienteId: os.clienteId,
        },
      });
      dados.contaId = conta.id;
    }
    await registrarNaTimeline(os.clienteId, eu.nome, `OS #${os.id} concluída — ${os.equipamento}`);
    await registrarNotificacao(os.clienteNome, `OS #${os.id} concluída`);
  }

  if (status === "entregue" && os.status !== "entregue") {
    dados.entregueEm = new Date();
    await registrarNaTimeline(
      os.clienteId,
      eu.nome,
      `OS #${os.id} entregue${os.garantiaMeses ? ` — garantia de ${os.garantiaMeses} meses` : ""}`,
    );
    await registrarNotificacao(os.clienteNome, `OS #${os.id} pronta para retirada/entrega`);
  }

  await db.ordemServico.update({ where: { id }, data: dados });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: "status-os",
    entidade: "OrdemServico",
    entidadeId: id,
    antes: { status: os.status },
    depois: { status },
  });

  revalidatePath(`/erp/ordens/${id}`);
  revalidatePath("/erp/ordens");
  return { ok: true };
}
