import { z } from "zod";

import { db } from "../db";
import { calcularScore } from "../crm";
import { logger } from "../core/logger";
import { linhaEmail, notificarPorEmail } from "./notificar";

/**
 * Contato capturado pelo agente ou pelo formulário de orçamento.
 *
 * Fica no BANCO (aba Leads do painel, com Kanban) — o HubSpot foi suspenso.
 * A cada novo lead, um e-mail avisa o dono.
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

const ROTULO_INTERESSE: Record<string, string> = {
  apple: "Apple (novos)",
  seminovos: "iPhone seminovos",
  "casa-inteligente": "Casa inteligente / automação",
  "audio-acessorios": "Áudio e acessórios",
  "assistencia-tecnica": "Assistência técnica",
  "servico-instalacao": "Serviço / instalação",
  "nao-definido": "Não definido",
};

/**
 * Grava o lead no banco (vira card do Kanban) e dispara o e-mail de aviso.
 */
export async function deliverLead(
  lead: Lead,
  contexto: {
    origem?: string;
    referenciaId?: number;
    pagina?: string;
    userAgent?: string;
    transcricao?: string;
  } = {},
): Promise<LeadResult> {
  if (!lead.email && !lead.telefone) {
    return {
      ok: false,
      message:
        "Falta um canal de resposta. Peça o WhatsApp ou o e-mail antes de registrar.",
    };
  }

  try {
    const origem = contexto.origem ?? "chat";
    const score = calcularScore({
      telefone: lead.telefone,
      email: lead.email,
      origem,
      interesse: lead.interesse,
      urgencia: lead.urgencia,
      transcricao: contexto.transcricao,
    });
    const novoLead = await db.lead.create({
      data: {
        nome: lead.nome,
        telefone: lead.telefone ?? null,
        email: lead.email ?? null,
        origem,
        referenciaId: contexto.referenciaId ?? null,
        interesse: lead.interesse,
        urgencia: lead.urgencia ?? null,
        perfil: lead.perfil ?? null,
        mensagem: lead.resumo,
        transcricao: contexto.transcricao ?? null,
        score,
      },
    });

    // Integração AI→CRM: a conversa vira o primeiro evento da timeline do lead.
    if (origem === "chat") {
      await db.interacao.create({
        data: {
          tipo: "chat_ia",
          conteudo: lead.resumo,
          leadId: novoLead.id,
          autorNome: "Assistente Kyron",
        },
      });
    }
  } catch (erro) {
    logger.error("falha ao gravar lead", { erro });
    return {
      ok: false,
      message:
        "Não consegui registrar agora. Ofereça o WhatsApp como alternativa e não peça os dados de novo.",
    };
  }

  // E-mail de aviso — best effort, não bloqueia.
  void notificarPorEmail(
    `Novo lead: ${lead.nome}`,
    [
      "<h2>Novo lead pelo site</h2>",
      linhaEmail("Nome", lead.nome),
      linhaEmail("WhatsApp/telefone", lead.telefone),
      linhaEmail("E-mail", lead.email),
      linhaEmail("Interesse", ROTULO_INTERESSE[lead.interesse] ?? lead.interesse),
      linhaEmail("Urgência", lead.urgencia),
      linhaEmail("Perfil", lead.perfil),
      linhaEmail("Necessidade", lead.resumo),
      linhaEmail("Origem", contexto.origem),
    ]
      .filter(Boolean)
      .join(""),
  );

  return {
    ok: true,
    message: "Contato registrado. Um especialista responde em até 1 dia útil.",
  };
}
