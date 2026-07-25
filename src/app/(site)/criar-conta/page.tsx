import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { FormCriarConta } from "@/components/conta/FormCriarConta";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { usuarioLogado } from "@/lib/usuario-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Criar conta",
  description:
    "Crie sua conta para acessar as aulas do Manual de Instalação da Kyron.",
  robots: { index: false, follow: false },
};

export default async function CriarContaPage() {
  if (await usuarioLogado()) redirect("/manual");

  return (
    <>
      <PageHero
        eyebrow="Área do cliente"
        titulo="Criar conta"
        lede="Cadastre-se para acessar as aulas. Seu acesso é liberado após aprovação da Kyron."
      />

      <Section semBorda>
        <div className="mx-auto max-w-[24rem]">
          <FormCriarConta />
          <p className="mt-fluid-md text-center text-fluid-sm text-kyron-silver">
            Já tem conta?{" "}
            <Link href="/entrar" className="text-kyron-blue hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </Section>
    </>
  );
}
