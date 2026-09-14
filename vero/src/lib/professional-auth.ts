import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { ProfessionalCategory } from "@/lib/professional-categories";
import type { SessionFormat } from "@/lib/session-format";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ProfessionalAccount {
  id: string;
  full_name: string;
  email: string;
  category: ProfessionalCategory;
  session_format: SessionFormat;
  price_cents: number;
  vetting_status: "pendente" | "aprovado" | "rejeitado";
  vetting_notes: string | null;
}

type ProfessionalLookup =
  | { configured: false }
  | { configured: true; professional: ProfessionalAccount | null };

/** `configured: false` quando o Supabase ainda não está configurado. */
export async function getProfessionalByToken(token: string): Promise<ProfessionalLookup> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { configured: false };

  if (!UUID_RE.test(token)) {
    return { configured: true, professional: null };
  }

  const { data, error } = await supabase
    .from("professionals")
    .select("id, full_name, email, category, session_format, price_cents, vetting_status, vetting_notes")
    .eq("access_token", token)
    .maybeSingle();

  if (error) {
    console.error("[professional-auth] Failed to load professional:", error.message);
  }

  return { configured: true, professional: data ?? null };
}

/**
 * Resolve o token para o id do profissional dono dele, ou null se o token
 * for inválido/não existir. Usado pelas rotas de API do profissional pra
 * nunca confiar num professionalId vindo do corpo da requisição.
 */
export async function getProfessionalIdByToken(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  token: unknown
): Promise<string | null> {
  if (typeof token !== "string" || !UUID_RE.test(token)) return null;

  const { data } = await supabase
    .from("professionals")
    .select("id")
    .eq("access_token", token)
    .maybeSingle();

  return data?.id ?? null;
}
