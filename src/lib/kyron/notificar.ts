import "server-only";

/**
 * Notificação por e-mail (best-effort, não bloqueia o fluxo).
 *
 * Usa a API HTTP do Resend (sem dependência npm). Configure:
 *   RESEND_API_KEY  — chave da API (https://resend.com)
 *   NOTIFY_EMAIL    — destino das notificações (padrão: leandrogofas@gmail.com)
 *   EMAIL_FROM      — remetente verificado (padrão: onboarding do Resend)
 *
 * Sem RESEND_API_KEY, apenas registra no log — o cadastro segue normalmente.
 */
const RESEND_URL = "https://api.resend.com/emails";

export async function notificarPorEmail(
  assunto: string,
  corpoHtml: string,
): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  // Sem domínio verificado, o Resend só ENTREGA para o e-mail dono da conta —
  // por isso o padrão é o e-mail com que a conta do Resend foi criada.
  // Ao verificar kyroncompany.com no Resend, defina EMAIL_FROM e NOTIFY_EMAIL
  // livremente.
  const para = process.env.NOTIFY_EMAIL ?? "leandrogofas1@gmail.com";
  const de = process.env.EMAIL_FROM ?? "Kyron <onboarding@resend.dev>";

  if (!key) {
    console.info("[kyron:notify] e-mail não configurado (RESEND_API_KEY):", assunto);
    return;
  }

  try {
    const r = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: de, to: [para], subject: assunto, html: corpoHtml }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!r.ok) {
      console.error("[kyron:notify] Resend falhou", r.status, await r.text().catch(() => ""));
    }
  } catch (erro) {
    console.error("[kyron:notify] erro ao enviar", erro);
  }
}

function escapar(t: string): string {
  return t
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Linha "rótulo: valor" para o corpo do e-mail (ignora vazios). */
export function linhaEmail(rotulo: string, valor?: string | null): string {
  if (!valor || !valor.trim()) return "";
  return `<p style="margin:4px 0"><strong>${escapar(rotulo)}:</strong> ${escapar(valor.trim())}</p>`;
}
