import type { Metadata } from "next";

import { AcademyLoginScreen } from "./AcademyLoginScreen";

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

  return <AcademyLoginScreen erroOAuth={erroOAuth} />;
}
