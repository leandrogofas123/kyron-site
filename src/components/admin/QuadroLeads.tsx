"use client";

import { useState } from "react";

import { acaoStatusLead } from "@/lib/admin-actions";

export type LeadKanban = {
  id: number;
  nome: string;
  telefone: string | null;
  email: string | null;
  origem: string;
  interesse: string | null;
  mensagem: string | null;
  criadoEm: string;
  status: string;
};

const COLUNAS = [
  { id: "novo", label: "Novo" },
  { id: "respondido", label: "Respondido" },
  { id: "vendido", label: "Vendido" },
  { id: "perdido", label: "Perdido" },
] as const;

function linkWhats(tel: string | null): string | null {
  if (!tel) return null;
  const n = tel.replace(/\D/g, "");
  if (n.length < 10) return null;
  return `https://wa.me/55${n.replace(/^55/, "")}`;
}

export function QuadroLeads({ leads: iniciais }: { leads: LeadKanban[] }) {
  const [leads, setLeads] = useState(iniciais);
  const [arrastando, setArrastando] = useState<number | null>(null);
  const [sobre, setSobre] = useState<string | null>(null);

  function mover(id: number, status: string) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    void acaoStatusLead(id, status);
  }

  return (
    <div className="grid gap-fluid-sm md:grid-cols-2 xl:grid-cols-4">
      {COLUNAS.map((col) => {
        const cards = leads.filter((l) => l.status === col.id);
        return (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault();
              setSobre(col.id);
            }}
            onDragLeave={() => setSobre((s) => (s === col.id ? null : s))}
            onDrop={() => {
              if (arrastando != null) mover(arrastando, col.id);
              setArrastando(null);
              setSobre(null);
            }}
            className={`flex flex-col gap-fluid-xs rounded-kyron-md border p-fluid-sm transition-colors ${
              sobre === col.id
                ? "border-[var(--kyron-blue-line)] bg-kyron-blue/5"
                : "border-[var(--kyron-hairline)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="kyron-label text-fluid-2xs text-kyron-silver/70">
                {col.label}
              </h2>
              <span className="text-fluid-2xs text-kyron-silver/50">
                {cards.length}
              </span>
            </div>

            {cards.length === 0 ? (
              <p className="py-fluid-sm text-center text-fluid-2xs text-kyron-silver/30">
                —
              </p>
            ) : (
              cards.map((l) => {
                const wa = linkWhats(l.telefone);
                return (
                  <article
                    key={l.id}
                    draggable
                    onDragStart={() => setArrastando(l.id)}
                    onDragEnd={() => {
                      setArrastando(null);
                      setSobre(null);
                    }}
                    className="cursor-grab rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-sm active:cursor-grabbing"
                  >
                    <p className="text-fluid-sm font-semibold text-kyron-white">
                      {l.nome}
                    </p>
                    <p className="text-fluid-2xs text-kyron-silver/55">
                      {l.criadoEm} · {l.origem}
                      {l.interesse && l.interesse !== "nao-definido"
                        ? ` · ${l.interesse}`
                        : ""}
                    </p>
                    {l.mensagem && (
                      <p className="mt-1 line-clamp-3 text-fluid-2xs text-kyron-silver">
                        {l.mensagem}
                      </p>
                    )}
                    <div className="mt-fluid-xs flex flex-wrap items-center gap-2 text-fluid-2xs">
                      {wa && (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-kyron-blue hover:underline"
                        >
                          WhatsApp
                        </a>
                      )}
                      {l.email && (
                        <a
                          href={`mailto:${l.email}`}
                          className="text-kyron-blue hover:underline"
                        >
                          E-mail
                        </a>
                      )}
                      <select
                        value={l.status}
                        onChange={(e) => mover(l.id, e.target.value)}
                        aria-label="Mudar etapa do lead"
                        className="ml-auto rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black px-1.5 py-1 text-kyron-silver"
                      >
                        {COLUNAS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
}
