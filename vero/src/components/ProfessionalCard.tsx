import Link from "next/link";
import { CATEGORY_LABELS } from "@/lib/professional-categories";
import { SESSION_FORMAT_LABELS } from "@/lib/session-format";
import type { PublicProfessional } from "@/lib/public-professionals";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function ProfessionalCard({
  professional,
}: {
  professional: PublicProfessional;
}) {
  return (
    <Link
      href={`/profissionais/${professional.id}`}
      className="block rounded-2xl border border-border bg-paper p-6 transition hover:border-primary"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-ink">{professional.full_name}</h3>
          <p className="text-sm text-ink-soft">
            {CATEGORY_LABELS[professional.category]} ·{" "}
            {professional.years_experience} anos de experiência
          </p>
        </div>
        <span className="whitespace-nowrap text-sm font-semibold text-primary">
          {formatPrice(professional.price_cents)}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-soft">
        {professional.bio}
      </p>

      {professional.specialties.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {professional.specialties.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs text-primary-dark"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-ink-soft">
        {SESSION_FORMAT_LABELS[professional.session_format]}
        {professional.location_city &&
          ` · ${professional.location_city}/${professional.location_state}`}
      </p>
    </Link>
  );
}
