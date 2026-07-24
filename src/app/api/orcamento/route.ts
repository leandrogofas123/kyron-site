import { z } from "zod";

import { db } from "@/lib/db";
import { deliverLead } from "@/lib/kyron/lead";
import { checkRateLimit, clientKeyFromHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Formulário curto de orçamento (spec §9.3): nome, telefone, o que precisa.
 * Grava o Lead no banco (aparece no admin) E envia para o HubSpot.
 */
const orcamentoSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome.").max(120),
  telefone: z
    .string()
    .trim()
    .min(8, "Informe um telefone com DDD.")
    .max(30),
  mensagem: z.string().trim().min(5, "Conte o que você precisa.").max(2000),
  origem: z.enum(["produto", "servico", "geral"]).default("geral"),
  referenciaId: z.coerce.number().int().positive().optional(),
  // Honeypot invisível.
  site: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  const rate = checkRateLimit(`orcamento:${clientKeyFromHeaders(request.headers)}`);
  if (!rate.allowed) {
    return Response.json(
      { erro: "Muitos envios em pouco tempo. Aguarde alguns instantes." },
      { status: 429, headers: { "retry-after": String(rate.retryAfterSeconds) } },
    );
  }

  let dados: z.infer<typeof orcamentoSchema>;
  try {
    dados = orcamentoSchema.parse(await request.json());
  } catch (error) {
    const campos =
      error instanceof z.ZodError
        ? Object.fromEntries(error.issues.map((i) => [String(i.path[0] ?? "geral"), i.message]))
        : {};
    return Response.json({ erro: "Verifique os campos.", campos }, { status: 400 });
  }

  // Bot: responde sucesso e descarta em silêncio.
  if (dados.site) return Response.json({ ok: true });

  // 1. Grava no banco — fonte de verdade, aparece no admin de leads.
  try {
    await db.lead.create({
      data: {
        nome: dados.nome,
        telefone: dados.telefone,
        origem: dados.origem,
        referenciaId: dados.referenciaId ?? null,
        mensagem: dados.mensagem,
      },
    });
  } catch (erro) {
    console.error("[kyron:orcamento] falha ao gravar lead", erro);
    return Response.json(
      { erro: "Não conseguimos registrar agora. Tente novamente em instantes." },
      { status: 500 },
    );
  }

  // 2. Espelha no HubSpot (não bloqueia o sucesso se o CRM falhar).
  await deliverLead(
    {
      nome: dados.nome,
      telefone: dados.telefone,
      interesse: dados.origem === "servico" ? "automacao-integracao" : "nao-definido",
      resumo: dados.mensagem,
    },
    { pagina: "/orcamento" },
  ).catch((erro) => console.error("[kyron:orcamento] HubSpot", erro));

  return Response.json({ ok: true });
}
