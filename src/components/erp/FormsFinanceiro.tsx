"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { acaoCriarConta, acaoLancar } from "@/lib/financeiro/acoes";
import {
  CATEGORIAS_DESPESA,
  CATEGORIAS_RECEITA,
  FORMAS_PAGAMENTO,
} from "@/lib/financeiro/plano";

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-2xs text-fluid-2xs text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const rotulo = "kyron-label mb-1 block text-fluid-2xs text-kyron-silver/60";
const cartao =
  "rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md";
const botao =
  "kyron-label w-full rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-2xs text-fluid-2xs text-white transition-all hover:-translate-y-px disabled:opacity-50";

export function FormsFinanceiro() {
  return (
    <div className="mb-fluid-xl grid gap-fluid-md lg:grid-cols-2">
      <LancamentoForm />
      <ContaForm />
    </div>
  );
}

function LancamentoForm() {
  const [estado, action, pendente] = useActionState(acaoLancar, null);
  const ref = useRef<HTMLFormElement>(null);
  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada");

  useEffect(() => {
    if (estado?.ok) ref.current?.reset();
  }, [estado?.ok]);

  const categorias = tipo === "entrada" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;

  return (
    <form ref={ref} action={action} className={cartao}>
      <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
        Novo lançamento no caixa
      </h2>
      <div className="grid grid-cols-2 gap-fluid-xs">
        <label>
          <span className={rotulo}>Tipo</span>
          <select
            name="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as "entrada" | "saida")}
            className={campo}
          >
            <option value="entrada">Entrada (+)</option>
            <option value="saida">Saída (−)</option>
          </select>
        </label>
        <label>
          <span className={rotulo}>Valor (R$)</span>
          <input name="valor" inputMode="decimal" placeholder="0,00" className={campo} />
        </label>
        <label className="col-span-2">
          <span className={rotulo}>Descrição</span>
          <input name="descricao" className={campo} placeholder="Ex.: Venda iPhone 13" />
        </label>
        <label>
          <span className={rotulo}>Categoria</span>
          <select name="categoria" className={campo}>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={rotulo}>Forma</span>
          <select name="forma" className={campo}>
            <option value="">—</option>
            {FORMAS_PAGAMENTO.map((f) => (
              <option key={f.id} value={f.id}>
                {f.rotulo}
              </option>
            ))}
          </select>
        </label>
      </div>
      {estado?.erro && (
        <p role="alert" className="mt-fluid-xs text-fluid-2xs text-kyron-blue">
          {estado.erro}
        </p>
      )}
      <button type="submit" disabled={pendente} className={`${botao} mt-fluid-sm`}>
        {pendente ? "Registrando…" : "Registrar"}
      </button>
    </form>
  );
}

function ContaForm() {
  const [estado, action, pendente] = useActionState(acaoCriarConta, null);
  const ref = useRef<HTMLFormElement>(null);
  const [tipo, setTipo] = useState<"pagar" | "receber">("pagar");

  useEffect(() => {
    if (estado?.ok) ref.current?.reset();
  }, [estado?.ok]);

  const categorias = tipo === "receber" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;

  return (
    <form ref={ref} action={action} className={cartao}>
      <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
        Nova conta a pagar / receber
      </h2>
      <div className="grid grid-cols-2 gap-fluid-xs">
        <label>
          <span className={rotulo}>Tipo</span>
          <select
            name="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as "pagar" | "receber")}
            className={campo}
          >
            <option value="pagar">A pagar</option>
            <option value="receber">A receber</option>
          </select>
        </label>
        <label>
          <span className={rotulo}>Valor (R$)</span>
          <input name="valor" inputMode="decimal" placeholder="0,00" className={campo} />
        </label>
        <label className="col-span-2">
          <span className={rotulo}>Descrição</span>
          <input name="descricao" className={campo} placeholder="Ex.: Aluguel loja" />
        </label>
        <label>
          <span className={rotulo}>Categoria</span>
          <select name="categoria" className={campo}>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={rotulo}>Vencimento</span>
          <input name="vencimento" type="date" className={campo} />
        </label>
      </div>
      {estado?.erro && (
        <p role="alert" className="mt-fluid-xs text-fluid-2xs text-kyron-blue">
          {estado.erro}
        </p>
      )}
      <button type="submit" disabled={pendente} className={`${botao} mt-fluid-sm`}>
        {pendente ? "Salvando…" : "Criar conta"}
      </button>
    </form>
  );
}
