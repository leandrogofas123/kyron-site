/**
 * Ciclo de status da Ordem de Serviço (módulo Orders).
 *
 * Fica separado de os.ts (que é server-only, com consultas ao banco) porque
 * estes são valores PUROS — usados também no client (ControleOS).
 */

export const STATUS_OS = [
  { id: "recebida", rotulo: "Recebida" },
  { id: "em_analise", rotulo: "Em análise" },
  { id: "aguardando_aprovacao", rotulo: "Aguardando aprovação" },
  { id: "aguardando_pecas", rotulo: "Aguardando peças" },
  { id: "em_manutencao", rotulo: "Em manutenção" },
  { id: "em_testes", rotulo: "Em testes" },
  { id: "concluida", rotulo: "Concluída" },
  { id: "entregue", rotulo: "Entregue" },
  { id: "cancelada", rotulo: "Cancelada" },
] as const;

export type StatusOS = (typeof STATUS_OS)[number]["id"];

export const STATUS_VALIDOS: Set<string> = new Set(STATUS_OS.map((s) => s.id));

export function rotuloStatusOS(id: string): string {
  return STATUS_OS.find((s) => s.id === id)?.rotulo ?? id;
}
