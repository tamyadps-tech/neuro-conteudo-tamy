import { getSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * Segmentos de destinatários pra campanha de email — usam dados que já
 * existem (lista de espera, profissionais aprovados), sem tabela nova.
 */
export type RecipientSegment =
  | "waitlist-clientes"
  | "waitlist-profissionais"
  | "profissionais-aprovados";

export const RECIPIENT_SEGMENTS: { id: RecipientSegment; label: string }[] = [
  { id: "waitlist-clientes", label: "Lista de espera — clientes" },
  { id: "waitlist-profissionais", label: "Lista de espera — profissionais" },
  { id: "profissionais-aprovados", label: "Profissionais aprovados" },
];

/** Retorna null quando o Supabase ainda não está configurado. */
export async function listRecipientEmails(
  segment: RecipientSegment
): Promise<string[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  if (segment === "waitlist-clientes" || segment === "waitlist-profissionais") {
    const role = segment === "waitlist-clientes" ? "cliente" : "profissional";
    const { data, error } = await supabase
      .from("waitlist_signups")
      .select("email")
      .eq("role", role);

    if (error) {
      console.error("[marketing-recipients] Failed to list waitlist:", error.message);
      return [];
    }
    return (data ?? []).map((row) => row.email);
  }

  const { data, error } = await supabase
    .from("professionals")
    .select("email")
    .eq("vetting_status", "aprovado");

  if (error) {
    console.error("[marketing-recipients] Failed to list professionals:", error.message);
    return [];
  }
  return (data ?? []).map((row) => row.email);
}
