import { avisoLoja } from "@/lib/configuracao/config";

/**
 * Faixa de aviso no topo do site — editável no ERP (Configurações da loja) sem
 * deploy. Some sozinha quando desligada ou vazia.
 */
export async function AvisoLoja() {
  const texto = await avisoLoja();
  if (!texto) return null;

  return (
    <div className="bg-kyron-blue px-fluid-md py-fluid-2xs text-center">
      <p className="text-fluid-2xs text-white">{texto}</p>
    </div>
  );
}
