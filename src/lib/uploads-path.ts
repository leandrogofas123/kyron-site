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

/** Extensões aceitas para materiais da Academy (documentos, não fotos). */
export const EXTENSOES_MATERIAL = ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "zip"] as const;

const CONTENT_TYPE_MATERIAL: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  zip: "application/zip",
};

/** Nome de material válido: UUID + uma das extensões aceitas. Barra caminho malicioso. */
export function nomeMaterialValido(nome: string): boolean {
  const re = new RegExp(`^[0-9a-f-]{36}\\.(${EXTENSOES_MATERIAL.join("|")})$`, "i");
  return re.test(nome);
}

export function contentTypeMaterial(nome: string): string {
  const ext = nome.split(".").pop()?.toLowerCase() ?? "";
  return CONTENT_TYPE_MATERIAL[ext] ?? "application/octet-stream";
}
