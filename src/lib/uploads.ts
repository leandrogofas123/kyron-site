import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { logger } from "./core/logger";
import { UPLOADS_DIR } from "./uploads-path";

/**
 * Recebe a foto do produto e devolve uma URL servível.
 *
 * Regras da spec (§2): converte para WebP, redimensiona para no máximo 1200px
 * de largura. Isso evita foto pesada travar o site — o dono manda a imagem do
 * celular sem se preocupar com tamanho.
 *
 * Grava em UPLOADS_DIR (fora de public/) e devolve a URL /uploads/<nome>, que é
 * servida pela rota app/uploads/[nome]. Assim funciona igual no dev e em
 * produção com disco persistente. Ver uploads-path.ts.
 */

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB de entrada
const TIPOS = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

export type ResultadoUpload =
  | { ok: true; url: string }
  | { ok: false; erro: string };

export async function salvarImagemProduto(arquivo: File): Promise<ResultadoUpload> {
  if (!arquivo || arquivo.size === 0) return { ok: false, erro: "Arquivo vazio." };
  if (arquivo.size > MAX_BYTES) return { ok: false, erro: "Imagem acima de 12 MB." };
  if (arquivo.type && !TIPOS.has(arquivo.type)) {
    return { ok: false, erro: "Formato não suportado. Use JPG, PNG ou WebP." };
  }

  try {
    const entrada = Buffer.from(await arquivo.arrayBuffer());

    const processada = await sharp(entrada)
      .rotate() // respeita a orientação do EXIF (foto de celular deitada)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    await mkdir(UPLOADS_DIR, { recursive: true });
    const nome = `${randomUUID()}.webp`;
    await writeFile(path.join(UPLOADS_DIR, nome), processada);

    return { ok: true, url: `/uploads/${nome}` };
  } catch (erro) {
    logger.error("falha no upload de imagem", { erro });
    return { ok: false, erro: "Não foi possível processar a imagem." };
  }
}
