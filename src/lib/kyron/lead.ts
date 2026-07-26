import { z } from "zod";

import { enviarLeadHubSpot, hubspotConfigurado } from "./hubspot";

/**
 * Contato capturado pelo agente durante a conversa.
 *
 * Deliberadamente NÃO existem campos para CPF, CNPJ, dados bancários ou
 * qualquer credencial. O agente também está instruído a recusar esses dados.
 */
export const leadSchema = z.object({
  nome: z.string().min(2).max(120),
  email: z.string().email().max(160).optional(),
  telefone: z.string().min(8).max(30).optional(),
  empresa: z.string().max(160).optional(),
  interesse: z
    .enum([
      "apple",
      "seminovos",
      "casa-inteligente",
      "audio-acessorios",
      "assistencia-tecnica",
      "servico-instalacao",
      "nao-definido",
    ])
    .default("nao-definido"),
  urgencia: z.string().max(120).optional(),
  perfil: z.string().max(160).optional(),
  resumo: z
    .string()
    .max(1200)
    .describe("A necessidade do visitante, em uma ou duas frases."),
});

export type Lead = z.infer<typeof leadSchema>;

export type LeadResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

/**
 * Entrega o lead. Sem webhook configurado, apenas registra no log do servidor —
 * o agente segue funcionando, o contato não se perde silenciosamente.
 */
export async function deliverLead(
  lead: Lead,
  origem: { pagina?: string; userAgent?: string; transcricao?: string },
): Promise<LeadResult> {
  if (!lead.email && !lead.telefone) {
    return {
      ok: false,
      message:
        "Falta um canal de resposta. Peça o e-mail corporativo ou o telefone antes de registrar.",
    };
  }

  const payload = {
    ...lead,
    origem: "chat-site",
    pagina: origem.pagina ?? null,
    userAgent: origem.userAgent ?? null,
    registradoEm: new Date().toISOString(),
  };

  // Destino principal: HubSpot. O contato vira lead e a conversa fica anexada
  // como nota. Quem responde revê tudo dentro do CRM.
  if (hubspotConfigurado()) {
    const resultado = await enviarLeadHubSpot(lead, origem.transcricao);
    if (resultado.ok) {
      return {
        ok: true,
        message:
          "Contato registrado. Um especialista responde em até 1 dia útil.",
      };
    }
    // HubSpot falhou: cai para o webhook/log abaixo em vez de perder o lead.
    console.error("[kyron:lead] HubSpot falhou, usando fallback:", resultado.motivo);
  }

  const webhook = process.env.KYRON_LEAD_WEBHOOK_URL;

  if (!webhook) {
    console.info("[kyron:lead] registrando no log", payload);
    return {
      ok: true,
      message: "Contato registrado. Um especialista responde em até 1 dia útil.",
    };
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      console.error("[kyron:lead] webhook respondeu", response.status, payload);
      return {
        ok: false,
        message:
          "Não consegui registrar agora. Ofereça o WhatsApp como alternativa e não peça os dados de novo.",
      };
    }

    return {
      ok: true,
      message: "Contato registrado. Um especialista responde em até 1 dia útil.",
    };
  } catch (error) {
    console.error("[kyron:lead] falha ao enviar", error, payload);
    return {
      ok: false,
      message:
        "Não consegui registrar agora. Ofereça o WhatsApp como alternativa e não peça os dados de novo.",
    };
  }
}
