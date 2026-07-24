"use client";

import { useId, useState } from "react";

import { registrarEvento } from "@/components/site/Analytics";

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-xs text-fluid-base text-kyron-white placeholder:text-kyron-silver/40 focus:border-[var(--kyron-blue-line)] focus:outline-none";

export function FormularioOrcamento({
  origem = "geral",
  referenciaId,
  mensagemInicial = "",
}: {
  origem?: "produto" | "servico" | "geral";
  referenciaId?: number;
  mensagemInicial?: string;
}) {
  const id = useId();
  const [estado, setEstado] = useState<"parado" | "enviando" | "enviado">("parado");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEstado("enviando");
    setErros({});
    setErroGeral(null);

    const form = new FormData(e.currentTarget);
    const corpo = {
      nome: form.get("nome"),
      telefone: form.get("telefone"),
      mensagem: form.get("mensagem"),
      origem,
      referenciaId,
      site: form.get("site") ?? "",
    };

    try {
      const r = await fetch("/api/orcamento", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(corpo),
      });
      const dados = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErros(dados.campos ?? {});
        setErroGeral(dados.campos ? null : (dados.erro ?? "Não foi possível enviar."));
        setEstado("parado");
        return;
      }
      registrarEvento("orcamento_enviado", { origem });
      setEstado("enviado");
    } catch {
      setErroGeral("Falha de conexão. Tente novamente.");
      setEstado("parado");
    }
  }

  if (estado === "enviado") {
    return (
      <div role="status" className="rounded-kyron-md border-l-2 border-kyron-blue bg-kyron-graphite p-fluid-md">
        <h2 className="kyron-display text-fluid-lg text-kyron-white">Pedido enviado.</h2>
        <p className="mt-fluid-xs text-fluid-base text-kyron-silver">
          Recebemos seu pedido e respondemos em breve, no horário comercial.
          Quer adiantar? Chame a gente no WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-fluid-sm">
      {erroGeral && (
        <p role="alert" className="rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-sm py-fluid-xs text-fluid-sm text-kyron-silver">
          {erroGeral}
        </p>
      )}

      <div>
        <label htmlFor={`${id}-nome`} className="kyron-label mb-fluid-2xs block text-fluid-2xs text-kyron-silver/70">
          Nome
        </label>
        <input id={`${id}-nome`} name="nome" type="text" autoComplete="name" required className={campo}
          aria-invalid={!!erros.nome} aria-describedby={erros.nome ? `${id}-nome-e` : undefined} />
        {erros.nome && <p id={`${id}-nome-e`} role="alert" className="mt-1 text-fluid-xs text-kyron-blue">{erros.nome}</p>}
      </div>

      <div>
        <label htmlFor={`${id}-tel`} className="kyron-label mb-fluid-2xs block text-fluid-2xs text-kyron-silver/70">
          Telefone / WhatsApp
        </label>
        <input id={`${id}-tel`} name="telefone" type="tel" autoComplete="tel" required className={campo}
          placeholder="(51) 9 9999-9999" aria-invalid={!!erros.telefone} aria-describedby={erros.telefone ? `${id}-tel-e` : undefined} />
        {erros.telefone && <p id={`${id}-tel-e`} role="alert" className="mt-1 text-fluid-xs text-kyron-blue">{erros.telefone}</p>}
      </div>

      <div>
        <label htmlFor={`${id}-msg`} className="kyron-label mb-fluid-2xs block text-fluid-2xs text-kyron-silver/70">
          O que você precisa?
        </label>
        <textarea id={`${id}-msg`} name="mensagem" rows={4} required defaultValue={mensagemInicial}
          className={`${campo} resize-y`} aria-invalid={!!erros.mensagem} aria-describedby={erros.mensagem ? `${id}-msg-e` : undefined} />
        {erros.mensagem && <p id={`${id}-msg-e`} role="alert" className="mt-1 text-fluid-xs text-kyron-blue">{erros.mensagem}</p>}
      </div>

      {/* Honeypot */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${id}-site`}>Não preencha</label>
        <input id={`${id}-site`} name="site" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" disabled={estado === "enviando"}
        className="kyron-label w-full rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(30,107,255,0.28)] disabled:opacity-50 sm:w-auto">
        {estado === "enviando" ? "Enviando…" : "Pedir orçamento"}
      </button>

      <p className="text-fluid-xs text-kyron-silver/55">
        Sem compromisso. Respondemos no horário comercial.
      </p>
    </form>
  );
}
