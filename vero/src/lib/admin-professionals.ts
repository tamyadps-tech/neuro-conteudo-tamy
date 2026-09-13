import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { ProfessionalCategory } from "@/lib/professional-categories";
import type { SessionFormat } from "@/lib/session-format";

export interface AdminProfessional {
  id: string;
  full_name: string;
  email: string;
  category: ProfessionalCategory;
  bio: string;
  years_experience: number;
  specialties: string[];
  methods: string[];
  personality: string | null;
  session_format: SessionFormat;
  location_city: string | null;
  location_state: string | null;
  location_address: string | null;
  price_cents: number;
  vetting_status: "pendente" | "aprovado" | "rejeitado";
  vetting_notes: string | null;
  credential_document_url: string | null;
  created_at: string;
}

/** Retorna null quando o Supabase ainda não está configurado. */
export async function listProfessionals(): Promise<AdminProfessional[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("professionals")
    .select(
      "id, full_name, email, category, bio, years_experience, specialties, methods, personality, session_format, location_city, location_state, location_address, price_cents, vetting_status, vetting_notes, credential_document_url, created_at"
    )
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[admin] Failed to list professionals:", error.message);
    return [];
  }

  return data;
}
