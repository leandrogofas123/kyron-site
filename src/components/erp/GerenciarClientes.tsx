"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { acaoExcluirCliente, acaoSalvarCliente } from "@/lib/erp/acoes-estoque";

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black px-fluid-sm py-fluid-xs text-fluid-sm text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const rotulo = "kyron-label mb-fluid-2xs block text-fluid-2xs text-kyron-silver/70";

export type ClienteLinha = {
  id: number;
  nome: string;
  telefone: string | null;
  email: string | null;
  cpf: string | null;
  cidade: string | null;
  observacoes: string | null;
};

export function GerenciarClientes({
  clientes,
  podeEditar,
}: {
  clientes: ClienteLinha[];
  podeEditar: boolean;
}) {
  const [estado, salvar, salvando] = useActionState(acaoSalvarCliente, null);
  const [editando, setEditando] = useState<ClienteLinha | null>(null);

  return (
    <div className="grid gap-fluid-xl [grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr))]">
      <div>
        <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
          Cadastrados
        </h2>
        {clientes.length === 0 ? (
          <p className="text-fluid-sm text-kyron-silver">Nenhum cliente ainda.</p>
        ) : (
          <ul className="space-y-fluid-xs">
            {clientes.map((c) => (
              <li
                key={c.id}
                className="rounded-kyron-md border border-[var(--kyron-hairline)] p-fluid-sm"
              >
                <Link
                  href={`/erp/clientes/${c.id}`}
                  className="text-fluid-sm font-semibold text-kyron-white hover:text-kyron-blue"
                >
                  {c.nome}
                </Link>
                <p className="text-fluid-2xs text-kyron-silver/60">
                  {[c.telefone, c.email, c.cidade].filter(Boolean).join(" · ") || "—"}
                </p>
                {podeEditar && (
                  <div className="mt-fluid-xs flex gap-fluid-sm text-fluid-2xs">
                    <button
                      type="button"
                      onClick={() => setEditando(c)}
                      className="text-kyron-blue hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remover ${c.nome}?`)) void acaoExcluirCliente(c.id);
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
              {editando ? "Editar cliente" : "Novo cliente"}
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
              <label htmlFor="cl-nome" className={rotulo}>Nome *</label>
              <input id="cl-nome" name="nome" defaultValue={editando?.nome} required className={campo} />
            </div>

            <div className="grid gap-fluid-sm sm:grid-cols-2">
              <div>
                <label htmlFor="cl-tel" className={rotulo}>Telefone</label>
                <input id="cl-tel" name="telefone" defaultValue={editando?.telefone ?? ""} className={campo} />
              </div>
              <div>
                <label htmlFor="cl-email" className={rotulo}>E-mail</label>
                <input id="cl-email" name="email" type="email" defaultValue={editando?.email ?? ""} className={campo} />
              </div>
              <div>
                <label htmlFor="cl-cpf" className={rotulo}>CPF</label>
                <input id="cl-cpf" name="cpf" defaultValue={editando?.cpf ?? ""} className={campo} />
              </div>
              <div>
                <label htmlFor="cl-cidade" className={rotulo}>Cidade</label>
                <input id="cl-cidade" name="cidade" defaultValue={editando?.cidade ?? ""} className={campo} />
              </div>
            </div>

            <div>
              <label htmlFor="cl-obs" className={rotulo}>Observações</label>
              <textarea id="cl-obs" name="observacoes" rows={2} defaultValue={editando?.observacoes ?? ""} className={`${campo} resize-y`} />
            </div>

            <p className="text-fluid-2xs text-kyron-silver/55">
              Dado pessoal: colete só o necessário e com o consentimento do cliente.
            </p>

            {estado?.erro && <p role="alert" className="text-fluid-sm text-kyron-blue">{estado.erro}</p>}
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
