import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getUpcomingSlots, type AvailabilityRule } from "@/lib/availability";

export interface AdminAvailabilitySlot {
  id: string;
  weekday: number;
  start_time: string;
}

/** Retorna null quando o Supabase ainda não está configurado. */
export async function listAvailabilitySlots(
  professionalId: string
): Promise<AdminAvailabilitySlot[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("availability_slots")
    .select("id, weekday, start_time")
    .eq("professional_id", professionalId)
    .order("weekday", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("[booking] Failed to list availability slots:", error.message);
    return [];
  }
  return data;
}

/** Retorna null quando o Supabase ainda não está configurado. */
export async function getUpcomingSlotsForProfessional(
  professionalId: string
): Promise<Date[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const [{ data: rules, error: rulesError }, { data: sessions, error: sessionsError }] =
    await Promise.all([
      supabase
        .from("availability_slots")
        .select("weekday, start_time")
        .eq("professional_id", professionalId),
      supabase
        .from("sessions")
        .select("scheduled_at")
        .eq("professional_id", professionalId)
        .eq("status", "agendada"),
    ]);

  if (rulesError || sessionsError) {
    console.error(
      "[booking] Failed to compute upcoming slots:",
      rulesError?.message ?? sessionsError?.message
    );
    return [];
  }

  const availabilityRules: AvailabilityRule[] = (rules ?? []).map((r) => ({
    weekday: r.weekday,
    // Postgres `time` volta como "HH:MM:SS" — corta pra "HH:MM".
    startTime: r.start_time.slice(0, 5),
  }));

  return getUpcomingSlots({
    rules: availabilityRules,
    bookedSessions: (sessions ?? []).map((s) => ({ scheduledAt: s.scheduled_at })),
  });
}
