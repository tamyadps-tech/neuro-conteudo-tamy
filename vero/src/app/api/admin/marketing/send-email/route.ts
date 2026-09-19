import { NextResponse } from "next/server";
import { getCampaignTemplate } from "@/lib/marketing-campaign-templates";
import { sendBulkMarketingEmail } from "@/lib/marketing-integrations";
import {
  listRecipientEmails,
  RECIPIENT_SEGMENTS,
  type RecipientSegment,
} from "@/lib/marketing-recipients";

const SEGMENT_IDS = RECIPIENT_SEGMENTS.map((s) => s.id);

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { templateId, segment, manualEmails } = (body ?? {}) as {
    templateId?: unknown;
    segment?: unknown;
    manualEmails?: unknown;
  };

  const template = typeof templateId === "string" ? getCampaignTemplate(templateId) : undefined;
  if (!template) {
    return NextResponse.json({ error: "Modelo de campanha inválido." }, { status: 400 });
  }

  let recipients: string[] = [];

  if (Array.isArray(manualEmails) && manualEmails.length > 0) {
    recipients = manualEmails
      .filter((email): email is string => typeof email === "string" && email.includes("@"))
      .map((email) => email.trim());
  } else if (typeof segment === "string" && SEGMENT_IDS.includes(segment as RecipientSegment)) {
    const segmentRecipients = await listRecipientEmails(segment as RecipientSegment);
    if (segmentRecipients === null) {
      return NextResponse.json(
        { error: "Supabase ainda não está configurado." },
        { status: 503 }
      );
    }
    recipients = segmentRecipients;
  } else {
    return NextResponse.json(
      { error: "Informe um segmento ou uma lista de emails." },
      { status: 400 }
    );
  }

  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "Nenhum destinatário encontrado pra essa campanha." },
      { status: 400 }
    );
  }

  const origin = new URL(request.url).origin;
  const { subject, html } = template.email(origin);
  const result = await sendBulkMarketingEmail(recipients, { subject, html });

  return NextResponse.json({ ok: true, recipientCount: recipients.length, ...result });
}
