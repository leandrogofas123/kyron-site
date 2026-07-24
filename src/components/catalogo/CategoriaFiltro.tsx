import Link from "next/link";

type Categoria = { slug: string; nome: string };

/** Filtro por categoria em "chips". O ativo fica azul. */
export function CategoriaFiltro({
  categorias,
  ativa,
  base = "/produtos",
}: {
  categorias: Categoria[];
  ativa?: string;
  base?: string;
}) {
  const chip = (href: string, label: string, selecionado: boolean) => (
    <Link
      href={href}
      className={`kyron-label rounded-full border px-fluid-sm py-fluid-2xs text-fluid-2xs transition-colors duration-300 ${
        selecionado
          ? "border-[var(--kyron-blue-line)] bg-[var(--kyron-blue-soft)] text-kyron-blue"
          : "border-[var(--kyron-hairline-strong)] text-kyron-silver hover:border-[var(--kyron-blue-line)] hover:text-kyron-white"
      }`}
      aria-current={selecionado ? "true" : undefined}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex flex-wrap gap-fluid-xs">
      {chip(base, "Tudo", !ativa)}
      {categorias.map((c) => chip(`${base}?categoria=${c.slug}`, c.nome, ativa === c.slug))}
    </div>
  );
}
