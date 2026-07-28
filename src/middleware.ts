import { NextResponse, type NextRequest } from "next/server";

/**
 * Content-Security-Policy.
 *
 * A auditoria apontou que o site tinha HSTS, X-Frame-Options, nosniff e
 * Referrer-Policy (definidos em next.config.ts), mas nenhum CSP — a camada que
 * de fato limita de onde script, imagem, fonte e iframe podem vir.
 *
 * DUAS POLÍTICAS, E O PORQUÊ
 * O modo forte de CSP usa `nonce` por requisição. No App Router, gerar nonce
 * obriga a página a ser renderizada dinamicamente — o que desfaria o cache da
 * camada de dados e o ISR de /produtos/[slug] e /servicos/[slug].
 *
 * Então a política é dividida por área:
 *
 *  - /admin e /erp: CSP ESTRITO com nonce, sem 'unsafe-inline'. Essas rotas já
 *    são `force-dynamic` (sessão em cookie), então o nonce não custa cache
 *    nenhum. É onde ficam login, ações privilegiadas e os dados do ERP — o alvo
 *    que justifica a política mais dura.
 *
 *  - site público: CSP com 'unsafe-inline' em script-src. Necessário porque as
 *    páginas de produto e serviço embutem JSON-LD (schema.org) com conteúdo
 *    variável — não dá para usar hash — e porque o Next injeta scripts inline de
 *    hidratação. Mesmo assim a política restringe as ORIGENS: script externo só
 *    do googletagmanager, iframe só do YouTube, e nada de object/embed. Isso já
 *    fecha o vetor mais comum de exfiltração por XSS, que é carregar script de
 *    domínio estranho.
 *
 * O CSP é montado aqui, e não em next.config.ts, para haver uma fonte única —
 * duas definições concorrentes acabariam divergindo.
 */

/** Origens externas que o site realmente usa. Nada além disto deve entrar. */
const YOUTUBE = "https://www.youtube-nocookie.com";
const GTM = "https://www.googletagmanager.com";
const GA = "https://*.google-analytics.com https://*.analytics.google.com";

function montarCsp(scriptSrc: string): string {
  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    // Next e Tailwind aplicam estilo inline; sem isto a página perde a
    // formatação inteira. Estilo inline não executa código.
    "style-src 'self' 'unsafe-inline'",
    // data: para os placeholders do next/image; blob: para o preview de foto
    // antes do upload no admin.
    "img-src 'self' data: blob:",
    // Fontes são auto-hospedadas (next/font). Nenhuma origem externa.
    "font-src 'self'",
    `connect-src 'self' ${GTM} ${GA}`,
    // As aulas do Manual são vídeos não listados no YouTube.
    `frame-src ${YOUTUBE}`,
    // Equivale ao X-Frame-Options: SAMEORIGIN, para navegadores modernos.
    "frame-ancestors 'self'",
    // Nenhum Flash/applet. Fecha um vetor antigo de execução.
    "object-src 'none'",
    // Impede que um <base> injetado reescreva o destino de links e formulários.
    "base-uri 'self'",
    // Formulário não pode postar para fora — barra exfiltração de dados de lead.
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/**
 * Área administrativa: nonce, sem 'unsafe-inline'.
 *
 * Sem 'strict-dynamic' de propósito: ele faz o navegador IGNORAR o 'self', de
 * modo que qualquer script do Next que porventura saia sem nonce derrubaria o
 * painel inteiro. Mantendo 'self', script inline continua exigindo nonce (que é
 * o que barra XSS) e script de origem externa continua bloqueado — sem o risco
 * de deixar o dono sem acesso ao ERP por um detalhe de build.
 */
function cspEstrito(nonce: string): string {
  return montarCsp(`'self' 'nonce-${nonce}'`);
}

/** Site público: preserva o cache, restringindo as origens. */
function cspPublico(): string {
  return montarCsp(`'self' 'unsafe-inline' ${GTM}`);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const areaAdministrativa =
    pathname.startsWith("/admin") || pathname.startsWith("/erp");

  if (!areaAdministrativa) {
    const resposta = NextResponse.next();
    resposta.headers.set("Content-Security-Policy", cspPublico());
    return resposta;
  }

  // Nonce em base64, conforme a gramática do CSP.
  const nonce = btoa(crypto.randomUUID());
  const csp = cspEstrito(nonce);

  // O Next lê o nonce do CSP presente no cabeçalho da REQUISIÇÃO para aplicá-lo
  // aos próprios scripts de hidratação. Sem repassar aqui, a página administrativa
  // carregaria sem JavaScript.
  const cabecalhos = new Headers(request.headers);
  cabecalhos.set("x-nonce", nonce);
  cabecalhos.set("Content-Security-Policy", csp);

  const resposta = NextResponse.next({ request: { headers: cabecalhos } });
  resposta.headers.set("Content-Security-Policy", csp);
  return resposta;
}

export const config = {
  matcher: [
    /*
     * Tudo, menos o que não precisa de política:
     *  - _next/static e _next/image: arquivos versionados, servidos pelo Next
     *  - uploads: fotos de produto servidas pela rota /uploads/[nome]
     *  - arquivos de metadado na raiz
     * Poupa uma execução de middleware por asset, que em página com muitas
     * fotos é a maior parte das requisições.
     */
    "/((?!_next/static|_next/image|uploads/|favicon.ico|icon.png|robots.txt|sitemap.xml|manifest.webmanifest|opengraph-image).*)",
  ],
};
