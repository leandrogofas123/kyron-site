import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { FormEntrarErp } from "@/components/erp/FormEntrarErp";
import { colaboradorLogado } from "@/lib/erp/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ERP Kyron — Entrar",
  robots: { index: false, follow: false },
};

const MENSAGENS: Record<string, string> = {
  "google-config": "O login com Google ainda não foi configurado.",
  "linkedin-config": "O login com LinkedIn ainda não foi configurado.",
  "google-cancelled": "O login com Google foi cancelado.",
  "linkedin-cancelled": "O login com LinkedIn foi cancelado.",
  inactive: "Este acesso está desativado.",
  "oauth-state": "A sessão de login expirou. Tente novamente.",
};

export default async function EntrarErpPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  if (await colaboradorLogado()) redirect("/erp");
  const { erro } = await searchParams;
  const mensagem = erro ? MENSAGENS[erro] ?? "Não foi possível concluir o login." : null;

  return (
    <main className="flex min-h-dvh items-center justify-center px-fluid-md py-fluid-lg">
      <div className="w-full max-w-[23rem]">
        <p className="kyron-display text-fluid-lg tracking-[0.2em] text-kyron-white">
          KYR<span className="text-kyron-blue">O</span>N
        </p>
        <p className="kyron-label mt-1 text-fluid-xs text-kyron-silver/60">
          Sistema de gestão
        </p>

        <div className="mt-fluid-lg rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
          {mensagem && (
            <p role="alert" className="mb-fluid-sm rounded-kyron-sm border border-kyron-blue/30 bg-kyron-blue/10 px-fluid-sm py-fluid-xs text-fluid-xs text-kyron-blue">
              {mensagem}
            </p>
          )}

          <FormEntrarErp />

          <div className="my-fluid-sm flex items-center gap-fluid-xs text-fluid-2xs text-kyron-silver/40">
            <span className="h-px flex-1 bg-[var(--kyron-hairline)]" />
            ou entre com
            <span className="h-px flex-1 bg-[var(--kyron-hairline)]" />
          </div>

          <div className="flex flex-col gap-fluid-xs">
            <a
              href="/api/auth/google?redirect=/erp"
              className="flex min-h-[2.9rem] items-center justify-center gap-2 rounded-kyron-sm border border-[#d7dce2] bg-white text-fluid-xs font-semibold text-[#202124] transition-all duration-200 hover:-translate-y-px"
            >
              <span className="text-fluid-base font-black">G</span> Continuar com Google
            </a>
            <a
              href="/api/auth/linkedin?redirect=/erp"
              className="flex min-h-[2.9rem] items-center justify-center gap-2 rounded-kyron-sm border border-[#2b80d4] bg-[#0a66c2] text-fluid-xs font-semibold text-white transition-all duration-200 hover:-translate-y-px"
            >
              <span className="text-fluid-base font-black">in</span> Continuar com LinkedIn
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
