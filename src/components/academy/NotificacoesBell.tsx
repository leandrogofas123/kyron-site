"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

import type { NovidadeAluno } from "@/lib/academy/aluno-dados";

/**
 * Sino de notificações da topbar. Antes era um `<button>` sem `onClick`
 * nem painel nenhum — clicar não fazia absolutamente nada. O layout já
 * buscava `getNovidadesAluno` (usado só para o número no menu lateral);
 * agora esse mesmo dado alimenta o dropdown do sino.
 */
export function NotificacoesBell({ novidades }: { novidades: NovidadeAluno[] }) {
  const [aberto, setAberto] = useState(false);
  const raizRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (raizRef.current && !raizRef.current.contains(e.target as Node)) setAberto(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className="academy-notif" ref={raizRef}>
      <button
        type="button"
        aria-label="Notificações"
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
      >
        <Bell size={18} />
        {novidades.length > 0 && <i />}
      </button>

      {aberto && (
        <div className="academy-notif-panel" role="menu">
          <p className="academy-notif-title">Novidades</p>
          {novidades.length === 0 && <p className="academy-search-empty">Nenhuma novidade por enquanto.</p>}
          {novidades.slice(0, 6).map((n) => (
            <Link key={n.id} href={n.href} className="academy-notif-item" onClick={() => setAberto(false)}>
              <span className="academy-search-item-tipo">{n.tipoLabel}</span>
              <span className="academy-search-item-titulo">{n.titulo}</span>
            </Link>
          ))}
          <Link href="/academy/novidades" className="academy-notif-ver-todas" onClick={() => setAberto(false)}>
            Ver todas as novidades →
          </Link>
        </div>
      )}
    </div>
  );
}
