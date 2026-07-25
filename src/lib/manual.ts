import { db } from "./db";

/**
 * Leitura do Manual de Instalação (posts públicos + aulas em vídeo).
 * O controle de acesso (aula restrita) é feito nas páginas, com usuarioLogado().
 */

export async function getPosts() {
  return db.post.findMany({
    where: { publicado: true },
    orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
    select: {
      id: true,
      slug: true,
      titulo: true,
      resumo: true,
      youtubeId: true,
      restrito: true,
    },
  });
}

export async function getPost(slug: string) {
  return db.post.findFirst({ where: { slug, publicado: true } });
}

/** Para o admin: lista tudo, inclusive não publicados. */
export async function getPostsAdmin() {
  return db.post.findMany({
    orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
  });
}

/**
 * Aceita a URL completa do YouTube (watch, youtu.be, embed, shorts) ou o
 * próprio ID de 11 caracteres, e devolve só o ID — ou null se não reconhecer.
 */
export function extrairYoutubeId(entrada: string): string | null {
  const s = entrada.trim();
  if (!s) return null;
  if (/^[\w-]{11}$/.test(s)) return s;

  try {
    const url = new URL(s);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.slice(1);
      return /^[\w-]{11}$/.test(id) ? id : null;
    }
    const v = url.searchParams.get("v");
    if (v && /^[\w-]{11}$/.test(v)) return v;
    const m = url.pathname.match(/\/(?:embed|shorts)\/([\w-]{11})/);
    if (m) return m[1];
  } catch {
    return null;
  }
  return null;
}
