import "server-only";

import { logger } from "../logger";

/**
 * Provider de e-mail (core).
 *
 * A interface é o contrato; hoje a implementação é o Resend via API HTTP (sem
 * SDK). Trocar por SendGrid/SES depois é escrever outro objeto que satisfaça
 * `MailProvider` — os módulos não mudam.
 *
 * Sem RESEND_API_KEY, cai no provider de log: nada se perde, só não sai e-mail.
 */

export type Mensagem = {
  para?: string; // padrão: NOTIFY_EMAIL
  assunto: string;
  html: string;
};

export interface MailProvider {
  readonly nome: string;
  enviar(msg: Mensagem): Promise<{ ok: boolean; motivo?: string }>;
}

/** Sem domínio verificado, o Resend só entrega ao e-mail dono da conta. */
const DESTINO_PADRAO = process.env.NOTIFY_EMAIL ?? "leandrogofas1@gmail.com";
const REMETENTE = process.env.EMAIL_FROM ?? "Kyron <onboarding@resend.dev>";

const resendProvider: MailProvider = {
  nome: "resend",
  async enviar(msg) {
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: REMETENTE,
          to: [msg.para ?? DESTINO_PADRAO],
          subject: msg.assunto,
          html: msg.html,
        }),
        signal: AbortSignal.timeout(8_000),
      });
      if (!r.ok) {
        const corpo = await r.text().catch(() => "");
        logger.error("resend recusou o envio", { status: r.status, corpo });
        return { ok: false, motivo: `HTTP ${r.status}` };
      }
      return { ok: true };
    } catch (erro) {
      logger.error("falha ao enviar e-mail", { erro });
      return { ok: false, motivo: "erro de rede" };
    }
  },
};

const logProvider: MailProvider = {
  nome: "log",
  async enviar(msg) {
    logger.info("e-mail não enviado (sem RESEND_API_KEY)", {
      assunto: msg.assunto,
      para: msg.para ?? DESTINO_PADRAO,
    });
    return { ok: true };
  },
};

export function mailProvider(): MailProvider {
  return process.env.RESEND_API_KEY ? resendProvider : logProvider;
}

/** Atalho: envia sem o módulo precisar conhecer o provider. */
export function enviarEmail(msg: Mensagem) {
  return mailProvider().enviar(msg);
}

function escapar(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Linha "rótulo: valor" para o corpo do e-mail (ignora vazios). */
export function linhaEmail(rotulo: string, valor?: string | null): string {
  if (!valor?.trim()) return "";
  return `<p style="margin:4px 0"><strong>${escapar(rotulo)}:</strong> ${escapar(valor.trim())}</p>`;
}
