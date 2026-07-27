"use client";

import { useActionState, useState } from "react";

import {
  acaoAlterarPapel,
  acaoAlternarAtivo,
  acaoCriarColaborador,
  acaoRedefinirSenha,
} from "@/lib/erp/actions";

export type ColaboradorLinha = {
  id: number;
  nome: string;
  email: string;
  papel: string;
  ativo: boolean;
  criadoEm: string;
};

const PAPEIS = [
  { id: "admin", label: "Administrador", ajuda: "Acesso total, inclusive a esta tela." },
  { id: "gerente", label: "Gerente", ajuda: "Produtos, estoque, notas, fornecedores e clientes." },
  { id: "vendedor", label: "Vendedor", ajuda: "Consulta produtos, movimenta estoque e atende clientes." },
  { id: "tecnico", label: "Técnico", ajuda: "Consulta produtos e movimenta estoque." },
];

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black px-fluid-sm py-fluid-xs text-fluid-sm text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const rotulo = "kyron-label mb-fluid-2xs block text-fluid-2xs text-kyron-silver/70";

export function GerenciarColaboradores({
  colaboradores,
  meuId,
}: {
  colaboradores: ColaboradorLinha[];
  meuId: number;
}) {
  const [estado, criar, criando] = useActionState(acaoCriarColaborador, null);
  const [senhaEstado, redefinir, redefinindo] = useActionState(
    acaoRedefinirSenha,
    null,
  );
  const [trocandoSenhaDe, setTrocandoSenhaDe] = useState<number | null>(null);

  return (
    <div className="grid gap-fluid-xl [grid-template-columns:repeat(auto-fit,minmax(min(100%,22rem),1fr))]">
      {/* LISTA */}
      <div>
        <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
          Pessoas com acesso
        </h2>
        <ul className="space-y-fluid-xs">
          {colaboradores.map((c) => {
            const souEu = c.id === meuId;
            return (
              <li
                key={c.id}
                className={`rounded-kyron-md border p-fluid-sm ${
                  c.ativo
                    ? "border-[var(--kyron-hairline)]"
                    : "border-[var(--kyron-hairline)] opacity-55"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-fluid-sm">
                  <div className="min-w-0">
                    <p className="truncate text-fluid-sm font-semibold text-kyron-white">
                      {c.nome}
                      {souEu && (
                        <span className="kyron-label ml-2 text-fluid-2xs text-kyron-blue">
                          você
                        </span>
                      )}
                      {!c.ativo && (
                        <span className="kyron-label ml-2 text-fluid-2xs text-kyron-silver/60">
                          desativado
                        </span>
                      )}
                    </p>
                    <p className="truncate text-fluid-2xs text-kyron-silver/60">
                      {c.email} · desde {c.criadoEm}
                    </p>
                  </div>

                  <select
                    value={c.papel}
                    disabled={souEu}
                    onChange={(e) => acaoAlterarPapel(c.id, e.target.value)}
                    aria-label={`Perfil de ${c.nome}`}
                    className="rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black px-2 py-1 text-fluid-2xs text-kyron-silver disabled:opacity-50"
                  >
                    {PAPEIS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                {!souEu && (
                  <div className="mt-fluid-xs flex flex-wrap items-center gap-fluid-sm text-fluid-2xs">
                    <button
                      type="button"
                      onClick={() => acaoAlternarAtivo(c.id, !c.ativo)}
                      className="text-kyron-silver transition-colors hover:text-kyron-white"
                    >
                      {c.ativo ? "Revogar acesso" : "Reativar"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTrocandoSenhaDe(trocandoSenhaDe === c.id ? null : c.id)
                      }
                      className="text-kyron-silver transition-colors hover:text-kyron-white"
                    >
                      Redefinir senha
                    </button>
                  </div>
                )}

                {trocandoSenhaDe === c.id && (
                  <form action={redefinir} className="mt-fluid-xs flex flex-wrap gap-2">
                    <input type="hidden" name="id" value={c.id} />
                    <input
                      name="senha"
                      type="password"
                      minLength={8}
                      required
                      placeholder="Nova senha (mín. 8)"
                      className={`${campo} flex-1`}
                    />
                    <button
                      type="submit"
                      disabled={redefinindo}
                      className="kyron-label rounded-kyron-sm bg-kyron-blue px-3 text-fluid-2xs text-white disabled:opacity-50"
                    >
                      {redefinindo ? "Salvando…" : "Salvar"}
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>

        {senhaEstado?.erro && (
          <p role="alert" className="mt-fluid-sm text-fluid-xs text-kyron-blue">
            {senhaEstado.erro}
          </p>
        )}
        {senhaEstado?.ok && (
          <p className="mt-fluid-sm text-fluid-xs text-kyron-silver">
            Senha redefinida. Entregue a nova senha à pessoa.
          </p>
        )}
      </div>

      {/* NOVO ACESSO */}
      <div>
        <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
          Conceder novo acesso
        </h2>

        <form action={criar} className="space-y-fluid-sm">
          <div>
            <label htmlFor="c-nome" className={rotulo}>
              Nome
            </label>
            <input id="c-nome" name="nome" required className={campo} />
          </div>

          <div>
            <label htmlFor="c-email" className={rotulo}>
              E-mail (login)
            </label>
            <input id="c-email" name="email" type="email" required className={campo} />
          </div>

          <div>
            <label htmlFor="c-senha" className={rotulo}>
              Senha provisória
            </label>
            <input
              id="c-senha"
              name="senha"
              type="password"
              minLength={8}
              required
              className={campo}
            />
            <p className="mt-1 text-fluid-2xs text-kyron-silver/55">
              Mínimo de 8 caracteres. Entregue à pessoa; ela usa para entrar.
            </p>
          </div>

          <div>
            <label htmlFor="c-papel" className={rotulo}>
              Perfil
            </label>
            <select id="c-papel" name="papel" defaultValue="vendedor" className={campo}>
              {PAPEIS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <ul className="mt-fluid-xs space-y-1">
              {PAPEIS.map((p) => (
                <li key={p.id} className="text-fluid-2xs text-kyron-silver/55">
                  <span className="text-kyron-silver">{p.label}:</span> {p.ajuda}
                </li>
              ))}
            </ul>
          </div>

          {estado?.erro && (
            <p role="alert" className="text-fluid-xs text-kyron-blue">
              {estado.erro}
            </p>
          )}
          {estado?.ok && (
            <p className="text-fluid-xs text-kyron-silver">Acesso criado.</p>
          )}

          <button
            type="submit"
            disabled={criando}
            className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px disabled:opacity-50"
          >
            {criando ? "Criando…" : "Conceder acesso"}
          </button>
        </form>
      </div>
    </div>
  );
}
