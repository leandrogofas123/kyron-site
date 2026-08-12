/**
 * Catálogo de permissões da plataforma (módulo auth).
 *
 * As permissões vivem NO CÓDIGO, não no banco. Motivo: assim elas são
 * versionadas junto com as telas que protegem, revisáveis em diff e não
 * "derivam" silenciosamente em produção. Os PAPÉIS ficam no banco (quem tem
 * qual papel muda no dia a dia); o que cada papel PODE muda com o código.
 *
 * Quando existir multiempresa/white-label, basta o PermissionService passar a
 * ler de outra fonte — quem consome (`pode`, `exigirPermissao`) não muda.
 */

export const PERMISSOES = [
  "dashboard.ver",
  "catalogo.ler",
  "catalogo.escrever",
  "estoque.ler",
  "estoque.movimentar",
  "notas.ler",
  "notas.importar",
  "fornecedores.ler",
  "fornecedores.escrever",
  "clientes.ler",
  "clientes.escrever",
  "crm.ler", // leads
  "crm.escrever",
  "manual.ver",
  "manual.editar",
  "aulas.assistir", // conteúdo restrito do Manual
  "admin.painel", // painel da loja (/admin)
  "usuarios.gerenciar", // conceder/revogar acesso
  "auditoria.ver",
  // ─── Kyron Academy (V2) ───
  "academy.conteudo.ver",
  "academy.conteudo.gerenciar", // criar/editar trilha, módulo, aula, material
  "academy.conteudo.publicar",
  "academy.conteudo.arquivar",
  "academy.aluno.aprovar",
  "academy.aluno.progresso.ver",
  "academy.xp.conceder", // XP/badge manual
] as const;

export type Permissao = (typeof PERMISSOES)[number];

export const PAPEIS = [
  "ADMIN_MASTER",
  "ADMIN",
  "GERENTE",
  "VENDEDOR",
  "TECNICO",
  "FINANCEIRO",
  "SUPORTE",
  "CLIENTE",
] as const;

export type Papel = (typeof PAPEIS)[number];

export const NOME_PAPEL: Record<Papel, string> = {
  ADMIN_MASTER: "Administrador master",
  ADMIN: "Administrador",
  GERENTE: "Gerente",
  VENDEDOR: "Vendedor",
  TECNICO: "Técnico",
  FINANCEIRO: "Financeiro",
  SUPORTE: "Suporte",
  CLIENTE: "Cliente",
};

/**
 * O que cada papel pode. Conjuntos EXPLÍCITOS em vez de herança automática por
 * nível: herança implícita é onde nascem os furos de permissão ("achei que
 * gerente não via isso"). Um papel novo obriga a escrever o que ele enxerga.
 */
const MAPA: Record<Papel, readonly Permissao[] | ["*"]> = {
  ADMIN_MASTER: ["*"],

  ADMIN: [
    "dashboard.ver",
    "catalogo.ler",
    "catalogo.escrever",
    "estoque.ler",
    "estoque.movimentar",
    "notas.ler",
    "notas.importar",
    "fornecedores.ler",
    "fornecedores.escrever",
    "clientes.ler",
    "clientes.escrever",
    "crm.ler",
    "crm.escrever",
    "manual.ver",
    "manual.editar",
    "aulas.assistir",
    "admin.painel",
    "academy.conteudo.ver",
    "academy.conteudo.gerenciar",
    "academy.conteudo.publicar",
    "academy.conteudo.arquivar",
    "academy.aluno.aprovar",
    "academy.aluno.progresso.ver",
    "academy.xp.conceder",
  ],

  GERENTE: [
    "dashboard.ver",
    "catalogo.ler",
    "catalogo.escrever",
    "estoque.ler",
    "estoque.movimentar",
    "notas.ler",
    "notas.importar",
    "fornecedores.ler",
    "fornecedores.escrever",
    "clientes.ler",
    "clientes.escrever",
    "crm.ler",
    "crm.escrever",
    "manual.ver",
    "manual.editar",
    "aulas.assistir",
    "admin.painel",
    "academy.conteudo.ver",
    "academy.conteudo.gerenciar",
    "academy.conteudo.publicar",
    "academy.aluno.aprovar",
    "academy.aluno.progresso.ver",
  ],

  VENDEDOR: [
    "dashboard.ver",
    "catalogo.ler",
    "estoque.ler",
    "estoque.movimentar",
    "clientes.ler",
    "clientes.escrever",
    "crm.ler",
    "crm.escrever",
    "manual.ver",
    "aulas.assistir",
    "academy.conteudo.ver",
  ],

  TECNICO: [
    "dashboard.ver",
    "catalogo.ler",
    "estoque.ler",
    "estoque.movimentar",
    "manual.ver",
    "aulas.assistir",
    "academy.conteudo.ver",
  ],

  FINANCEIRO: [
    "dashboard.ver",
    "catalogo.ler",
    "estoque.ler",
    "crm.ler",
    "manual.ver",
  ],

  SUPORTE: ["dashboard.ver", "catalogo.ler", "crm.ler", "manual.ver"],

  // Cliente do Manual: só o conteúdo, e ainda depende de estar aprovado.
  CLIENTE: ["manual.ver", "aulas.assistir"],
};

/** Todas as permissões de um conjunto de papéis (união). */
export function permissoesDe(papeis: readonly string[]): Set<string> {
  const saida = new Set<string>();
  for (const p of papeis) {
    const lista = MAPA[p as Papel];
    if (!lista) continue;
    if (lista[0] === "*") return new Set(["*"]);
    for (const perm of lista) saida.add(perm);
  }
  return saida;
}

export function conjuntoPermite(
  permissoes: Set<string>,
  acao: Permissao | string,
): boolean {
  return permissoes.has("*") || permissoes.has(acao);
}

/** Papel de maior poder (menor nível) — para exibir "você é X". */
export function papelPrincipal(papeis: readonly string[]): Papel | null {
  const ordem = PAPEIS as readonly string[];
  let melhor: Papel | null = null;
  let melhorIdx = Number.MAX_SAFE_INTEGER;
  for (const p of papeis) {
    const i = ordem.indexOf(p);
    if (i >= 0 && i < melhorIdx) {
      melhorIdx = i;
      melhor = p as Papel;
    }
  }
  return melhor;
}
