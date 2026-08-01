"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import {
  acaoAlternarMaquininha,
  acaoExcluirMaquininha,
  acaoSalvarMaquininha,
} from "@/lib/pdv/acoes-maquininha";

type Maq = {
  id: number;
  nome: string;
  ativo: boolean;
  taxaDebito: number;
  taxasCredito: Record<string, number>;
  bancoId: number | null;
  prazoDias: number;
};

type BancoOpc = { id: number; nome: string };

const PARCELAS = Array.from({ length: 12 }, (_, i) => i + 1);
const bpsPct = (bps: number) => (bps ? (bps / 100).toString().replace(".", ",") : "");

const inp =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-xs py-fluid-2xs text-fluid-2xs text-kyron-white text-right focus:border-[var(--kyron-blue-line)] focus:outline-none";
const lbl = "kyron-label mb-1 block text-fluid-2xs text-kyron-silver/60";

const sel =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-2xs text-fluid-sm text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";

export function GerenciarMaquininhas({ maquininhas, bancos }: { maquininhas: Maq[]; bancos: BancoOpc[] }) {
  const [editando, setEditando] = useState<Maq | null>(null);
  const [estado, action, pend] = useActionState(acaoSalvarMaquininha, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado?.ok) { ref.current?.reset(); setEditando(null); }
  }, [estado?.ok]);

  return (
    <div className="grid gap-fluid-xl xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
      {/* lista */}
      <div>
        <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
          Maquininhas ({maquininhas.length})
        </h2>
        {maquininhas.length === 0 ? (
          <p className="text-fluid-2xs text-kyron-silver/60">
            Nenhuma cadastrada. Adicione ao lado com as taxas do seu contrato.
          </p>
        ) : (
          <ul className="space-y-fluid-2xs">
            {maquininhas.map((m) => (
              <li key={m.id} className="rounded-kyron-sm border border-[var(--kyron-hairline)] px-fluid-sm py-fluid-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-fluid-sm text-kyron-white">
                    {m.nome}
                    {!m.ativo && <span className="text-fluid-2xs text-kyron-silver/50"> · inativa</span>}
                  </span>
                  <div className="flex items-center gap-2 text-fluid-2xs">
                    <button onClick={() => setEditando(m)} className="text-kyron-silver hover:text-kyron-white">Editar</button>
                    <button onClick={() => acaoAlternarMaquininha(m.id, !m.ativo)} className="text-kyron-silver hover:text-kyron-blue">
                      {m.ativo ? "Desativar" : "Ativar"}
                    </button>
                    <button onClick={() => acaoExcluirMaquininha(m.id)} className="text-kyron-silver hover:text-[var(--kyron-amber,#d9902f)]">Excluir</button>
                  </div>
                </div>
                <p className="mt-1 text-fluid-2xs text-kyron-silver/60">
                  Débito {bpsPct(m.taxaDebito) || "0"}% · Créd. 1x {bpsPct(m.taxasCredito["1"]) || "0"}%
                  {m.taxasCredito["12"] ? ` · 12x ${bpsPct(m.taxasCredito["12"])}%` : ""}
                  {" · "}
                  {bancos.find((b) => b.id === m.bancoId)?.nome ?? "banco padrão"} · D+{m.prazoDias}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* form */}
      <form ref={ref} action={action} className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
        <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
          {editando ? `Editar ${editando.nome}` : "Nova maquininha"}
        </h2>
        {editando && <input type="hidden" name="id" value={editando.id} />}
        <div className="mb-fluid-xs">
          <span className={lbl}>Nome</span>
          <input name="nome" defaultValue={editando?.nome ?? ""} placeholder="Ex.: Stone, PagBank…"
            className="w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-2xs text-fluid-sm text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none" />
        </div>
        <label className="mb-fluid-sm flex items-center gap-fluid-2xs text-fluid-2xs text-kyron-silver">
          <input type="checkbox" name="ativo" defaultChecked={editando ? editando.ativo : true} className="h-4 w-4 accent-kyron-blue" />
          Ativa (aparece no PDV)
        </label>

        <div className="mb-fluid-xs grid grid-cols-[minmax(0,1fr)_6rem] gap-fluid-2xs">
          <div>
            <span className={lbl}>Banco de liquidação</span>
            <select key={editando?.id ?? "novo"} name="bancoId" defaultValue={editando?.bancoId ?? ""} className={sel}>
              <option value="">— usar padrão da forma —</option>
              {bancos.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
            </select>
          </div>
          <div>
            <span className={lbl}>Prazo (D+)</span>
            <input name="prazoDias" type="number" min={0} inputMode="numeric" defaultValue={editando?.prazoDias ?? 1}
              className="w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-xs py-fluid-2xs text-fluid-sm text-kyron-white text-right focus:border-[var(--kyron-blue-line)] focus:outline-none" />
          </div>
        </div>

        <span className={lbl}>Taxas (%)</span>
        <div className="grid grid-cols-3 gap-fluid-2xs">
          <label className="text-fluid-2xs text-kyron-silver/60">Débito
            <input name="debito" inputMode="decimal" defaultValue={bpsPct(editando?.taxaDebito ?? 0)} className={inp} />
          </label>
          {PARCELAS.map((p) => (
            <label key={p} className="text-fluid-2xs text-kyron-silver/60">{p}x
              <input name={`credito_${p}`} inputMode="decimal" defaultValue={bpsPct(editando?.taxasCredito[String(p)] ?? 0)} className={inp} />
            </label>
          ))}
        </div>

        {estado?.erro && <p role="alert" className="mt-fluid-xs text-fluid-2xs text-[var(--kyron-amber,#d9902f)]">{estado.erro}</p>}
        <div className="mt-fluid-md flex gap-fluid-2xs">
          <button type="submit" disabled={pend} className="kyron-label flex-1 rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-2xs text-fluid-2xs text-white disabled:opacity-50">
            {pend ? "Salvando…" : editando ? "Salvar alterações" : "Adicionar"}
          </button>
          {editando && (
            <button type="button" onClick={() => setEditando(null)} className="kyron-label rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-sm py-fluid-2xs text-fluid-2xs text-kyron-silver">
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
