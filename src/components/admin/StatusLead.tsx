"use client";

import { useState, useTransition } from "react";

import { acaoStatusLead } from "@/lib/admin-actions";

const OPCOES = [
  { v: "novo", t: "Novo" },
  { v: "respondido", t: "Respondido" },
  { v: "vendido", t: "Vendido" },
  { v: "perdido", t: "Perdido" },
];

export function StatusLead({ id, status }: { id: number; status: string }) {
  const [atual, setAtual] = useState(status);
  const [pendente, iniciar] = useTransition();

  return (
    <select
      value={atual}
      disabled={pendente}
      onChange={(e) => {
        const novo = e.target.value;
        setAtual(novo);
        iniciar(() => acaoStatusLead(id, novo));
      }}
      aria-label="Status do lead"
      className="rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-xs py-1 text-fluid-2xs text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none disabled:opacity-50"
    >
      {OPCOES.map((o) => (
        <option key={o.v} value={o.v}>
          {o.t}
        </option>
      ))}
    </select>
  );
}
