import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { FormEntrarErp } from "@/components/erp/FormEntrarErp";
import { colaboradorLogado } from "@/lib/erp/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ERP Kyron — Entrar",
  robots: { index: false, follow: false },
};

export default async function EntrarErpPage() {
  if (await colaboradorLogado()) redirect("/erp");

  return (
    <main className="flex min-h-dvh items-center justify-center px-fluid-md">
      <div className="w-full max-w-[22rem]">
        <p className="kyron-display text-fluid-lg tracking-[0.2em] text-kyron-white">
          KYR<span className="text-kyron-blue">O</span>N
        </p>
        <p className="kyron-label mt-1 text-fluid-2xs text-kyron-silver/60">
          Sistema de gestão
        </p>

        <div className="mt-fluid-lg rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
          <FormEntrarErp />
        </div>
      </div>
    </main>
  );
}
