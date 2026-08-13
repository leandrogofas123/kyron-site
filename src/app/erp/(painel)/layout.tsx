import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ErpShell } from "@/components/erp/ErpShell";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ERP Kyron",
  robots: { index: false, follow: false },
};

// Atalhos rápidos (topo da lateral) — os módulos mais usados no dia a dia.
const ATALHOS = [
  { label: "Dashboard", href: "/erp", acao: "dashboard", icone: "dashboard" },
  { label: "Vendas", href: "/erp/vendas", acao: "estoque.ver", icone: "notas" },
  { label: "Ordens", href: "/erp/ordens", acao: "estoque.movimentar", icone: "ordens" },
  { label: "Financeiro", href: "/erp/financeiro", acao: "financeiro", icone: "financeiro" },
];

// Poucos módulos PRINCIPAIS, cada um agrupando os secundários relacionados.
const GRUPOS = [
  {
    label: "Comercial",
    icone: "clientes",
    itens: [
      { label: "Vendas", href: "/erp/vendas", acao: "estoque.ver", icone: "notas" },
      { label: "Ordens de serviço", href: "/erp/ordens", acao: "estoque.movimentar", icone: "ordens" },
      { label: "Clientes", href: "/erp/clientes", acao: "clientes.ver", icone: "clientes" },
      { label: "Leads", href: "/erp/leads", acao: "clientes.ver", icone: "clientes" },
    ],
  },
  {
    label: "Catálogo & Estoque",
    icone: "produtos",
    itens: [
      { label: "Produtos & seminovos", href: "/erp/produtos", acao: "produtos.ver", icone: "produtos" },
      { label: "Serviços", href: "/erp/servicos", acao: "produtos.editar", icone: "ordens" },
      { label: "Estoque", href: "/erp/estoque", acao: "estoque.ver", icone: "estoque" },
      { label: "Inventário", href: "/erp/inventario", acao: "estoque.movimentar", icone: "inventario" },
      { label: "Notas fiscais", href: "/erp/notas", acao: "notas.ver", icone: "notas" },
      { label: "Fornecedores", href: "/erp/fornecedores", acao: "fornecedores.ver", icone: "fornecedores" },
    ],
  },
  {
    label: "Financeiro",
    icone: "financeiro",
    itens: [
      { label: "Financeiro", href: "/erp/financeiro", acao: "financeiro", icone: "financeiro" },
      { label: "Painel executivo", href: "/erp/analytics", acao: "financeiro", icone: "analytics" },
    ],
  },
  {
    label: "Aulas & Alunos",
    icone: "aulas",
    itens: [
      { label: "Alunos", href: "/erp/alunos", acao: "alunos", icone: "clientes" },
      { label: "Kyron Academy", href: "/erp/academy", acao: "aulas", icone: "aulas" },
      { label: "Biblioteca Academy", href: "/erp/academy/materiais", acao: "aulas", icone: "aulas" },
      { label: "Conquistas Academy", href: "/erp/academy/conquistas", acao: "aulas", icone: "aulas" },
      { label: "Relatórios Academy", href: "/erp/academy/relatorios", acao: "aulas", icone: "analytics" },
      { label: "Aulas · Manual", href: "/erp/aulas", acao: "aulas", icone: "aulas" },
    ],
  },
  {
    label: "Sistema",
    icone: "configuracoes",
    itens: [
      { label: "Colaboradores", href: "/erp/colaboradores", acao: "colaboradores.ver", icone: "colaboradores" },
      { label: "Notificações", href: "/erp/notificacoes", acao: "clientes.ver", icone: "notificacoes" },
      { label: "Integrações", href: "/erp/integracoes", acao: "financeiro", icone: "integracoes" },
      { label: "Site · Banners", href: "/erp/site/banners", acao: "produtos.editar", icone: "produtos" },
      { label: "Configurações", href: "/erp/configuracoes", acao: "financeiro", icone: "configuracoes" },
      { label: "Auditoria", href: "/erp/auditoria", acao: "auditoria.ver", icone: "auditoria" },
    ],
  },
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

  const papel = colaborador.papel;
  const limpar = ({ label, href, icone }: { label: string; href: string; icone: string }) => ({ label, href, icone });

  const atalhos = ATALHOS.filter((i) => podeFazer(papel, i.acao)).map(limpar);
  const grupos = GRUPOS.map((g) => ({
    label: g.label,
    icone: g.icone,
    itens: g.itens.filter((i) => podeFazer(papel, i.acao)).map(limpar),
  })).filter((g) => g.itens.length > 0);

  return (
    <ErpShell
      atalhos={atalhos}
      grupos={grupos}
      usuario={{ nome: colaborador.nome, papel: ROTULO_PAPEL[papel] ?? papel }}
    >
      {children}
    </ErpShell>
  );
}
