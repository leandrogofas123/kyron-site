/**
 * Consentimento de cookies — LGPD.
 *
 * Princípio: nada além do essencial roda antes de uma escolha explícita.
 * O estado "pendente" (sem registro salvo) NUNCA é tratado como aceite.
 */

export type Consentimento = {
  /** Necessários ao funcionamento. Sempre ativos, não são opcionais. */
  essenciais: true;
  /** Medição de audiência. Só true com aceite explícito. */
  analytics: boolean;
  /** Quando a escolha foi registrada — prova de consentimento. */
  registradoEm: string;
  /** Versão do texto aceito. Mudar o texto exige novo consentimento. */
  versao: number;
};

export const VERSAO_CONSENTIMENTO = 1;
const CHAVE = "kyron:consentimento";

export function lerConsentimento(): Consentimento | null {
  if (typeof window === "undefined") return null;

  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return null;

    const dados = JSON.parse(bruto) as Partial<Consentimento>;

    // Texto novo → o consentimento anterior não vale mais.
    if (dados.versao !== VERSAO_CONSENTIMENTO) return null;
    if (typeof dados.analytics !== "boolean") return null;

    return {
      essenciais: true,
      analytics: dados.analytics,
      registradoEm: dados.registradoEm ?? "",
      versao: VERSAO_CONSENTIMENTO,
    };
  } catch {
    // localStorage bloqueado (navegação privada, política corporativa).
    // Sem registro = sem consentimento. Falha para o lado seguro.
    return null;
  }
}

export function salvarConsentimento(analytics: boolean): Consentimento {
  const registro: Consentimento = {
    essenciais: true,
    analytics,
    registradoEm: new Date().toISOString(),
    versao: VERSAO_CONSENTIMENTO,
  };

  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(registro));
  } catch {
    // Sem persistência, o banner reaparece na próxima visita. Correto:
    // é melhor perguntar de novo do que assumir um aceite que não foi salvo.
  }

  window.dispatchEvent(
    new CustomEvent<Consentimento>("kyron:consentimento", { detail: registro }),
  );

  return registro;
}

/** Abre o painel de preferências de qualquer lugar do site. */
export function abrirPreferenciasCookies() {
  window.dispatchEvent(new CustomEvent("kyron:abrir-preferencias"));
}

/**
 * Avisa quando o painel de cookies abre ou fecha.
 *
 * O banner ocupa a base da tela e, no celular, cobriria o botão do assistente.
 * Quem precisa ceder espaço escuta este evento — controlado em React, não em
 * CSS: o reset do Tailwind define `opacity: 1` em todo `button` e vence uma
 * regra de folha de estilo, por causa das camadas de cascata.
 */
export function anunciarPainelCookies(aberto: boolean) {
  window.dispatchEvent(
    new CustomEvent<boolean>("kyron:painel-cookies", { detail: aberto }),
  );
}
