"use client";

import { useActionState } from "react";

import { acaoSalvarAula } from "@/lib/erp/aulas-actions";

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-xs text-fluid-base text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const rotulo = "kyron-label mb-fluid-2xs block text-fluid-2xs text-kyron-silver/70";

export type AulaEdit = {
  id: number;
  titulo: string;
  resumo: string | null;
  conteudo: string | null;
  youtubeId: string | null;
  restrito: boolean;
  publicado: boolean;
};

export function AulaForm({ aula }: { aula?: AulaEdit }) {
  const [estado, formAction, pendente] = useActionState(acaoSalvarAula, null);

  return (
    <form action={formAction} className="space-y-fluid-md">
      {aula && <input type="hidden" name="id" value={aula.id} />}

      <div>
        <label htmlFor="a-titulo" className={rotulo}>Título *</label>
        <input id="a-titulo" name="titulo" defaultValue={aula?.titulo} required className={campo} />
      </div>

      <div>
        <label htmlFor="a-resumo" className={rotulo}>Resumo</label>
        <input id="a-resumo" name="resumo" defaultValue={aula?.resumo ?? ""} placeholder="Uma linha que aparece no card" className={campo} />
      </div>

      <div>
        <label htmlFor="a-youtube" className={rotulo}>Vídeo do YouTube (URL ou ID)</label>
        <input id="a-youtube" name="youtube" defaultValue={aula?.youtubeId ?? ""} placeholder="https://youtu.be/… — vazio = post sem vídeo" className={campo} />
        <p className="mt-fluid-2xs text-fluid-2xs text-kyron-silver/60">
          Com vídeo, vira uma <strong>aula</strong>. Suba no YouTube como
          &quot;não listado&quot; para não aparecer publicamente lá.
        </p>
      </div>

      <div>
        <label htmlFor="a-conteudo" className={rotulo}>Conteúdo</label>
        <textarea id="a-conteudo" name="conteudo" rows={6} defaultValue={aula?.conteudo ?? ""} placeholder="Texto do post ou descrição da aula" className={`${campo} resize-y`} />
      </div>

      <div className="flex flex-wrap gap-fluid-md">
        <label className="flex items-center gap-fluid-xs text-fluid-sm text-kyron-silver">
          <input type="checkbox" name="restrito" value="on" defaultChecked={aula?.restrito} className="h-4 w-4 accent-kyron-blue" />
          Restrito (só alunos aprovados)
        </label>
        <label className="flex items-center gap-fluid-xs text-fluid-sm text-kyron-silver">
          <input type="checkbox" name="publicado" value="on" defaultChecked={aula ? aula.publicado : true} className="h-4 w-4 accent-kyron-blue" />
          Publicado
        </label>
      </div>

      {estado?.erro && <p role="alert" className="text-fluid-sm text-[var(--kyron-amber,#d9902f)]">{estado.erro}</p>}

      <button type="submit" disabled={pendente} className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px disabled:opacity-50">
        {pendente ? "Salvando…" : aula ? "Salvar alterações" : "Adicionar"}
      </button>
    </form>
  );
}
