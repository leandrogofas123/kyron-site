"use client";

import type { AlunoLinha } from "@/lib/erp/alunos";
import { AcoesAluno } from "./AcoesAluno";
import { TabelaFiltravel, type Coluna } from "./TabelaFiltravel";

const dataBR = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(new Date(iso));

export function ListaAlunos({ alunos }: { alunos: AlunoLinha[] }) {
  const colunas: Coluna<AlunoLinha>[] = [
    { chave: "nome", titulo: "Aluno", tipo: "texto", valor: (a) => a.nome,
      render: (a) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-kyron-white">{a.nome}</p>
          <p className="truncate text-kyron-silver/60">{a.email}</p>
        </div>
      ) },
    { chave: "telefone", titulo: "Telefone", tipo: "texto", valor: (a) => a.telefone ?? "",
      render: (a) => a.telefone ?? <span className="text-kyron-silver/40">—</span> },
    { chave: "status", titulo: "Status", tipo: "texto", valor: (a) => (a.aprovado ? "aprovado" : "pendente"),
      render: (a) =>
        a.aprovado ? (
          <span className="kyron-label text-kyron-blue">aprovado</span>
        ) : (
          <span className="kyron-label rounded-kyron-sm bg-kyron-blue/15 px-1.5 py-0.5 text-kyron-blue">pendente</span>
        ) },
    { chave: "verificado", titulo: "E-mail", tipo: "texto", valor: (a) => (a.emailVerificado ? "verificado" : "não verif."),
      render: (a) => <span className="text-kyron-silver/70">{a.emailVerificado ? "verificado" : "não verif."}</span> },
    { chave: "criado", titulo: "Cadastro", tipo: "data", valor: (a) => a.criadoEm },
    { chave: "ultimo", titulo: "Último acesso", tipo: "data", valor: (a) => a.ultimoLogin ?? "",
      render: (a) => (a.ultimoLogin ? dataBR(a.ultimoLogin) : <span className="text-kyron-silver/40">nunca</span>) },
    { chave: "acoes", titulo: "Ações", tipo: "acao", alinhar: "dir",
      render: (a) => <div className="flex justify-end"><AcoesAluno id={a.id} aprovado={a.aprovado} /></div> },
  ];

  return <TabelaFiltravel colunas={colunas} dados={alunos} vazio="Nenhum aluno cadastrado ainda." />;
}
