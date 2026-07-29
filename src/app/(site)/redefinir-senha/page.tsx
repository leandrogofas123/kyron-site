import type { Metadata } from "next";
import Link from "next/link";

import { FormRedefinirSenha } from "@/components/conta/FormRedefinirSenha";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Redefinir senha",
  robots: { index: false, follow: false },
};

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <>
      <PageHero
        eyebrow="Área do cliente"
        titulo="Nova senha"
        lede="Crie uma nova senha para sua conta."
      />

      <Section semBorda>
        <div className="mx-auto max-w-[24rem]">
          {token ? (
            <FormRedefinirSenha token={token} />
          ) : (
            <div className="space-y-fluid-md text-center">
              <p className="text-fluid-sm text-kyron-silver">
                Link inválido. Solicite uma nova redefinição de senha.
              </p>
              <Link
                href="/recuperar-senha"
                className="kyron-label inline-block rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white"
              >
                Recuperar senha
              </Link>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
