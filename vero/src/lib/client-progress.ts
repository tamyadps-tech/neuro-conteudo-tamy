import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { SessionStatus } from "@/lib/admin-sessions";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ClientProgressSession {
  id: string;
  scheduled_at: string;
  status: SessionStatus;
  topics: string[] | null;
  homework: string | null;
  next_session_at: string | null;
  professional: { full_name: string } | null;
  review: { rating: number; comment: string | null } | null;
}

export interface ClientProgress {
  full_name: string;
  sessions: ClientProgressSession[];
}

type ClientLookup =
  | { configured: false }
  | { configured: true; client: ClientProgress | null };

/** `configured: false` quando o Supabase ainda não está configurado. */
export async function getClientProgress(token: string): Promise<ClientLookup> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { configured: false };

  if (!UUID_RE.test(token)) {
    return { configured: true, client: null };
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, full_name")
    .eq("access_token", token)
    .maybeSingle();

  if (clientError || !client) {
    if (clientError) {
      console.error("[client-progress] Failed to load client:", clientError.message);
    }
    return { configured: true, client: null };
  }

  const { data: sessions, error: sessionsError } = await supabase
    .from("sessions")
    .select(
      "id, scheduled_at, status, topics, homework, next_session_at, professional:professionals(full_name), review:reviews(rating, comment)"
    )
    .eq("client_id", client.id)
    .order("scheduled_at", { ascending: false });

  if (sessionsError) {
    console.error("[client-progress] Failed to load sessions:", sessionsError.message);
  }

  return {
    configured: true,
    client: {
      full_name: client.full_name,
      sessions: (sessions ?? []) as unknown as ClientProgressSession[],
    },
  };
}
