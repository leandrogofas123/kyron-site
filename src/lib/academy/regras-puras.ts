/**
 * Regras puras da Kyron Academy — SEM Prisma, e-mail ou qualquer efeito
 * colateral. Extraídas de progresso.ts de propósito: são a parte com
 * cobertura de teste automatizado (ver tests/academy-regras.test.mjs).
 * A lógica com banco continua só verificada manualmente — ver checklist.
 */

export const NIVEIS = [
  { nome: "Recruta", minXp: 0 },
  { nome: "Operador", minXp: 200 },
  { nome: "Especialista", minXp: 600 },
  { nome: "Hunter", minXp: 1200 },
] as const;

export function nivelPorXp(xp: number): string {
  let atual: string = NIVEIS[0].nome;
  for (const n of NIVEIS) if (xp >= n.minXp) atual = n.nome;
  return atual;
}

export const mesmoDia = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** true se `b` é exatamente o dia seguinte a `a`. */
export const diaSeguinte = (a: Date, b: Date) => {
  const prox = new Date(a);
  prox.setDate(prox.getDate() + 1);
  return mesmoDia(prox, b);
};
