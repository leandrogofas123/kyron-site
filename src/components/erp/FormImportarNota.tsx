"use client";

import { useActionState } from "react";

import { acaoImportarNota } from "@/lib/erp/nfe/importar";

export function FormImportarNota() {
  const [estado, importar, importando] = useActionState(acaoImportarNota, null);

  return (
    <form
      action={importar}
      className="rounded-kyron-md border border-dashed border-[var(--kyron-hairline-strong)] bg-kyron-graphite p-fluid-md"
    >
      <label htmlFor="xml" className="kyron-label block text-fluid-2xs text-kyron-silver/70">
        Arquivo XML da NF-e
      </label>
      <input
        id="xml"
        name="xml"
        type="file"
        accept=".xml,text/xml,application/xml"
        required
        className="mt-fluid-2xs block w-full text-fluid-sm text-kyron-silver file:mr-3 file:rounded-kyron-sm file:border-0 file:bg-kyron-blue file:px-3 file:py-2 file:text-fluid-2xs file:text-white"
      />
      <p className="mt-fluid-2xs text-fluid-2xs text-kyron-silver/55">
        O XML de compra (NF-e modelo 55). Importar por chave (SEFAZ) exige
        certificado — fica para depois.
      </p>

      {estado?.erro && (
        <p role="alert" className="mt-fluid-sm text-fluid-sm text-kyron-blue">
          {estado.erro}
        </p>
      )}

      <button
        type="submit"
        disabled={importando}
        className="kyron-label mt-fluid-md rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all hover:-translate-y-px disabled:opacity-50"
      >
        {importando ? "Lendo a nota…" : "Importar XML"}
      </button>
    </form>
  );
}
