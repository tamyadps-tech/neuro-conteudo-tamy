import { NextResponse } from "next/server";
import { getProfessionalByToken } from "@/lib/professional-auth";
import { getProfessionalCampaignTemplate } from "@/lib/professional-campaign-templates";
import { sendBulkWhatsAppMessages } from "@/lib/marketing-integrations";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { token, templateId, phones } = (body ?? {}) as {
    token?: unknown;
    templateId?: unknown;
    phones?: unknown;
  };

  const template = typeof templateId === "string" ? getProfessionalCampaignTemplate(templateId) : undefined;
  if (!template) {
    return NextResponse.json({ error: "Modelo de campanha inválido." }, { status: 400 });
  }

  const lookup = await getProfessionalByToken(typeof token === "string" ? token : "");
  if (!lookup.configured) {
    return NextResponse.json({ error: "Supabase ainda não está configurado." }, { status: 503 });
  }
  if (!lookup.professional) {
    return NextResponse.json({ error: "Link inválido." }, { status: 404 });
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
  const profileUrl = `${origin}/profissionais/${lookup.professional.id}`;
  const text = template.whatsapp(lookup.professional.full_name, profileUrl);

  const result = await sendBulkWhatsAppMessages(cleanedPhones, text);

  return NextResponse.json({ ok: true, recipientCount: cleanedPhones.length, ...result });
}
