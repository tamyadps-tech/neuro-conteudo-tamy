import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const ACTION_TO_STATUS = {
  aprovar: "aprovado",
  rejeitar: "rejeitado",
} as const;

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

  const { action, notes } = (body ?? {}) as { action?: unknown; notes?: unknown };
  if (typeof action !== "string" || !(action in ACTION_TO_STATUS)) {
    return NextResponse.json(
      { error: "Ação inválida. Use 'aprovar' ou 'rejeitar'." },
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

  const { error } = await supabase
    .from("professionals")
    .update({
      vetting_status: ACTION_TO_STATUS[action as keyof typeof ACTION_TO_STATUS],
      vetting_notes: typeof notes === "string" ? notes : null,
    })
    .eq("id", id);

  if (error) {
    console.error("[admin/professionals] update failed:", error.message);
    return NextResponse.json(
      { error: "Não foi possível atualizar agora." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
