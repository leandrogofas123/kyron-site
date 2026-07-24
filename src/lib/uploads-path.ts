import "server-only";

import path from "node:path";

/**
 * Onde as imagens enviadas ficam guardadas.
 *
 * Fora de public/ de propósito: em produção, o Next não serve com segurança
 * arquivos gravados em public/ depois do build. Aqui gravamos num diretório de
 * dados e servimos por uma rota controlada (app/uploads/[nome]).
 *
 * UPLOADS_DIR permite apontar para um DISCO PERSISTENTE montado pela hospedagem
 * (Railway/Render/VPS) — é lá que as fotos sobrevivem a cada nova publicação.
 * Sem a variável, usa ./data/uploads na raiz do projeto (bom para dev).
 */
export const UPLOADS_DIR =
  process.env.UPLOADS_DIR ?? path.join(process.cwd(), "data", "uploads");

/** Nome de arquivo válido: só UUID + .webp. Barra caminho malicioso. */
export function nomeArquivoValido(nome: string): boolean {
  return /^[0-9a-f-]{36}\.webp$/i.test(nome);
}
