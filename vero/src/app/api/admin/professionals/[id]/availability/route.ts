import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function POST(
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

  const { weekday, startTime } = (body ?? {}) as {
    weekday?: unknown;
    startTime?: unknown;
  };

  if (
    typeof weekday !== "number" ||
    !Number.isInteger(weekday) ||
    weekday < 0 ||
    weekday > 6
  ) {
    return NextResponse.json({ error: "Dia da semana inválido." }, { status: 400 });
  }
  if (typeof startTime !== "string" || !TIME_RE.test(startTime)) {
    return NextResponse.json(
      { error: "Horário inválido (use HH:MM)." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase ainda não está configurado." },
      { status: 503 }
    );
  }

  const { error } = await supabase.from("availability_slots").insert({
    professional_id: id,
    weekday,
    start_time: startTime,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Esse horário já está cadastrado." },
        { status: 409 }
      );
    }
    console.error("[admin/availability] insert failed:", error.message);
    return NextResponse.json(
      { error: "Não foi possível salvar agora." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
