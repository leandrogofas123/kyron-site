import type { Metadata } from "next";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { AcademyTemaToggle } from "@/components/academy/AcademyTemaToggle";

import { AcademyAuth } from "./AcademyAuth";
import { CerebroKyron } from "./CerebroKyron";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

const MENSAGENS: Record<string, string> = {
  "google-config": "O login com Google ainda não foi configurado.",
  "linkedin-config": "O login com LinkedIn ainda não foi configurado.",
  "google-cancelled": "O login com Google foi cancelado.",
  "linkedin-cancelled": "O login com LinkedIn foi cancelado.",
  "google-email-unverified": "O Google informou que o e-mail não está verificado.",
  "linkedin-email-unverified": "O LinkedIn informou que o e-mail não está verificado.",
  inactive: "Esta conta está desativada. Fale com a Kyron.",
  "provider-linked": "Este provedor já está vinculado a outra conta.",
  "oauth-state": "A sessão de login expirou. Tente novamente.",
  "somente-alunos": "Esta área é exclusiva de alunos da Academy. Contas de gestão devem acessar o ERP.",
};

export default async function AppLoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const erroOAuth = erro ? MENSAGENS[erro] ?? "Não foi possível concluir o login." : null;

  return (
    <main className="academy-login">
      <section className="academy-login-brand">
        <div className="academy-login-aura" />
        <div className="academy-login-grid" />
        <div className="academy-login-brand-content">
          <Link href="/" className="academy-brandmark">
            <img src="/marca/kyron-simbolo.png" alt="Kyron" />
            <div><b>KYRON</b><small>ACADEMY</small></div>
          </Link>

          <div className="academy-login-hero">
            <p className="academy-eyebrow blue"><i /> APRENDA. PRATIQUE. EVOLUA.</p>
            <h1>Um mapa vivo das suas <span>competências.</span></h1>
            <p className="academy-login-sub">
              Cada competência é um território do conhecimento comercial. A Academy
              guia sua equipe a dominar um de cada vez — com método e evolução visível.
            </p>
          </div>

          <div className="academy-cerebro">
            <CerebroKyron />
          </div>

          <ul className="academy-login-bullets">
            <li><CheckCircle2 size={17} /> Conteúdo direto e aplicável</li>
            <li><CheckCircle2 size={17} /> Evolução acompanhada pela liderança</li>
            <li><CheckCircle2 size={17} /> Certificação por competência</li>
          </ul>
        </div>
      </section>

      <section className="academy-login-panel">
        <div className="academy-login-card">
          <div className="academy-login-topo">
            <Link href="/" className="academy-login-back"><ArrowLeft size={16} /> Voltar ao site</Link>
            <AcademyTemaToggle />
          </div>
          <AcademyAuth erroOAuth={erroOAuth} />
        </div>
      </section>
    </main>
  );
}
