import { shell, button } from "@/lib/email-templates";

/**
 * Modelos prontos de campanha pra divulgar a própria Vero — texto
 * original, escrito pra essa plataforma (não adaptado de terceiros).
 * Cada modelo cobre um momento do funil: atrair (venda), engajar quem
 * ainda não decidiu (acompanhamento) e cuidar de quem já está dentro
 * (pós-venda).
 */

export type CampaignTemplateId = "convite" | "acompanhamento" | "pos-venda";

export interface CampaignTemplate {
  id: CampaignTemplateId;
  label: string;
  stage: "Venda" | "Acompanhamento" | "Pós-venda";
  description: string;
  email: (siteUrl: string) => { subject: string; html: string };
  whatsapp: (siteUrl: string) => string;
}

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: "convite",
    label: "Convite pra conhecer a Vero",
    stage: "Venda",
    description:
      "Pra quem está na lista de espera ou ainda não decidiu — apresenta a Vero e convida a se cadastrar.",
    email: (siteUrl) => {
      const body = `
        <p style="font-size:16px;">Olá,</p>
        <p style="font-size:14px;line-height:1.6;color:#5b6763;">
          A Vero é um espaço pra você cuidar (ou oferecer cuidado) com mais
          organização: agenda, prontuário, autoavaliações e pagamento, tudo
          num lugar só — sem planilha, sem post-it.
        </p>
        <p style="font-size:14px;line-height:1.6;color:#5b6763;">
          Se você é profissional de saúde mental ou bem-estar, leva poucos
          minutos pra montar seu perfil e começar a receber clientes. Se
          você busca apoio, é rápido encontrar alguém com quem conversar.
        </p>
        <p style="margin:24px 0;">${button(siteUrl, "Conhecer a Vero")}</p>
      `;
      return {
        subject: "Conheça a Vero: cuidado com mais organização",
        html: shell("Conheça a Vero", body),
      };
    },
    whatsapp: (siteUrl) =>
      `Oi! A Vero é uma plataforma pra organizar o cuidado com saúde mental e bem-estar — agenda, prontuário e pagamento num só lugar. Dá uma olhada: ${siteUrl}`,
  },
  {
    id: "acompanhamento",
    label: "Acompanhamento de quem ainda não terminou o cadastro",
    stage: "Acompanhamento",
    description:
      "Pra quem começou a se interessar (entrou na lista de espera, começou o cadastro) mas ainda não virou usuário ativo.",
    email: (siteUrl) => {
      const body = `
        <p style="font-size:16px;">Olá,</p>
        <p style="font-size:14px;line-height:1.6;color:#5b6763;">
          Vimos que você chegou a conhecer a Vero, mas ainda não deu o
          próximo passo — e queremos ajudar com o que estiver faltando.
        </p>
        <p style="font-size:14px;line-height:1.6;color:#5b6763;">
          Tem alguma dúvida sobre como funciona, os valores ou o processo
          de aprovação? É só responder este email que a gente te ajuda
          pessoalmente.
        </p>
        <p style="margin:24px 0;">${button(siteUrl, "Continuar meu cadastro")}</p>
      `;
      return {
        subject: "Faltou pouco pra você entrar na Vero",
        html: shell("Vamos continuar?", body),
      };
    },
    whatsapp: (siteUrl) =>
      `Oi! Vimos que você começou a conhecer a Vero mas ainda não finalizou. Alguma dúvida? É só responder aqui. Pra continuar: ${siteUrl}`,
  },
  {
    id: "pos-venda",
    label: "Pós-venda: cuidado com quem já está na Vero",
    stage: "Pós-venda",
    description:
      "Pra profissionais/clientes já ativos — reforça vínculo, lembra de recursos úteis e demonstra cuidado real (não é só venda).",
    email: (siteUrl) => {
      const body = `
        <p style="font-size:16px;">Olá,</p>
        <p style="font-size:14px;line-height:1.6;color:#5b6763;">
          Só passando pra saber como você está — de verdade. Usar uma
          ferramenta nova no dia a dia tem seus altos e baixos, e a gente
          quer que a Vero esteja ajudando, não atrapalhando.
        </p>
        <p style="font-size:14px;line-height:1.6;color:#5b6763;">
          Lembrete rápido: seu painel reúne agenda, histórico de sessões e
          autoavaliações num lugar só. Se algo não estiver claro, ou se
          tiver alguma sugestão, é só responder este email.
        </p>
        <p style="margin:24px 0;">${button(siteUrl, "Acessar meu painel")}</p>
      `;
      return {
        subject: "Como você está usando a Vero?",
        html: shell("Um cuidado com você", body),
      };
    },
    whatsapp: () =>
      `Oi! Só passando pra saber como você está usando a Vero — se precisar de ajuda com alguma coisa do painel, é só chamar por aqui.`,
  },
];

export function getCampaignTemplate(id: string): CampaignTemplate | undefined {
  return CAMPAIGN_TEMPLATES.find((template) => template.id === id);
}

/**
 * Versão "resolvida" do template — assunto/HTML/texto já calculados com a
 * URL do site, sem função nenhuma. É o formato que passamos pra Client
 * Components (React não serializa função nenhuma pela fronteira
 * servidor/cliente).
 */
export interface ResolvedCampaignTemplate {
  id: CampaignTemplateId;
  label: string;
  stage: CampaignTemplate["stage"];
  description: string;
  email: { subject: string; html: string };
  whatsapp: string;
}

export function resolveCampaignTemplates(siteUrl: string): ResolvedCampaignTemplate[] {
  return CAMPAIGN_TEMPLATES.map((template) => ({
    id: template.id,
    label: template.label,
    stage: template.stage,
    description: template.description,
    email: template.email(siteUrl),
    whatsapp: template.whatsapp(siteUrl),
  }));
}
