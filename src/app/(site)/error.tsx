"use client";

import { useEffect } from "react";

/**
 * Fronteira de erro do site público.
 *
 * POR QUE EXISTE
 * Sem este arquivo, uma exceção em produção mostra a tela de erro genérica do
 * Next e — pior — não deixa rastro nenhum: o dono só descobre que o site quebrou
 * quando um cliente avisa pelo WhatsApp. Aqui o erro é registrado com o `digest`
 * (o identificador que o Next também grava no log do servidor), permitindo casar
 * o relato do cliente com a linha de log correspondente.
 *
 * A tela segue a linguagem visual do site e oferece as duas saídas que
 * importam para o negócio: tentar de novo e falar no WhatsApp — porque a venda
 * fecha lá, e uma página quebrada não pode significar um cliente perdido.
 */
export default function Erro({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log estruturado no cliente: chega ao console do navegador e a qualquer
    // coletor de front que venha depois. O servidor já registra o seu lado.
    console.error(
      JSON.stringify({
        nivel: "error",
        escopo: "site",
        mensagem: "erro de renderização",
        digest: error.digest ?? null,
        detalhe: error.message,
        caminho: typeof window !== "undefined" ? window.location.pathname : null,
      }),
    );
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-fluid-md px-fluid-md text-center">
      <p className="kyron-display text-fluid-xs tracking-[0.14em] text-kyron-blue">
        ALGO SAIU DO LUGAR
      </p>
      <h1 className="kyron-display text-fluid-2xl text-kyron-white">
        NÃO CONSEGUIMOS CARREGAR ESTA PÁGINA.
      </h1>
      <p className="text-fluid-sm text-kyron-silver">
        A falha foi registrada e vamos verificar. Você pode tentar de novo ou
        falar direto com a gente.
      </p>

      <div className="mt-fluid-sm flex flex-wrap items-center justify-center gap-fluid-sm">
        <button
          type="button"
          onClick={reset}
          className="rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs font-semibold tracking-wide text-white transition-transform duration-300 hover:-translate-y-0.5"
        >
          TENTAR DE NOVO
        </button>
        <a
          href="/"
          className="rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-md py-fluid-sm text-fluid-xs font-semibold tracking-wide text-kyron-white transition-transform duration-300 hover:-translate-y-0.5"
        >
          IR PARA O INÍCIO
        </a>
      </div>

      {error.digest && (
        <p className="mt-fluid-sm text-fluid-2xs text-kyron-silver">
          Código da ocorrência: <span className="font-mono">{error.digest}</span>
        </p>
      )}
    </main>
  );
}
