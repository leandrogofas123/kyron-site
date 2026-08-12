import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { acaoArquivarMaterial } from "@/lib/academy/acoes";
import { getMateriaisAdmin, getTrilhasParaVinculo } from "@/lib/academy/dados";
import { BotaoArquivarMaterial } from "@/components/erp/academy/BotaoArquivarMaterial";
import { MaterialForm } from "@/components/erp/academy/MaterialForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Materiais — Academy" };

export default async function MateriaisAcademyPage() {
  const [materiais, trilhas] = await Promise.all([getMateriaisAdmin(), getTrilhasParaVinculo()]);

  return (
    <div className="space-y-fluid-lg">
      <div>
        <p className="kyron-label text-fluid-2xs text-kyron-blue">KYRON ACADEMY</p>
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Materiais · Biblioteca</h1>
        <p className="mt-fluid-2xs text-fluid-sm text-kyron-silver/70">
          Upload de PDFs, apresentações e planilhas. Vincule a uma trilha ou deixe geral.
        </p>
      </div>

      <MaterialForm trilhas={trilhas} />

      <div className="rounded-kyron-md border border-[var(--kyron-hairline)]">
        {materiais.length === 0 ? (
          <p className="p-fluid-md text-fluid-sm text-kyron-silver/60">Nenhum material enviado ainda.</p>
        ) : (
          materiais.map((m) => (
            <div key={m.id} className="flex items-center gap-fluid-sm border-b border-[var(--kyron-hairline)] p-fluid-sm last:border-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-kyron-sm bg-kyron-black text-kyron-blue"><FileText size={18} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-fluid-sm text-kyron-white">{m.titulo}</p>
                <p className="text-fluid-2xs text-kyron-silver/50">
                  {m.tipo.toUpperCase()} · {m.tamanhoKb ? `${m.tamanhoKb} KB` : "—"}
                  {m.trilha && ` · ${m.trilha.nome}`}{m.aula && ` · ${m.aula.titulo}`}
                </p>
              </div>
              <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-fluid-2xs text-kyron-blue hover:text-kyron-white">Abrir</a>
              <BotaoArquivarMaterial onArquivar={acaoArquivarMaterial.bind(null, m.id)} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
