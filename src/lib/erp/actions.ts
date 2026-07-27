"use server";

import { redirect } from "next/navigation";

import { db } from "../db";
import {
  criarSessaoErp,
  encerrarSessaoErp,
  hashSenha,
  senhaConfere,
} from "./auth";

type Estado = { erro?: string } | null;

export async function acaoEntrarErp(_estado: Estado, form: FormData) {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const senha = String(form.get("senha") ?? "");

  const colaborador = await db.colaborador.findUnique({ where: { email } });

  // Primeiro acesso: sem nenhum colaborador cadastrado, o e-mail do dono
  // (ADMIN_EMAIL + ADMIN_PASSWORD) cria automaticamente o admin do ERP.
  if (!colaborador) {
    const donoEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const donoSenha = process.env.ADMIN_PASSWORD;
    const total = await db.colaborador.count();
    if (total === 0 && donoEmail && donoSenha && email === donoEmail && senha === donoSenha) {
      const admin = await db.colaborador.create({
        data: {
          nome: "Administrador",
          email: donoEmail,
          senhaHash: hashSenha(donoSenha),
          papel: "admin",
        },
      });
      await criarSessaoErp(admin.id);
      redirect("/erp");
    }
    return { erro: "E-mail ou senha incorretos." };
  }

  if (!colaborador.ativo || !senhaConfere(senha, colaborador.senhaHash)) {
    return { erro: "E-mail ou senha incorretos." };
  }

  await criarSessaoErp(colaborador.id);
  redirect("/erp");
}

export async function acaoSairErp() {
  await encerrarSessaoErp();
  redirect("/erp/entrar");
}
