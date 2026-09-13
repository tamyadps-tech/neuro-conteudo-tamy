import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";
import { sessionSummaryEmail } from "@/lib/email-templates";

const VALID_STATUSES = new Set([
  "agendada",
  "concluida",
  "cancelada_cliente",
  "cancelada_profissional",
]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { topics, homework, nextSessionAt, status } = (body ?? {}) as {
    topics?: unknown;
    homework?: unknown;
    nextSessionAt?: unknown;
    status?: unknown;
  };

  const update: Record<string, unknown> = {};

  if (topics !== undefined) {
    if (
      !Array.isArray(topics) ||
      topics.some((t) => typeof t !== "string" || !t.trim())
    ) {
      return NextResponse.json({ error: "Tópicos inválidos." }, { status: 400 });
    }
    update.topics = topics.map((t: string) => t.trim());
  }

  if (homework !== undefined) {
    if (typeof homework !== "string") {
      return NextResponse.json({ error: "Tarefa inválida." }, { status: 400 });
    }
    update.homework = homework.trim() || null;
  }

  if (nextSessionAt !== undefined) {
    if (nextSessionAt !== null) {
      const date = typeof nextSessionAt === "string" ? new Date(nextSessionAt) : null;
      if (!date || Number.isNaN(date.getTime())) {
        return NextResponse.json(
          { error: "Data da próxima sessão inválida." },
          { status: 400 }
        );
      }
      update.next_session_at = date.toISOString();
    } else {
      update.next_session_at = null;
    }
  }

  if (status !== undefined) {
    if (typeof status !== "string" || !VALID_STATUSES.has(status)) {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
    }
    update.status = status;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase ainda não está configurado." },
      { status: 503 }
    );
  }

  const { error } = await supabase.from("sessions").update(update).eq("id", id);

  if (error) {
    console.error("[admin/sessions] update failed:", error.message);
    return NextResponse.json(
      { error: "Não foi possível salvar agora." },
      { status: 500 }
    );
  }

  // Ao concluir a sessão, manda o resumo pro cliente. Best-effort: se o
  // email falhar, a atualização da sessão já valeu de qualquer forma.
  if (update.status === "concluida") {
    const { data: fullSession } = await supabase
      .from("sessions")
      .select(
        "topics, homework, next_session_at, professional:professionals(full_name), client:clients(full_name, email, access_token)"
      )
      .eq("id", id)
      .single();

    if (fullSession?.client && fullSession.professional) {
      const client = fullSession.client as unknown as {
        full_name: string;
        email: string;
        access_token: string;
      };
      const professional = fullSession.professional as unknown as {
        full_name: string;
      };
      const { subject, html } = sessionSummaryEmail({
        clientName: client.full_name,
        professionalName: professional.full_name,
        topics: fullSession.topics ?? [],
        homework: fullSession.homework,
        nextSessionAt: fullSession.next_session_at,
        progressUrl: `${new URL(request.url).origin}/c/${client.access_token}`,
      });
      await sendEmail({ to: client.email, subject, html });
    }
  }

  return NextResponse.json({ ok: true });
}
