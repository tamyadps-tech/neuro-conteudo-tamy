import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getUpcomingSlotsForProfessional } from "@/lib/booking";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { professionalId, slot, clientName, clientEmail } = (body ?? {}) as {
    professionalId?: unknown;
    slot?: unknown;
    clientName?: unknown;
    clientEmail?: unknown;
  };

  if (typeof professionalId !== "string" || !UUID_RE.test(professionalId)) {
    return NextResponse.json({ error: "Profissional inválido." }, { status: 400 });
  }

  const slotDate = typeof slot === "string" ? new Date(slot) : null;
  if (!slotDate || Number.isNaN(slotDate.getTime()) || slotDate.getTime() < Date.now()) {
    return NextResponse.json({ error: "Horário inválido." }, { status: 400 });
  }

  const fullName = typeof clientName === "string" ? clientName.trim() : "";
  if (fullName.length < 3) {
    return NextResponse.json({ error: "Informe seu nome completo." }, { status: 400 });
  }

  const email = typeof clientEmail === "string" ? clientEmail.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Informe um email válido." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Agendamento ainda não está conectado ao banco de dados. Tente novamente em breve.",
      },
      { status: 503 }
    );
  }

  // Recalcula os horários de verdade no servidor — nunca confia no horário
  // que o cliente mandou de volta (evita corrida/duplo agendamento e
  // horários fora da disponibilidade real do profissional).
  const upcoming = await getUpcomingSlotsForProfessional(professionalId);
  const isStillAvailable = (upcoming ?? []).some(
    (candidate) => candidate.getTime() === slotDate.getTime()
  );
  if (!isStillAvailable) {
    return NextResponse.json(
      { error: "Esse horário não está mais disponível. Escolha outro." },
      { status: 409 }
    );
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .upsert({ full_name: fullName, email }, { onConflict: "email" })
    .select("id")
    .single();

  if (clientError || !client) {
    console.error("[sessions/book] client upsert failed:", clientError?.message);
    return NextResponse.json(
      { error: "Não foi possível agendar agora. Tente novamente." },
      { status: 500 }
    );
  }

  const { error: sessionError } = await supabase.from("sessions").insert({
    professional_id: professionalId,
    client_id: client.id,
    scheduled_at: slotDate.toISOString(),
    status: "agendada",
  });

  if (sessionError) {
    console.error("[sessions/book] session insert failed:", sessionError.message);
    return NextResponse.json(
      { error: "Não foi possível agendar agora. Tente novamente." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
