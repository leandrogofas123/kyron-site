"use client";

import { useActionState, useRef, useTransition } from "react";
import { Trash2 } from "lucide-react";

import { acaoCriarPergunta, acaoCriarQuiz, acaoExcluirPergunta } from "@/lib/academy/acoes";

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black px-fluid-sm py-fluid-xs text-fluid-sm text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const rotulo = "kyron-label mb-fluid-2xs block text-fluid-2xs text-kyron-silver/60";

type Alternativa = { id: number; texto: string; correta: boolean };
type Pergunta = { id: number; enunciado: string; alternativas: Alternativa[] };
type Quiz = { id: number; notaMinima: number; tentativasDia: number; perguntas: Pergunta[] };

export function QuizEditor({ aulaId, quiz }: { aulaId: number; quiz: Quiz | null }) {
  if (!quiz) return <ConfigurarQuizForm aulaId={aulaId} />;
  return (
    <div className="space-y-fluid-sm">
      <ConfigurarQuizForm aulaId={aulaId} quiz={quiz} />
      <div className="space-y-fluid-xs">
        {quiz.perguntas.length === 0 && <p className="text-fluid-2xs text-kyron-silver/50">Nenhuma pergunta ainda.</p>}
        {quiz.perguntas.map((p) => <PerguntaLinha key={p.id} pergunta={p} aulaId={aulaId} />)}
      </div>
      <NovaPerguntaForm quizId={quiz.id} aulaId={aulaId} />
    </div>
  );
}

function ConfigurarQuizForm({ aulaId, quiz }: { aulaId: number; quiz?: Quiz }) {
  const [estado, formAction, pendente] = useActionState(acaoCriarQuiz, null);
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-fluid-sm rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black/40 p-fluid-sm">
      <input type="hidden" name="aulaId" value={aulaId} />
      <div>
        <label className={rotulo}>Nota mínima (%)</label>
        <input name="notaMinima" type="number" min={0} max={100} defaultValue={quiz?.notaMinima ?? 70} className={`${campo} w-24`} />
      </div>
      <div>
        <label className={rotulo}>Tentativas por dia</label>
        <input name="tentativasDia" type="number" min={1} defaultValue={quiz?.tentativasDia ?? 3} className={`${campo} w-24`} />
      </div>
      <button type="submit" disabled={pendente} className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-sm py-fluid-xs text-fluid-2xs text-white disabled:opacity-50">
        {pendente ? "Salvando…" : quiz ? "Atualizar quiz" : "Criar quiz"}
      </button>
      {estado?.erro && <p role="alert" className="w-full text-fluid-2xs text-[var(--kyron-amber,#d9902f)]">{estado.erro}</p>}
    </form>
  );
}

function PerguntaLinha({ pergunta, aulaId }: { pergunta: Pergunta; aulaId: number }) {
  const [pend, start] = useTransition();
  return (
    <div className="rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black/30 p-fluid-sm">
      <div className="flex items-start justify-between gap-fluid-sm">
        <p className="text-fluid-sm text-kyron-white">{pergunta.enunciado}</p>
        <button type="button" disabled={pend}
          onClick={() => { if (confirm("Excluir esta pergunta?")) start(acaoExcluirPergunta.bind(null, pergunta.id, aulaId)); }}
          className="shrink-0 text-kyron-silver/50 hover:text-[var(--kyron-amber,#d9902f)] disabled:opacity-50">
          <Trash2 size={14} />
        </button>
      </div>
      <ul className="mt-fluid-2xs space-y-1">
        {pergunta.alternativas.map((a) => (
          <li key={a.id} className={`text-fluid-2xs ${a.correta ? "text-emerald-400" : "text-kyron-silver/60"}`}>
            {a.correta ? "✓ " : "· "}{a.texto}
          </li>
        ))}
      </ul>
    </div>
  );
}

function NovaPerguntaForm({ quizId, aulaId }: { quizId: number; aulaId: number }) {
  const [estado, formAction, pendente] = useActionState(acaoCriarPergunta, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (form) => { await formAction(form); formRef.current?.reset(); }}
      className="space-y-fluid-xs rounded-kyron-sm border border-dashed border-[var(--kyron-hairline)] p-fluid-sm"
    >
      <input type="hidden" name="quizId" value={quizId} />
      <input type="hidden" name="aulaId" value={aulaId} />
      <div>
        <label className={rotulo}>Nova pergunta</label>
        <input name="enunciado" required placeholder="Enunciado da pergunta" className={campo} />
      </div>
      <div className="space-y-fluid-2xs">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-fluid-2xs">
            <input type="radio" name="correta" value={i} defaultChecked={i === 0} className="h-4 w-4 accent-kyron-blue" aria-label={`Alternativa ${i + 1} é a correta`} />
            <input name="alternativa" placeholder={`Alternativa ${i + 1}${i < 2 ? " (obrigatória)" : " (opcional)"}`} className={campo} />
          </div>
        ))}
      </div>
      {estado?.erro && <p role="alert" className="text-fluid-2xs text-[var(--kyron-amber,#d9902f)]">{estado.erro}</p>}
      <button type="submit" disabled={pendente} className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-sm py-fluid-xs text-fluid-2xs text-white disabled:opacity-50">
        {pendente ? "Adicionando…" : "Adicionar pergunta"}
      </button>
    </form>
  );
}
