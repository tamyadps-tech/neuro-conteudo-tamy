/**
 * Integrações de marketing pra divulgar a própria Vero (não o profissional
 * individual) — email marketing em massa e WhatsApp em massa, usadas pelo
 * admin. Mesmo padrão de fallback gracioso de email.ts/stripe.ts: sem a
 * chave configurada, a função não falha, só avisa que não está conectada.
 */

export interface MarketingPlatform {
  id: string;
  name: string;
  url: string;
  recommended: boolean;
  summary: string;
  why: string;
}

/**
 * Email marketing: precisa de automação (fluxos de venda/acompanhamento/
 * pós-venda), não só disparo transacional. Brevo é a recomendada — camada
 * gratuita generosa, automação de verdade, API REST simples, suporte em
 * português. RD Station Marketing e Mailchimp ficam como alternativas.
 */
export const EMAIL_MARKETING_PLATFORMS: MarketingPlatform[] = [
  {
    id: "brevo",
    name: "Brevo",
    url: "https://www.brevo.com",
    recommended: true,
    summary:
      "E-mail marketing + automação de fluxos (venda, acompanhamento, pós-venda) numa plataforma só.",
    why: "Camada gratuita com até 300 emails/dia, editor de automação de verdade (não só disparo único), API REST simples e suporte em português — dá pra montar os 3 fluxos pedidos sem depender de outra ferramenta.",
  },
  {
    id: "rd-station",
    name: "RD Station Marketing",
    url: "https://www.rdstation.com",
    recommended: false,
    summary: "Automação robusta focada em geração e nutrição de leads B2B.",
    why: "Empresa brasileira, forte em fluxos de nutrição pra quem vende pra outras empresas (como convencer profissionais a entrar na Vero), mas é mais cara e tem menos a ver com o público cliente final.",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    url: "https://mailchimp.com",
    recommended: false,
    summary: "E-mail marketing conhecido, camada gratuita mais limitada.",
    why: "Bem conhecido e fácil de usar, mas a automação de verdade só vem nos planos pagos e o suporte em português é mais fraco que o da Brevo.",
  },
];

/**
 * WhatsApp em massa: o pedido foi "sugira e escolha só uma completa" — a
 * Zenvia é a recomendada porque já entrega um painel de campanhas pronto
 * (não só a API crua do WhatsApp Business), é brasileira e cobra em real.
 */
export const WHATSAPP_MARKETING_PLATFORMS: MarketingPlatform[] = [
  {
    id: "zenvia",
    name: "Zenvia",
    url: "https://www.zenvia.com",
    recommended: true,
    summary:
      "Plataforma completa de WhatsApp Business API oficial, com painel de campanhas em massa pronto.",
    why: "Empresa brasileira, parceira oficial do WhatsApp Business API, com painel de disparo em massa e modelos aprovados já incluído (não precisa construir isso do zero), cobrança em real e suporte em português. É a mais 'completa' das três pra quem quer começar a disparar sem montar infraestrutura própria.",
  },
  {
    id: "take-blip",
    name: "Take Blip",
    url: "https://take.net",
    recommended: false,
    summary: "Plataforma conversacional robusta, mais voltada a grandes empresas.",
    why: "Muito completa e também brasileira, mas o modelo comercial é mais voltado a contratos maiores — compensa se o volume de disparo crescer bastante.",
  },
  {
    id: "360dialog",
    name: "360dialog",
    url: "https://www.360dialog.com",
    recommended: false,
    summary: "Acesso oficial ao WhatsApp Business API, mais barato em volume.",
    why: "Mais barata em escala, mas entrega só a API — é preciso construir (ou usar outra ferramenta) por cima pra ter um painel de campanhas, o que dá mais trabalho pra começar.",
  },
];

export interface MarketingIntegrationStatus {
  configured: boolean;
  missing: string[];
}

export function getEmailMarketingStatus(): MarketingIntegrationStatus {
  const missing: string[] = [];
  if (!process.env.BREVO_API_KEY) missing.push("BREVO_API_KEY");
  if (!process.env.BREVO_FROM) missing.push("BREVO_FROM");
  return { configured: missing.length === 0, missing };
}

export function getWhatsAppMarketingStatus(): MarketingIntegrationStatus {
  const missing: string[] = [];
  if (!process.env.ZENVIA_API_TOKEN) missing.push("ZENVIA_API_TOKEN");
  if (!process.env.ZENVIA_WHATSAPP_FROM) missing.push("ZENVIA_WHATSAPP_FROM");
  return { configured: missing.length === 0, missing };
}

interface SendMarketingEmailInput {
  to: string;
  subject: string;
  html: string;
}

type SendResult = { sent: true } | { sent: false; reason: string };

/**
 * Envia uma campanha de email via Brevo (Transactional Email API). Sem as
 * variáveis configuradas, não falha: só avisa e segue (mesmo padrão de
 * email.ts).
 */
export async function sendMarketingEmail(
  input: SendMarketingEmailInput
): Promise<SendResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.BREVO_FROM;

  if (!apiKey || !from) {
    console.warn(
      "[marketing] BREVO_API_KEY / BREVO_FROM não configurados — campanha não enviada:",
      { to: input.to, subject: input.subject }
    );
    return { sent: false, reason: "not_configured" };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: from, name: "Vero" },
        to: [{ email: input.to }],
        subject: input.subject,
        htmlContent: input.html,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error("[marketing] Brevo respondeu com erro:", response.status, body);
      return { sent: false, reason: `brevo_${response.status}` };
    }

    return { sent: true };
  } catch (error) {
    console.error("[marketing] Falha ao chamar a Brevo:", error);
    return { sent: false, reason: "network_error" };
  }
}

export interface BulkSendResult {
  sent: number;
  failed: number;
  reasons: string[];
}

export async function sendBulkMarketingEmail(
  recipients: string[],
  campaign: { subject: string; html: string }
): Promise<BulkSendResult> {
  const result: BulkSendResult = { sent: 0, failed: 0, reasons: [] };
  for (const to of recipients) {
    const outcome = await sendMarketingEmail({ to, subject: campaign.subject, html: campaign.html });
    if (outcome.sent) {
      result.sent += 1;
    } else {
      result.failed += 1;
      if (!result.reasons.includes(outcome.reason)) result.reasons.push(outcome.reason);
    }
  }
  return result;
}

/**
 * Envia uma mensagem de WhatsApp via Zenvia (Messages API v2). Mesmo
 * fallback gracioso das outras integrações.
 */
export async function sendWhatsAppMessage(
  to: string,
  text: string
): Promise<SendResult> {
  const apiToken = process.env.ZENVIA_API_TOKEN;
  const from = process.env.ZENVIA_WHATSAPP_FROM;

  if (!apiToken || !from) {
    console.warn(
      "[marketing] ZENVIA_API_TOKEN / ZENVIA_WHATSAPP_FROM não configurados — mensagem não enviada:",
      { to }
    );
    return { sent: false, reason: "not_configured" };
  }

  try {
    const response = await fetch(
      "https://api.zenvia.com/v2/channels/whatsapp/messages",
      {
        method: "POST",
        headers: {
          "X-API-TOKEN": apiToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to,
          contents: [{ type: "text", text }],
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error("[marketing] Zenvia respondeu com erro:", response.status, body);
      return { sent: false, reason: `zenvia_${response.status}` };
    }

    return { sent: true };
  } catch (error) {
    console.error("[marketing] Falha ao chamar a Zenvia:", error);
    return { sent: false, reason: "network_error" };
  }
}

export async function sendBulkWhatsAppMessages(
  recipients: string[],
  text: string
): Promise<BulkSendResult> {
  const result: BulkSendResult = { sent: 0, failed: 0, reasons: [] };
  for (const to of recipients) {
    const outcome = await sendWhatsAppMessage(to, text);
    if (outcome.sent) {
      result.sent += 1;
    } else {
      result.failed += 1;
      if (!result.reasons.includes(outcome.reason)) result.reasons.push(outcome.reason);
    }
  }
  return result;
}
