"use client";

import Link from "next/link";

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
    titulo: "Acess?rios",
    itens: [
      { label: "Capas e pel?culas", href: "/produtos?categoria=acessorios" },
      { label: "Carregadores e cabos", href: "/produtos?categoria=acessorios-carregadores-e-cabos" },
      { label: "Fones de ouvido", href: "/produtos?categoria=audio-fones" },
      { label: "Extras para celular", href: "/produtos?categoria=acessorios" },
    ],
  },
  {
    titulo: "Casa inteligente",
    itens: [
      { label: "Automa??o residencial", href: "/produtos?categoria=casa-inteligente" },
      { label: "C?meras Wi-Fi", href: "/produtos?categoria=casa-inteligente-cameras-wi-fi" },
      { label: "Fechaduras inteligentes", href: "/produtos?categoria=casa-inteligente-fechaduras-inteligentes" },
      { label: "Instala??o em domic?lio", href: "/servicos/instalacao-de-automacao-residencial" },
    ],
  },
  {
    titulo: "Kyron",
    itens: [
      { label: "Servi?os", href: "/servicos" },
      { label: "Manual de Instala??o", href: "/manual" },
      { label: "Sobre a Kyron", href: "/sobre" },
      { label: "Contato", href: "/contato" },
    ],
  },
] as const;

export function DepartmentDrawer({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-sm">
      <button type="button" onClick={onFechar} aria-label="Fechar departamentos" className="absolute inset-0 h-full w-full cursor-default" />
      <aside id="departamentos-kyron" role="dialog" aria-modal="true" aria-label="Departamentos" className="relative flex h-full w-[min(25rem,calc(100vw-1.25rem))] flex-col overflow-y-auto border-r border-[var(--kyron-hairline-strong)] bg-kyron-black p-fluid-md shadow-[24px_0_64px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="kyron-label text-fluid-2xs text-kyron-blue">Navega??o r?pida</p>
            <h2 className="kyron-display mt-1 text-fluid-xl text-kyron-white">Departamentos</h2>
          </div>
          <button type="button" onClick={onFechar} aria-label="Fechar departamentos" className="flex h-11 w-11 items-center justify-center rounded-kyron-sm border border-[var(--kyron-hairline)] text-kyron-silver transition-colors hover:text-kyron-white">?</button>
        </div>

        <form action="/produtos" className="mt-fluid-md flex items-center rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite focus-within:border-[var(--kyron-blue-line)]">
          <SearchIcon />
          <label htmlFor="busca-departamentos" className="sr-only">Buscar produtos</label>
          <input id="busca-departamentos" name="q" type="search" placeholder="O que voc? procura?" className="min-w-0 flex-1 bg-transparent py-3 pl-1 pr-3 text-fluid-sm text-kyron-white placeholder:text-kyron-silver/45 focus:outline-none" />
        </form>

        <nav className="mt-fluid-md space-y-fluid-md" aria-label="Categorias de produtos">
          {DEPARTAMENTOS.map((departamento) => (
            <section key={departamento.titulo}>
              <h3 className="kyron-label text-fluid-2xs text-kyron-silver/55">{departamento.titulo}</h3>
              <ul className="mt-2 space-y-1">
                {departamento.itens.map((item) => (
                  <li key={item.href + item.label}>
                    <Link href={item.href} onClick={onFechar} className="flex min-h-10 items-center rounded-kyron-sm px-2 text-fluid-sm text-kyron-silver transition-colors hover:bg-kyron-graphite hover:text-kyron-white">
                      {item.label}
                      <span aria-hidden="true" className="ml-auto text-kyron-blue">?</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </aside>
    </div>
  );
}

function SearchIcon() {
  return <svg className="ml-2 shrink-0 text-kyron-silver/55" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.7" /><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
}
