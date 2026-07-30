import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ErpShell } from "@/components/erp/ErpShell";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ERP Kyron",
  robots: { index: false, follow: false },
};

const NAV = [
  { label: "Dashboard", href: "/erp", acao: "dashboard", icone: "dashboard" },
  { label: "Venda rápida", href: "/erp/pdv", acao: "estoque.movimentar", icone: "pdv" },
  { label: "Painel executivo", href: "/erp/analytics", acao: "financeiro", icone: "analytics" },
  { label: "Produtos", href: "/erp/produtos", acao: "produtos.ver", icone: "produtos" },
  { label: "Estoque", href: "/erp/estoque", acao: "estoque.ver", icone: "estoque" },
  { label: "Inventário", href: "/erp/inventario", acao: "estoque.movimentar", icone: "inventario" },
  { label: "Ordens de serviço", href: "/erp/ordens", acao: "estoque.movimentar", icone: "ordens" },
  { label: "Notas fiscais", href: "/erp/notas", acao: "notas.ver", icone: "notas" },
  { label: "Fornecedores", href: "/erp/fornecedores", acao: "fornecedores.ver", icone: "fornecedores" },
  { label: "Clientes", href: "/erp/clientes", acao: "clientes.ver", icone: "clientes" },
  { label: "Financeiro", href: "/erp/financeiro", acao: "financeiro", icone: "financeiro" },
  { label: "Notificações", href: "/erp/notificacoes", acao: "clientes.ver", icone: "notificacoes" },
  { label: "Colaboradores", href: "/erp/colaboradores", acao: "colaboradores.ver", icone: "colaboradores" },
  { label: "Integrações", href: "/erp/integracoes", acao: "financeiro", icone: "integracoes" },
  { label: "Maquininhas & taxas", href: "/erp/maquininhas", acao: "financeiro", icone: "maquininhas" },
  { label: "Configurações", href: "/erp/configuracoes", acao: "financeiro", icone: "configuracoes" },
  { label: "Auditoria", href: "/erp/auditoria", acao: "auditoria.ver", icone: "auditoria" },
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

  const itens = NAV.filter((i) => podeFazer(colaborador.papel, i.acao)).map(
    ({ label, href, icone }) => ({ label, href, icone }),
  );

  return (
    <ErpShell
      itens={itens}
      usuario={{ nome: colaborador.nome, papel: ROTULO_PAPEL[colaborador.papel] ?? colaborador.papel }}
    >
      {children}
    </ErpShell>
  );
}
