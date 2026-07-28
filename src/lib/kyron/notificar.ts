import "server-only";

/**
 * Notificação por e-mail.
 *
 * A implementação foi para o core (`core/providers/mail`): este arquivo agora é
 * só a porta de entrada que os módulos já usavam — trocar de provedor não
 * mexe em quem chama.
 */
import { enviarEmail, linhaEmail } from "../core/providers/mail";

export { linhaEmail };

export async function notificarPorEmail(
  assunto: string,
  corpoHtml: string,
): Promise<void> {
  await enviarEmail({ assunto, html: corpoHtml });
}
