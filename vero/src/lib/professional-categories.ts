export const PROFESSIONAL_CATEGORIES = [
  "terapeuta",
  "psicologo",
  "coach",
  "consultor",
  "mentor",
  "palestrante",
] as const;

export type ProfessionalCategory = (typeof PROFESSIONAL_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ProfessionalCategory, string> = {
  terapeuta: "Terapeuta",
  psicologo: "Psicólogo(a)",
  coach: "Coach",
  consultor: "Consultor(a)",
  mentor: "Mentor(a)",
  palestrante: "Palestrante",
};

export function isProfessionalCategory(
  value: unknown
): value is ProfessionalCategory {
  return (
    typeof value === "string" &&
    (PROFESSIONAL_CATEGORIES as readonly string[]).includes(value)
  );
}
