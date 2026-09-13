import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { token, sessionId, rating, comment } = (body ?? {}) as {
    token?: unknown;
    sessionId?: unknown;
    rating?: unknown;
    comment?: unknown;
  };

  if (typeof token !== "string" || !UUID_RE.test(token)) {
    return NextResponse.json({ error: "Link inválido." }, { status: 400 });
  }
  if (typeof sessionId !== "string" || !UUID_RE.test(sessionId)) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 400 });
  }
  const ratingNumber = typeof rating === "number" ? Math.round(rating) : NaN;
  if (!Number.isFinite(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
    return NextResponse.json({ error: "Escolha uma nota de 1 a 5." }, { status: 400 });
  }
  const commentText =
    typeof comment === "string" && comment.trim() ? comment.trim().slice(0, 500) : null;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Avaliação ainda não está conectada ao banco de dados. Tente novamente em breve.",
      },
      { status: 503 }
    );
  }

  // Só quem tem o link de progresso desse cliente pode avaliar, e só uma
  // sessão concluída dele mesmo — nunca confia em client_id vindo do corpo.
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id")
    .eq("access_token", token)
    .maybeSingle();

  if (clientError || !client) {
    return NextResponse.json({ error: "Link inválido." }, { status: 404 });
  }

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, professional_id, client_id, status")
    .eq("id", sessionId)
    .maybeSingle();

  if (sessionError || !session || session.client_id !== client.id) {
    return NextResponse.json({ error: "Sessão não encontrada." }, { status: 404 });
  }
  if (session.status !== "concluida") {
    return NextResponse.json(
      { error: "Só é possível avaliar sessões concluídas." },
      { status: 400 }
    );
  }

  const { error: insertError } = await supabase.from("reviews").insert({
    session_id: session.id,
    client_id: client.id,
    professional_id: session.professional_id,
    rating: ratingNumber,
    comment: commentText,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "Você já avaliou esta sessão." },
        { status: 409 }
      );
    }
    console.error("[reviews] insert failed:", insertError.message);
    return NextResponse.json(
      { error: "Não foi possível enviar sua avaliação agora." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
