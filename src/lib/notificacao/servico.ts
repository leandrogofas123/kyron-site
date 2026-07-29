import "server-only";

import { logger } from "../core/logger";
import { enviarEmail, mailProvider } from "../core/providers/mail";
import { db } from "../db";
import { renderTemplate, type Vars } from "./templates";

/**
 * NotificationService — a única porta de comunicação da plataforma.
 *
 * Todo envio passa por aqui e deixa um registro em Notificacao (canal,
 * destinatário, status, erro). Antes os e-mails sumiam no provedor sem rastro;
 * agora dá para auditar o que saiu, para quem e se falhou.
 *
 * Best-effort: nunca lança para quem chamou — comunicação é efeito colateral.
 */

const DESTINO_INTERNO = process.env.NOTIFY_EMAIL ?? "leandrogofas1@gmail.com";

type Entrada = {
  canal?: string;
  para?: string;
  assunto: string;
  html: string;
  template?: string;
};

export async function notificar(entrada: Entrada): Promise<{ ok: boolean }> {
  const canal = entrada.canal ?? "email";
  const destinatario = entrada.para ?? DESTINO_INTERNO;

  let registroId: number | null = null;
  try {
    const reg = await db.notificacao.create({
      data: {
        canal,
        template: entrada.template ?? null,
        destinatario,
        assunto: entrada.assunto,
        status: "pendente",
      },
    });
    registroId = reg.id;
  } catch (erro) {
    logger.error("falha ao registrar notificação", { erro });
  }

  try {
    const r = await enviarEmail({
      para: entrada.para,
      assunto: entrada.assunto,
      html: entrada.html,
    });
    if (registroId != null) {
      await db.notificacao
        .update({
          where: { id: registroId },
          data: {
            status: r.ok ? "enviado" : "falhou",
            provider: mailProvider().nome,
            tentativas: 1,
            erro: r.ok ? null : r.motivo ?? "falha desconhecida",
          },
        })
        .catch(() => {});
    }
    return { ok: r.ok };
  } catch (erro) {
    logger.error("falha ao enviar notificação", { erro });
    if (registroId != null) {
      await db.notificacao
        .update({
          where: { id: registroId },
          data: { status: "falhou", tentativas: 1, erro: String(erro) },
        })
        .catch(() => {});
    }
    return { ok: false };
  }
}

/** Envia por um template nomeado. `para` ausente = destino interno (o dono). */
export async function enviarTemplate(
  id: string,
  para: string | undefined,
  vars: Vars,
): Promise<{ ok: boolean }> {
  const t = renderTemplate(id, vars);
  if (!t) {
    logger.error("template de notificação inexistente", { id });
    return { ok: false };
  }
  return notificar({
    canal: t.canal ?? "email",
    para,
    assunto: t.assunto,
    html: t.html,
    template: id,
  });
}

/** Histórico para a tela de notificações. */
export function listarNotificacoes(limite = 100) {
  return db.notificacao.findMany({
    orderBy: { criadoEm: "desc" },
    take: limite,
  });
}
