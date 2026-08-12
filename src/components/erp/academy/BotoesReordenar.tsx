"use client";

import { useTransition } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function BotoesReordenar({
  podeSubir, podeDescer, onSubir, onDescer,
}: {
  podeSubir: boolean;
  podeDescer: boolean;
  onSubir: () => Promise<void>;
  onDescer: () => Promise<void>;
}) {
  const [pend, start] = useTransition();
  return (
    <div className="flex shrink-0 flex-col">
      <button
        type="button" disabled={!podeSubir || pend}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); start(onSubir); }}
        className="text-kyron-silver/50 transition-colors hover:text-kyron-white disabled:opacity-20"
        aria-label="Mover para cima"
      >
        <ChevronUp size={14} />
      </button>
      <button
        type="button" disabled={!podeDescer || pend}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); start(onDescer); }}
        className="text-kyron-silver/50 transition-colors hover:text-kyron-white disabled:opacity-20"
        aria-label="Mover para baixo"
      >
        <ChevronDown size={14} />
      </button>
    </div>
  );
}
