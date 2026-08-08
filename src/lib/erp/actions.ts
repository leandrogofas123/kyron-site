"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auditar } from "../core/audit";
import { gerarHash } from "../core/security";
import { db } from "../db";
import {
  CHAVE_UNIFICADA,
  CHAVES_EQUIPE,
  colaboradorLogado,
  criarSessaoErp,
  encerrarSessaoErp,
  hashSenha,
  papelErpDaLista,
  PAPEIS,
  senhaConfere,
} from "./auth";

type Estado = { erro?: string; ok?: boolean } | null;

/** Concede a um usuário exatamente um papel de equipe (troca o anterior). */
async function definirPapelEquipe(usuarioId: number, papelErp: string) {
  const chave = CHAVE_UNIFICADA[papelErp as keyof typeof CHAVE_UNIFICADA];
  const papel = await db.papel.findUnique({ where: { chave } });
  if (!papel) return;
  // Remove papéis de equipe anteriores (mantém CLIENTE, se houver).
  const equipe = await db.papel.findMany({
    where: { chave: { in: CHAVES_EQUIPE } },
    select: { id: true },
  });
  await db.usuarioPapel.deleteMany({
    where: { usuarioId, papelId: { in: equipe.map((p) => p.id) } },
  });
  await db.usuarioPapel.create({ data: { usuarioId, papelId: papel.id } });
}

export async function acaoEntrarErp(_estado: Estado, form: FormData) {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const senha = String(form.get("senha") ?? "");

  const usuario = await db.usuario.findUnique({
    where: { email },
    include: { papeis: { select: { papel: { select: { chave: true } } } } },
  });

  // Primeiro acesso: sem nenhuma equipe cadastrada, o e-mail do dono
  // (ADMIN_EMAIL + ADMIN_PASSWORD) cria automaticamente o admin master.
  if (!usuario) {
    const donoEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const donoSenha = process.env.ADMIN_PASSWORD;
    if (donoEmail && donoSenha && email === donoEmail && senha === donoSenha) {
      const master = await db.papel.findUnique({ where: { chave: "ADMIN_MASTER" } });
      const admin = await db.usuario.create({
        data: {
          nome: process.env.ADMIN_NOME?.trim() || "Administrador",
          email: donoEmail,
          senhaHash: gerarHash(donoSenha),
          ativo: true,
          aprovado: true,
          emailVerificado: true,
          papeis: master ? { create: { papelId: master.id } } : undefined,
        },
      });
      await criarSessaoErp(admin.id);
      redirect("/erp");
    }
    return { erro: "E-mail ou senha incorretos." };
  }

  if (!usuario.ativo || !senhaConfere(senha, usuario.senhaHash)) {
    // Tentativa falha também é registrada — é o que denuncia ataque de senha.
    await auditar({
      ator: { tipo: "sistema" },
      modulo: "auth",
      acao: "login-negado",
      entidade: "Usuario",
      entidadeId: usuario.id,
      metadata: { email },
    });
    return { erro: "E-mail ou senha incorretos." };
  }

  const papeis = usuario.papeis.map((p) => p.papel.chave);
  if (!papelErpDaLista(papeis)) {
    return { erro: "Este acesso não tem permissão no ERP." };
  }

  await auditar({
    ator: { tipo: "usuario", id: usuario.id, nome: usuario.nome },
    modulo: "auth",
    acao: "login",
    entidade: "Usuario",
    entidadeId: usuario.id,
  });

  await criarSessaoErp(usuario.id);
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

  if (await db.usuario.findUnique({ where: { email } })) {
    return { erro: "Já existe um acesso com este e-mail." };
  }

  const eu = await colaboradorLogado();
  const criado = await db.usuario.create({
    data: {
      nome,
      email,
      senhaHash: hashSenha(senha),
      ativo: true,
      aprovado: true, // equipe entra liberada
      emailVerificado: true,
    },
  });
  await definirPapelEquipe(criado.id, papel);

  await auditar({
    ator: { tipo: "usuario", id: eu?.id, nome: eu?.nome },
    modulo: "erp",
    acao: "conceder-acesso",
    entidade: "Usuario",
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

  const alvo = await db.usuario.findUnique({
    where: { id },
    select: { nome: true, papeis: { select: { papel: { select: { chave: true } } } } },
  });
  const antes = alvo ? papelErpDaLista(alvo.papeis.map((p) => p.papel.chave)) : null;
  await definirPapelEquipe(id, papel);

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: "alterar-papel",
    entidade: "Usuario",
    entidadeId: id,
    antes: { papel: antes },
    depois: { papel },
    metadata: { alvo: alvo?.nome },
  });

  revalidatePath("/erp/colaboradores");
}

export async function acaoAlternarAtivo(id: number, ativo: boolean) {
  const eu = await exigirAdminMaster();
  if (id === eu.id) return; // não se desativa

  const alvo = await db.usuario.findUnique({
    where: { id },
    select: { nome: true },
  });
  await db.usuario.update({ where: { id }, data: { ativo } });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: ativo ? "reativar-acesso" : "revogar-acesso",
    entidade: "Usuario",
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
  await db.usuario.update({
    where: { id },
    data: { senhaHash: hashSenha(senha) },
  });

  // A senha em si NUNCA entra na auditoria — só o fato de ter sido trocada.
  await auditar({
    ator: { tipo: "usuario", id: eu?.id, nome: eu?.nome },
    modulo: "erp",
    acao: "redefinir-senha",
    entidade: "Usuario",
    entidadeId: id,
  });

  revalidatePath("/erp/colaboradores");
  return { ok: true };
}
