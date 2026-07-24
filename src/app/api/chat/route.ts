import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

import { KYRON_SYSTEM_PROMPT } from "@/lib/kyron/system-prompt";
import { deliverLead, leadSchema } from "@/lib/kyron/lead";
import { checkRateLimit, clientKeyFromHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-opus-4-8";
const MAX_TOOL_TURNS = 4;
const MAX_HISTORY = 24;
const MAX_CHARS_PER_MESSAGE = 4_000;

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(MAX_CHARS_PER_MESSAGE),
      }),
    )
    .min(1)
    .max(MAX_HISTORY),
  pagina: z.string().max(300).optional(),
});

const registrarContato: Anthropic.Tool = {
  name: "registrar_contato",
  description:
    "Registra o contato do visitante para que um especialista da Kyron responda. " +
    "Chame apenas quando o visitante demonstrar intenção real de conversar E você " +
    "já tiver coletado, idealmente, nome, empresa, e-mail e telefone. Registre com " +
    "o que tiver desde que haja pelo menos o nome e um canal de resposta (e-mail ou " +
    "telefone). Não chame para simplesmente encerrar a conversa.",
  input_schema: {
    type: "object",
    properties: {
      nome: { type: "string", description: "Nome do visitante." },
      email: { type: "string", description: "E-mail do visitante. Peça sempre." },
      telefone: {
        type: "string",
        description: "Telefone ou WhatsApp com DDD. Peça sempre.",
      },
      empresa: { type: "string", description: "Nome da empresa do visitante. Peça sempre." },
      interesse: {
        type: "string",
        enum: [
          "ia-aplicada",
          "automacao-integracao",
          "engenharia-de-software",
          "dados-e-decisao",
          "nao-definido",
        ],
        description: "A prática da Kyron mais próxima do problema descrito.",
      },
      resumo: {
        type: "string",
        description:
          "O problema do visitante em uma ou duas frases, com as palavras dele.",
      },
    },
    required: ["nome", "resumo"],
  },
};

function sseChunk(payload: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`);
}

/**
 * Transcreve a conversa em texto legível para anexar ao lead no HubSpot.
 * Considera só o texto do visitante e do assistente — blocos de ferramenta e
 * de raciocínio ficam de fora.
 */
function transcreverConversa(mensagens: Anthropic.MessageParam[]): string {
  const linhas: string[] = [];
  for (const m of mensagens) {
    const autor = m.role === "user" ? "Visitante" : "Assistente";
    if (typeof m.content === "string") {
      if (m.content.trim()) linhas.push(`${autor}: ${m.content.trim()}`);
      continue;
    }
    for (const bloco of m.content) {
      if (bloco.type === "text" && bloco.text.trim()) {
        linhas.push(`${autor}: ${bloco.text.trim()}`);
      }
    }
  }
  return linhas.join("\n\n");
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "Assistente indisponível no momento." },
      { status: 503 },
    );
  }

  const rate = checkRateLimit(clientKeyFromHeaders(request.headers));
  if (!rate.allowed) {
    return Response.json(
      { error: "Muitas mensagens em pouco tempo. Aguarde alguns segundos." },
      { status: 429, headers: { "retry-after": String(rate.retryAfterSeconds) } },
    );
  }

  let body: z.infer<typeof requestSchema>;
  try {
    body = requestSchema.parse(await request.json());
  } catch {
    return Response.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const client = new Anthropic();
  const userAgent = request.headers.get("user-agent") ?? undefined;

  const messages: Anthropic.MessageParam[] = body.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: unknown) => {
        try {
          controller.enqueue(sseChunk(payload));
        } catch {
          // Cliente desconectou entre o enqueue e o close — nada a fazer.
        }
      };

      try {
        for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
          const modelStream = client.messages.stream(
            {
              model: MODEL,
              max_tokens: 2_048,
              thinking: { type: "adaptive" },
              output_config: { effort: "low" },
              system: [
                {
                  type: "text",
                  text: KYRON_SYSTEM_PROMPT,
                  // O prefixo (tools + system) é idêntico em toda requisição.
                  // Observação: em Opus 4.8 o cache só ativa acima de 4096 tokens
                  // de prefixo — confira usage.cache_read_input_tokens ao medir.
                  cache_control: { type: "ephemeral" },
                },
              ],
              tools: [registrarContato],
              messages,
            },
            { signal: request.signal },
          );

          for await (const event of modelStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              send({ type: "delta", text: event.delta.text });
            }
          }

          const message = await modelStream.finalMessage();

          if (message.stop_reason === "refusal") {
            send({
              type: "delta",
              text: "Prefiro não seguir por aí. Posso te ajudar com as soluções da Kyron?",
            });
            break;
          }

          if (message.stop_reason !== "tool_use") break;

          messages.push({ role: "assistant", content: message.content });

          const toolResults: Anthropic.ToolResultBlockParam[] = [];

          for (const block of message.content) {
            if (block.type !== "tool_use") continue;

            if (block.name !== "registrar_contato") {
              toolResults.push({
                type: "tool_result",
                tool_use_id: block.id,
                content: "Ferramenta desconhecida.",
                is_error: true,
              });
              continue;
            }

            const parsed = leadSchema.safeParse(block.input);

            if (!parsed.success) {
              toolResults.push({
                type: "tool_result",
                tool_use_id: block.id,
                content:
                  "Dados incompletos ou inválidos. Peça ao visitante o que faltou, " +
                  "sem repetir o que ele já informou.",
                is_error: true,
              });
              continue;
            }

            send({ type: "tool", name: "registrar_contato" });

            const result = await deliverLead(parsed.data, {
              pagina: body.pagina,
              userAgent,
              transcricao: transcreverConversa(messages),
            });

            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: result.message,
              is_error: !result.ok,
            });
          }

          messages.push({ role: "user", content: toolResults });
        }

        send({ type: "done" });
      } catch (error) {
        if (request.signal.aborted) {
          // Navegação ou fechamento do widget. Silencioso por design.
        } else {
          console.error("[kyron:chat]", error);
          send({
            type: "error",
            message:
              "Não consegui responder agora. Tente novamente ou fale com a gente no WhatsApp.",
          });
        }
      } finally {
        try {
          controller.close();
        } catch {
          // Já fechado.
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}
