import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { FormEntrar } from "@/components/conta/FormEntrar";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { usuarioLogado } from "@/lib/usuario-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse as aulas do Manual de Instalação da Kyron.",
  robots: { index: false, follow: false },
};

export default async function EntrarPage() {
  if (await usuarioLogado()) redirect("/manual");

  return (
    <>
      <PageHero
        eyebrow="Área do cliente"
        titulo="Entrar"
        lede="Acesse as aulas do Manual de Instalação."
      />

      <Section semBorda>
        <div className="mx-auto max-w-[24rem]">
          <FormEntrar />
          <p className="mt-fluid-md text-center text-fluid-sm text-kyron-silver">
            Ainda não tem conta?{" "}
            <Link
              href="/criar-conta"
              className="text-kyron-blue hover:underline"
            >
              Criar conta
            </Link>
          </p>
          <p className="mt-fluid-2xs text-center text-fluid-xs text-kyron-silver/70">
            <Link
              href="/recuperar-senha"
              className="hover:text-kyron-white hover:underline"
            >
              Esqueci minha senha
            </Link>
          </p>
        </div>
      </Section>
    </>
  );
}
