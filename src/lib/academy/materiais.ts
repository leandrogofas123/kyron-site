import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { logger } from "../core/logger";
import { EXTENSOES_MATERIAL, UPLOADS_DIR } from "../uploads-path";

/**
 * Upload de materiais da Kyron Academy (PDF, docs, planilhas, zip).
 *
 * Mesmo disco persistente dos uploads de produto (UPLOADS_DIR — funciona
 * igual em dev e produção, ver uploads-path.ts), servido por uma rota própria
 * (/materiais/[nome]) porque o content-type não é sempre imagem.
 */

const MAX_BYTES = 30 * 1024 * 1024; // 30 MB

export type ResultadoUploadMaterial =
  | { ok: true; url: string; tamanhoKb: number }
  | { ok: false; erro: string };

function extensaoDe(nomeOriginal: string): string | null {
  const ext = nomeOriginal.split(".").pop()?.toLowerCase();
  return ext && (EXTENSOES_MATERIAL as readonly string[]).includes(ext) ? ext : null;
}

export async function salvarMaterialAcademy(arquivo: File): Promise<ResultadoUploadMaterial> {
  if (!arquivo || arquivo.size === 0) return { ok: false, erro: "Arquivo vazio." };
  if (arquivo.size > MAX_BYTES) return { ok: false, erro: "Arquivo acima de 30 MB." };

  const ext = extensaoDe(arquivo.name || "");
  if (!ext) {
    return { ok: false, erro: `Formato não suportado. Use: ${EXTENSOES_MATERIAL.join(", ")}.` };
  }

  try {
    const dados = Buffer.from(await arquivo.arrayBuffer());
    await mkdir(UPLOADS_DIR, { recursive: true });
    const nome = `${randomUUID()}.${ext}`;
    await writeFile(path.join(UPLOADS_DIR, nome), dados);

    return { ok: true, url: `/materiais/${nome}`, tamanhoKb: Math.round(dados.byteLength / 1024) };
  } catch (erro) {
    logger.error("falha no upload de material da Academy", { erro });
    return { ok: false, erro: "Não foi possível salvar o arquivo." };
  }
}
