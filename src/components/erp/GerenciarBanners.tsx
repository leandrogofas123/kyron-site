"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";

import {
  acaoAlternarBanner,
  acaoDuplicarBanner,
  acaoExcluirBanner,
  acaoSalvarBanner,
} from "@/lib/site/acoes";

type Pos = { id: string; nome: string; desktop: { w: number; h: number }; mobile: { w: number; h: number } };
type Banner = {
  id: number; titulo: string; posicao: string; imagemDesktop: string; imagemMobile: string | null;
  link: string | null; botaoTexto: string | null; ordem: number; ativo: boolean;
  rotacaoSegundos: number; inicioEm: string | null; fimEm: string | null;
};

const inp =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-2xs text-fluid-sm text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const lbl = "kyron-label mb-1 block text-fluid-2xs text-kyron-silver/60";
const ROTACOES = [3, 5, 6, 8, 10, 15];

export function GerenciarBanners({ banners, posicoes }: { banners: Banner[]; posicoes: Pos[] }) {
  const [editando, setEditando] = useState<Banner | null>(null);
  const [posSel, setPosSel] = useState(posicoes[0]?.id ?? "hero");
  const [estado, action, pend] = useActionState(acaoSalvarBanner, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado?.ok) { ref.current?.reset(); setEditando(null); }
  }, [estado?.ok]);
  useEffect(() => { if (editando) setPosSel(editando.posicao); }, [editando]);

  const pos = posicoes.find((p) => p.id === posSel);

  return (
    <div className="grid gap-fluid-xl xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
      {/* Lista */}
      <div className="space-y-fluid-lg">
        {posicoes.map((p) => {
          const doGrupo = banners.filter((b) => b.posicao === p.id);
          return (
            <div key={p.id}>
              <div className="mb-fluid-sm flex items-baseline justify-between">
                <h2 className="kyron-label text-fluid-2xs text-kyron-silver/70">{p.nome}</h2>
                <span className="text-fluid-2xs text-kyron-silver/50">
                  Desktop {p.desktop.w}×{p.desktop.h} · Mobile {p.mobile.w}×{p.mobile.h} · JPG/PNG/WebP
                </span>
              </div>
              {doGrupo.length === 0 ? (
                <p className="text-fluid-2xs text-kyron-silver/50">Nenhum banner nesta posição.</p>
              ) : (
                <ul className="space-y-fluid-2xs">
                  {doGrupo.map((b) => (
                    <li key={b.id} className="flex items-center gap-fluid-sm rounded-kyron-sm border border-[var(--kyron-hairline)] p-fluid-2xs">
                      <div className="relative h-10 w-20 shrink-0 overflow-hidden rounded bg-kyron-black">
                        <Image src={b.imagemDesktop} alt="" fill sizes="80px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-fluid-sm text-kyron-white">
                          {b.titulo}{!b.ativo && <span className="text-fluid-2xs text-kyron-silver/50"> · inativo</span>}
                        </p>
                        <p className="text-fluid-2xs text-kyron-silver/50">ordem {b.ordem} · rotação {b.rotacaoSegundos}s</p>
                      </div>
                      <div className="flex shrink-0 gap-2 text-fluid-2xs">
                        <button onClick={() => setEditando(b)} className="text-kyron-silver hover:text-kyron-white">Editar</button>
                        <button onClick={() => acaoAlternarBanner(b.id, !b.ativo)} className="text-kyron-silver hover:text-kyron-blue">{b.ativo ? "Desativar" : "Ativar"}</button>
                        <button onClick={() => acaoDuplicarBanner(b.id)} className="text-kyron-silver hover:text-kyron-white">Duplicar</button>
                        <button onClick={() => acaoExcluirBanner(b.id)} className="text-kyron-silver hover:text-[var(--kyron-amber,#d9902f)]">Excluir</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Form */}
      <form ref={ref} action={action} className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
        <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
          {editando ? `Editar “${editando.titulo}”` : "Novo banner"}
        </h2>
        {editando && <input type="hidden" name="id" value={editando.id} />}

        <div className="mb-fluid-xs"><span className={lbl}>Título</span>
          <input name="titulo" defaultValue={editando?.titulo ?? ""} className={inp} placeholder="Ex.: Promoção de seminovos" /></div>

        <div className="mb-fluid-xs"><span className={lbl}>Posição</span>
          <select name="posicao" value={posSel} onChange={(e) => setPosSel(e.target.value)} className={inp}>
            {posicoes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
          {pos && <p className="mt-1 text-fluid-2xs text-kyron-silver/50">Recomendado: desktop {pos.desktop.w}×{pos.desktop.h}, mobile {pos.mobile.w}×{pos.mobile.h}.</p>}
        </div>

        <div className="grid grid-cols-2 gap-fluid-xs">
          <div><span className={lbl}>Arte desktop{editando ? " (trocar)" : ""}</span>
            <input type="file" name="arquivoDesktop" accept="image/*" className="text-fluid-2xs text-kyron-silver" /></div>
          <div><span className={lbl}>Arte mobile (opcional)</span>
            <input type="file" name="arquivoMobile" accept="image/*" className="text-fluid-2xs text-kyron-silver" /></div>
        </div>

        <div className="mt-fluid-xs grid grid-cols-2 gap-fluid-xs">
          <div className="col-span-2"><span className={lbl}>Link (para onde leva)</span>
            <input name="link" defaultValue={editando?.link ?? ""} className={inp} placeholder="/produtos?categoria=…" /></div>
          <div><span className={lbl}>Texto do botão</span>
            <input name="botaoTexto" defaultValue={editando?.botaoTexto ?? ""} className={inp} placeholder="Ver ofertas" /></div>
          <div><span className={lbl}>Ordem</span>
            <input name="ordem" inputMode="numeric" defaultValue={editando?.ordem ?? 0} className={inp} /></div>
          <div><span className={lbl}>Rotação (s)</span>
            <select name="rotacaoSegundos" defaultValue={editando?.rotacaoSegundos ?? 6} className={inp}>
              {ROTACOES.map((s) => <option key={s} value={s}>{s}s</option>)}
            </select></div>
          <label className="flex items-end gap-2 pb-1 text-fluid-2xs text-kyron-silver">
            <input type="checkbox" name="ativo" defaultChecked={editando ? editando.ativo : true} className="h-4 w-4 accent-kyron-blue" /> Ativo
          </label>
          <div><span className={lbl}>Início (opcional)</span>
            <input type="date" name="inicioEm" defaultValue={editando?.inicioEm?.slice(0, 10) ?? ""} className={inp} /></div>
          <div><span className={lbl}>Fim (opcional)</span>
            <input type="date" name="fimEm" defaultValue={editando?.fimEm?.slice(0, 10) ?? ""} className={inp} /></div>
        </div>

        {estado?.erro && <p role="alert" className="mt-fluid-xs text-fluid-2xs text-[var(--kyron-amber,#d9902f)]">{estado.erro}</p>}
        <div className="mt-fluid-md flex gap-fluid-xs">
          <button type="submit" disabled={pend} className="kyron-label flex-1 rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-2xs text-fluid-2xs text-white disabled:opacity-50">
            {pend ? "Salvando…" : editando ? "Salvar alterações" : "Publicar banner"}
          </button>
          {editando && <button type="button" onClick={() => setEditando(null)} className="kyron-label rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-sm py-fluid-2xs text-fluid-2xs text-kyron-silver">Cancelar</button>}
        </div>
      </form>
    </div>
  );
}
