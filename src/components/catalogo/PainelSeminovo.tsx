/**
 * Painel de condição do seminovo — o diferencial da loja (spec §9.2).
 *
 * Os dados já existem no modelo Seminovo; aqui eles ganham forma visual:
 * anel de saúde da bateria, régua de condição estética e os campos objetivos
 * (capacidade, cor, garantia). Transparência que justifica o preço.
 */

type Seminovo = {
  saudeBateria: number | null;
  condicaoEstetica: string;
  capacidade: string | null;
  cor: string | null;
  garantiaMeses: number;
};

// Régua de condição: nível preenchido + descrição honesta de cada estado.
const NIVEL: Record<string, { n: number; nota: string }> = {
  impecável: { n: 4, nota: "sem marcas de uso, praticamente como novo" },
  impecavel: { n: 4, nota: "sem marcas de uso, praticamente como novo" },
  ótimo: { n: 3, nota: "marcas mínimas de uso, tela sem riscos" },
  otimo: { n: 3, nota: "marcas mínimas de uso, tela sem riscos" },
  bom: { n: 2, nota: "sinais visíveis de uso, plenamente funcional" },
};

function saudeBateriaTexto(pct: number) {
  if (pct >= 85) return { cor: "#46c07a", nota: "Saudável para o uso diário" };
  if (pct >= 80) return { cor: "#46c07a", nota: "Bom estado de bateria" };
  if (pct >= 70) return { cor: "#e0a63a", nota: "Bateria com desgaste moderado" };
  return { cor: "#e0a63a", nota: "Considere uma troca de bateria futura" };
}

function capitalizar(t: string) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function PainelSeminovo({ s }: { s: Seminovo }) {
  const nivel = NIVEL[s.condicaoEstetica.toLowerCase()] ?? { n: 2, nota: "" };

  return (
    <div className="mt-fluid-md rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
      {s.saudeBateria != null && <SaudeBateria pct={s.saudeBateria} />}

      <div className={s.saudeBateria != null ? "mt-fluid-md" : ""}>
        <Rotulo>Condição estética</Rotulo>
        <div className="mt-fluid-2xs flex gap-1" aria-hidden="true">
          {[1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i <= nivel.n ? "bg-[#46c07a]" : "bg-kyron-silver/15"
              }`}
            />
          ))}
        </div>
        <p className="mt-fluid-2xs text-fluid-2xs text-kyron-silver">
          <span className="font-semibold text-kyron-white">
            {capitalizar(s.condicaoEstetica)}
          </span>
          {nivel.nota ? ` · ${nivel.nota}` : ""}
        </p>
      </div>

      <dl className="mt-fluid-md grid grid-cols-2 gap-fluid-sm border-t border-[var(--kyron-hairline)] pt-fluid-md">
        {s.capacidade && <Campo rotulo="Capacidade" valor={s.capacidade} />}
        {s.cor && <Campo rotulo="Cor" valor={s.cor} />}
        <Campo
          rotulo="Garantia"
          valor={s.garantiaMeses > 0 ? `${s.garantiaMeses} meses` : "Consulte"}
        />
      </dl>
    </div>
  );
}

function SaudeBateria({ pct }: { pct: number }) {
  const { cor, nota } = saudeBateriaTexto(pct);
  const r = 26;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);

  return (
    <div>
      <Rotulo>Saúde da bateria</Rotulo>
      <div className="mt-fluid-2xs flex items-center gap-fluid-sm">
        <svg width="62" height="62" viewBox="0 0 62 62" className="shrink-0" aria-hidden="true">
          <circle
            cx="31"
            cy="31"
            r={r}
            fill="none"
            stroke="rgba(201,205,212,0.16)"
            strokeWidth="6"
          />
          <circle
            cx="31"
            cy="31"
            r={r}
            fill="none"
            stroke={cor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform="rotate(-90 31 31)"
          />
        </svg>
        <div>
          <p className="kyron-display text-fluid-lg" style={{ color: cor }}>
            {pct}%
          </p>
          <p className="text-fluid-2xs text-kyron-silver">{nota}</p>
        </div>
      </div>
    </div>
  );
}

function Rotulo({ children }: { children: string }) {
  return (
    <span className="kyron-label text-fluid-2xs text-kyron-silver/55">{children}</span>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="kyron-label text-fluid-2xs text-kyron-silver/55">{rotulo}</dt>
      <dd className="mt-0.5 text-fluid-sm font-semibold text-kyron-white">{valor}</dd>
    </div>
  );
}
