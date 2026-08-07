import type { Metadata } from "next";
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

export default async function AppLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const mensagem = erro ? MENSAGENS[erro] ?? "Não foi possível concluir o login." : null;

  return (
    <main className="flex min-h-screen items-center justify-center px-fluid-md py-fluid-xl">
      <div className="w-full max-w-[28rem]">
        <Link href="/" className="kyron-label text-fluid-xs text-kyron-blue hover:underline">
          KYRON ACADEMY
        </Link>

        <div className="mt-fluid-md rounded-kyron-lg border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <p className="kyron-label text-fluid-2xs tracking-[0.16em] text-kyron-silver/60">ÁREA DE TREINAMENTOS</p>
          <h1 className="kyron-display mt-fluid-xs text-fluid-xl text-kyron-white">Entre para aprender.</h1>
          <p className="mt-fluid-sm text-fluid-sm leading-relaxed text-kyron-silver">
            Acesse aulas, manuais e orientações práticas para aproveitar melhor as soluções da Kyron.
          </p>

          {mensagem && (
            <p role="alert" className="mt-fluid-md rounded-kyron-sm border border-[rgba(217,144,47,0.35)] bg-[rgba(217,144,47,0.08)] px-fluid-sm py-fluid-xs text-fluid-xs text-[var(--kyron-amber,#d9902f)]">
              {mensagem}
            </p>
          )}

          <div className="mt-fluid-lg space-y-fluid-xs">
            <a
              href="/api/auth/google"
              className="flex min-h-12 items-center justify-center gap-2 rounded-kyron-sm bg-white px-fluid-md text-fluid-sm font-semibold text-[#202124] transition-transform hover:-translate-y-px"
            >
              <GoogleIcon />
              Continuar com Google
            </a>
            <a
              href="/api/auth/linkedin"
              className="flex min-h-12 items-center justify-center gap-2 rounded-kyron-sm bg-[#0A66C2] px-fluid-md text-fluid-sm font-semibold text-white transition-transform hover:-translate-y-px"
            >
              <LinkedInIcon />
              Continuar com LinkedIn
            </a>
          </div>

          <p className="mt-fluid-md text-center text-fluid-2xs leading-relaxed text-kyron-silver/60">
            Sua conta será criada como aluno e ficará aguardando a aprovação da Kyron.
          </p>
          <Link href="/" className="mt-fluid-md block text-center text-fluid-xs text-kyron-silver hover:text-kyron-white">
            Voltar para a área de treinamentos
          </Link>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return <span aria-hidden className="text-base font-bold">G</span>;
}

function LinkedInIcon() {
  return <span aria-hidden className="text-base font-bold">in</span>;
}
