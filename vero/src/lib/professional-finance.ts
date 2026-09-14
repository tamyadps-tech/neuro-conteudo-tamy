import { getSupabaseAdmin } from "@/lib/supabase-admin";

export interface ProfessionalTransaction {
  sessionId: string;
  clientName: string;
  scheduledAt: string;
  status: string;
  amountCents: number;
}

export interface ProfessionalFinance {
  receivedCents: number;
  pendingCents: number;
  paidSessionsCount: number;
  transactions: ProfessionalTransaction[];
}

type SessionRow = {
  id: string;
  scheduled_at: string;
  client: { full_name: string } | null;
  payment: { status: string; amount_cents: number } | null;
};

/** Retorna null quando o Supabase ainda não está configurado. */
export async function getProfessionalFinance(
  professionalId: string
): Promise<ProfessionalFinance | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("sessions")
    .select(
      "id, scheduled_at, client:clients(full_name), payment:payments(status, amount_cents)"
    )
    .eq("professional_id", professionalId)
    .order("scheduled_at", { ascending: false });

  const finance: ProfessionalFinance = {
    receivedCents: 0,
    pendingCents: 0,
    paidSessionsCount: 0,
    transactions: [],
  };

  if (error) {
    console.error("[professional-finance] Failed to load finance:", error.message);
    return finance;
  }

  for (const row of (data ?? []) as unknown as SessionRow[]) {
    if (!row.payment) continue;

    if (row.payment.status === "pago") {
      finance.receivedCents += row.payment.amount_cents;
      finance.paidSessionsCount += 1;
    }
    if (row.payment.status === "pendente") {
      finance.pendingCents += row.payment.amount_cents;
    }

    finance.transactions.push({
      sessionId: row.id,
      clientName: row.client?.full_name ?? "Cliente removido",
      scheduledAt: row.scheduled_at,
      status: row.payment.status,
      amountCents: row.payment.amount_cents,
    });
  }

  return finance;
}
