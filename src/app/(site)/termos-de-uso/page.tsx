import type { Metadata } from "next";

import { Documento, H2, Lista } from "@/components/site/Documento";
import { PageHero } from "@/components/site/PageHero";
import { KYRON_COMPANY } from "@/lib/kyron/company";
import { CONTATO } from "@/lib/kyron/site";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Condições de uso do site da Kyron Tecnologia.",
  alternates: { canonical: "/termos-de-uso" },
};

/**
 * ⚠️ MINUTA — REVISÃO JURÍDICA OBRIGATÓRIA ANTES DO LANÇAMENTO.
 *
 * Redigida com os dados reais da empresa e com as cláusulas usuais para site
 * institucional, mas NÃO substitui parecer de advogado. Atenção especial a:
 * limitação de responsabilidade, foro e cláusulas sobre o assistente virtual.
 */
export default function TermosDeUso() {
  return (
    <>
      <PageHero
        eyebrow="Documentos"
        titulo="Termos de Uso"
        lede="Condições para utilização deste site."
      />

      <Documento atualizadoEm="23 de julho de 2026">
        <H2>1. Aceitação</H2>
        <p>
          Ao acessar e utilizar este site, você concorda com estes Termos de Uso.
          Se não concordar com qualquer condição aqui prevista, recomendamos que
          não utilize o site.
        </p>

        <H2>2. Quem opera este site</H2>
        <p>
          Este site é operado por{" "}
          <strong className="text-kyron-white">{KYRON_COMPANY.razaoSocial}</strong>
          , CNPJ {KYRON_COMPANY.cnpj}, que atua sob o nome fantasia{" "}
          {KYRON_COMPANY.nomeFantasia}, com base em{" "}
          {KYRON_COMPANY.enderecoPublico}.
        </p>

        <H2>3. Finalidade do conteúdo</H2>
        <p>
          O conteúdo deste site tem finalidade informativa sobre os serviços da
          Kyron. Descrições de soluções, prazos e aplicações são referências
          gerais e{" "}
          <strong className="text-kyron-white">
            não constituem proposta comercial, garantia de resultado ou
            aconselhamento técnico específico
          </strong>
          . Escopo, prazo e investimento de qualquer projeto são definidos apenas
          em proposta formal, após o diagnóstico.
        </p>

        <H2>4. Assistente virtual</H2>
        <p>
          O site disponibiliza um assistente automatizado apoiado em inteligência
          artificial. Sobre ele:
        </p>
        <Lista
          itens={[
            "As respostas são geradas automaticamente e podem conter imprecisões.",
            "Nenhuma resposta do assistente constitui proposta, orçamento ou compromisso contratual da Kyron.",
            "Informações comercialmente vinculantes são fornecidas exclusivamente por um especialista humano, em proposta formal.",
            "Não devem ser informados ao assistente senhas, dados bancários, documentos pessoais ou qualquer credencial.",
          ]}
        />

        <H2>5. Uso permitido</H2>
        <p>Ao utilizar este site, você concorda em não:</p>
        <Lista
          itens={[
            "Utilizá-lo para qualquer finalidade ilícita ou vedada por estes termos.",
            "Tentar obter acesso não autorizado a sistemas, contas ou dados.",
            "Realizar coleta automatizada em massa, engenharia reversa ou ações que comprometam a disponibilidade do serviço.",
            "Enviar conteúdo ilícito, ofensivo, ou que viole direitos de terceiros.",
            "Utilizar o assistente virtual para tentar obter comportamento diverso da sua finalidade.",
          ]}
        />

        <H2>6. Propriedade intelectual</H2>
        <p>
          Todo o conteúdo deste site — textos, marca, identidade visual, layout,
          código e materiais — é de titularidade da Kyron ou de seus licenciantes
          e protegido pela legislação aplicável. É vedada a reprodução, distribuição
          ou modificação sem autorização prévia e por escrito.
        </p>
        <p>
          Marcas de terceiros eventualmente citadas pertencem a seus respectivos
          titulares e são mencionadas apenas de forma descritiva, sem qualquer
          vínculo, patrocínio ou endosso.
        </p>

        <H2>7. Links externos</H2>
        <p>
          Este site pode conter links para sites de terceiros. A Kyron não
          controla nem se responsabiliza pelo conteúdo, pelas práticas de
          privacidade ou pela disponibilidade desses sites.
        </p>

        <H2>8. Disponibilidade e limitação de responsabilidade</H2>
        <p>
          Empregamos esforços para manter o site disponível e correto, mas ele é
          fornecido no estado em que se encontra. Podem ocorrer interrupções para
          manutenção, atualização ou por fatores fora do nosso controle.
        </p>
        <p>
          Na máxima extensão permitida pela legislação aplicável, a Kyron não se
          responsabiliza por decisões tomadas exclusivamente com base no conteúdo
          informativo deste site ou em respostas do assistente virtual, nem por
          danos indiretos decorrentes de indisponibilidade temporária. Nada nestes
          termos exclui direitos assegurados ao consumidor pela legislação
          brasileira.
        </p>

        <H2>9. Privacidade</H2>
        <p>
          O tratamento de dados pessoais é descrito na{" "}
          <a
            href="/politica-de-privacidade"
            className="text-kyron-blue underline underline-offset-2"
          >
            Política de Privacidade
          </a>
          , que integra estes Termos de Uso.
        </p>

        <H2>10. Alterações</H2>
        <p>
          Estes termos podem ser atualizados a qualquer momento. A data de
          atualização no topo indica a versão vigente. O uso continuado do site
          após alterações implica concordância com a versão em vigor.
        </p>

        <H2>11. Legislação e foro</H2>
        <p>
          Estes termos são regidos pela legislação brasileira. Fica eleito o foro
          da comarca de Santa Cruz do Sul, Rio Grande do Sul, para dirimir
          controvérsias, com renúncia a qualquer outro, ressalvadas as hipóteses de
          competência legalmente assegurada ao consumidor.
        </p>

        {CONTATO.email && (
          <>
            <H2>12. Contato</H2>
            <p>
              Dúvidas sobre estes termos podem ser enviadas para{" "}
              <a
                href={`mailto:${CONTATO.email}`}
                className="inline-block break-words py-1.5 text-kyron-blue underline underline-offset-2"
              >
                {CONTATO.email}
              </a>
              .
            </p>
          </>
        )}
      </Documento>
    </>
  );
}
