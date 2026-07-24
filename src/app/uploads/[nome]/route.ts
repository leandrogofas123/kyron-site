import { readFile } from "node:fs/promises";
import path from "node:path";

import { UPLOADS_DIR, nomeArquivoValido } from "@/lib/uploads-path";

export const runtime = "nodejs";

/**
 * Serve as fotos dos produtos gravadas em UPLOADS_DIR.
 *
 * O nome é validado (só UUID.webp) antes de tocar o disco — nunca concatena
 * entrada do usuário num caminho sem checar. path.basename é a segunda barreira
 * contra travessia de diretório (../).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ nome: string }> },
) {
  const { nome } = await params;

  if (!nomeArquivoValido(nome)) {
    return new Response("Não encontrado", { status: 404 });
  }

  const seguro = path.basename(nome); // barra qualquer ../ que passe
  try {
    const dados = await readFile(path.join(UPLOADS_DIR, seguro));
    return new Response(new Uint8Array(dados), {
      headers: {
        "content-type": "image/webp",
        // Nome imutável → pode cachear por um ano no navegador e na CDN.
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Não encontrado", { status: 404 });
  }
}
