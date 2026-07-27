import "server-only";

/**
 * Leitura do XML da NF-e (layout 4.00), sem dependência externa.
 *
 * NÃO valida assinatura nem consulta a SEFAZ — só extrai os dados de que o
 * estoque precisa (emitente + itens). A importação por CHAVE (distribuição
 * DF-e na SEFAZ) exige certificado A1 e provedor; fica para uma evolução.
 */

export type ItemNfe = {
  codigoFornecedor: string | null; // cProd
  descricao: string; // xProd
  ean: string | null; // cEAN
  ncm: string | null;
  cfop: string | null;
  quantidade: number;
  valorUnitario: number; // centavos
};

export type NotaNfe = {
  chave: string | null;
  numero: string | null;
  serie: string | null;
  emitidaEm: Date | null;
  valorTotal: number | null; // centavos
  fornecedor: {
    nome: string | null;
    cnpj: string | null;
    cidade: string | null;
    estado: string | null;
  };
  itens: ItemNfe[];
};

/** Primeiro conteúdo de <tag> dentro de um trecho. */
function tag(xml: string, nome: string): string | null {
  const m = xml.match(new RegExp(`<${nome}\\b[^>]*>([\\s\\S]*?)</${nome}>`, "i"));
  if (!m) return null;
  return decodeXml(m[1].trim()) || null;
}

function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

/** "1.234,56" ou "1234.56" (centavos, arredondado). */
function reaisParaCentavos(v: string | null): number | null {
  if (!v) return null;
  const n = Number(v.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

function numero(v: string | null): number {
  if (!v) return 0;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

/** Extrai todos os blocos <tagName ...>…</tagName>. */
function blocos(xml: string, nome: string): string[] {
  const re = new RegExp(`<${nome}\\b[^>]*>([\\s\\S]*?)</${nome}>`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) out.push(m[1]);
  return out;
}

export function parseNfeXml(xml: string): NotaNfe | null {
  if (!xml || !/<(nfe|NFe|infNFe)\b/i.test(xml)) return null;

  const inf = xml.match(/<infNFe\b[^>]*Id="([^"]*)"/i);
  const chaveBruta = inf?.[1]?.replace(/^NFe/i, "") ?? null;
  const chave = chaveBruta && /^\d{44}$/.test(chaveBruta) ? chaveBruta : null;

  const ide = blocos(xml, "ide")[0] ?? "";
  const emit = blocos(xml, "emit")[0] ?? "";
  const enderEmit = blocos(emit, "enderEmit")[0] ?? "";
  const total = blocos(xml, "ICMSTot")[0] ?? blocos(xml, "total")[0] ?? "";

  const dataStr = tag(ide, "dhEmi") ?? tag(ide, "dEmi");
  const emitidaEm = dataStr ? new Date(dataStr) : null;

  const itens: ItemNfe[] = blocos(xml, "det").map((det) => {
    const prod = blocos(det, "prod")[0] ?? det;
    const ean = tag(prod, "cEAN");
    return {
      codigoFornecedor: tag(prod, "cProd"),
      descricao: tag(prod, "xProd") ?? "Item sem descrição",
      ean: ean && ean !== "SEM GTIN" && /^\d{8,14}$/.test(ean) ? ean : null,
      ncm: tag(prod, "NCM"),
      cfop: tag(prod, "CFOP"),
      quantidade: Math.max(1, Math.round(numero(tag(prod, "qCom")))),
      valorUnitario: reaisParaCentavos(tag(prod, "vUnCom")) ?? 0,
    };
  });

  return {
    chave,
    numero: tag(ide, "nNF"),
    serie: tag(ide, "serie"),
    emitidaEm: emitidaEm && !Number.isNaN(emitidaEm.getTime()) ? emitidaEm : null,
    valorTotal: reaisParaCentavos(tag(total, "vNF")),
    fornecedor: {
      nome: tag(emit, "xNome") ?? tag(emit, "xFant"),
      cnpj: tag(emit, "CNPJ"),
      cidade: tag(enderEmit, "xMun"),
      estado: tag(enderEmit, "UF"),
    },
    itens: itens.filter((i) => i.descricao),
  };
}
