import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "./LoginForm";
import { adminConfigurado, sessaoValida } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin — Entrar",
  robots: { index: false, follow: false },
};

export default async function AdminLogin() {
  if (await sessaoValida()) redirect("/admin/produtos");

  return (
    <main className="container-kyron flex min-h-dvh flex-col justify-center py-section">
      <div className="mx-auto w-full max-w-[24rem]">
        <p className="kyron-label text-fluid-2xs tracking-[0.18em] text-kyron-silver/70">
          Painel Kyron
        </p>
        <h1 className="kyron-display mt-fluid-sm text-fluid-2xl text-kyron-white">
          Entrar
        </h1>

        {adminConfigurado() ? (
          <div className="mt-fluid-lg">
            <LoginForm />
          </div>
        ) : (
          <p className="mt-fluid-md rounded-kyron-sm border border-[var(--kyron-hairline-strong)] p-fluid-sm text-fluid-sm text-kyron-silver">
            O painel ainda não foi configurado. Defina ADMIN_PASSWORD e
            ADMIN_SECRET no arquivo .env.local.
          </p>
        )}
      </div>
    </main>
  );
}
