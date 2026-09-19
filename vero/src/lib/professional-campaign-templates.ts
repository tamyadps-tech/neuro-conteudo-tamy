import { shell, button } from "@/lib/email-templates";

/**
 * Modelos de campanha pro profissional mandar pros PRÓPRIOS clientes —
 * diferente de marketing-campaign-templates.ts, que é a Vero se
 * divulgando. Aqui quem "fala" é o profissional.
 */

export type ProfessionalCampaignTemplateId = "convite" | "reengajamento" | "cuidado";

export interface ProfessionalCampaignTemplate {
  id: ProfessionalCampaignTemplateId;
  label: string;
  goal: string;
  email: (professionalName: string, profileUrl: string) => { subject: string; html: string };
  whatsapp: (professionalName: string, profileUrl: string) => string;
}

export const PROFESSIONAL_CAMPAIGN_TEMPLATES: ProfessionalCampaignTemplate[] = [
  {
    id: "convite",
    label: "Convite pra agendar",
    goal: "Atrair quem ainda não marcou sessão nenhuma, ou convidar indicações.",
    email: (professionalName, profileUrl) => {
      const body = `
        <p style="font-size:16px;">Olá,</p>
        <p style="font-size:14px;line-height:1.6;color:#5b6763;">
          Aqui é <strong>${professionalName}</strong>. Quero te convidar a marcar uma
          sessão comigo pela Vero — é rápido, dá pra escolher o horário que funciona
          pra você e o pagamento fica combinado direto por lá.
        </p>
        <p style="margin:24px 0;">${button(profileUrl, "Ver horários disponíveis")}</p>
      `;
      return {
        subject: `${professionalName} tem horários disponíveis`,
        html: shell(`Convite de ${professionalName}`, body),
      };
    },
    whatsapp: (professionalName, profileUrl) =>
      `Oi! Aqui é ${professionalName}. Tenho horários disponíveis pra sessão — dá uma olhada e escolha o melhor pra você: ${profileUrl}`,
  },
  {
    id: "reengajamento",
    label: "Reengajamento de quem sumiu",
    goal: "Pra clientes que já vieram antes mas não voltam há um tempo.",
    email: (professionalName, profileUrl) => {
      const body = `
        <p style="font-size:16px;">Olá,</p>
        <p style="font-size:14px;line-height:1.6;color:#5b6763;">
          Aqui é <strong>${professionalName}</strong>. Faz um tempo que a gente não se
          encontra, e queria saber como você está. Se fizer sentido retomar as sessões,
          os horários continuam abertos — sem compromisso, é só ver o que combina com
          sua agenda.
        </p>
        <p style="margin:24px 0;">${button(profileUrl, "Ver horários e agendar")}</p>
      `;
      return {
        subject: `Sentimos sua falta — ${professionalName}`,
        html: shell(`Vamos retomar?`, body),
      };
    },
    whatsapp: (professionalName, profileUrl) =>
      `Oi! Aqui é ${professionalName}. Faz um tempo que não nos vemos — se quiser retomar as sessões, os horários continuam abertos: ${profileUrl}`,
  },
  {
    id: "cuidado",
    label: "Cuidado com quem já é cliente ativo",
    goal: "Pra quem já está em acompanhamento — reforça vínculo, não é venda.",
    email: (professionalName, profileUrl) => {
      const body = `
        <p style="font-size:16px;">Olá,</p>
        <p style="font-size:14px;line-height:1.6;color:#5b6763;">
          Aqui é <strong>${professionalName}</strong>. Só passando pra saber como você
          está entre uma sessão e outra. Se algo mudou ou se precisar antecipar nossa
          próxima conversa, é só me chamar.
        </p>
        <p style="margin:24px 0;">${button(profileUrl, "Ver minha agenda com você")}</p>
      `;
      return {
        subject: `Como você está? — ${professionalName}`,
        html: shell("Um cuidado com você", body),
      };
    },
    whatsapp: (professionalName) =>
      `Oi! Aqui é ${professionalName}. Só passando pra saber como você está — qualquer coisa antes da nossa próxima sessão, me chama por aqui.`,
  },
];

export function getProfessionalCampaignTemplate(
  id: string
): ProfessionalCampaignTemplate | undefined {
  return PROFESSIONAL_CAMPAIGN_TEMPLATES.find((template) => template.id === id);
}

export interface ResolvedProfessionalCampaignTemplate {
  id: ProfessionalCampaignTemplateId;
  label: string;
  goal: string;
  email: { subject: string; html: string };
  whatsapp: string;
}

export function resolveProfessionalCampaignTemplates(
  professionalName: string,
  profileUrl: string
): ResolvedProfessionalCampaignTemplate[] {
  return PROFESSIONAL_CAMPAIGN_TEMPLATES.map((template) => ({
    id: template.id,
    label: template.label,
    goal: template.goal,
    email: template.email(professionalName, profileUrl),
    whatsapp: template.whatsapp(professionalName, profileUrl),
  }));
}
