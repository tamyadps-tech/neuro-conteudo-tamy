import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type SessionStatus =
  | "agendada"
  | "concluida"
  | "cancelada_cliente"
  | "cancelada_profissional";

export type PaymentStatus = "pendente" | "pago" | "falhou" | "reembolsado";

export interface AdminSession {
  id: string;
  scheduled_at: string;
  status: SessionStatus;
  topics: string[] | null;
  homework: string | null;
  next_session_at: string | null;
  client: { full_name: string; email: string } | null;
  payment: { status: PaymentStatus; amount_cents: number } | null;
}

/** Retorna null quando o Supabase ainda não está configurado. */
export async function listSessionsForProfessional(
  professionalId: string
): Promise<AdminSession[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("sessions")
    .select(
      "id, scheduled_at, status, topics, homework, next_session_at, client:clients(full_name, email), payment:payments(status, amount_cents)"
    )
    .eq("professional_id", professionalId)
    .order("scheduled_at", { ascending: false });

  if (error) {
    console.error("[admin] Failed to list sessions:", error.message);
    return [];
  }

  return (data ?? []) as unknown as AdminSession[];
}
