import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Botão "voltar" padrão — mesmo em toda página da Academy (aluno). */
export function VoltarLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="academy-back">
      <ArrowLeft size={15} /> {label}
    </Link>
  );
}
