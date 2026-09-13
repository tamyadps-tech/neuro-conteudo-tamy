import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; slotId: string }> }
) {
  const { id, slotId } = await params;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase ainda não está configurado." },
      { status: 503 }
    );
  }

  const { error } = await supabase
    .from("availability_slots")
    .delete()
    .eq("id", slotId)
    .eq("professional_id", id);

  if (error) {
    console.error("[admin/availability] delete failed:", error.message);
    return NextResponse.json(
      { error: "Não foi possível remover agora." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
