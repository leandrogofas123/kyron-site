import Link from "next/link";

export default function NotFound() {
  const destinos = [
    { label: "Início", href: "/" },
    { label: "Produtos", href: "/produtos" },
    { label: "iPhone seminovos", href: "/seminovos" },
    { label: "Serviços", href: "/servicos" },
    { label: "Contato", href: "/contato" },
  ];

  return (
    <section className="container-kyron flex min-h-[60vh] flex-col justify-center py-section">
      <p className="kyron-label text-fluid-2xs tracking-[0.18em] text-kyron-silver/70">
        Erro 404
      </p>

      <h1 className="kyron-display mt-fluid-sm max-w-[16ch] text-fluid-3xl text-kyron-white">
        Esta página não <span className="text-kyron-blue">existe</span>.
      </h1>

      <p className="mt-fluid-md max-w-[48ch] text-fluid-lg text-kyron-silver">
        O produto pode ter saído do catálogo ou o link estar incorreto. Veja por
        onde continuar:
      </p>

      <ul className="mt-fluid-lg flex flex-wrap gap-fluid-xs">
        {destinos.map((d) => (
          <li key={d.href}>
            <Link
              href={d.href}
              className="kyron-label inline-block rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-sm py-fluid-xs text-fluid-xs text-kyron-silver transition-colors duration-300 hover:border-[var(--kyron-blue-line)] hover:text-kyron-white"
            >
              {d.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
