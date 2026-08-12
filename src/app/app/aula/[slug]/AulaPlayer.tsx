"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";

type Quiz = {
  id: number; notaMinima: number;
  perguntas: { id: number; enunciado: string; alternativas: { id: number; texto: string }[] }[];
};

export function AulaPlayer({
  aulaId, tipo, youtubeId, conteudoMd, percentualInicial, jaConcluida, quiz,
  onHeartbeat, onConcluir, onResponderQuiz,
}: {
  aulaId: number;
  tipo: string;
  youtubeId: string | null;
  conteudoMd: string | null;
  percentualInicial: number;
  jaConcluida: boolean;
  quiz: Quiz | null;
  onHeartbeat: (aulaId: number, segundos: number) => Promise<{ percentual: number }>;
  onConcluir: () => Promise<{ ok: boolean; xpGanho?: number; motivo?: string }>;
  onResponderQuiz: (respostas: Record<number, number>) => Promise<{ ok: boolean; nota?: number; aprovado?: boolean; motivo?: string }>;
}) {
  const [percentual, setPercentual] = useState(percentualInicial);
  const [concluida, setConcluida] = useState(jaConcluida);
  const [erro, setErro] = useState<string | null>(null);
  const [pend, start] = useTransition();
  const segundos = useRef(0);

  useEffect(() => {
    if (tipo !== "VIDEO" || concluida) return;
    const t = setInterval(() => {
      segundos.current += 15;
      onHeartbeat(aulaId, segundos.current).then((r) => setPercentual((p) => Math.max(p, r.percentual)));
    }, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, concluida, aulaId]);

  function concluir() {
    setErro(null);
    start(async () => {
      const r = await onConcluir();
      if (r.ok) { setConcluida(true); setPercentual(100); }
      else setErro(r.motivo ?? "Não foi possível concluir.");
    });
  }

  if (tipo === "QUIZ" && quiz) {
    return <QuizBloco quiz={quiz} concluida={concluida} onResponder={onResponderQuiz} onConcluida={() => setConcluida(true)} />;
  }

  return (
    <div>
      {tipo === "VIDEO" && youtubeId && (
        <div style={{ position: "relative", aspectRatio: "16/9", borderRadius: 12, overflow: "hidden", background: "#000" }}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
            title="Aula"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
          />
        </div>
      )}

      {conteudoMd && (
        <div style={{ marginTop: 18, color: "var(--academy-muted)", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
          {conteudoMd}
        </div>
      )}

      {tipo === "VIDEO" && !concluida && (
        <div className="academy-progress" style={{ marginTop: 18 }}>
          <span><i style={{ width: `${percentual}%` }} /></span>
          <small>{percentual}% assistido — libera "Concluir" a partir de 90%</small>
        </div>
      )}

      {erro && <p role="alert" className="academy-login-alert" style={{ marginTop: 14 }}>{erro}</p>}

      <div style={{ marginTop: 20 }}>
        {concluida ? (
          <span className="academy-primary" style={{ background: "var(--academy-green)", border: "none" }}>
            <CheckCircle2 size={16} /> Aula concluída
          </span>
        ) : (
          <button
            type="button"
            className="academy-primary"
            disabled={pend || (tipo === "VIDEO" && percentual < 90)}
            onClick={concluir}
            style={{ border: "none", cursor: "pointer" }}
          >
            {pend ? "Salvando…" : "Concluir aula"}
          </button>
        )}
      </div>
    </div>
  );
}

function QuizBloco({
  quiz, concluida, onResponder, onConcluida,
}: {
  quiz: Quiz; concluida: boolean;
  onResponder: (respostas: Record<number, number>) => Promise<{ ok: boolean; nota?: number; aprovado?: boolean; motivo?: string }>;
  onConcluida: () => void;
}) {
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [resultado, setResultado] = useState<{ nota: number; aprovado: boolean } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pend, start] = useTransition();

  if (concluida) {
    return (
      <span className="academy-primary" style={{ background: "var(--academy-green)", border: "none" }}>
        <CheckCircle2 size={16} /> Quiz aprovado
      </span>
    );
  }

  function enviar() {
    setErro(null);
    start(async () => {
      const r = await onResponder(respostas);
      if (!r.ok) { setErro(r.motivo ?? "Não foi possível enviar."); return; }
      setResultado({ nota: r.nota ?? 0, aprovado: !!r.aprovado });
      if (r.aprovado) onConcluida();
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {quiz.perguntas.map((p, i) => (
        <fieldset key={p.id} style={{ border: "1px solid var(--academy-border)", borderRadius: 10, padding: 14 }}>
          <legend style={{ fontSize: 13, color: "var(--academy-text)", padding: "0 6px" }}>{i + 1}. {p.enunciado}</legend>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
            {p.alternativas.map((a) => (
              <label key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--academy-muted)" }}>
                <input type="radio" name={`p-${p.id}`} onChange={() => setRespostas((prev) => ({ ...prev, [p.id]: a.id }))} />
                {a.texto}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      {resultado && (
        <p role="status" className="academy-login-alert" style={{ color: resultado.aprovado ? "var(--academy-green)" : undefined }}>
          Nota: {resultado.nota}% — {resultado.aprovado ? "aprovado" : `mínimo ${quiz.notaMinima}%, tente novamente`}
        </p>
      )}
      {erro && <p role="alert" className="academy-login-alert">{erro}</p>}

      <button type="button" className="academy-primary" style={{ border: "none", cursor: "pointer" }}
        disabled={pend || Object.keys(respostas).length < quiz.perguntas.length}
        onClick={enviar}>
        {pend ? "Enviando…" : "Enviar respostas"}
      </button>
    </div>
  );
}
