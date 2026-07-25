"use client";

import { acaoAprovarUsuario, acaoExcluirUsuario } from "@/lib/admin-actions";

export function AcoesCliente({
  id,
  aprovado,
}: {
  id: number;
  aprovado: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-fluid-sm">
      <button
        type="button"
        onClick={() => acaoAprovarUsuario(id, !aprovado)}
        className={
          aprovado
            ? "text-fluid-2xs text-kyron-silver transition-colors hover:text-kyron-white"
            : "kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-sm py-1 text-fluid-2xs text-white transition-all hover:-translate-y-px"
        }
      >
        {aprovado ? "Revogar acesso" : "Aprovar"}
      </button>
      <button
        type="button"
        onClick={() => {
          if (confirm("Excluir este cliente? Não dá para desfazer.")) {
            void acaoExcluirUsuario(id);
          }
        }}
        className="text-fluid-2xs text-kyron-silver/60 transition-colors hover:text-kyron-blue"
      >
        Excluir
      </button>
    </div>
  );
}
