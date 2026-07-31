"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import {
  acaoAlternarBanco,
  acaoExcluirBanco,
  acaoSalvarBanco,
  acaoSalvarFormaBanco,
} from "@/lib/financeiro/acoes-banco";

type Banco = { id: number; nome: string; tipo: string; ativo: boolean; ordem: number; saldo: number };
type Tipo = { id: string; rotulo: string };
type Forma = { id: string; rotulo: string };

const brl = (c: number) => "R$ " + (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
const inp =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-2xs text-fluid-sm text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const lbl = "kyron-label mb-1 block text-fluid-2xs text-kyron-silver/60";

export function GerenciarBancos({
  bancos,
  tipos,
  formas,
  mapaInicial,
}: {
  bancos: Banco[];
  tipos: Tipo[];
  formas: Forma[];
  mapaInicial: Record<string, number>;
}) {
  const [editando, setEditando] = useState<Banco | null>(null);
  const [estado, action, pend] = useActionState(acaoSalvarBanco, null);
  const ref = useRef<HTMLFormElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [mapa, setMapa] = useState<Record<string, string>>(
    Object.fromEntries(formas.map((f) => [f.id, mapaInicial[f.id] ? String(mapaInicial[f.id]) : ""])),
  );
  const rotuloTipo = (id: string) => tipos.find((t) => t.id === id)?.rotulo ?? id;

  useEffect(() => {
    if (estado?.ok) { ref.current?.reset(); setEditando(null); }
  }, [estado?.ok]);

  async function excluir(id: number) {
    const r = await acaoExcluirBanco(id);
    if (!r.ok) setMsg(r.erro ?? "Não foi possível excluir.");
  }
  async function salvarMapa() {
    const payload: Record<string, number | null> = {};
    for (const [forma, v] of Object.entries(mapa)) payload[forma] = v ? Number(v) : null;
    await acaoSalvarFormaBanco(payload);
    setMsg("Vínculos salvos.");
  }

  return (
    <div className="space-y-fluid-xl">
      <div className="grid gap-fluid-xl xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        {/* Lista */}
        <div>
          <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">Bancos ({bancos.length})</h2>
          {bancos.length === 0 ? (
            <p className="text-fluid-2xs text-kyron-silver/60">Nenhum banco. Cadastre ao lado (ex.: Caixa, PIX Sicredi, Cartão Stone).</p>
          ) : (
            <ul className="space-y-fluid-2xs">
              {bancos.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-kyron-sm border border-[var(--kyron-hairline)] px-fluid-sm py-fluid-xs">
                  <div className="min-w-0">
                    <p className="text-fluid-sm text-kyron-white">
                      {b.nome}{!b.ativo && <span className="text-fluid-2xs text-kyron-silver/50"> · inativo</span>}
                    </p>
                    <p className="text-fluid-2xs text-kyron-silver/60">{rotuloTipo(b.tipo)} · saldo {brl(b.saldo)}</p>
                  </div>
                  <div className="flex shrink-0 gap-2 text-fluid-2xs">
                    <button onClick={() => setEditando(b)} className="text-kyron-silver hover:text-kyron-white">Editar</button>
                    <button onClick={() => acaoAlternarBanco(b.id, !b.ativo)} className="text-kyron-silver hover:text-kyron-blue">{b.ativo ? "Desativar" : "Ativar"}</button>
                    <button onClick={() => excluir(b.id)} className="text-kyron-silver hover:text-[var(--kyron-amber,#d9902f)]">Excluir</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {msg && <p className="mt-fluid-sm text-fluid-2xs text-kyron-silver/70">{msg}</p>}
        </div>

        {/* Form */}
        <form ref={ref} action={action} className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
          <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">{editando ? `Editar ${editando.nome}` : "Novo banco"}</h2>
          {editando && <input type="hidden" name="id" value={editando.id} />}
          <div className="mb-fluid-xs"><span className={lbl}>Nome</span>
            <input name="nome" defaultValue={editando?.nome ?? ""} placeholder="Ex.: PIX Sicredi" className={inp} /></div>
          <div className="mb-fluid-xs"><span className={lbl}>Tipo</span>
            <select name="tipo" defaultValue={editando?.tipo ?? "conta"} className={inp}>
              {tipos.map((t) => <option key={t.id} value={t.id}>{t.rotulo}</option>)}
            </select></div>
          <div className="mb-fluid-xs grid grid-cols-2 items-end gap-fluid-xs">
            <div><span className={lbl}>Ordem</span><input name="ordem" inputMode="numeric" defaultValue={editando?.ordem ?? 0} className={inp} /></div>
            <label className="flex items-center gap-2 pb-1 text-fluid-2xs text-kyron-silver">
              <input type="checkbox" name="ativo" defaultChecked={editando ? editando.ativo : true} className="h-4 w-4 accent-kyron-blue" /> Ativo
            </label>
          </div>
          {estado?.erro && <p role="alert" className="text-fluid-2xs text-[var(--kyron-amber,#d9902f)]">{estado.erro}</p>}
          <div className="mt-fluid-sm flex gap-fluid-xs">
            <button type="submit" disabled={pend} className="kyron-label flex-1 rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-2xs text-fluid-2xs text-white disabled:opacity-50">
              {pend ? "Salvando…" : editando ? "Salvar" : "Adicionar"}
            </button>
            {editando && <button type="button" onClick={() => setEditando(null)} className="kyron-label rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-sm py-fluid-2xs text-fluid-2xs text-kyron-silver">Cancelar</button>}
          </div>
        </form>
      </div>

      {/* Mapa forma → banco */}
      <div className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
        <h2 className="kyron-label mb-fluid-2xs text-fluid-2xs text-kyron-silver/70">Forma de pagamento → banco</h2>
        <p className="mb-fluid-sm text-fluid-2xs text-kyron-silver/60">
          Define em qual banco cada forma credita. Usado nas vendas e lançamentos (a partir da Fase C).
        </p>
        <div className="grid gap-fluid-xs sm:grid-cols-2 xl:grid-cols-3">
          {formas.map((f) => (
            <label key={f.id}>
              <span className={lbl}>{f.rotulo}</span>
              <select value={mapa[f.id] ?? ""} onChange={(e) => setMapa((m) => ({ ...m, [f.id]: e.target.value }))} className={inp}>
                <option value="">— não vinculado —</option>
                {bancos.filter((b) => b.ativo).map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
              </select>
            </label>
          ))}
        </div>
        <button onClick={salvarMapa} className="kyron-label mt-fluid-md rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-2xs text-fluid-2xs text-white">Salvar vínculos</button>
      </div>
    </div>
  );
}
