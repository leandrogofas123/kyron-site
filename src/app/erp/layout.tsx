/**
 * Casca do ERP — isolada da loja: sem header público, WhatsApp flutuante,
 * assistente ou banner de cookies. Só o sistema de gestão.
 */
export default function ErpRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
