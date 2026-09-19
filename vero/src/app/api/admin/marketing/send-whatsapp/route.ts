import { NextResponse } from "next/server";
import { getCampaignTemplate } from "@/lib/marketing-campaign-templates";
import { sendBulkWhatsAppMessages } from "@/lib/marketing-integrations";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { templateId, phones } = (body ?? {}) as {
    templateId?: unknown;
    phones?: unknown;
  };

  const template = typeof templateId === "string" ? getCampaignTemplate(templateId) : undefined;
  if (!template) {
    return NextResponse.json({ error: "Modelo de campanha inválido." }, { status: 400 });
  }

  const cleanedPhones = Array.isArray(phones)
    ? phones
        .filter((phone): phone is string => typeof phone === "string" && phone.trim().length > 0)
        .map((phone) => phone.trim())
    : [];

  if (cleanedPhones.length === 0) {
    return NextResponse.json(
      { error: "Informe ao menos um número de WhatsApp." },
      { status: 400 }
    );
  }

  const origin = new URL(request.url).origin;
  const text = template.whatsapp(origin);
  const result = await sendBulkWhatsAppMessages(cleanedPhones, text);

  return NextResponse.json({ ok: true, recipientCount: cleanedPhones.length, ...result });
}
