import { AdminNav } from "@/components/admin/AdminNav";
import { ProfessionalRow } from "@/components/admin/ProfessionalRow";
import { listProfessionals } from "@/lib/admin-professionals";

export default async function AdminProfessionalsPage() {
  const professionals = await listProfessionals();

  const pending = professionals?.filter((p) => p.vetting_status === "pendente") ?? [];
  const rest = professionals?.filter((p) => p.vetting_status !== "pendente") ?? [];

  return (
    <>
      <AdminNav active="/admin/profissionais" />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Profissionais
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Revise credenciais e aprove ou rejeite candidaturas.
        </p>

        {professionals === null ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-paper-alt/40 p-8 text-center">
            <p className="font-medium text-ink">
              Supabase ainda não está configurado.
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Defina <code>SUPABASE_URL</code> e{" "}
              <code>SUPABASE_SERVICE_ROLE_KEY</code> para ver candidaturas
              aqui.
            </p>
          </div>
        ) : professionals.length === 0 ? (
          <p className="mt-8 text-sm text-ink-soft">
            Nenhuma candidatura ainda.
          </p>
        ) : (
          <>
            {pending.length > 0 && (
              <section className="mt-8">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
                  Pendentes ({pending.length})
                </h2>
                <div className="mt-3 space-y-3">
                  {pending.map((professional) => (
                    <ProfessionalRow key={professional.id} professional={professional} />
                  ))}
                </div>
              </section>
            )}

            {rest.length > 0 && (
              <section className="mt-10">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
                  Histórico
                </h2>
                <div className="mt-3 space-y-3">
                  {rest.map((professional) => (
                    <ProfessionalRow key={professional.id} professional={professional} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
}
