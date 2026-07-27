"use client";

import Link from "next/link";
import { useEffect } from "react";

const DEPARTAMENTOS = [
  {
    titulo: "Apple",
    itens: [
      { label: "iPhone novos", href: "/produtos?categoria=apple-iphone-novos" },
      { label: "iPhone seminovos", href: "/seminovos" },
      { label: "iPad, Watch e AirPods", href: "/produtos?categoria=apple-ipad-watch-airpods" },
      { label: "Monte seu Kit Celular", href: "/monte-seu-kit" },
    ],
  },
  {
    titulo: "Acessórios",
    itens: [
      { label: "Capas e películas", href: "/produtos?categoria=acessorios" },
      { label: "Carregadores e cabos", href: "/produtos?categoria=acessorios-carregadores-e-cabos" },
      { label: "Fones de ouvido", href: "/produtos?categoria=audio-fones" },
    ],
  },
  {
    titulo: "Casa inteligente",
    itens: [
      { label: "Automação residencial", href: "/produtos?categoria=casa-inteligente" },
      { label: "Câmeras Wi-Fi", href: "/produtos?categoria=casa-inteligente-cameras-wi-fi" },
      { label: "Fechaduras inteligentes", href: "/produtos?categoria=casa-inteligente-fechaduras-inteligentes" },
      { label: "Instalação em domicílio", href: "/servicos/instalacao-de-automacao-residencial" },
    ],
  },
  {
    titulo: "Kyron",
    itens: [
      { label: "Serviços", href: "/servicos" },
      { label: "Manual de Instalação", href: "/manual" },
      { label: "Sobre a Kyron", href: "/sobre" },
      { label: "Contato", href: "/contato" },
    ],
  },
] as const;

/** Altura do cabeçalho — a barra encosta logo abaixo dele. */
const TOPO = "clamp(3.5rem,6vw,4.25rem)";

export function SidebarDepartamentos({
  aberta,
  onFechar,
}: {
  aberta: boolean;
  onFechar: () => void;
}) {
  /*
   * No celular a barra abre sobreposta, então a página atrás não deve rolar.
   * No desktop ela é acoplada e a página rola normalmente. A limpeza sempre
   * devolve a rolagem — antes o travamento herdado do menu mobile ficava preso
   * e a página não rolava mais depois de abrir os Departamentos.
   */
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

  return (
    <>
      {/* Fundo escurecido — só no celular, onde a barra fica sobreposta. */}
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
        <div className="kyron-sidebar-conteudo h-full overflow-y-auto px-fluid-sm py-fluid-md">
          <div className="mb-fluid-md flex items-center justify-between gap-2">
            <p className="kyron-label text-fluid-2xs text-kyron-blue">
              Departamentos
            </p>
            <button
              type="button"
              onClick={onFechar}
              aria-label="Ocultar departamentos"
              className="flex h-9 w-9 items-center justify-center rounded-kyron-sm text-kyron-silver transition-colors hover:text-kyron-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="m6 6 12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <nav aria-label="Categorias de produtos" className="space-y-fluid-md">
            {DEPARTAMENTOS.map((departamento) => (
              <section key={departamento.titulo}>
                <h3 className="kyron-label text-fluid-2xs text-kyron-silver/55">
                  {departamento.titulo}
                </h3>
                <ul className="mt-1.5 space-y-0.5">
                  {departamento.itens.map((item) => (
                    <li key={item.href + item.label}>
                      <Link
                        href={item.href}
                        onClick={onFechar}
                        className="group flex min-h-10 items-center gap-2 rounded-kyron-sm px-2 text-fluid-sm text-kyron-silver transition-colors hover:bg-kyron-graphite hover:text-kyron-white"
                      >
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        <svg
                          aria-hidden="true"
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="shrink-0 text-kyron-silver/30 transition-transform group-hover:translate-x-0.5 group-hover:text-kyron-blue"
                        >
                          <path
                            d="m9 6 6 6-6 6"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
