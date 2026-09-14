import { sendEmail } from "@/lib/email";
import { sessionSummaryEmail } from "@/lib/email-templates";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const VALID_STATUSES = new Set([
  "agendada",
  "concluida",
  "cancelada_cliente",
  "cancelada_profissional",
]);

export type SessionUpdateFields = {
  topics?: string[];
  homework?: string | null;
  next_session_at?: string | null;
  status?: string;
};

/** Valida o corpo de um PATCH de sessão (admin ou profissional). */
export function parseSessionUpdate(
  body: unknown
): { data: SessionUpdateFields } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Corpo inválido." };
  }
  const { topics, homework, nextSessionAt, status } = body as {
    topics?: unknown;
    homework?: unknown;
    nextSessionAt?: unknown;
    status?: unknown;
  };

  const update: SessionUpdateFields = {};

  if (topics !== undefined) {
    if (!Array.isArray(topics) || topics.some((t) => typeof t !== "string" || !t.trim())) {
      return { error: "Tópicos inválidos." };
    }
    update.topics = topics.map((t: string) => t.trim());
  }

  if (homework !== undefined) {
    if (typeof homework !== "string") {
      return { error: "Tarefa inválida." };
    }
    update.homework = homework.trim() || null;
  }

  if (nextSessionAt !== undefined) {
    if (nextSessionAt !== null) {
      const date = typeof nextSessionAt === "string" ? new Date(nextSessionAt) : null;
      if (!date || Number.isNaN(date.getTime())) {
        return { error: "Data da próxima sessão inválida." };
      }
      update.next_session_at = date.toISOString();
    } else {
      update.next_session_at = null;
    }
  }

  if (status !== undefined) {
    if (typeof status !== "string" || !VALID_STATUSES.has(status)) {
      return { error: "Status inválido." };
    }
    update.status = status;
  }

  if (Object.keys(update).length === 0) {
    return { error: "Nada para atualizar." };
  }

  return { data: update };
}

/**
 * Ao concluir a sessão, manda o resumo pro cliente. Best-effort: se o
 * email falhar, quem chamou já deve ter salvo a atualização da sessão de
 * qualquer forma.
 */
export async function notifySessionCompletion(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  sessionId: string,
  origin: string
) {
  const { data: fullSession } = await supabase
    .from("sessions")
    .select(
      "topics, homework, next_session_at, professional:professionals(full_name), client:clients(full_name, email, access_token)"
    )
    .eq("id", sessionId)
    .single();

  const client = fullSession?.client as unknown as
    | { full_name: string; email: string; access_token: string }
    | undefined;
  const professional = fullSession?.professional as unknown as
    | { full_name: string }
    | undefined;

  if (!fullSession || !client || !professional) return;

  const { subject, html } = sessionSummaryEmail({
    clientName: client.full_name,
    professionalName: professional.full_name,
    topics: fullSession.topics ?? [],
    homework: fullSession.homework,
    nextSessionAt: fullSession.next_session_at,
    progressUrl: `${origin}/c/${client.access_token}`,
  });
  await sendEmail({ to: client.email, subject, html });
}
