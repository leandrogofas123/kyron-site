"use client";

import { useActionState } from "react";

import { acaoEmitirCertificadoManual } from "@/lib/academy/acoes";

export function EmitirCertificadoBotao({
  usuarioId, trilhaId, jaEmitido,
}: { usuarioId: number; trilhaId: number; jaEmitido: boolean }) {
  const [estado, formAction, pendente] = useActionState(acaoEmitirCertificadoManual, null);

  if (jaEmitido) {
    return <span className="text-fluid-2xs text-emerald-400">Certificado emitido</span>;
  }

  return (
    <form action={formAction} className="flex items-center gap-fluid-2xs">
      <input type="hidden" name="usuarioId" value={usuarioId} />
      <input type="hidden" name="trilhaId" value={trilhaId} />
      <button type="submit" disabled={pendente} className="text-fluid-2xs text-kyron-blue hover:text-kyron-white disabled:opacity-50">
        {pendente ? "Emitindo…" : "Emitir certificado"}
      </button>
      {estado?.erro && <span className="text-fluid-2xs text-[var(--kyron-amber,#d9902f)]">{estado.erro}</span>}
    </form>
  );
}
