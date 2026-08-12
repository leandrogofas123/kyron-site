"use client";

import { useActionState, useRef } from "react";

import { acaoCriarMaterial } from "@/lib/academy/acoes";

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black px-fluid-sm py-fluid-xs text-fluid-sm text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const rotulo = "kyron-label mb-fluid-2xs block text-fluid-2xs text-kyron-silver/60";

export function MaterialForm({ trilhas }: { trilhas: Array<{ id: number; nome: string }> }) {
  const [estado, formAction, pendente] = useActionState(acaoCriarMaterial, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (form) => {
        await formAction(form);
        formRef.current?.reset();
      }}
      className="space-y-fluid-xs rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black/40 p-fluid-sm"
    >
      <div className="grid grid-cols-1 gap-fluid-xs sm:grid-cols-2">
        <div>
          <label className={rotulo}>Título *</label>
          <input name="titulo" required placeholder="Ex.: Tabela de preços 2026" className={campo} />
        </div>
        <div>
          <label className={rotulo}>Arquivo * (pdf, doc, xls, ppt, zip — até 30 MB)</label>
          <input name="arquivo" type="file" required accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip" className={campo} />
        </div>
      </div>

      <div>
        <label className={rotulo}>Vincular a uma trilha (opcional — sem vínculo, fica geral na Biblioteca)</label>
        <select name="trilhaId" defaultValue="" className={campo}>
          <option value="">Nenhuma (geral)</option>
          {trilhas.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>
      </div>

      {estado?.erro && <p role="alert" className="text-fluid-2xs text-[var(--kyron-amber,#d9902f)]">{estado.erro}</p>}
      {estado?.ok && <p className="text-fluid-2xs text-emerald-400">Material enviado.</p>}

      <button type="submit" disabled={pendente}
        className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-sm py-fluid-xs text-fluid-2xs text-white disabled:opacity-50">
        {pendente ? "Enviando…" : "Enviar material"}
      </button>
    </form>
  );
}
