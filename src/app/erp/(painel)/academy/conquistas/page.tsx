import type { Metadata } from "next";
import { Trophy } from "lucide-react";

import { ConquistaForm } from "@/components/erp/academy/ConquistaForm";
import { BotaoExcluirConquista } from "@/components/erp/academy/BotaoExcluirConquista";
import { acaoExcluirConquista } from "@/lib/academy/acoes";
import { getConquistasAdmin } from "@/lib/academy/dados";
import { exigirPermissao } from "@/lib/auth/service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Conquistas — Academy" };

const ROTULO_CRITERIO: Record<string, string> = {
  "primeira-aula": "aulas concluídas",
  "aulas-dia": "aulas no mesmo dia",
  streak: "dias seguidos",
  "quiz-100": "% mínima no quiz",
  "trilha-completa": "trilhas concluídas",
};

export default async function ConquistasAcademyPage() {
  await exigirPermissao("academy.conteudo.ver");
  const conquistas = await getConquistasAdmin();

  return (
    <div className="space-y-fluid-lg">
      <div>
        <p className="kyron-label text-fluid-2xs text-kyron-blue">KYRON ACADEMY</p>
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Conquistas</h1>
        <p className="mt-fluid-2xs text-fluid-sm text-kyron-silver/70">
          Concedidas automaticamente quando o critério é atingido. Não é possível excluir uma já concedida a algum aluno.
        </p>
      </div>

      <ConquistaForm />

      <div className="rounded-kyron-md border border-[var(--kyron-hairline)]">
        {conquistas.map((c) => (
          <div key={c.id} className="border-b border-[var(--kyron-hairline)] p-fluid-sm last:border-0">
            <div className="flex items-center gap-fluid-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-kyron-sm bg-kyron-black text-kyron-blue">
                {c.icone || <Trophy size={16} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-fluid-sm text-kyron-white">{c.nome}</p>
                <p className="text-fluid-2xs text-kyron-silver/50">
                  {c.descricao} · {c.criterioValor} {ROTULO_CRITERIO[c.criterioTipo] ?? c.criterioTipo} · concedida {c._count.alunos}×
                </p>
              </div>
              <BotaoExcluirConquista
                bloqueado={c._count.alunos > 0}
                onExcluir={acaoExcluirConquista.bind(null, c.id)}
              />
            </div>
            <details className="mt-fluid-xs">
              <summary className="cursor-pointer text-fluid-2xs text-kyron-blue">Editar</summary>
              <div className="mt-fluid-xs">
                <ConquistaForm conquista={c} />
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
