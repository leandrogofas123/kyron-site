import { Bell, CheckCircle2, LogOut, Search } from "lucide-react";

import { AcademySidebar, Logo } from "@/components/academy/AcademySidebar";
import { getNovidadesAluno } from "@/lib/academy/aluno-dados";
import { acaoLogout } from "@/lib/auth/actions";
import { guardaAcademy } from "@/lib/auth/areas";

/**
 * Casca ÚNICA de toda a área logada da Academy (exceto /app/login, que tem
 * seu próprio design de página cheia). Antes só o dashboard `/app` tinha a
 * barra lateral — cada página nova esquecia de repeti-la. Agora é
 * estrutural: qualquer página dentro de (painel) ganha o menu automaticamente,
 * e o aprovado/pendente é checado UMA vez, aqui, não em cada página.
 */
export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const usuario = await guardaAcademy();
  if (!usuario.aprovado) return <Aguardando nome={usuario.nome} />;

  const novidades = await getNovidadesAluno(20);
  const ehMaster = usuario.papeis.includes("ADMIN_MASTER");

  return (
    <div className="academy-app">
      <AcademySidebar nome={usuario.nome} ehMaster={ehMaster} novidadesCount={novidades.length} />

      <div className="academy-main">
        <header className="academy-topbar">
          <div className="academy-search"><Search size={17} /><span>Buscar trilhas, aulas ou materiais</span><kbd>⌘ K</kbd></div>
          <div className="academy-top-actions">
            <span className="academy-live"><i /> ACESSO ATIVO</span>
            <button aria-label="Notificações"><Bell size={18} /><i /></button>
          </div>
        </header>

        <main className="academy-content">{children}</main>

        <footer className="academy-footer">
          <Logo compact /><span>© 2026 Kyron Academy</span><span>Aprenda. Pratique. Evolua.</span>
        </footer>
      </div>
    </div>
  );
}

function Aguardando({ nome }: { nome: string }) {
  const sair = acaoLogout.bind(null, "/app/login");
  return (
    <main className="academy-pending">
      <Logo />
      <div>
        <span className="academy-pending-icon"><CheckCircle2 size={28} /></span>
        <p className="academy-eyebrow blue"><i /> CADASTRO RECEBIDO</p>
        <h1>Sua conta está em análise.</h1>
        <p>Olá, {nome}. A equipe Kyron vai validar seu vínculo e liberar as trilhas adequadas ao seu perfil.</p>
        <div className="academy-pending-steps">
          <span className="done"><i>1</i> Conta criada</span>
          <span className="active"><i>2</i> Aprovação Kyron</span>
          <span><i>3</i> Trilhas liberadas</span>
        </div>
        <form action={sair}><button type="submit" className="academy-secondary"><LogOut size={15} /> Sair</button></form>
      </div>
    </main>
  );
}
