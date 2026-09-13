import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProfessionalFilters } from "@/components/ProfessionalFilters";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { listApprovedProfessionals } from "@/lib/public-professionals";
import { isProfessionalCategory } from "@/lib/professional-categories";
import { isSessionFormat } from "@/lib/session-format";
import { getReviewSummaries, type ReviewSummary } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "Encontre um profissional — Vero",
  description:
    "Busque terapeutas, psicólogos, coaches e consultores aprovados pela Vero.",
};

export default async function ProfissionaisPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : undefined;
  const format = typeof params.format === "string" ? params.format : undefined;
  const q = typeof params.q === "string" ? params.q : undefined;

  const professionals = await listApprovedProfessionals({
    category: isProfessionalCategory(category) ? category : undefined,
    sessionFormat: isSessionFormat(format) ? format : undefined,
    q,
  });

  const ratings = professionals
    ? await getReviewSummaries(professionals.map((p) => p.id))
    : null;
  const emptyRating: ReviewSummary = { average: 0, count: 0 };

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-16">
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Encontre um profissional
          </h1>
          <p className="mt-2 text-ink-soft">
            Todos aprovados por vetting de credenciais.
          </p>

          <div className="mt-8">
            <ProfessionalFilters />
          </div>

          {professionals === null ? (
            <div className="mt-10 rounded-2xl border border-dashed border-border bg-paper-alt/40 p-8 text-center">
              <p className="font-medium text-ink">
                Ainda não temos profissionais aprovados no ar.
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                Estamos na fase de cadastro e vetting. Deixe seu email na{" "}
                <Link href="/#lista-espera-cliente" className="text-primary hover:underline">
                  lista de espera
                </Link>{" "}
                pra saber quando abrirmos.
              </p>
            </div>
          ) : professionals.length === 0 ? (
            <p className="mt-10 text-center text-sm text-ink-soft">
              Nenhum profissional encontrado com esses filtros.
            </p>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {professionals.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                  rating={ratings?.[professional.id] ?? emptyRating}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
