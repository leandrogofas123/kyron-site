import type { Metadata } from "next";
import Link from "next/link";

import { FormRecuperarSenha } from "@/components/conta/FormRecuperarSenha";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recuperar senha",
  description: "Receba um link para redefinir a senha da sua conta Kyron.",
  robots: { index: false, follow: false },
};

export default function RecuperarSenhaPage() {
  return (
    <>
      <PageHero
        eyebrow="Área do cliente"
        titulo="Recuperar senha"
        lede="Informe seu e-mail e enviaremos um link para criar uma nova senha."
      />

      <Section semBorda>
        <div className="mx-auto max-w-[24rem]">
          <FormRecuperarSenha />
          <p className="mt-fluid-md text-center text-fluid-sm text-kyron-silver">
            Lembrou a senha?{" "}
            <Link href="/entrar" className="text-kyron-blue hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </Section>
    </>
  );
}
