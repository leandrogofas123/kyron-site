import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  entrarComOAuth,
  lerEstado,
  buscarPerfil,
  OAUTH_STATE_COOKIE,
  OAuthError,
  providerValido,
  urlPublica,
} from "@/lib/auth/oauth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: value } = await params;
  const url = new URL(request.url);
  if (!providerValido(value)) {
    return NextResponse.json({ erro: "Provedor de login inválido." }, { status: 404 });
  }

  const estado = lerEstado((await cookies()).get(OAUTH_STATE_COOKIE)?.value);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const providerError = url.searchParams.get("error");

  if (providerError) {
    return redirecionarErro(request, `${value}-cancelled`);
  }
  if (!estado || estado.provider !== value || !state || state !== estado.state || !code) {
    return redirecionarErro(request, "oauth-state");
  }

  try {
    const perfil = await buscarPerfil(request, value, code);
    await entrarComOAuth(value, perfil);
    const resposta = NextResponse.redirect(urlPublica(request, estado.redirectTo));
    resposta.cookies.delete(OAUTH_STATE_COOKIE);
    return resposta;
  } catch (erro) {
    const codeErro = erro instanceof OAuthError ? erro.code : "oauth-callback";
    return redirecionarErro(request, codeErro);
  }
}

function redirecionarErro(request: Request, code: string) {
  const destino = urlPublica(request, `/login?erro=${encodeURIComponent(code)}`);
  const resposta = NextResponse.redirect(destino);
  resposta.cookies.delete(OAUTH_STATE_COOKIE);
  return resposta;
}
