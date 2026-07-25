import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { acaoLogout } from "@/lib/admin-actions";
import { sessaoValida } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Painel Kyron",
  robots: { index: false, follow: false },
};

const NAV = [
  { label: "Produtos", href: "/admin/produtos" },
  { label: "Seminovos", href: "/admin/seminovos" },
  { label: "Serviços", href: "/admin/servicos" },
  { label: "Manual", href: "/admin/manual" },
  { label: "Clientes", href: "/admin/clientes" },
  { label: "Leads", href: "/admin/leads" },
];

export default async function PainelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!(await sessaoValida())) redirect("/admin/login");

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-[var(--kyron-hairline)] bg-kyron-graphite/[0.92] backdrop-blur-[16px]">
        <div className="container-kyron flex h-[clamp(3.25rem,7vw,3.75rem)] items-center justify-between gap-fluid-sm">
          <Link href="/admin/produtos" className="kyron-display text-fluid-sm tracking-[0.2em] text-kyron-white">
            KYR<span className="text-kyron-blue">O</span>N · admin
          </Link>
          <form action={acaoLogout}>
            <button
              type="submit"
              className="kyron-label text-fluid-2xs text-kyron-silver transition-colors hover:text-kyron-white"
            >
              Sair
            </button>
          </form>
        </div>

        {/* Nav rolável horizontalmente no celular. */}
        <nav
          aria-label="Seções do painel"
          className="kyron-scroll container-kyron flex gap-fluid-md overflow-x-auto pb-fluid-2xs"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="kyron-label whitespace-nowrap py-fluid-2xs text-fluid-2xs text-kyron-silver transition-colors hover:text-kyron-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="container-kyron py-fluid-lg">{children}</main>
    </div>
  );
}
