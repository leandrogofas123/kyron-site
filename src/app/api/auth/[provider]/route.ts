import { NextResponse } from "next/server";

import {
  criarAutorizacao,
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_MAX_AGE,
  providerValido,
  OAuthError,
  urlLoginApp,
} from "@/lib/auth/oauth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: value } = await params;
  if (!providerValido(value)) {
    return NextResponse.json({ erro: "Provedor de login inválido." }, { status: 404 });
  }

  try {
    const url = new URL(request.url);
    const redirectTo = url.searchParams.get("redirect");
    const autorizacao = criarAutorizacao(request, value, redirectTo);
    const resposta = NextResponse.redirect(autorizacao.url);
    resposta.cookies.set(OAUTH_STATE_COOKIE, autorizacao.cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: OAUTH_STATE_MAX_AGE,
    });
    return resposta;
  } catch (erro) {
    const code = erro instanceof OAuthError ? erro.code : "oauth-start";
    const destino = urlLoginApp(request, code);
    return NextResponse.redirect(destino);
  }
}
