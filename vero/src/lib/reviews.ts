import { getSupabaseAdmin } from "@/lib/supabase-admin";

export interface ReviewSummary {
  average: number;
  count: number;
}

export interface PublicReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

function summarize(ratings: number[]): ReviewSummary {
  if (ratings.length === 0) return { average: 0, count: 0 };
  const total = ratings.reduce((sum, r) => sum + r, 0);
  return { average: total / ratings.length, count: ratings.length };
}

/** Retorna null quando o Supabase ainda não está configurado. */
export async function getReviewSummaries(
  professionalIds: string[]
): Promise<Record<string, ReviewSummary> | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  if (professionalIds.length === 0) return {};

  const { data, error } = await supabase
    .from("reviews")
    .select("professional_id, rating")
    .in("professional_id", professionalIds);

  if (error) {
    console.error("[reviews] Failed to load summaries:", error.message);
    return {};
  }

  const byProfessional = new Map<string, number[]>();
  for (const row of data ?? []) {
    const list = byProfessional.get(row.professional_id) ?? [];
    list.push(row.rating);
    byProfessional.set(row.professional_id, list);
  }

  const result: Record<string, ReviewSummary> = {};
  for (const id of professionalIds) {
    result[id] = summarize(byProfessional.get(id) ?? []);
  }
  return result;
}

/** Retorna null quando o Supabase ainda não está configurado. */
export async function listPublicReviews(
  professionalId: string
): Promise<PublicReview[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at")
    .eq("professional_id", professionalId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[reviews] Failed to list public reviews:", error.message);
    return [];
  }
  return data;
}
