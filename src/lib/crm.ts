import "server-only";

import { db } from "./db";

/**
 * Regras do CRM: pontuação de leads e timeline unificada do cliente.
 *
 * Score e timeline são DERIVADOS — nenhuma automação externa, nenhum peso morto.
 * O score prioriza a fila do Kanban; a timeline junta o que já existe
 * (interações registradas + vendas/garantias do ledger de estoque) numa linha
 * do tempo só.
 */

type EntradaScore = {
  telefone?: string | null;
  email?: string | null;
  origem?: string | null;
  interesse?: string | null;
  urgencia?: string | null;
  transcricao?: string | null;
};

const URGENTE = /\b(hoje|agora|urgente|urg[êe]ncia|imediato|amanh[ãa]|essa semana|esta semana)\b/i;

/**
 * Pontua um lead de 0 a 100. Determinístico e explicável — o vendedor entende
 * por que um card está no topo. Sinais: com quem dá pra falar, quão quente é a
 * urgência, de onde veio e se já houve conversa.
 */
export function calcularScore(lead: EntradaScore): number {
  let s = 20; // base

  if (lead.telefone) s += 15; // dá pra chamar no WhatsApp
  if (lead.email) s += 10;

  if (lead.urgencia && URGENTE.test(lead.urgencia)) s += 25;
  else if (lead.urgencia?.trim()) s += 10;

  switch (lead.origem) {
    case "chat":
      s += 15; // conversou com o assistente
      break;
    case "produto":
      s += 15; // intenção num item específico
      break;
    case "servico":
      s += 10;
      break;
    default:
      break;
  }

  if (lead.interesse && lead.interesse !== "nao-definido") s += 10;
  if (lead.transcricao?.trim()) s += 10;

  return Math.max(0, Math.min(100, s));
}

/** Faixa de temperatura para exibição (cor/rótulo no Kanban). */
export function faixaScore(score: number): "quente" | "morno" | "frio" {
  if (score >= 70) return "quente";
  if (score >= 40) return "morno";
  return "frio";
}

export type EventoTimeline = {
  data: Date;
  tipo: string;
  titulo: string;
  detalhe?: string | null;
  autor?: string | null;
};

const ROTULO_INTERACAO: Record<string, string> = {
  whatsapp: "WhatsApp",
  ligacao: "Ligação",
  visita: "Visita",
  email: "E-mail",
  chat_ia: "Conversa com IA",
  loja: "Atendimento na loja",
  suporte: "Suporte",
  observacao: "Observação",
};

export function rotuloInteracao(tipo: string): string {
  return ROTULO_INTERACAO[tipo] ?? tipo;
}

/**
 * Timeline de um cliente: interações registradas + vendas e garantias do ledger,
 * fundidas e ordenadas do mais recente para o mais antigo.
 */
export async function timelineCliente(clienteId: number): Promise<EventoTimeline[]> {
  const [interacoes, movimentacoes] = await Promise.all([
    db.interacao.findMany({
      where: { clienteId },
      orderBy: { criadoEm: "desc" },
    }),
    db.movimentacaoEstoque.findMany({
      where: { clienteId },
      orderBy: { criadoEm: "desc" },
      include: { produto: { select: { nome: true, garantiaMeses: true } } },
    }),
  ]);

  const eventos: EventoTimeline[] = [];

  for (const i of interacoes) {
    eventos.push({
      data: i.criadoEm,
      tipo: i.tipo,
      titulo: rotuloInteracao(i.tipo),
      detalhe: i.conteudo,
      autor: i.autorNome,
    });
  }

  for (const m of movimentacoes) {
    if (m.tipo === "venda") {
      eventos.push({
        data: m.criadoEm,
        tipo: "venda",
        titulo: `Venda — ${m.produto.nome}`,
        detalhe: m.documento ? `Doc. ${m.documento}` : null,
      });
      const meses = m.produto.garantiaMeses ?? 0;
      if (meses > 0) {
        const ate = new Date(m.criadoEm);
        ate.setMonth(ate.getMonth() + meses);
        eventos.push({
          data: m.criadoEm,
          tipo: "garantia",
          titulo: `Garantia registrada (${meses} meses)`,
          detalhe: `Cobertura até ${ate.toLocaleDateString("pt-BR")}`,
        });
      }
    }
  }

  return eventos.sort((a, b) => b.data.getTime() - a.data.getTime());
}
