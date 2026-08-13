"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { Search } from "lucide-react";

import { acaoBuscarAcademy } from "@/lib/academy/aluno-acoes";
import type { ResultadoBuscaAluno } from "@/lib/academy/aluno-dados";

/**
 * Barra de busca da topbar da Academy. Antes era só um `<div>` decorativo
 * (ícone + texto estático + `⌘ K`) sem nenhum `<input>` real por trás —
 * não dava pra digitar nada. Agora é um campo de verdade, com atalho de
 * teclado (o `⌘ K` que já aparecia na tela) e resultados ao vivo via
 * Server Action, cobrindo trilha / aula / material publicados.
 */
export function AcademyBusca() {
  const [aberto, setAberto] = useState(false);
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<ResultadoBuscaAluno[]>([]);
  const [pend, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const raizRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Atalho ⌘K / Ctrl+K — o hint já existia na tela, só nunca fez nada.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAberto(true);
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setAberto(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Clique fora fecha o painel de resultados.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (raizRef.current && !raizRef.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function onChange(valor: string) {
    setTermo(valor);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (valor.trim().length < 2) {
      setResultados([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      start(async () => {
        const r = await acaoBuscarAcademy(valor);
        setResultados(r);
      });
    }, 250);
  }

  const mostrarPainel = aberto && termo.trim().length >= 2;

  return (
    <div className="academy-search" ref={raizRef}>
      <Search size={17} />
      <input
        ref={inputRef}
        type="search"
        placeholder="Buscar trilhas, aulas ou materiais"
        value={termo}
        onFocus={() => setAberto(true)}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Buscar trilhas, aulas ou materiais"
      />
      <kbd>⌘ K</kbd>

      {mostrarPainel && (
        <div className="academy-search-panel" role="listbox">
          {pend && <p className="academy-search-empty">Buscando…</p>}
          {!pend && resultados.length === 0 && (
            <p className="academy-search-empty">Nenhum resultado para &quot;{termo.trim()}&quot;.</p>
          )}
          {!pend &&
            resultados.map((r) => (
              <Link key={r.id} href={r.href} className="academy-search-item" onClick={() => setAberto(false)}>
                <span className="academy-search-item-tipo">{r.tipoLabel}</span>
                <span className="academy-search-item-titulo">{r.titulo}</span>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
