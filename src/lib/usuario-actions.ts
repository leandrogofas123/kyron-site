"use server";

import { redirect } from "next/navigation";

import { db } from "./db";
import { enviarTemplate } from "./notificacao/servico";
import {
  criarSessaoUsuario,
  encerrarSessaoUsuario,
  hashSenha,
  normalizarEmail,
  senhaConfere,
} from "./usuario-auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Estado = { erro?: string } | null;

/** Cadastro aberto. Cria o usuário como NÃO aprovado; o admin libera depois. */
export async function acaoCriarConta(_estado: Estado, form: FormData) {
  const nome = String(form.get("nome") ?? "").trim();
  const email = normalizarEmail(String(form.get("email") ?? ""));
  const senha = String(form.get("senha") ?? "");

  if (nome.length < 2) return { erro: "Informe seu nome." };
  if (!EMAIL_RE.test(email)) return { erro: "Informe um e-mail válido." };
  if (senha.length < 8)
    return { erro: "A senha precisa ter pelo menos 8 caracteres." };

  const existente = await db.usuario.findUnique({ where: { email } });
  if (existente)
    return { erro: "Este e-mail já está cadastrado. Tente entrar." };

  const clientePapel = await db.papel.findUnique({ where: { chave: "CLIENTE" } });
  const usuario = await db.usuario.create({
    data: {
      nome,
      email,
      senhaHash: hashSenha(senha),
      papeis: clientePapel ? { create: { papelId: clientePapel.id } } : undefined,
    },
  });

  // Avisa o dono do novo cadastro (aguardando aprovação).
  void enviarTemplate("novo-cliente", undefined, { nome, email });

  // Já entra logado (mas pendente) para ver o status "em análise".
  await criarSessaoUsuario(usuario.id);
  redirect("/manual");
}

export async function acaoEntrar(_estado: Estado, form: FormData) {
  const email = normalizarEmail(String(form.get("email") ?? ""));
  const senha = String(form.get("senha") ?? "");

  const usuario = await db.usuario.findUnique({ where: { email } });
  // Mensagem única — não revela se o e-mail existe.
  if (!usuario || !senhaConfere(senha, usuario.senhaHash)) {
    return { erro: "E-mail ou senha incorretos." };
  }

  await criarSessaoUsuario(usuario.id);
  redirect("/manual");
}

export async function acaoSairUsuario() {
  await encerrarSessaoUsuario();
  redirect("/manual");
}
