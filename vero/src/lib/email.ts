interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

type SendEmailResult = { sent: true } | { sent: false; reason: string };

/**
 * Envia email transacional via Resend (resend.com — tem camada gratuita).
 * Sem RESEND_API_KEY configurado, não falha: só loga e segue em frente,
 * mesmo padrão de fallback gracioso do resto do app.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !from) {
    console.warn(
      "[email] RESEND_API_KEY / RESEND_FROM não configurados — email não enviado:",
      { to: input.to, subject: input.subject }
    );
    return { sent: false, reason: "not_configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error("[email] Resend respondeu com erro:", response.status, body);
      return { sent: false, reason: `resend_${response.status}` };
    }

    return { sent: true };
  } catch (error) {
    console.error("[email] Falha ao chamar a Resend:", error);
    return { sent: false, reason: "network_error" };
  }
}
