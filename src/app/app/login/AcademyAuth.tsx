"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, KeyRound, Lock, Mail, User,
} from "lucide-react";

import { acaoCadastrar, acaoLogin } from "@/lib/auth/actions";

type Estado = { erro?: string; ok?: boolean; mensagem?: string };

const entrarAcao = acaoLogin.bind(null, "/app");

export function AcademyAuth({ erroOAuth }: { erroOAuth: string | null }) {
  const [modo, setModo] = useState<"login" | "cadastro">("login");

  return (
    <div className="academy-auth">
      <p className="academy-eyebrow blue"><i /> ÁREA EXCLUSIVA</p>
      <h2>{modo === "login" ? "Entre na Kyron Academy" : "Crie sua conta"}</h2>
      <p className="academy-login-lead">
        {modo === "login"
          ? "Acesse suas trilhas com e-mail, Google ou LinkedIn."
          : "Cadastre-se para evoluir. Novos acessos têm aprovação rápida da Kyron."}
      </p>

      {erroOAuth && <p role="alert" className="academy-login-alert">{erroOAuth}</p>}

      <div className="academy-seg" role="tablist" aria-label="Escolha entre entrar e criar conta">
        <button type="button" role="tab" aria-selected={modo === "login"} data-active={modo === "login"} onClick={() => setModo("login")}>
          Entrar
        </button>
        <button type="button" role="tab" aria-selected={modo === "cadastro"} data-active={modo === "cadastro"} onClick={() => setModo("cadastro")}>
          Criar conta
        </button>
      </div>

      {modo === "login" ? <FormLogin /> : <FormCadastro />}

      <div className="academy-sep"><span>ou continue com</span></div>

      <div className="academy-oauth-row">
        <a href="/api/auth/google?redirect=/app" className="academy-oauth google"><span>G</span> Google</a>
        <a href="/api/auth/linkedin?redirect=/app" className="academy-oauth linkedin"><span>in</span> LinkedIn</a>
      </div>

      <p className="academy-login-terms">
        Ao continuar, você concorda com os <Link href="/termos-de-uso">Termos de Uso</Link> e a <Link href="/politica-de-privacidade">Política de Privacidade</Link>.
      </p>
    </div>
  );
}

function FormLogin() {
  const [estado, action, pendente] = useActionState<Estado, FormData>(entrarAcao, {});
  return (
    <form action={action} className="academy-form">
      <label className="academy-field">
        <span><Mail size={15} /> E-mail</span>
        <input name="email" type="email" autoComplete="username" required placeholder="voce@empresa.com" />
      </label>
      <label className="academy-field">
        <span><Lock size={15} /> Senha</span>
        <input name="senha" type="password" autoComplete="current-password" required placeholder="Sua senha" />
      </label>

      {estado?.erro && <p role="alert" className="academy-login-alert">{estado.erro}</p>}

      <button type="submit" className="academy-submit" disabled={pendente}>
        <KeyRound size={16} /> {pendente ? "Entrando…" : "Entrar"} <ArrowRight size={16} />
      </button>
      <Link href="/recuperar-senha" className="academy-forgot">Esqueci minha senha</Link>
    </form>
  );
}

function FormCadastro() {
  const [estado, action, pendente] = useActionState<Estado, FormData>(acaoCadastrar, {});
  return (
    <form action={action} className="academy-form">
      <input type="hidden" name="destino" value="/app" />
      <label className="academy-field">
        <span><User size={15} /> Nome completo</span>
        <input name="nome" type="text" autoComplete="name" required placeholder="Seu nome" />
      </label>
      <label className="academy-field">
        <span><Mail size={15} /> E-mail</span>
        <input name="email" type="email" autoComplete="username" required placeholder="voce@empresa.com" />
      </label>
      <label className="academy-field">
        <span><Lock size={15} /> Senha</span>
        <input name="senha" type="password" autoComplete="new-password" required minLength={6} placeholder="Ao menos 6 caracteres" />
      </label>

      {estado?.erro && <p role="alert" className="academy-login-alert">{estado.erro}</p>}

      <button type="submit" className="academy-submit" disabled={pendente}>
        <User size={16} /> {pendente ? "Criando conta…" : "Criar conta"} <ArrowRight size={16} />
      </button>
    </form>
  );
}
