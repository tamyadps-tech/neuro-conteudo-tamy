import { getSupabaseAdmin } from "@/lib/supabase-admin";

export interface ProfessionalClient {
  id: string;
  full_name: string;
  email: string;
  sessionCount: number;
  lastSessionAt: string | null;
  totalPaidCents: number;
}

type SessionRow = {
  scheduled_at: string;
  client: { id: string; full_name: string; email: string } | null;
  payment: { status: string; amount_cents: number } | null;
};

/**
 * CRM básico: agrega as sessões do profissional por cliente, sem tabela
 * própria — a "carteira de clientes" já está implícita em `sessions`.
 * Retorna null quando o Supabase ainda não está configurado.
 */
export async function listProfessionalClients(
  professionalId: string
): Promise<ProfessionalClient[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("sessions")
    .select(
      "scheduled_at, client:clients(id, full_name, email), payment:payments(status, amount_cents)"
    )
    .eq("professional_id", professionalId)
    .order("scheduled_at", { ascending: false });

  if (error) {
    console.error("[professional-clients] Failed to list clients:", error.message);
    return [];
  }

  const byClient = new Map<string, ProfessionalClient>();
  for (const row of (data ?? []) as unknown as SessionRow[]) {
    const client = row.client;
    if (!client) continue;

    const entry = byClient.get(client.id) ?? {
      id: client.id,
      full_name: client.full_name,
      email: client.email,
      sessionCount: 0,
      lastSessionAt: null,
      totalPaidCents: 0,
    };

    entry.sessionCount += 1;
    if (!entry.lastSessionAt || row.scheduled_at > entry.lastSessionAt) {
      entry.lastSessionAt = row.scheduled_at;
    }
    if (row.payment?.status === "pago") {
      entry.totalPaidCents += row.payment.amount_cents;
    }

    byClient.set(client.id, entry);
  }

  return Array.from(byClient.values()).sort((a, b) =>
    (b.lastSessionAt ?? "").localeCompare(a.lastSessionAt ?? "")
  );
}
