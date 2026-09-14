import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getProfessionalIdByToken } from "@/lib/professional-auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slotId: string }> }
) {
  const { slotId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { token } = (body ?? {}) as { token?: unknown };

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase ainda não está configurado." },
      { status: 503 }
    );
  }

  const professionalId = await getProfessionalIdByToken(supabase, token);
  if (!professionalId) {
    return NextResponse.json({ error: "Link inválido." }, { status: 404 });
  }

  const { error } = await supabase
    .from("availability_slots")
    .delete()
    .eq("id", slotId)
    .eq("professional_id", professionalId);

  if (error) {
    console.error("[professional/availability] delete failed:", error.message);
    return NextResponse.json(
      { error: "Não foi possível remover agora." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
