"use client";

import { useActionState } from "react";

import { acaoSalvarAulaAcademy } from "@/lib/academy/acoes";

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black px-fluid-sm py-fluid-xs text-fluid-sm text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const rotulo = "kyron-label mb-fluid-2xs block text-fluid-2xs text-kyron-silver/60";

export type AulaAcademyEdit = {
  id: number;
  titulo: string;
  resumo: string | null;
  tipo: string;
  youtubeId: string | null;
  conteudoMd: string | null;
  duracaoMin: number;
  xp: number;
  restrita: boolean;
  ordem: number;
};

export function AulaAcademyForm({
  trilhaId, moduloId, aula,
}: { trilhaId: number; moduloId: number; aula?: AulaAcademyEdit }) {
  const [estado, formAction, pendente] = useActionState(acaoSalvarAulaAcademy, null);

  return (
    <form action={formAction} className="space-y-fluid-xs rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black/40 p-fluid-sm">
      <input type="hidden" name="trilhaId" value={trilhaId} />
      <input type="hidden" name="moduloId" value={moduloId} />
      {aula && <input type="hidden" name="id" value={aula.id} />}

      <div className="grid grid-cols-1 gap-fluid-xs sm:grid-cols-[1fr_7rem]">
        <div>
          <label className={rotulo}>Título *</label>
          <input name="titulo" defaultValue={aula?.titulo} required placeholder="Título da aula" className={campo} />
        </div>
        <div>
          <label className={rotulo}>Formato</label>
          <select name="tipo" defaultValue={aula?.tipo ?? "VIDEO"} className={campo}>
            <option value="VIDEO">Vídeo</option>
            <option value="TEXTO">Texto</option>
            <option value="QUIZ">Quiz</option>
            <option value="PDF">PDF</option>
          </select>
        </div>
      </div>

      <div>
        <label className={rotulo}>Resumo</label>
        <input name="resumo" defaultValue={aula?.resumo ?? ""} placeholder="Uma linha para o card" className={campo} />
      </div>

      <div>
        <label className={rotulo}>Vídeo do YouTube (URL ou ID)</label>
        <input name="youtubeId" defaultValue={aula?.youtubeId ?? ""} placeholder="https://youtu.be/… — suba como não listado" className={campo} />
      </div>

      <div>
        <label className={rotulo}>Conteúdo (markdown)</label>
        <textarea name="conteudoMd" rows={4} defaultValue={aula?.conteudoMd ?? ""} placeholder="Texto da aula, manual ou instruções" className={`${campo} resize-y`} />
      </div>

      <div className="grid grid-cols-2 gap-fluid-xs sm:grid-cols-4">
        <div>
          <label className={rotulo}>Duração (min)</label>
          <input name="duracaoMin" type="number" min={0} defaultValue={aula?.duracaoMin ?? 0} className={campo} />
        </div>
        <div>
          <label className={rotulo}>XP</label>
          <input name="xp" type="number" min={0} defaultValue={aula?.xp ?? 10} className={campo} />
        </div>
        <div>
          <label className={rotulo}>Ordem</label>
          <input name="ordem" type="number" defaultValue={aula?.ordem ?? 0} className={campo} />
        </div>
        <label className="flex items-center gap-fluid-2xs self-end pb-fluid-xs text-fluid-2xs text-kyron-silver">
          <input type="checkbox" name="restrita" defaultChecked={aula ? aula.restrita : true} className="h-4 w-4 accent-kyron-blue" />
          Restrita
        </label>
      </div>

      {estado?.erro && <p role="alert" className="text-fluid-2xs text-[var(--kyron-amber,#d9902f)]">{estado.erro}</p>}

      <button type="submit" disabled={pendente}
        className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-sm py-fluid-xs text-fluid-2xs text-white disabled:opacity-50">
        {pendente ? "Salvando…" : aula ? "Salvar aula" : "Adicionar aula"}
      </button>
    </form>
  );
}
