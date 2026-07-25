"use client";

import { useActionState } from "react";

import { acaoSalvarPost } from "@/lib/admin-actions";

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-xs text-fluid-base text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const rotulo = "kyron-label mb-fluid-2xs block text-fluid-2xs text-kyron-silver/70";

export type PostEdit = {
  id: number;
  titulo: string;
  resumo: string | null;
  conteudo: string | null;
  youtubeId: string | null;
  restrito: boolean;
  publicado: boolean;
};

export function PostForm({ post }: { post?: PostEdit }) {
  const [estado, formAction, pendente] = useActionState(acaoSalvarPost, null);

  return (
    <form action={formAction} className="space-y-fluid-md">
      {post && <input type="hidden" name="id" value={post.id} />}

      <div>
        <label htmlFor="p-titulo" className={rotulo}>
          Título *
        </label>
        <input
          id="p-titulo"
          name="titulo"
          defaultValue={post?.titulo}
          required
          className={campo}
        />
      </div>

      <div>
        <label htmlFor="p-resumo" className={rotulo}>
          Resumo
        </label>
        <input
          id="p-resumo"
          name="resumo"
          defaultValue={post?.resumo ?? ""}
          placeholder="Uma linha que aparece no card"
          className={campo}
        />
      </div>

      <div>
        <label htmlFor="p-youtube" className={rotulo}>
          Vídeo do YouTube (URL ou ID)
        </label>
        <input
          id="p-youtube"
          name="youtube"
          defaultValue={post?.youtubeId ?? ""}
          placeholder="https://youtu.be/… — vazio = post sem vídeo"
          className={campo}
        />
        <p className="mt-fluid-2xs text-fluid-2xs text-kyron-silver/60">
          Com vídeo, o post vira uma <strong>aula</strong>. Suba no YouTube como
          &quot;não listado&quot; para não aparecer publicamente lá.
        </p>
      </div>

      <div>
        <label htmlFor="p-conteudo" className={rotulo}>
          Conteúdo
        </label>
        <textarea
          id="p-conteudo"
          name="conteudo"
          rows={6}
          defaultValue={post?.conteudo ?? ""}
          placeholder="Texto do post ou descrição da aula"
          className={`${campo} resize-y`}
        />
      </div>

      <div className="flex flex-wrap gap-fluid-md">
        <label className="flex items-center gap-fluid-xs text-fluid-sm text-kyron-silver">
          <input
            type="checkbox"
            name="restrito"
            value="on"
            defaultChecked={post?.restrito}
            className="h-4 w-4 accent-[#1e6bff]"
          />
          Restrito (só clientes aprovados)
        </label>
        <label className="flex items-center gap-fluid-xs text-fluid-sm text-kyron-silver">
          <input
            type="checkbox"
            name="publicado"
            value="on"
            defaultChecked={post ? post.publicado : true}
            className="h-4 w-4 accent-[#1e6bff]"
          />
          Publicado
        </label>
      </div>

      {estado?.erro && (
        <p role="alert" className="text-fluid-sm text-kyron-blue">
          {estado.erro}
        </p>
      )}

      <button
        type="submit"
        disabled={pendente}
        className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px disabled:opacity-50"
      >
        {pendente ? "Salvando…" : post ? "Salvar alterações" : "Adicionar"}
      </button>
    </form>
  );
}
