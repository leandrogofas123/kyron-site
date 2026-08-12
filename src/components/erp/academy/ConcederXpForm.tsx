"use client";

import { useActionState, useRef } from "react";

import { acaoConcederConquistaAluno, acaoConcederXpAluno } from "@/lib/academy/acoes";

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black px-fluid-sm py-fluid-xs text-fluid-sm text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const rotulo = "kyron-label mb-fluid-2xs block text-fluid-2xs text-kyron-silver/60";

export function ConcederXpForm({ usuarioId }: { usuarioId: number }) {
  const [estado, formAction, pendente] = useActionState(acaoConcederXpAluno, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (form) => { await formAction(form); formRef.current?.reset(); }}
      className="flex flex-wrap items-end gap-fluid-sm"
    >
      <input type="hidden" name="usuarioId" value={usuarioId} />
      <div>
        <label className={rotulo}>XP (negativo para descontar)</label>
        <input name="xp" type="number" required placeholder="50" className={`${campo} w-28`} />
      </div>
      <div className="min-w-[10rem] flex-1">
        <label className={rotulo}>Motivo (opcional)</label>
        <input name="motivo" placeholder="Ex.: bônus por ajudar colega" className={campo} />
      </div>
      <button type="submit" disabled={pendente} className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-sm py-fluid-xs text-fluid-2xs text-white disabled:opacity-50">
        {pendente ? "Concedendo…" : "Conceder XP"}
      </button>
      {estado?.erro && <p role="alert" className="w-full text-fluid-2xs text-[var(--kyron-amber,#d9902f)]">{estado.erro}</p>}
      {estado?.ok && <p className="w-full text-fluid-2xs text-emerald-400">XP concedido.</p>}
    </form>
  );
}

export function ConcederConquistaForm({
  usuarioId, conquistas,
}: { usuarioId: number; conquistas: Array<{ id: number; nome: string }> }) {
  const [estado, formAction, pendente] = useActionState(acaoConcederConquistaAluno, null);

  if (conquistas.length === 0) return null;

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-fluid-sm">
      <input type="hidden" name="usuarioId" value={usuarioId} />
      <div className="min-w-[12rem] flex-1">
        <label className={rotulo}>Conceder badge</label>
        <select name="conquistaId" defaultValue="" required className={campo}>
          <option value="" disabled>Selecione…</option>
          {conquistas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </div>
      <button type="submit" disabled={pendente} className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-sm py-fluid-xs text-fluid-2xs text-white disabled:opacity-50">
        {pendente ? "Concedendo…" : "Conceder badge"}
      </button>
      {estado?.erro && <p role="alert" className="w-full text-fluid-2xs text-[var(--kyron-amber,#d9902f)]">{estado.erro}</p>}
      {estado?.ok && <p className="w-full text-fluid-2xs text-emerald-400">Badge concedido.</p>}
    </form>
  );
}
