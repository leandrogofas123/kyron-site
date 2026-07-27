"use client";

import { useActionState, useState } from "react";

import { acaoExcluirFornecedor, acaoSalvarFornecedor } from "@/lib/erp/acoes-estoque";

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black px-fluid-sm py-fluid-xs text-fluid-sm text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const rotulo = "kyron-label mb-fluid-2xs block text-fluid-2xs text-kyron-silver/70";

export type FornecedorLinha = {
  id: number;
  nome: string;
  cnpj: string | null;
  contato: string | null;
  telefone: string | null;
  email: string | null;
  cidade: string | null;
  estado: string | null;
  observacoes: string | null;
};

export function GerenciarFornecedores({
  fornecedores,
  podeEditar,
}: {
  fornecedores: FornecedorLinha[];
  podeEditar: boolean;
}) {
  const [estado, salvar, salvando] = useActionState(acaoSalvarFornecedor, null);
  const [editando, setEditando] = useState<FornecedorLinha | null>(null);

  return (
    <div className="grid gap-fluid-xl [grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr))]">
      <div>
        <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
          Cadastrados
        </h2>
        {fornecedores.length === 0 ? (
          <p className="text-fluid-sm text-kyron-silver">Nenhum fornecedor ainda.</p>
        ) : (
          <ul className="space-y-fluid-xs">
            {fornecedores.map((f) => (
              <li
                key={f.id}
                className="rounded-kyron-md border border-[var(--kyron-hairline)] p-fluid-sm"
              >
                <p className="text-fluid-sm font-semibold text-kyron-white">{f.nome}</p>
                <p className="text-fluid-2xs text-kyron-silver/60">
                  {[f.cnpj, f.telefone, f.cidade && f.estado ? `${f.cidade}/${f.estado}` : f.cidade]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </p>
                {podeEditar && (
                  <div className="mt-fluid-xs flex gap-fluid-sm text-fluid-2xs">
                    <button
                      type="button"
                      onClick={() => setEditando(f)}
                      className="text-kyron-blue hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remover ${f.nome}?`)) void acaoExcluirFornecedor(f.id);
                      }}
                      className="text-kyron-silver/60 hover:text-kyron-blue"
                    >
                      Remover
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {podeEditar && (
        <div>
          <div className="mb-fluid-sm flex items-center justify-between">
            <h2 className="kyron-label text-fluid-2xs text-kyron-silver/70">
              {editando ? "Editar fornecedor" : "Novo fornecedor"}
            </h2>
            {editando && (
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="text-fluid-2xs text-kyron-silver/60 hover:text-kyron-silver"
              >
                + Novo
              </button>
            )}
          </div>

          <form action={salvar} key={editando?.id ?? "novo"} className="space-y-fluid-sm">
            {editando && <input type="hidden" name="id" value={editando.id} />}

            <div>
              <label htmlFor="f-nome" className={rotulo}>Nome *</label>
              <input id="f-nome" name="nome" defaultValue={editando?.nome} required className={campo} />
            </div>

            <div className="grid gap-fluid-sm sm:grid-cols-2">
              <div>
                <label htmlFor="f-cnpj" className={rotulo}>CNPJ</label>
                <input id="f-cnpj" name="cnpj" defaultValue={editando?.cnpj ?? ""} className={campo} />
              </div>
              <div>
                <label htmlFor="f-contato" className={rotulo}>Contato</label>
                <input id="f-contato" name="contato" defaultValue={editando?.contato ?? ""} className={campo} />
              </div>
              <div>
                <label htmlFor="f-telefone" className={rotulo}>Telefone</label>
                <input id="f-telefone" name="telefone" defaultValue={editando?.telefone ?? ""} className={campo} />
              </div>
              <div>
                <label htmlFor="f-email" className={rotulo}>E-mail</label>
                <input id="f-email" name="email" type="email" defaultValue={editando?.email ?? ""} className={campo} />
              </div>
              <div>
                <label htmlFor="f-cidade" className={rotulo}>Cidade</label>
                <input id="f-cidade" name="cidade" defaultValue={editando?.cidade ?? ""} className={campo} />
              </div>
              <div>
                <label htmlFor="f-estado" className={rotulo}>Estado</label>
                <input id="f-estado" name="estado" maxLength={2} defaultValue={editando?.estado ?? ""} placeholder="RS" className={campo} />
              </div>
            </div>

            <div>
              <label htmlFor="f-obs" className={rotulo}>Observações</label>
              <textarea id="f-obs" name="observacoes" rows={2} defaultValue={editando?.observacoes ?? ""} className={`${campo} resize-y`} />
            </div>

            {estado?.erro && (
              <p role="alert" className="text-fluid-sm text-kyron-blue">{estado.erro}</p>
            )}
            {estado?.ok && <p className="text-fluid-sm text-kyron-silver">Salvo.</p>}

            <button
              type="submit"
              disabled={salvando}
              className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all hover:-translate-y-px disabled:opacity-50"
            >
              {salvando ? "Salvando…" : editando ? "Salvar alterações" : "Cadastrar"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
