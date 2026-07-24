import type { Lead } from "./lead";

/**
 * Integração com o HubSpot CRM.
 *
 * Cada lead vira um CONTATO no HubSpot. A conversa e o resumo do problema são
 * anexados como uma NOTA no próprio contato — assim o especialista revê tudo
 * dentro do CRM, sem banco de dados separado e sem nova superfície de LGPD.
 *
 * Usa só propriedades padrão do HubSpot (email, firstname, company). Nada de
 * campo customizado — o token não precisa de permissão para criar propriedades.
 *
 * Token: crie um "Private App" no HubSpot (Configurações → Integrações →
 * Aplicativos privados) com os escopos:
 *   crm.objects.contacts.read
 *   crm.objects.contacts.write
 * O token começa com "pat-". Guarde em HUBSPOT_TOKEN no .env.local.
 */

const BASE = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_TOKEN;

/** Associação padrão do HubSpot entre Nota e Contato. */
const NOTA_PARA_CONTATO = 202;

type ResultadoHubSpot =
  | { ok: true }
  | { ok: false; motivo: string };

function headers() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  };
}

/** "Leandro Miguel" → { firstname: "Leandro", lastname: "Miguel" } */
function separarNome(nome: string): { firstname: string; lastname?: string } {
  const partes = nome.trim().split(/\s+/);
  const firstname = partes.shift() ?? nome;
  const lastname = partes.join(" ");
  return lastname ? { firstname, lastname } : { firstname };
}

async function criarOuAtualizarContato(lead: Lead): Promise<string | null> {
  const properties: Record<string, string> = {
    ...separarNome(lead.nome),
  };
  if (lead.email) properties.email = lead.email;
  if (lead.telefone) properties.phone = lead.telefone;
  if (lead.empresa) properties.company = lead.empresa;

  const criar = await fetch(`${BASE}/crm/v3/objects/contacts`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ properties }),
    signal: AbortSignal.timeout(10_000),
  });

  if (criar.ok) {
    const dados = (await criar.json()) as { id: string };
    return dados.id;
  }

  // 409 = já existe um contato com esse e-mail. O corpo traz o id existente.
  if (criar.status === 409) {
    const corpo = (await criar.json()) as { message?: string };
    const id = corpo.message?.match(/Existing ID:\s*(\d+)/)?.[1];
    if (!id) return null;

    // Atualiza os dados que possam ter mudado (empresa, telefone).
    await fetch(`${BASE}/crm/v3/objects/contacts/${id}`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ properties }),
      signal: AbortSignal.timeout(10_000),
    }).catch(() => undefined);

    return id;
  }

  console.error("[kyron:hubspot] falha ao criar contato", criar.status, await criar.text().catch(() => ""));
  return null;
}

async function anexarNota(
  contatoId: string,
  corpoNota: string,
): Promise<void> {
  await fetch(`${BASE}/crm/v3/objects/notes`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      properties: {
        hs_note_body: corpoNota,
        hs_timestamp: new Date().toISOString(),
      },
      associations: [
        {
          to: { id: contatoId },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: NOTA_PARA_CONTATO,
            },
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(10_000),
  }).catch((erro) => {
    // A nota é um extra. Se falhar, o contato já foi criado — não perde o lead.
    console.error("[kyron:hubspot] falha ao anexar nota", erro);
  });
}

const ROTULO_INTERESSE: Record<string, string> = {
  "ia-aplicada": "IA Aplicada",
  "automacao-integracao": "Automação & Integração",
  "engenharia-de-software": "Engenharia de Software",
  "dados-e-decisao": "Dados & Decisão",
  "nao-definido": "Não definido",
};

/** Monta o corpo da nota: resumo, interesse e a conversa (quando houver). */
function montarNota(lead: Lead, transcricao?: string): string {
  const linhas = [
    "Lead capturado pelo assistente do site.",
    "",
    `Interesse: ${ROTULO_INTERESSE[lead.interesse] ?? lead.interesse}`,
    `Problema relatado: ${lead.resumo}`,
  ];

  if (transcricao?.trim()) {
    linhas.push("", "— Conversa —", transcricao.trim());
  }

  return linhas.join("\n");
}

export function hubspotConfigurado(): boolean {
  return Boolean(TOKEN);
}

export async function enviarLeadHubSpot(
  lead: Lead,
  transcricao?: string,
): Promise<ResultadoHubSpot> {
  if (!TOKEN) return { ok: false, motivo: "HUBSPOT_TOKEN ausente" };

  try {
    const contatoId = await criarOuAtualizarContato(lead);
    if (!contatoId) return { ok: false, motivo: "não foi possível criar o contato" };

    await anexarNota(contatoId, montarNota(lead, transcricao));
    return { ok: true };
  } catch (erro) {
    console.error("[kyron:hubspot]", erro);
    return { ok: false, motivo: "erro de comunicação com o HubSpot" };
  }
}
