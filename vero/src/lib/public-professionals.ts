import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { ProfessionalCategory } from "@/lib/professional-categories";
import type { SessionFormat } from "@/lib/session-format";

export interface PublicProfessional {
  id: string;
  full_name: string;
  category: ProfessionalCategory;
  bio: string;
  years_experience: number;
  specialties: string[];
  methods: string[];
  personality: string | null;
  session_format: SessionFormat;
  location_city: string | null;
  location_state: string | null;
  price_cents: number;
}

const PUBLIC_COLUMNS =
  "id, full_name, category, bio, years_experience, specialties, methods, personality, session_format, location_city, location_state, price_cents";

export interface ProfessionalSearchFilters {
  category?: ProfessionalCategory;
  sessionFormat?: SessionFormat;
  q?: string;
}

/** Retorna null quando o Supabase ainda não está configurado. */
export async function listApprovedProfessionals(
  filters: ProfessionalSearchFilters = {}
): Promise<PublicProfessional[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  let query = supabase
    .from("professionals")
    .select(PUBLIC_COLUMNS)
    .eq("vetting_status", "aprovado")
    .order("created_at", { ascending: false });

  if (filters.category) {
    query = query.eq("category", filters.category);
  }
  if (filters.sessionFormat) {
    query = query.eq("session_format", filters.sessionFormat);
  }
  if (filters.q) {
    const term = filters.q.trim();
    if (term) {
      query = query.or(`full_name.ilike.%${term}%,bio.ilike.%${term}%`);
    }
  }

  const { data, error } = await query;
  if (error) {
    console.error("[professionals] Failed to list approved professionals:", error.message);
    return [];
  }
  return data;
}

type ProfessionalLookup =
  | { configured: false }
  | { configured: true; professional: PublicProfessional | null };

/** `configured: false` quando o Supabase ainda não está configurado. */
export async function getApprovedProfessional(
  id: string
): Promise<ProfessionalLookup> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { configured: false };

  const { data, error } = await supabase
    .from("professionals")
    .select(PUBLIC_COLUMNS)
    .eq("id", id)
    .eq("vetting_status", "aprovado")
    .maybeSingle();

  if (error) {
    console.error("[professionals] Failed to load professional:", error.message);
    return { configured: true, professional: null };
  }
  return { configured: true, professional: data };
}
