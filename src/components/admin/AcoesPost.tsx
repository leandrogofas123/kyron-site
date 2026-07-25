"use client";

import { acaoAlternarPostPublicado, acaoExcluirPost } from "@/lib/admin-actions";

export function AcoesPost({
  id,
  publicado,
}: {
  id: number;
  publicado: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-fluid-sm">
      <button
        type="button"
        onClick={() => acaoAlternarPostPublicado(id, !publicado)}
        className="text-fluid-2xs text-kyron-silver transition-colors hover:text-kyron-white"
      >
        {publicado ? "Despublicar" : "Publicar"}
      </button>
      <button
        type="button"
        onClick={() => {
          if (confirm("Excluir este post? Não dá para desfazer.")) {
            void acaoExcluirPost(id);
          }
        }}
        className="text-fluid-2xs text-kyron-silver/60 transition-colors hover:text-kyron-blue"
      >
        Excluir
      </button>
    </div>
  );
}
