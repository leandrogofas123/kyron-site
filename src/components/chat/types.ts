export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

/** Eventos que a rota /api/chat emite via SSE. */
export type ChatStreamEvent =
  | { type: "delta"; text: string }
  | { type: "tool"; name: string }
  | { type: "done" }
  | { type: "error"; message: string };
