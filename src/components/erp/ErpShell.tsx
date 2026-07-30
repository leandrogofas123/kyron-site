"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { acaoSairErp } from "@/lib/erp/actions";

type Item = { label: string; href: string; icone: string };

/** Ícones de linha (stroke). Um por seção do ERP. */
const I: Record<string, ReactNode> = {
  dashboard: <><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></>,
  pdv: <path d="M13 2 3 14h7l-1 8 10-12h-7z" />,
  analytics: <><path d="M3 3v18h18" /><path d="M7 14l4-4 3 3 5-6" /></>,
  produtos: <><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /></>,
  estoque: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
  inventario: <><path d="M9 11l3 3 5-5" /><rect x="4" y="3" width="16" height="18" rx="2" /></>,
  ordens: <path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-2.8 2.8-2.1-2.1z" />,
  notas: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h5" /></>,
  fornecedores: <><rect x="1" y="6" width="14" height="11" rx="1" /><path d="M15 9h4l3 3v5h-7z" /><circle cx="6" cy="19" r="2" /><circle cx="18" cy="19" r="2" /></>,
  clientes: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  financeiro: <><path d="M12 1v22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>,
  notificacoes: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>,
  colaboradores: <><circle cx="9" cy="8" r="3" /><path d="M3 21a6 6 0 0 1 12 0" /><path d="M16 3.5a3 3 0 0 1 0 5.8M18 21a5 5 0 0 0-3-4.6" /></>,
  integracoes: <><path d="M9 2v6M15 2v6" /><path d="M6 8h12v4a6 6 0 0 1-12 0z" /><path d="M12 18v4" /></>,
  maquininhas: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>,
  configuracoes: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 15H3a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 4.6 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 3.6V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.1a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.4 1z" /></>,
  auditoria: <><path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l3 2" /></>,
};

function Icone({ nome }: { nome: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px] shrink-0">
      {I[nome] ?? I.dashboard}
    </svg>
  );
}

export function ErpShell({
  itens,
  usuario,
  children,
}: {
  itens: Item[];
  usuario: { nome: string; papel: string };
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);

  const ehAtivo = (href: string) => (href === "/erp" ? pathname === "/erp" : pathname.startsWith(href));
  const iniciais = usuario.nome.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-dvh lg:flex">
      {/* Topbar mobile */}
      <div className="sticky top-0 z-30 flex items-center gap-fluid-sm border-b border-[var(--kyron-hairline)] bg-kyron-graphite/95 px-fluid-md py-fluid-xs backdrop-blur lg:hidden">
        <button onClick={() => setMobile(true)} aria-label="Abrir menu" className="text-kyron-silver hover:text-kyron-white">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
        </button>
        <span className="kyron-display text-fluid-sm tracking-[0.2em] text-kyron-white">
          KYR<span className="text-kyron-blue">O</span>N · ERP
        </span>
      </div>

      {/* Backdrop mobile */}
      {mobile && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobile(false)} />}

      {/* Sidebar */}
      <aside
        className={`erp-aside fixed top-0 z-50 flex h-dvh shrink-0 flex-col border-r border-[var(--kyron-hairline)] bg-kyron-graphite transition-transform duration-200 lg:sticky lg:translate-x-0 ${
          mobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-fluid-xs px-fluid-md py-fluid-md">
          <Link href="/erp" className="grid h-8 w-8 shrink-0 place-items-center rounded-kyron-sm bg-kyron-blue font-bold text-white">K</Link>
          <span className="kyron-display text-fluid-sm tracking-[0.18em] text-kyron-white">
            KYR<span className="text-kyron-blue">O</span>N
          </span>
          <button onClick={() => setMobile(false)} aria-label="Fechar menu" className="ml-auto text-kyron-silver/60 hover:text-kyron-white lg:hidden">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="kyron-scroll flex-1 space-y-0.5 overflow-y-auto px-fluid-xs pb-fluid-md">
          {itens.map((item) => {
            const ativo = ehAtivo(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobile(false)}
                className={`flex items-center gap-fluid-sm rounded-kyron-sm px-fluid-sm py-fluid-xs text-fluid-2xs transition-colors ${
                  ativo
                    ? "bg-kyron-blue/12 text-kyron-white"
                    : "text-kyron-silver hover:bg-white/[0.04] hover:text-kyron-white"
                }`}
              >
                <span className={ativo ? "text-kyron-blue" : ""}><Icone nome={item.icone} /></span>
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-fluid-xs border-t border-[var(--kyron-hairline)] px-fluid-md py-fluid-sm">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.06] text-fluid-2xs font-bold text-kyron-silver">{iniciais}</span>
          <div className="min-w-0">
            <p className="truncate text-fluid-2xs font-semibold text-kyron-white">{usuario.nome}</p>
            <p className="text-fluid-2xs text-kyron-silver/50">{usuario.papel}</p>
          </div>
          <form action={acaoSairErp} className="ml-auto">
            <button type="submit" title="Sair" className="text-kyron-silver/70 hover:text-kyron-white">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></svg>
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-fluid-lg py-fluid-lg">{children}</main>
    </div>
  );
}
