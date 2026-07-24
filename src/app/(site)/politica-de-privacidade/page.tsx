import type { Metadata } from "next";

import { Documento, H2, Lista } from "@/components/site/Documento";
import { PageHero } from "@/components/site/PageHero";
import { KYRON_COMPANY } from "@/lib/kyron/company";
import { CONTATO } from "@/lib/kyron/site";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como a Kyron Tecnologia coleta, usa e protege dados pessoais, conforme a LGPD.",
  alternates: { canonical: "/politica-de-privacidade" },
  robots: { index: true, follow: true },
};

/**
 * ⚠️ MINUTA — REVISÃO JURÍDICA OBRIGATÓRIA ANTES DO LANÇAMENTO.
 *
 * Este texto foi redigido a partir dos requisitos da Lei 13.709/2018 (LGPD) e
 * dos dados reais da empresa, mas NÃO substitui parecer de advogado. Um
 * profissional precisa validar, em especial: bases legais, prazos de retenção,
 * transferência internacional (provedores de nuvem e de IA) e a lista de
 * operadores/subprocessadores.
 */
export default function PoliticaDePrivacidade() {
  return (
    <>
      <PageHero
        eyebrow="Documentos"
        titulo="Política de Privacidade"
        lede="Como a Kyron trata dados pessoais coletados neste site."
      />

      <Documento atualizadoEm="23 de julho de 2026">
        <H2>1. Quem é o controlador</H2>
        <p>
          O controlador dos dados pessoais tratados neste site é{" "}
          <strong className="text-kyron-white">{KYRON_COMPANY.razaoSocial}</strong>,
          inscrita no CNPJ sob o nº {KYRON_COMPANY.cnpj}, que opera sob o nome
          fantasia {KYRON_COMPANY.nomeFantasia}, com base em{" "}
          {KYRON_COMPANY.enderecoPublico}.
        </p>
        {CONTATO.email && (
          <p>
            Para qualquer assunto relacionado a dados pessoais, incluindo o
            exercício dos direitos descritos no item 6, o contato é{" "}
            <a
              href={`mailto:${CONTATO.email}`}
              className="inline-block break-words py-1.5 text-kyron-blue underline underline-offset-2"
            >
              {CONTATO.email}
            </a>
            .
          </p>
        )}

        <H2>2. Quais dados coletamos</H2>
        <p>Coletamos apenas o necessário para responder a quem nos procura.</p>
        <Lista
          itens={[
            <>
              <strong className="text-kyron-white">Dados que você informa.</strong>{" "}
              Nome, e-mail, empresa, porte, área de interesse e o conteúdo da
              mensagem — enviados pelo formulário de contato ou pelo assistente
              virtual do site.
            </>,
            <>
              <strong className="text-kyron-white">Dados de navegação.</strong>{" "}
              Endereço IP, tipo de navegador, dispositivo, páginas visitadas e
              origem do acesso, coletados por ferramentas de medição de audiência.
            </>,
            <>
              <strong className="text-kyron-white">
                Conversas com o assistente virtual.
              </strong>{" "}
              O conteúdo das mensagens trocadas, para responder à solicitação e
              melhorar o atendimento.
            </>,
          ]}
        />
        <p>
          <strong className="text-kyron-white">Não solicitamos</strong> CPF, RG,
          dados bancários, cartão de crédito, senhas ou qualquer credencial de
          acesso por meio deste site ou do assistente virtual. Se você receber um
          pedido desse tipo se passando pela Kyron, desconsidere e nos avise.
        </p>

        <H2>3. Para que usamos</H2>
        <Lista
          itens={[
            "Responder a solicitações de contato, orçamento e agendamento de diagnóstico.",
            "Entender qual solução se aplica ao seu caso antes da primeira conversa.",
            "Medir a audiência do site e entender como ele é utilizado, de forma agregada.",
            "Cumprir obrigações legais e regulatórias aplicáveis.",
          ]}
        />
        <p>
          Não vendemos, alugamos nem cedemos dados pessoais a terceiros para fins
          de marketing.
        </p>

        <H2>4. Base legal</H2>
        <p>
          O tratamento se apoia nas seguintes bases da Lei 13.709/2018 (LGPD):
        </p>
        <Lista
          itens={[
            <>
              <strong className="text-kyron-white">Consentimento</strong> (art.
              7º, I) — para o envio do formulário de contato e para cookies não
              essenciais.
            </>,
            <>
              <strong className="text-kyron-white">
                Procedimentos preliminares relacionados a contrato
              </strong>{" "}
              (art. 7º, V) — para responder a pedidos de proposta e diagnóstico.
            </>,
            <>
              <strong className="text-kyron-white">Legítimo interesse</strong>{" "}
              (art. 7º, IX) — para segurança do site e medição agregada de
              audiência.
            </>,
            <>
              <strong className="text-kyron-white">Obrigação legal</strong> (art.
              7º, II) — quando a guarda do dado for exigida por lei.
            </>,
          ]}
        />

        <H2>5. Compartilhamento e operadores</H2>
        <p>
          Para operar o site utilizamos prestadores de serviço que atuam como
          operadores, tratando dados exclusivamente conforme nossas instruções:
          provedores de hospedagem e de infraestrutura em nuvem, ferramentas de
          medição de audiência, serviços de e-mail e provedores de modelos de
          inteligência artificial que dão suporte ao assistente virtual.
        </p>
        <p>
          Alguns desses prestadores podem estar localizados fora do Brasil. Nesses
          casos, a transferência internacional observa os requisitos dos artigos
          33 a 36 da LGPD.
        </p>

        <H2>6. Seus direitos</H2>
        <p>
          A LGPD garante a você, a qualquer momento e sem custo, os seguintes
          direitos:
        </p>
        <Lista
          itens={[
            "Confirmar se tratamos dados seus e acessar esses dados.",
            "Corrigir dados incompletos, inexatos ou desatualizados.",
            "Solicitar anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos.",
            "Solicitar a portabilidade dos dados a outro fornecedor.",
            "Revogar o consentimento e solicitar a eliminação dos dados tratados com base nele.",
            "Ser informado sobre com quem compartilhamos seus dados.",
            "Opor-se a tratamento realizado com base em legítimo interesse.",
          ]}
        />
        {CONTATO.email && (
          <p>
            Para exercer qualquer desses direitos, escreva para{" "}
            <a
              href={`mailto:${CONTATO.email}`}
              className="inline-block break-words py-1.5 text-kyron-blue underline underline-offset-2"
            >
              {CONTATO.email}
            </a>
            . Respondemos no prazo previsto em lei.
          </p>
        )}

        <H2>7. Por quanto tempo guardamos</H2>
        <p>
          Dados de contato comercial são mantidos enquanto durar a relação e pelo
          período necessário ao cumprimento de obrigações legais. Dados de
          navegação são mantidos por período limitado, conforme a configuração das
          ferramentas de medição. Você pode solicitar a exclusão a qualquer
          momento, ressalvadas as hipóteses de guarda obrigatória previstas em lei.
        </p>

        <H2>8. Segurança</H2>
        <p>
          Adotamos medidas técnicas e administrativas para proteger os dados
          contra acesso não autorizado, perda, alteração e divulgação indevida —
          incluindo tráfego criptografado, controle de acesso e limitação da coleta
          ao mínimo necessário. Nenhum sistema é totalmente imune a incidentes; em
          caso de incidente relevante, comunicaremos os titulares e a ANPD nos
          termos da lei.
        </p>

        <H2>9. Cookies</H2>
        <p>
          Utilizamos cookies essenciais ao funcionamento do site e, mediante seu
          consentimento, cookies de medição de audiência. Você pode gerenciar as
          preferências no banner de consentimento e configurar seu navegador para
          bloquear cookies — o que pode afetar algumas funcionalidades.
        </p>

        <H2>10. Assistente virtual</H2>
        <p>
          O assistente do site é um sistema automatizado apoiado em inteligência
          artificial. Ele responde a partir de informações públicas sobre a Kyron
          e encaminha para um especialista humano quando o assunto exige. As
          conversas podem ser registradas para atender à solicitação e melhorar o
          serviço. Não informe senhas, dados bancários ou documentos pessoais ao
          assistente.
        </p>

        <H2>11. Alterações desta política</H2>
        <p>
          Esta política pode ser atualizada. A data de atualização no topo indica a
          versão vigente. Alterações relevantes serão comunicadas pelos canais de
          contato informados.
        </p>
      </Documento>
    </>
  );
}
