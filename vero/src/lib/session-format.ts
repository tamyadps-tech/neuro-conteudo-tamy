export const SESSION_FORMATS = ["online", "presencial", "hibrido"] as const;

export type SessionFormat = (typeof SESSION_FORMATS)[number];

export const SESSION_FORMAT_LABELS: Record<SessionFormat, string> = {
  online: "Online",
  presencial: "Presencial",
  hibrido: "Online e presencial",
};

export function isSessionFormat(value: unknown): value is SessionFormat {
  return (
    typeof value === "string" &&
    (SESSION_FORMATS as readonly string[]).includes(value)
  );
}
