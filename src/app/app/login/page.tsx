import type { Metadata } from "next";
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

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
};

export default async function AppLoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const mensagem = erro ? MENSAGENS[erro] ?? "Não foi possível concluir o login." : null;

  return (
    <main className="academy-login">
      <section className="academy-login-brand">
        <div className="academy-login-grid" />
        <span className="academy-login-orbit one" />
        <span className="academy-login-orbit two" />
        <span className="academy-login-orbit three" />
        <div className="academy-login-brand-content">
          <Link href="/" className="academy-logo"><span>K</span><div><b>KYRON</b><small>ACADEMY</small></div></Link>
          <div>
            <p className="academy-eyebrow blue"><i /> APRENDA. PRATIQUE. EVOLUA.</p>
            <h1>Conhecimento que vira <span>performance.</span></h1>
            <p>Trilhas práticas para equipes comerciais que querem atender melhor, vender com método e evoluir continuamente.</p>
            <ul>
              <li><CheckCircle2 size={16} /> Conteúdo direto e aplicável</li>
              <li><CheckCircle2 size={16} /> Evolução acompanhada pela liderança</li>
              <li><CheckCircle2 size={16} /> Certificação por competência</li>
            </ul>
          </div>
          <small>KYRON COMPANY · CAPACITAÇÃO COMERCIAL</small>
        </div>
      </section>

      <section className="academy-login-panel">
        <div className="academy-login-card">
          <Link href="/" className="academy-login-back"><ArrowLeft size={15} /> Voltar ao site</Link>
          <span className="academy-login-icon"><Sparkles size={22} /></span>
          <p className="academy-eyebrow blue"><i /> ÁREA EXCLUSIVA</p>
          <h2>Entre na Kyron Academy</h2>
          <p className="academy-login-lead">Use sua conta profissional. Novos acessos passam por uma aprovação rápida da equipe Kyron.</p>

          {mensagem && <p role="alert" className="academy-login-alert">{mensagem}</p>}

          <div className="academy-login-actions">
            <Link href="/api/auth/google?redirect=/app" className="academy-oauth google"><span>G</span> Continuar com Google</Link>
            <Link href="/api/auth/linkedin?redirect=/app" className="academy-oauth linkedin"><span>in</span> Continuar com LinkedIn</Link>
          </div>

          <div className="academy-login-security"><ShieldCheck size={18} /><p><b>Acesso protegido</b><span>Sua conta será vinculada ao perfil de treinamento adequado.</span></p></div>
          <p className="academy-login-terms">Ao continuar, você concorda com os <Link href="/termos-de-uso">Termos de Uso</Link> e a <Link href="/politica-de-privacidade">Política de Privacidade</Link>.</p>
        </div>
      </section>
    </main>
  );
}
