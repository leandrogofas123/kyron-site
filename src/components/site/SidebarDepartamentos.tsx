"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { NAV_PRINCIPAL } from "@/lib/kyron/site";

type Item = { label: string; href: string };
type Departamento = { titulo: string; icone: string; itens: Item[] };

const DEPARTAMENTOS: Departamento[] = [
  {
    titulo: "Apple",
    icone: "apple",
    itens: [
      { label: "iPhone novos", href: "/produtos?categoria=apple-iphone-novos" },
      { label: "iPhone seminovos", href: "/seminovos" },
      { label: "iPad, Watch e AirPods", href: "/produtos?categoria=apple-ipad-watch-airpods" },
      { label: "Monte seu Kit Celular", href: "/monte-seu-kit" },
    ],
  },
  {
    titulo: "Acessórios",
    icone: "acessorios",
    itens: [
      { label: "Capas e películas", href: "/produtos?categoria=acessorios" },
      { label: "Carregadores e cabos", href: "/produtos?categoria=acessorios-carregadores-e-cabos" },
      { label: "Fones de ouvido", href: "/produtos?categoria=audio-fones" },
    ],
  },
  {
    titulo: "Casa inteligente",
    icone: "casa",
    itens: [
      { label: "Automação residencial", href: "/produtos?categoria=casa-inteligente" },
      { label: "Câmeras Wi-Fi", href: "/produtos?categoria=casa-inteligente-cameras-wi-fi" },
      { label: "Fechaduras inteligentes", href: "/produtos?categoria=casa-inteligente-fechaduras-inteligentes" },
      { label: "Instalação em domicílio", href: "/servicos/instalacao-de-automacao-residencial" },
    ],
  },
  {
    titulo: "Kyron",
    icone: "kyron",
    itens: [
      { label: "Assistência", href: "/servicos" },
      { label: "Manual de Instalação", href: "/manual" },
      { label: "Sobre a Kyron", href: "/sobre" },
      { label: "Contato", href: "/contato" },
    ],
  },
];

const ICONES: Record<string, ReactNode> = {
  apple: <path d="M16 3c-.9.05-2 .6-2.6 1.4-.6.7-1.1 1.8-.9 2.8 1 .1 2-.5 2.6-1.3.6-.7 1-1.8.9-2.9zM19 16.4c-.5 1.2-.8 1.7-1.5 2.8-1 1.5-2.3 3.3-4 3.3-1.5 0-1.9-.9-3.9-.9s-2.5.9-3.9.9c-1.7 0-3-1.7-4-3.2-2.5-3.9-2.8-8.5-1.2-10.9 1.1-1.7 2.9-2.7 4.5-2.7 1.7 0 2.7 1 4.1 1 1.3 0 2.1-1 4.1-1 1.5 0 3 .8 4.1 2.2-3.6 2-3 7.1.6 8.6z" fill="currentColor" stroke="none" />,
  acessorios: <><rect x="7" y="2" width="10" height="20" rx="3" /><path d="M11 6h2" /></>,
  casa: <><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></>,
  kyron: <path d="M13 2 3 14h7l-1 8 10-12h-7z" />,
  home: <><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></>,
};

function Icone({ nome }: { nome: string }) {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      {ICONES[nome] ?? ICONES.home}
    </svg>
  );
}

/** Altura do cabeçalho — a barra encosta logo abaixo dele. */
const TOPO = "clamp(3.5rem,6vw,4.25rem)";

export function SidebarDepartamentos({
  aberta,
  onFechar,
}: {
  aberta: boolean;
  onFechar: () => void;
}) {
  const pathname = usePathname();
  const ehAtivo = (href: string) => {
    const base = href.split("?")[0];
    if (href.includes("?")) return false; // categorias: só hover
    return pathname === base;
  };

  // Acordeão: começa tudo aberto; o usuário recolhe o que quiser.
  const [fechados, setFechados] = useState<Set<string>>(new Set());
  const alternar = (t: string) =>
    setFechados((prev) => {
      const n = new Set(prev);
      n.has(t) ? n.delete(t) : n.add(t);
      return n;
    });

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 1023px)").matches;
    if (!aberta || !mobile) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [aberta, onFechar]);

  const fecharSeMobile = () => {
    if (window.matchMedia("(max-width: 1023px)").matches) onFechar();
  };

  const linkItem = (item: Item) => {
    const ativo = ehAtivo(item.href);
    return (
      <li key={item.href + item.label}>
        <Link
          href={item.href}
          onClick={fecharSeMobile}
          aria-current={ativo ? "page" : undefined}
          className={`group flex min-h-9 items-center gap-2 rounded-kyron-sm border-l-2 px-2.5 text-fluid-sm transition-all ${
            ativo
              ? "border-kyron-blue bg-kyron-blue/12 text-kyron-white"
              : "border-transparent text-kyron-silver hover:border-[var(--kyron-blue-line)] hover:bg-kyron-graphite hover:text-kyron-white"
          }`}
        >
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" className={`shrink-0 transition-transform ${ativo ? "text-kyron-blue" : "text-kyron-silver/30 group-hover:translate-x-0.5 group-hover:text-kyron-blue"}`}>
            <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </li>
    );
  };

  return (
    <>
      {aberta && (
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar departamentos"
          className="fixed inset-0 z-30 cursor-default bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        id="departamentos-kyron"
        aria-label="Departamentos"
        aria-hidden={!aberta}
        inert={!aberta ? true : undefined}
        data-aberta={aberta ? "true" : "false"}
        className={`kyron-sidebar z-40 shrink-0 overflow-hidden border-[var(--kyron-hairline)] bg-kyron-black transition-[width,transform] duration-300 ease-in-out
          max-lg:fixed max-lg:bottom-0 max-lg:left-0 max-lg:border-r max-lg:pt-fluid-sm lg:sticky lg:border-r
          ${aberta ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"}`}
        style={{ top: TOPO, height: `calc(100dvh - ${TOPO})` }}
      >
        <div className="kyron-sidebar-conteudo h-full overflow-y-auto px-fluid-sm py-fluid-sm">
          {/* Status "tech" — loja online */}
          <div className="mb-fluid-sm flex items-center gap-2 rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite/60 px-2.5 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-kyron-blue/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-kyron-blue" />
            </span>
            <span className="kyron-label text-[0.62rem] text-kyron-silver/70">Loja online · atende agora</span>
          </div>

          <nav aria-label="Navegação do site" className="space-y-fluid-xs">
            {/* Navegação principal */}
            <section>
              <ul className="space-y-0.5">
                {NAV_PRINCIPAL.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={fecharSeMobile}
                      aria-current={ehAtivo(item.href) ? "page" : undefined}
                      className={`group flex min-h-9 items-center gap-2 rounded-kyron-sm border-l-2 px-2.5 text-fluid-sm transition-all ${
                        ehAtivo(item.href)
                          ? "border-kyron-blue bg-kyron-blue/12 text-kyron-white"
                          : "border-transparent text-kyron-white hover:border-[var(--kyron-blue-line)] hover:bg-kyron-graphite"
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* Departamentos — acordeão com ícone */}
            {DEPARTAMENTOS.map((dep) => {
              const aberto = !fechados.has(dep.titulo);
              const temAtivo = dep.itens.some((i) => ehAtivo(i.href));
              return (
                <section key={dep.titulo} className="rounded-kyron-sm">
                  <button
                    type="button"
                    onClick={() => alternar(dep.titulo)}
                    aria-expanded={aberto}
                    className="flex w-full items-center gap-2 rounded-kyron-sm px-2.5 py-1.5 text-left transition-colors hover:bg-kyron-graphite/60"
                  >
                    <span className={temAtivo || aberto ? "text-kyron-blue" : "text-kyron-silver/50"}><Icone nome={dep.icone} /></span>
                    <h3 className="kyron-label flex-1 text-fluid-2xs text-kyron-silver/70">{dep.titulo}</h3>
                    <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`shrink-0 text-kyron-silver/40 transition-transform ${aberto ? "rotate-90" : ""}`}>
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </button>
                  {aberto && <ul className="mt-0.5 space-y-0.5 pl-1.5">{dep.itens.map(linkItem)}</ul>}
                </section>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
