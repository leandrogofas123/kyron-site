"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award, BarChart3, BookOpen, Building2, Headphones, Home, Library, LogOut, Sparkles, Trophy,
} from "lucide-react";

import { acaoLogout } from "@/lib/auth/actions";
import { KYRON_COMPANY } from "@/lib/kyron/company";

/**
 * Casca de navegação da Kyron Academy — um só lugar, usado pelo layout
 * `(painel)`. Cada ícone do menu leva a uma página REAL (nunca uma âncora):
 * antes "Novidades" e "Meu progresso" eram âncoras no dashboard; agora são
 * páginas próprias dentro de `/academy`.
 */

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/academy" className={`academy-logo ${compact ? "compact" : ""}`}>
      <span>K</span>{!compact && <div><b>KYRON</b><small>ACADEMY</small></div>}
    </Link>
  );
}

const ITENS_APRENDIZADO = [
  { href: "/academy", label: "Início", Icone: Home },
  { href: "/academy/trilhas", label: "Minhas trilhas", Icone: BookOpen },
  { href: "/academy/novidades", label: "Novidades", Icone: Sparkles },
  { href: "/academy/progresso", label: "Meu progresso", Icone: BarChart3 },
] as const;

const ITENS_CONTEUDO = [
  { href: "/academy/biblioteca", label: "Biblioteca", Icone: Library },
  { href: "/academy/certificados", label: "Certificados", Icone: Award },
  { href: "/academy/conquistas", label: "Conquistas", Icone: Trophy },
] as const;

export function AcademySidebar({
  nome, ehMaster, novidadesCount,
}: { nome: string; ehMaster: boolean; novidadesCount: number }) {
  const pathname = usePathname();
  const sair = acaoLogout.bind(null, "/academy/login");
  const ativo = (href: string) => (href === "/academy" ? pathname === "/academy" : pathname.startsWith(href));

  return (
    <aside className="academy-sidebar">
      <Logo />
      <nav aria-label="Navegação da Academy">
        <span className="academy-nav-label">APRENDIZADO</span>
        {ITENS_APRENDIZADO.map(({ href, label, Icone }) => (
          <Link key={href} href={href} className={ativo(href) ? "active" : undefined}>
            <Icone size={18} /> {label}
            {href === "/academy/novidades" && novidadesCount > 0 && <em>{novidadesCount}</em>}
          </Link>
        ))}
        <span className="academy-nav-label academy-nav-space">CONTEÚDO</span>
        {ITENS_CONTEUDO.map(({ href, label, Icone }) => (
          <Link key={href} href={href} className={ativo(href) ? "active" : undefined}>
            <Icone size={18} /> {label}
          </Link>
        ))}
        {ehMaster && (
          <Link href="/erp"><Building2 size={18} /> Ir para o ERP</Link>
        )}
      </nav>
      <a
        className="academy-help"
        href={`https://wa.me/${KYRON_COMPANY.whatsapp}?text=${encodeURIComponent("Oi! Preciso de ajuda na Kyron Academy.")}`}
        target="_blank" rel="noopener noreferrer"
      >
        <span><Headphones size={19} /></span><div><b>Precisa de ajuda?</b><small>Fale com a equipe Kyron</small></div>
      </a>
      <div className="academy-user">
        <span>{iniciais(nome)}</span>
        <div><b>{nome}</b><small>Aluno aprovado</small></div>
        <form action={sair}><button type="submit" aria-label="Sair"><LogOut size={17} /></button></form>
      </div>
    </aside>
  );
}

function iniciais(nome: string): string {
  return nome.split(" ").filter(Boolean).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase();
}
