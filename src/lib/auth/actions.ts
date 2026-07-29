"use server";

import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";

import { auditar } from "../core/audit";
import { enviarEmail } from "../core/providers/mail";
import { gerarHash, conferirHash } from "../core/security";
import { db } from "../db";
import { abrirSessao, encerrarSessaoAtual, encerrarTodasSessoes } from "./sessao";
import { usuarioAtual } from "./service";

/**
 * Ações de autenticação da plataforma (login/logout/cadastro/senha).
 *
 * Um único fluxo para todas as áreas. O acesso a CADA área depois é decidido
 * pelos papéis do usuário (ver permissoes.ts), não por "onde ele entrou".
 */

const DURACAO_TOKEN_MS = 1000 * 60 * 30; // 30 min para redefinir senha

function normalizar(email: string): string {
  return email.trim().toLowerCase();
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

type Estado = { erro?: string; ok?: boolean; mensagem?: string };

/**
 * Autentica e abre a sessão, SEM redirecionar. Devolve o usuário para quem
 * chamou decidir o que fazer (o admin, por exemplo, ainda exige permissão de
 * painel). Login-negado é auditado aqui.
 */
export async function autenticar(
  form: FormData,
): Promise<{ erro: string } | { ok: true; usuarioId: number }> {
  const email = normalizar(String(form.get("email") ?? ""));
  const senha = String(form.get("senha") ?? "");
  if (!email || !senha) return { erro: "Informe e-mail e senha." };

  const usuario = await db.usuario.findUnique({ where: { email } });

  // Mesma resposta para "não existe" e "senha errada" — não revela quem tem conta.
  if (!usuario || !usuario.ativo || !conferirHash(senha, usuario.senhaHash)) {
    await auditar({
      ator: { tipo: "sistema" },
      modulo: "auth",
      acao: "login-negado",
      entidade: "Usuario",
      entidadeId: usuario?.id,
      metadata: { email },
    });
    return { erro: "E-mail ou senha incorretos." };
  }

  await db.usuario.update({
    where: { id: usuario.id },
    data: { ultimoLogin: new Date() },
  });
  await abrirSessao(usuario.id);

  await auditar({
    ator: { tipo: "usuario", id: usuario.id, nome: usuario.nome },
    modulo: "auth",
    acao: "login",
    entidade: "Usuario",
    entidadeId: usuario.id,
  });

  return { ok: true, usuarioId: usuario.id };
}

/** Login unificado. `destino` é para onde redirecionar em caso de sucesso. */
export async function acaoLogin(
  destino: string,
  _estado: Estado,
  form: FormData,
): Promise<Estado> {
  const r = await autenticar(form);
  if ("erro" in r) return r;
  redirect(destino);
}

export async function acaoLogout(destino = "/") {
  const u = await usuarioAtual();
  await encerrarSessaoAtual();
  if (u) {
    await auditar({
      ator: { tipo: "usuario", id: u.id, nome: u.nome },
      modulo: "auth",
      acao: "logout",
      entidade: "Usuario",
      entidadeId: u.id,
    });
  }
  redirect(destino);
}

/**
 * Cadastro de cliente (área de aulas). Nasce SEM papel de equipe e pendente de
 * aprovação — o admin libera. Já cria a sessão para o cliente acompanhar o
 * status.
 */
export async function acaoCadastrar(_estado: Estado, form: FormData): Promise<Estado> {
  const nome = String(form.get("nome") ?? "").trim();
  const email = normalizar(String(form.get("email") ?? ""));
  const senha = String(form.get("senha") ?? "");

  if (!nome || !email || senha.length < 6) {
    return { erro: "Preencha nome, e-mail e uma senha de ao menos 6 caracteres." };
  }

  const existe = await db.usuario.findUnique({ where: { email } });
  if (existe) return { erro: "Já existe uma conta com este e-mail." };

  const clientePapel = await db.papel.findUnique({ where: { chave: "CLIENTE" } });
  const usuario = await db.usuario.create({
    data: {
      nome,
      email,
      senhaHash: gerarHash(senha),
      aprovado: false,
      papeis: clientePapel ? { create: { papelId: clientePapel.id } } : undefined,
    },
  });

  await abrirSessao(usuario.id);
  await auditar({
    ator: { tipo: "usuario", id: usuario.id, nome: usuario.nome },
    modulo: "auth",
    acao: "cadastro",
    entidade: "Usuario",
    entidadeId: usuario.id,
  });

  // Avisa a loja que há um cadastro para aprovar.
  enviarEmail({
    assunto: "Novo cadastro aguardando aprovação — Kyron",
    html: `<p><strong>${nome}</strong> (${email}) criou uma conta e aguarda liberação de acesso às aulas.</p>`,
  });

  redirect("/aulas");
}

/**
 * Recuperação de senha (passo 1): gera token de uso único e manda por e-mail.
 * Resposta é sempre a mesma, exista o e-mail ou não — não revela cadastro.
 */
export async function acaoRecuperarSenha(_estado: Estado, form: FormData): Promise<Estado> {
  const email = normalizar(String(form.get("email") ?? ""));
  const resposta = {
    ok: true,
    mensagem: "Se houver uma conta com esse e-mail, enviamos as instruções.",
  };
  if (!email) return { erro: "Informe o e-mail." };

  const usuario = await db.usuario.findUnique({ where: { email } });
  if (!usuario) return resposta;

  const bruto = randomBytes(32).toString("hex");
  await db.tokenAcesso.create({
    data: {
      usuarioId: usuario.id,
      tokenHash: hashToken(bruto),
      tipo: "recuperar-senha",
      expiraEm: new Date(Date.now() + DURACAO_TOKEN_MS),
    },
  });

  const base = process.env.APP_URL ?? "https://kyron-site-production.up.railway.app";
  const link = `${base}/redefinir-senha?token=${bruto}`;
  enviarEmail({
    para: usuario.email,
    assunto: "Redefinir sua senha — Kyron",
    html: `<p>Recebemos um pedido para redefinir sua senha.</p>
<p><a href="${link}">Clique aqui para criar uma nova senha</a> (válido por 30 minutos).</p>
<p>Se não foi você, ignore este e-mail.</p>`,
  });

  await auditar({
    ator: { tipo: "usuario", id: usuario.id, nome: usuario.nome },
    modulo: "auth",
    acao: "recuperar-senha-solicitado",
    entidade: "Usuario",
    entidadeId: usuario.id,
  });
  return resposta;
}

/**
 * Recuperação de senha (passo 2): valida o token, troca a senha e REVOGA todas
 * as sessões — se alguém tinha acesso indevido, perde na hora.
 */
export async function acaoRedefinirSenha(_estado: Estado, form: FormData): Promise<Estado> {
  const token = String(form.get("token") ?? "");
  const senha = String(form.get("senha") ?? "");
  if (senha.length < 6) return { erro: "A senha precisa de ao menos 6 caracteres." };

  const registro = await db.tokenAcesso.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (
    !registro ||
    registro.tipo !== "recuperar-senha" ||
    registro.usadoEm ||
    registro.expiraEm < new Date()
  ) {
    return { erro: "Link inválido ou expirado. Solicite um novo." };
  }

  await db.$transaction([
    db.usuario.update({
      where: { id: registro.usuarioId },
      data: { senhaHash: gerarHash(senha) },
    }),
    db.tokenAcesso.update({
      where: { id: registro.id },
      data: { usadoEm: new Date() },
    }),
  ]);
  await encerrarTodasSessoes(registro.usuarioId);

  await auditar({
    ator: { tipo: "usuario", id: registro.usuarioId },
    modulo: "auth",
    acao: "senha-redefinida",
    entidade: "Usuario",
    entidadeId: registro.usuarioId,
  });

  return { ok: true, mensagem: "Senha alterada. Faça login com a nova senha." };
}
