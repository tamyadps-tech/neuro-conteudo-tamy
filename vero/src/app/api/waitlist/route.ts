import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = new Set(["cliente", "profissional"]);

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { email, role } = (body ?? {}) as { email?: unknown; role?: unknown };

  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Informe um email válido." }, { status: 400 });
  }
  if (typeof role !== "string" || !VALID_ROLES.has(role)) {
    return NextResponse.json({ error: "Papel inválido." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.warn(
      "[waitlist] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não configurados — inscrição não persistida:",
      { email, role }
    );
    return NextResponse.json(
      {
        error:
          "Lista de espera ainda não está conectada ao banco de dados. Tente novamente em breve.",
      },
      { status: 503 }
    );
  }

  const { error } = await supabase
    .from("waitlist_signups")
    .upsert({ email: email.toLowerCase().trim(), role }, { onConflict: "email" });

  if (error) {
    console.error("[waitlist] Supabase insert failed:", error.message);
    return NextResponse.json(
      { error: "Não foi possível salvar agora. Tente novamente." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
