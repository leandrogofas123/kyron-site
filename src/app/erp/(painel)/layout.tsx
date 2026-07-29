import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { acaoSairErp } from "@/lib/erp/actions";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ERP Kyron",
  robots: { index: false, follow: false },
};

const NAV = [
  { label: "Dashboard", href: "/erp", acao: "dashboard" },
  { label: "Produtos", href: "/erp/produtos", acao: "produtos.ver" },
  { label: "Estoque", href: "/erp/estoque", acao: "estoque.ver" },
  { label: "Inventário", href: "/erp/inventario", acao: "estoque.movimentar" },
  { label: "Notas fiscais", href: "/erp/notas", acao: "notas.ver" },
  { label: "Fornecedores", href: "/erp/fornecedores", acao: "fornecedores.ver" },
  { label: "Clientes", href: "/erp/clientes", acao: "clientes.ver" },
  { label: "Financeiro", href: "/erp/financeiro", acao: "financeiro" },
  { label: "Notificações", href: "/erp/notificacoes", acao: "clientes.ver" },
  { label: "Colaboradores", href: "/erp/colaboradores", acao: "colaboradores.ver" },
  { label: "Auditoria", href: "/erp/auditoria", acao: "auditoria.ver" },
];

const ROTULO_PAPEL: Record<string, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  vendedor: "Vendedor",
  tecnico: "Técnico",
};

export default async function ErpLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const colaborador = await colaboradorLogado();
  if (!colaborador) redirect("/erp/entrar");

  const itens = NAV.filter((i) => podeFazer(colaborador.papel, i.acao));

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-[var(--kyron-hairline)] bg-kyron-graphite/[0.94] backdrop-blur-[16px]">
        <div className="container-kyron flex h-[clamp(3.25rem,6vw,3.75rem)] items-center justify-between gap-fluid-sm">
          <Link href="/erp" className="kyron-display text-fluid-sm tracking-[0.2em] text-kyron-white">
            KYR<span className="text-kyron-blue">O</span>N · ERP
          </Link>

          <div className="flex items-center gap-fluid-sm">
            <span className="hidden text-fluid-2xs text-kyron-silver/60 sm:inline">
              {colaborador.nome} · {ROTULO_PAPEL[colaborador.papel] ?? colaborador.papel}
            </span>
            <form action={acaoSairErp}>
              <button
                type="submit"
                className="kyron-label text-fluid-2xs text-kyron-silver transition-colors hover:text-kyron-white"
              >
                Sair
              </button>
            </form>
          </div>
        </div>

        <nav
          aria-label="Seções do ERP"
          className="kyron-scroll container-kyron flex gap-fluid-md overflow-x-auto pb-fluid-2xs"
        >
          {itens.map((item) => (
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
