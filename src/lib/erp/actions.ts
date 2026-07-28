"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auditar } from "../core/audit";
import { db } from "../db";
import {
  colaboradorLogado,
  criarSessaoErp,
  encerrarSessaoErp,
  hashSenha,
  PAPEIS,
  senhaConfere,
} from "./auth";

type Estado = { erro?: string; ok?: boolean } | null;

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
    // Tentativa falha também é registrada — é o que denuncia ataque de senha.
    await auditar({
      ator: { tipo: "sistema" },
      modulo: "auth",
      acao: "login-negado",
      entidade: "Colaborador",
      entidadeId: colaborador.id,
      metadata: { email },
    });
    return { erro: "E-mail ou senha incorretos." };
  }

  await auditar({
    ator: { tipo: "colaborador", id: colaborador.id, nome: colaborador.nome },
    modulo: "auth",
    acao: "login",
    entidade: "Colaborador",
    entidadeId: colaborador.id,
  });

  await criarSessaoErp(colaborador.id);
  redirect("/erp");
}

export async function acaoSairErp() {
  await encerrarSessaoErp();
  redirect("/erp/entrar");
}

// ───────────────── Colaboradores (só o admin master) ─────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Só quem tem papel admin administra acessos. */
async function exigirAdminMaster() {
  const eu = await colaboradorLogado();
  if (!eu || eu.papel !== "admin") {
    throw new Error("Apenas o administrador pode gerenciar acessos.");
  }
  return eu;
}

export async function acaoCriarColaborador(_estado: Estado, form: FormData) {
  await exigirAdminMaster();

  const nome = String(form.get("nome") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const senha = String(form.get("senha") ?? "");
  const papel = String(form.get("papel") ?? "vendedor");

  if (nome.length < 2) return { erro: "Informe o nome." };
  if (!EMAIL_RE.test(email)) return { erro: "Informe um e-mail válido." };
  if (senha.length < 8) return { erro: "A senha precisa ter ao menos 8 caracteres." };
  if (!PAPEIS.includes(papel as (typeof PAPEIS)[number])) {
    return { erro: "Perfil inválido." };
  }

  if (await db.colaborador.findUnique({ where: { email } })) {
    return { erro: "Já existe um acesso com este e-mail." };
  }

  const eu = await colaboradorLogado();
  const criado = await db.colaborador.create({
    data: { nome, email, senhaHash: hashSenha(senha), papel },
  });

  await auditar({
    ator: { tipo: "colaborador", id: eu?.id, nome: eu?.nome },
    modulo: "erp",
    acao: "conceder-acesso",
    entidade: "Colaborador",
    entidadeId: criado.id,
    depois: { nome, email, papel },
  });

  revalidatePath("/erp/colaboradores");
  return { ok: true };
}

export async function acaoAlterarPapel(id: number, papel: string) {
  const eu = await exigirAdminMaster();
  if (!PAPEIS.includes(papel as (typeof PAPEIS)[number])) return;
  // Trava de segurança: o admin não rebaixa a si mesmo e fica sem acesso.
  if (id === eu.id) return;

  const antes = await db.colaborador.findUnique({
    where: { id },
    select: { papel: true, nome: true },
  });
  await db.colaborador.update({ where: { id }, data: { papel } });

  await auditar({
    ator: { tipo: "colaborador", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: "alterar-papel",
    entidade: "Colaborador",
    entidadeId: id,
    antes: { papel: antes?.papel },
    depois: { papel },
    metadata: { alvo: antes?.nome },
  });

  revalidatePath("/erp/colaboradores");
}

export async function acaoAlternarAtivo(id: number, ativo: boolean) {
  const eu = await exigirAdminMaster();
  if (id === eu.id) return; // não se desativa

  const alvo = await db.colaborador.findUnique({
    where: { id },
    select: { nome: true },
  });
  await db.colaborador.update({ where: { id }, data: { ativo } });

  await auditar({
    ator: { tipo: "colaborador", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: ativo ? "reativar-acesso" : "revogar-acesso",
    entidade: "Colaborador",
    entidadeId: id,
    depois: { ativo },
    metadata: { alvo: alvo?.nome },
  });

  revalidatePath("/erp/colaboradores");
}

/** Redefine a senha de um acesso (o admin entrega a nova ao colaborador). */
export async function acaoRedefinirSenha(_estado: Estado, form: FormData) {
  await exigirAdminMaster();
  const id = Number(form.get("id"));
  const senha = String(form.get("senha") ?? "");
  if (!Number.isInteger(id)) return { erro: "Acesso inválido." };
  if (senha.length < 8) return { erro: "A senha precisa ter ao menos 8 caracteres." };

  const eu = await colaboradorLogado();
  await db.colaborador.update({
    where: { id },
    data: { senhaHash: hashSenha(senha) },
  });

  // A senha em si NUNCA entra na auditoria — só o fato de ter sido trocada.
  await auditar({
    ator: { tipo: "colaborador", id: eu?.id, nome: eu?.nome },
    modulo: "erp",
    acao: "redefinir-senha",
    entidade: "Colaborador",
    entidadeId: id,
  });

  revalidatePath("/erp/colaboradores");
  return { ok: true };
}
