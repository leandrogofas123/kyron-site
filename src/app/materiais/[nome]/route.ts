import { readFile } from "node:fs/promises";
import path from "node:path";

import { contentTypeMaterial, nomeMaterialValido, UPLOADS_DIR } from "@/lib/uploads-path";

export const runtime = "nodejs";

/**
 * Serve os materiais da Kyron Academy (PDF, docs, planilhas, zip) gravados em
 * UPLOADS_DIR. Mesmo padrão de segurança da rota de fotos: nome validado
 * (UUID + extensão de uma lista fixa) antes de tocar o disco, path.basename
 * como segunda barreira contra travessia de diretório.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ nome: string }> },
) {
  const { nome } = await params;

  if (!nomeMaterialValido(nome)) {
    return new Response("Não encontrado", { status: 404 });
  }

  const seguro = path.basename(nome);
  try {
    const dados = await readFile(path.join(UPLOADS_DIR, seguro));
    return new Response(new Uint8Array(dados), {
      headers: {
        "content-type": contentTypeMaterial(seguro),
        "cache-control": "public, max-age=31536000, immutable",
        "content-disposition": `inline; filename="${seguro}"`,
      },
    });
  } catch {
    return new Response("Não encontrado", { status: 404 });
  }
}
