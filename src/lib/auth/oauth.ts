import "server-only";

import { randomBytes } from "node:crypto";

import { auditar } from "../core/audit";
import { gerarHash } from "../core/security";
import { db } from "../db";
import { abrirSessao } from "./sessao";

export type OAuthProvider = "google" | "linkedin";

export const OAUTH_STATE_COOKIE = "kyron_oauth_state";
export const OAUTH_STATE_MAX_AGE = 10 * 60;

type OAuthConfig = {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  clientId: string;
  clientSecret: string;
  scopes: string;
};

type OAuthState = {
  state: string;
  provider: OAuthProvider;
  redirectTo: string;
};

export type OAuthProfile = {
  providerId: string;
  email: string;
  name: string;
  avatar: string | null;
  emailVerified: boolean;
};

export class OAuthError extends Error {
  code: string;

  constructor(code: string, message = code) {
    super(message);
    this.name = "OAuthError";
    this.code = code;
  }
}

function texto(valor: unknown): string | null {
  return typeof valor === "string" && valor.trim() ? valor.trim() : null;
}

function configuracao(provider: OAuthProvider): OAuthConfig {
  const config =
    provider === "google"
      ? {
          authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
          tokenEndpoint: "https://oauth2.googleapis.com/token",
          userInfoEndpoint: "https://openidconnect.googleapis.com/v1/userinfo",
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          scopes: "openid email profile",
        }
      : {
          authorizationEndpoint: "https://www.linkedin.com/oauth/v2/authorization",
          tokenEndpoint: "https://www.linkedin.com/oauth/v2/accessToken",
          userInfoEndpoint: "https://api.linkedin.com/v2/userinfo",
          clientId: process.env.LINKEDIN_CLIENT_ID,
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
          scopes: "openid profile email",
        };

  if (!config.clientId || !config.clientSecret) {
    throw new OAuthError(`${provider}-config`, `OAuth ${provider} não configurado.`);
  }

  return {
    ...config,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
  };
}

export function providerValido(value: string): value is OAuthProvider {
  return value === "google" || value === "linkedin";
}

export function destinoSeguro(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function origemConfigurada(): URL | null {
  const valor = process.env.APP_PUBLIC_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (!valor) return null;

  try {
    const url = new URL(valor);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return new URL(url.origin);
  } catch {
    return null;
  }
}

function hostSeguro(host: string | null): string | null {
  if (!host) return null;
  const valor = host.split(",")[0]?.trim().toLowerCase();
  if (!valor || valor.includes("@")) return null;

  try {
    const url = new URL(`https://${valor}`);
    if (["0.0.0.0", "127.0.0.1", "localhost"].includes(url.hostname)) return null;
    if (url.port && !["443", "80"].includes(url.port)) return null;
    return url.hostname;
  } catch {
    return null;
  }
}

function hostDaAplicacao(): string {
  return hostSeguro(process.env.APP_HOST ?? null) ?? "app.kyrontecnologia.com";
}

function candidatoHostPublico(request: Request): string | null {
  return hostSeguro(
    request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
  );
}

export function hostPublico(request: Request): string | null {
  const configurada = origemConfigurada();
  const candidato = candidatoHostPublico(request);
  const hostsPermitidos = new Set(
    [
      configurada?.hostname,
      hostDaAplicacao(),
      "kyroncompany.com",
      "www.kyroncompany.com",
      "app.kyrontecnologia.com",
    ]
      .map((host) => host?.trim().toLowerCase())
      .filter((host): host is string => Boolean(host)),
  );

  return candidato && hostsPermitidos.has(candidato)
    ? candidato
    : configurada?.hostname ?? null;
}

export function origemPublica(request: Request): string {
  const configurada = origemConfigurada();
  const host = candidatoHostPublico(request);
  if (host && hostPublico(request) === host) {
    const protocolo =
      request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase() === "http"
        ? "http"
        : "https";
    return `${protocolo}://${host}`;
  }

  return configurada?.origin ?? "https://www.kyroncompany.com";
}

export function caminhoAppPublico(request: Request, path: string): string {
  const normalizado = path.startsWith("/") ? path : `/${path}`;
  if (hostPublico(request) === hostDaAplicacao()) return normalizado;
  if (normalizado === "/") return "/app";
  return normalizado === "/app" || normalizado.startsWith("/app/")
    ? normalizado
    : `/app${normalizado}`;
}

export function urlLoginApp(request: Request, code: string): URL {
  const destino = urlPublica(request, caminhoAppPublico(request, "/login"));
  destino.searchParams.set("erro", code);
  return destino;
}

export function urlPublica(request: Request, path: string): URL {
  return new URL(path, `${origemPublica(request)}/`);
}

export function callbackUrl(request: Request, provider: OAuthProvider): string {
  return urlPublica(request, `/api/auth/${provider}/callback`).toString();
}

export function criarAutorizacao(
  request: Request,
  provider: OAuthProvider,
  redirectTo?: string | null,
) {
  const config = configuracao(provider);
  const state = randomBytes(32).toString("hex");
  const payload: OAuthState = {
    state,
    provider,
    redirectTo: caminhoAppPublico(request, destinoSeguro(redirectTo)),
  };
  const cookieValue = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const redirectUri = callbackUrl(request, provider);

  const url = new URL(config.authorizationEndpoint);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scopes);
  url.searchParams.set("state", state);

  return { url, cookieValue };
}

export function lerEstado(cookieValue: string | undefined): OAuthState | null {
  if (!cookieValue) return null;
  try {
    const valor = JSON.parse(Buffer.from(cookieValue, "base64url").toString("utf8")) as Partial<OAuthState>;
    const provider = typeof valor.provider === "string" ? valor.provider : "";
    if (
      typeof valor.state !== "string" ||
      !providerValido(provider) ||
      typeof valor.redirectTo !== "string"
    ) {
      return null;
    }
    return {
      state: valor.state,
      provider,
      redirectTo: destinoSeguro(valor.redirectTo),
    };
  } catch {
    return null;
  }
}

export async function buscarPerfil(
  request: Request,
  provider: OAuthProvider,
  code: string,
): Promise<OAuthProfile> {
  const config = configuracao(provider);
  const redirectUri = callbackUrl(request, provider);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const tokenResponse = await fetch(config.tokenEndpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  const token = (await tokenResponse.json().catch(() => null)) as Record<string, unknown> | null;
  const accessToken = texto(token?.access_token);
  if (!tokenResponse.ok || !accessToken) {
    throw new OAuthError(`${provider}-token`, "Não foi possível concluir o login social.");
  }

  const profileResponse = await fetch(config.userInfoEndpoint, {
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const profile = (await profileResponse.json().catch(() => null)) as Record<string, unknown> | null;
  if (!profileResponse.ok || !profile) {
    throw new OAuthError(`${provider}-profile`, "Não foi possível ler o perfil social.");
  }

  const providerId = texto(profile.sub) ?? texto(profile.id);
  const email = texto(profile.email)?.toLowerCase();
  const name =
    texto(profile.name) ??
    [texto(profile.given_name), texto(profile.family_name)].filter(Boolean).join(" ");
  const emailVerified = profile.email_verified === true || profile.email_verified === "true";

  if (!providerId || !email || !name) {
    throw new OAuthError(`${provider}-profile-incomplete`, "O provedor não retornou um perfil completo.");
  }
  if (!emailVerified) {
    throw new OAuthError(`${provider}-email-unverified`, "O e-mail do provedor precisa estar verificado.");
  }

  return {
    providerId,
    email,
    name,
    avatar: texto(profile.picture),
    emailVerified,
  };
}

export async function entrarComOAuth(
  provider: OAuthProvider,
  profile: OAuthProfile,
): Promise<number> {
  const existente = await db.identidadeOAuth.findUnique({
    where: { provedor_provedorId: { provedor: provider, provedorId: profile.providerId } },
    include: { usuario: true },
  });

  if (existente) {
    if (!existente.usuario.ativo) throw new OAuthError("inactive", "Esta conta está desativada.");

    const usuario = await db.usuario.update({
      where: { id: existente.usuario.id },
      data: { ultimoLogin: new Date(), emailVerificado: true },
    });
    await db.identidadeOAuth.update({
      where: { id: existente.id },
      data: { email: profile.email, nome: profile.name, avatar: profile.avatar, ultimoLogin: new Date() },
    });
    await abrirSessao(usuario.id);
    await auditar({
      ator: { tipo: "usuario", id: usuario.id, nome: usuario.nome },
      modulo: "auth",
      acao: "login-oauth",
      entidade: "Usuario",
      entidadeId: usuario.id,
      metadata: { provider },
    });
    return usuario.id;
  }

  let usuario = await db.usuario.findUnique({ where: { email: profile.email } });
  const novo = !usuario;

  if (usuario && !usuario.ativo) {
    throw new OAuthError("inactive", "Esta conta está desativada.");
  }

  if (usuario) {
    const identidadeDoProvedor = await db.identidadeOAuth.findUnique({
      where: { usuarioId_provedor: { usuarioId: usuario.id, provedor: provider } },
    });
    if (identidadeDoProvedor) {
      throw new OAuthError("provider-linked", "Este provedor já está vinculado a outra conta.");
    }

    await db.identidadeOAuth.create({
      data: {
        provedor: provider,
        provedorId: profile.providerId,
        usuarioId: usuario.id,
        email: profile.email,
        nome: profile.name,
        avatar: profile.avatar,
        ultimoLogin: new Date(),
      },
    });
    usuario = await db.usuario.update({
      where: { id: usuario.id },
      data: { ultimoLogin: new Date(), emailVerificado: true },
    });
  } else {
    const cliente = await db.papel.findUnique({ where: { chave: "CLIENTE" } });
    usuario = await db.usuario.create({
      data: {
        nome: profile.name,
        email: profile.email,
        senhaHash: gerarHash(randomBytes(32).toString("hex")),
        avatar: profile.avatar,
        emailVerificado: true,
        aprovado: false,
        ultimoLogin: new Date(),
        papeis: cliente ? { create: { papelId: cliente.id } } : undefined,
        identidadesOAuth: {
          create: {
            provedor: provider,
            provedorId: profile.providerId,
            email: profile.email,
            nome: profile.name,
            avatar: profile.avatar,
            ultimoLogin: new Date(),
          },
        },
      },
    });
  }

  await abrirSessao(usuario.id);
  await auditar({
    ator: { tipo: "usuario", id: usuario.id, nome: usuario.nome },
    modulo: "auth",
    acao: novo ? "cadastro-oauth" : "vinculo-oauth",
    entidade: "Usuario",
    entidadeId: usuario.id,
    metadata: { provider, email: profile.email },
  });
  return usuario.id;
}
