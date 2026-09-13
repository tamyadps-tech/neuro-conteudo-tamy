import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { AvailabilityManager } from "@/components/admin/AvailabilityManager";
import { CATEGORY_LABELS } from "@/lib/professional-categories";
import { SESSION_FORMAT_LABELS } from "@/lib/session-format";
import { getProfessional } from "@/lib/admin-professionals";
import { listAvailabilitySlots } from "@/lib/booking";

export default async function AdminProfessionalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lookup = await getProfessional(id);

  if (!lookup.configured) {
    return (
      <>
        <AdminNav active="/admin/profissionais" />
        <main className="mx-auto max-w-3xl px-6 py-10">
          <p className="font-medium text-ink">Supabase ainda não está configurado.</p>
        </main>
      </>
    );
  }

  if (!lookup.professional) {
    notFound();
  }

  const professional = lookup.professional;
  const slots = await listAvailabilitySlots(id);

  return (
    <>
      <AdminNav active="/admin/profissionais" />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {professional.full_name}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          {CATEGORY_LABELS[professional.category]} · {professional.email} ·{" "}
          {SESSION_FORMAT_LABELS[professional.session_format]}
        </p>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Disponibilidade semanal
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Sem dashboard de profissional ainda, quem cadastra os horários é
            a equipe. Cada horário se repete toda semana até ser removido.
          </p>
          <div className="mt-4 rounded-2xl border border-border bg-paper-alt/40 p-5">
            {slots === null ? (
              <p className="text-sm text-ink-soft">
                Supabase ainda não está configurado.
              </p>
            ) : (
              <AvailabilityManager professionalId={id} slots={slots} />
            )}
          </div>
        </section>
      </main>
    </>
  );
}
