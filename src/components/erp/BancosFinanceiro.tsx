"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { acaoMovimentarBanco } from "@/lib/financeiro/acoes-banco";

type Banco = { id: number; nome: string; tipo: string; saldo: number; aReceber: number };

const brl = (c: number) => "R$ " + (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
const inp =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-2xs text-fluid-sm text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const lbl = "kyron-label mb-1 block text-fluid-2xs text-kyron-silver/60";

const TIPOS = [
  ["transferencia", "Transferência"],
  ["deposito", "Depósito"],
  ["saque", "Saque"],
  ["ajuste", "Ajuste"],
] as const;

export function BancosFinanceiro({ bancos }: { bancos: Banco[] }) {
  const [estado, action, pend] = useActionState(acaoMovimentarBanco, null);
  const [tipo, setTipo] = useState("transferencia");
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => { if (estado?.ok) ref.current?.reset(); }, [estado?.ok]);

  // Transferência e saque tiram dinheiro do banco e são imutáveis — confirmar.
  function aoEnviar(e: React.FormEvent<HTMLFormElement>) {
    if (tipo === "transferencia" || tipo === "saque") {
      const ok = window.confirm(
        "Confirmar esta movimentação? Ela é registrada como lançamento e não pode ser desfeita — só se corrige com outra movimentação.",
      );
      if (!ok) e.preventDefault();
    }
  }

  const total = bancos.reduce((s, b) => s + b.saldo, 0);

  return (
    <div className="grid gap-fluid-md xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
      {/* Saldos */}
      <div>
        <div className="mb-fluid-sm flex items-baseline justify-between">
          <h2 className="kyron-label text-fluid-2xs text-kyron-silver/70">Bancos & saldos</h2>
          <span className="text-fluid-2xs text-kyron-silver/60">Total {brl(total)}</span>
        </div>
        {bancos.length === 0 ? (
          <p className="text-fluid-2xs text-kyron-silver/60">
            Nenhum banco cadastrado. Configure em Configurações → Bancos & contas.
          </p>
        ) : (
          <ul className="grid gap-fluid-2xs sm:grid-cols-2">
            {bancos.map((b) => (
              <li key={b.id} className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-sm">
                <p className="text-fluid-sm text-kyron-white">{b.nome}</p>
                <p className="kyron-display mt-0.5 text-fluid-lg text-kyron-blue">{brl(b.saldo)}</p>
                {b.aReceber > 0 && (
                  <p className="text-fluid-2xs text-kyron-silver/60">a receber {brl(b.aReceber)}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Movimentar */}
      <form ref={ref} action={action} onSubmit={aoEnviar} className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
        <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">Movimentar</h2>
        <div className="mb-fluid-xs"><span className={lbl}>Tipo</span>
          <select name="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} className={inp}>
            {TIPOS.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
          </select>
        </div>
        <div className="mb-fluid-xs"><span className={lbl}>{tipo === "transferencia" ? "De (origem)" : "Banco"}</span>
          <select name="bancoId" className={inp}>
            {bancos.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
          </select>
        </div>
        {tipo === "transferencia" && (
          <div className="mb-fluid-xs"><span className={lbl}>Para (destino)</span>
            <select name="bancoDestinoId" className={inp}>
              {bancos.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
            </select>
          </div>
        )}
        {tipo === "ajuste" && (
          <div className="mb-fluid-xs"><span className={lbl}>Direção</span>
            <select name="direcao" className={inp}>
              <option value="entrada">Somar ao saldo</option>
              <option value="saida">Subtrair do saldo</option>
            </select>
          </div>
        )}
        <div className="mb-fluid-xs"><span className={lbl}>Valor (R$)</span>
          <input name="valor" inputMode="decimal" placeholder="0,00" className={inp} />
        </div>
        <div className="mb-fluid-xs"><span className={lbl}>Descrição (opcional)</span>
          <input name="descricao" className={inp} />
        </div>
        {estado?.erro && <p role="alert" className="text-fluid-2xs text-[var(--kyron-amber,#d9902f)]">{estado.erro}</p>}
        <button type="submit" disabled={pend || bancos.length === 0} className="kyron-label mt-fluid-sm w-full rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-2xs text-fluid-2xs text-white disabled:opacity-50">
          {pend ? "Registrando…" : "Registrar movimentação"}
        </button>
      </form>
    </div>
  );
}
