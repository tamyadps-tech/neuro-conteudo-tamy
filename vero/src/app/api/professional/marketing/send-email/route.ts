import { NextResponse } from "next/server";
import { getProfessionalByToken } from "@/lib/professional-auth";
import { listProfessionalClients } from "@/lib/professional-clients";
import { getProfessionalCampaignTemplate } from "@/lib/professional-campaign-templates";
import { sendBulkMarketingEmail } from "@/lib/marketing-integrations";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { token, templateId, clientIds } = (body ?? {}) as {
    token?: unknown;
    templateId?: unknown;
    clientIds?: unknown;
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

  const clients = await listProfessionalClients(lookup.professional.id);
  if (clients === null) {
    return NextResponse.json({ error: "Supabase ainda não está configurado." }, { status: 503 });
  }

  // Nunca confia em email vindo do corpo — só manda pra quem já é cliente
  // de verdade desse profissional (evita virar disparo aberto pra
  // qualquer endereço).
  const requestedIds = Array.isArray(clientIds)
    ? clientIds.filter((id): id is string => typeof id === "string")
    : [];
  const matchedClients = clients.filter((client) => requestedIds.includes(client.id));

  if (matchedClients.length === 0) {
    return NextResponse.json(
      { error: "Selecione ao menos um cliente seu pra enviar." },
      { status: 400 }
    );
  }

  const origin = new URL(request.url).origin;
  const profileUrl = `${origin}/profissionais/${lookup.professional.id}`;
  const { subject, html } = template.email(lookup.professional.full_name, profileUrl);

  const result = await sendBulkMarketingEmail(
    matchedClients.map((client) => client.email),
    { subject, html }
  );

  return NextResponse.json({ ok: true, recipientCount: matchedClients.length, ...result });
}
