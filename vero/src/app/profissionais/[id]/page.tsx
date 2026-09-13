import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CATEGORY_LABELS } from "@/lib/professional-categories";
import { SESSION_FORMAT_LABELS } from "@/lib/session-format";
import { getApprovedProfessional } from "@/lib/public-professionals";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lookup = await getApprovedProfessional(id);
  if (!lookup.configured || !lookup.professional) {
    return { title: "Profissional — Vero" };
  }
  return { title: `${lookup.professional.full_name} — Vero` };
}

export default async function ProfessionalProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lookup = await getApprovedProfessional(id);

  if (!lookup.configured) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-2xl px-6 py-20 text-center">
            <p className="font-medium text-ink">
              Ainda não temos profissionais aprovados no ar.
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Estamos na fase de cadastro e vetting.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!lookup.professional) {
    notFound();
  }

  const professional = lookup.professional;

  return (
    <>
      <Header />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-paper-alt px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink-soft">
            {CATEGORY_LABELS[professional.category]}
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {professional.full_name}
          </h1>
          <p className="mt-2 text-ink-soft">
            {professional.years_experience} anos de experiência ·{" "}
            {SESSION_FORMAT_LABELS[professional.session_format]}
            {professional.location_city &&
              ` · ${professional.location_city}/${professional.location_state}`}
          </p>

          {professional.personality && (
            <p className="mt-4 text-lg italic text-ink-soft">
              &ldquo;{professional.personality}&rdquo;
            </p>
          )}

          <div className="mt-8 rounded-2xl border border-border bg-paper-alt/40 p-6 sm:p-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Sobre
            </h2>
            <p className="mt-2 leading-relaxed text-ink">{professional.bio}</p>

            {professional.specialties.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
                  Especialidades
                </h2>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {professional.specialties.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs text-primary-dark"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {professional.methods.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
                  Métodos e abordagens
                </h2>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {professional.methods.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-accent-light px-2.5 py-0.5 text-xs text-accent-dark"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-paper p-6">
            <div>
              <p className="text-sm text-ink-soft">Sessão individual</p>
              <p className="text-2xl font-semibold text-ink">
                {formatPrice(professional.price_cents)}
              </p>
            </div>
            <span className="rounded-full bg-paper-alt px-4 py-2 text-sm font-medium text-ink-soft">
              Agendamento chega em breve
            </span>
          </div>

          <p className="mt-4 text-center text-xs text-ink-soft">
            Ainda não temos avaliações públicas — elas aparecem aqui depois
            das primeiras sessões.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
