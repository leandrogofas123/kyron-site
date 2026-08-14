"use server";

import { revalidatePath } from "next/cache";

import { guardaAcademy } from "../auth/areas";
import { buscarConteudoAcademy, type ResultadoBuscaAluno } from "./aluno-dados";
import { concluirAula, registrarHeartbeat, responderQuiz } from "./progresso";

/**
 * Server Actions do lado do ALUNO (Kyron Academy V2). Equivalente funcional
 * ao contrato de API do doc (§5): heartbeat de vídeo, concluir aula e
 * responder quiz — aqui como Server Actions (idiomático no App Router, mesmo
 * padrão usado no resto do ERP), com o mesmo enforcement no servidor.
 */

export async function acaoHeartbeat(aulaId: number, segundos: number) {
  const usuario = await guardaAcademy();
  if (!usuario.aprovado) return { percentual: 0 };
  const r = await registrarHeartbeat(usuario.id, aulaId, segundos);
  return r ?? { percentual: 0 };
}

export async function acaoConcluirAula(aulaId: number, trilhaSlug: string) {
  const usuario = await guardaAcademy();
  if (!usuario.aprovado) return { ok: false as const, motivo: "Conta ainda não aprovada." };
  const r = await concluirAula(usuario.id, aulaId);
  revalidatePath(`/academy/trilhas/${trilhaSlug}`);
  revalidatePath("/academy");
  return r;
}

export async function acaoResponderQuiz(quizId: number, trilhaSlug: string, respostas: Record<number, number>) {
  const usuario = await guardaAcademy();
  if (!usuario.aprovado) return { ok: false as const, motivo: "Conta ainda não aprovada." };
  const r = await responderQuiz(usuario.id, quizId, respostas);
  revalidatePath(`/academy/trilhas/${trilhaSlug}`);
  revalidatePath("/academy");
  return r;
}

/** Busca da topbar da Academy (`AcademyBusca`) — trilha, aula e material publicados. */
export async function acaoBuscarAcademy(termo: string): Promise<ResultadoBuscaAluno[]> {
  const usuario = await guardaAcademy();
  if (!usuario.aprovado) return [];
  return buscarConteudoAcademy(termo);
}
