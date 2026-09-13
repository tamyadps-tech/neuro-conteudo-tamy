import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { ProfessionalCategory } from "@/lib/professional-categories";

export interface AdminMetrics {
  waitlist: { total: number; clientes: number; profissionais: number };
  professionals: {
    total: number;
    pendente: number;
    aprovado: number;
    rejeitado: number;
    byCategory: Partial<Record<ProfessionalCategory, number>>;
  };
  sessions: { agendadas: number; concluidas: number };
}

/** Retorna null quando o Supabase ainda não está configurado. */
export async function getAdminMetrics(): Promise<AdminMetrics | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const [{ data: waitlistRows }, { data: professionalRows }, { data: sessionRows }] =
    await Promise.all([
      supabase.from("waitlist_signups").select("role"),
      supabase.from("professionals").select("vetting_status, category"),
      supabase.from("sessions").select("status"),
    ]);

  const waitlist = { total: 0, clientes: 0, profissionais: 0 };
  for (const row of waitlistRows ?? []) {
    waitlist.total += 1;
    if (row.role === "cliente") waitlist.clientes += 1;
    if (row.role === "profissional") waitlist.profissionais += 1;
  }

  const professionals: AdminMetrics["professionals"] = {
    total: 0,
    pendente: 0,
    aprovado: 0,
    rejeitado: 0,
    byCategory: {},
  };
  for (const row of professionalRows ?? []) {
    professionals.total += 1;
    if (row.vetting_status === "pendente") professionals.pendente += 1;
    if (row.vetting_status === "aprovado") professionals.aprovado += 1;
    if (row.vetting_status === "rejeitado") professionals.rejeitado += 1;

    const category = row.category as ProfessionalCategory;
    professionals.byCategory[category] =
      (professionals.byCategory[category] ?? 0) + 1;
  }

  const sessions = { agendadas: 0, concluidas: 0 };
  for (const row of sessionRows ?? []) {
    if (row.status === "agendada") sessions.agendadas += 1;
    if (row.status === "concluida") sessions.concluidas += 1;
  }

  return { waitlist, professionals, sessions };
}
