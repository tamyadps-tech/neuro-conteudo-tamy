import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isProfessionalCategory } from "@/lib/professional-categories";
import { isSessionFormat, type SessionFormat } from "@/lib/session-format";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/i;
const MAX_TAGS = 10;

interface ApplyPayload {
  fullName: string;
  email: string;
  category: string;
  bio: string;
  yearsExperience: number;
  specialties: string[];
  methods: string[];
  personality?: string;
  sessionFormat: SessionFormat;
  locationCity?: string;
  locationState?: string;
  locationAddress?: string;
  priceCents: number;
  credentialDocumentUrl?: string;
}

function parseTags(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  if (value.length > MAX_TAGS) return null;
  const tags: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") return null;
    const tag = item.trim();
    if (!tag || tag.length > 40) return null;
    tags.push(tag);
  }
  return tags;
}

function validate(body: unknown): { data: ApplyPayload } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Corpo inválido." };
  }
  const b = body as Record<string, unknown>;

  const fullName = typeof b.fullName === "string" ? b.fullName.trim() : "";
  if (fullName.length < 3) {
    return { error: "Informe seu nome completo." };
  }

  const email = typeof b.email === "string" ? b.email.trim() : "";
  if (!EMAIL_RE.test(email)) {
    return { error: "Informe um email válido." };
  }

  if (!isProfessionalCategory(b.category)) {
    return { error: "Selecione uma categoria válida." };
  }

  const bio = typeof b.bio === "string" ? b.bio.trim() : "";
  if (bio.length < 20) {
    return { error: "Conte um pouco mais sobre sua experiência (mín. 20 caracteres)." };
  }

  const yearsExperience =
    typeof b.yearsExperience === "number" ? Math.round(b.yearsExperience) : NaN;
  if (!Number.isFinite(yearsExperience) || yearsExperience < 0 || yearsExperience > 60) {
    return { error: "Informe os anos de experiência (0 a 60)." };
  }

  const specialties = parseTags(b.specialties);
  if (!specialties || specialties.length === 0) {
    return { error: "Informe ao menos uma especialidade." };
  }

  const methods = parseTags(b.methods);
  if (!methods) {
    return { error: "Métodos inválidos." };
  }

  const personality =
    typeof b.personality === "string" && b.personality.trim()
      ? b.personality.trim().slice(0, 300)
      : undefined;

  if (!isSessionFormat(b.sessionFormat)) {
    return { error: "Selecione um formato de atendimento válido." };
  }
  const sessionFormat = b.sessionFormat;

  let locationCity: string | undefined;
  let locationState: string | undefined;
  let locationAddress: string | undefined;
  if (sessionFormat !== "online") {
    locationCity = typeof b.locationCity === "string" ? b.locationCity.trim() : "";
    locationState = typeof b.locationState === "string" ? b.locationState.trim() : "";
    if (!locationCity || !locationState) {
      return {
        error: "Informe cidade e estado do ponto de atendimento presencial.",
      };
    }
    locationAddress =
      typeof b.locationAddress === "string" && b.locationAddress.trim()
        ? b.locationAddress.trim()
        : undefined;
  }

  const priceCents =
    typeof b.priceCents === "number" ? Math.round(b.priceCents) : NaN;
  if (!Number.isFinite(priceCents) || priceCents < 0) {
    return { error: "Informe um preço de sessão válido." };
  }

  const credentialDocumentUrl =
    typeof b.credentialDocumentUrl === "string" && b.credentialDocumentUrl.trim()
      ? b.credentialDocumentUrl.trim()
      : undefined;
  if (credentialDocumentUrl && !URL_RE.test(credentialDocumentUrl)) {
    return { error: "O link do documento precisa ser uma URL válida (http/https)." };
  }

  return {
    data: {
      fullName,
      email: email.toLowerCase(),
      category: b.category,
      bio,
      yearsExperience,
      specialties,
      methods,
      personality,
      sessionFormat,
      locationCity,
      locationState,
      locationAddress,
      priceCents,
      credentialDocumentUrl,
    },
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const result = validate(body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.warn(
      "[professionals/apply] Supabase não configurado — candidatura não persistida:",
      result.data
    );
    return NextResponse.json(
      {
        error:
          "Cadastro ainda não está conectado ao banco de dados. Tente novamente em breve.",
      },
      { status: 503 }
    );
  }

  const { data } = result;
  const { data: inserted, error } = await supabase
    .from("professionals")
    .insert({
      full_name: data.fullName,
      email: data.email,
      category: data.category,
      bio: data.bio,
      years_experience: data.yearsExperience,
      specialties: data.specialties,
      methods: data.methods,
      personality: data.personality ?? null,
      session_format: data.sessionFormat,
      location_city: data.locationCity ?? null,
      location_state: data.locationState ?? null,
      location_address: data.locationAddress ?? null,
      price_cents: data.priceCents,
      credential_document_url: data.credentialDocumentUrl ?? null,
    })
    .select("access_token")
    .single();

  if (error || !inserted) {
    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "Já existe uma candidatura com esse email." },
        { status: 409 }
      );
    }
    console.error("[professionals/apply] Supabase insert failed:", error?.message);
    return NextResponse.json(
      { error: "Não foi possível enviar agora. Tente novamente." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, dashboardToken: inserted.access_token });
}
