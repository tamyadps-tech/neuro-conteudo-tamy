import { WaitlistForm } from "./WaitlistForm";

const perks = [
  "Agenda, prontuário e cobrança num só lugar",
  "Perfil público com avaliações reais de clientes",
  "Resumo de sessão automático — você não escreve o email",
  "Comissão simples por sessão, sem mensalidade no início",
];

export function ForProfessionals() {
  return (
    <section id="para-profissionais" className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-10 rounded-3xl border border-border bg-paper-alt/50 p-8 sm:grid-cols-2 sm:p-12">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Para profissionais
          </h2>
          <p className="mt-4 text-ink-soft">
            Menos ferramentas soltas, mais tempo com quem importa: seus
            clientes.
          </p>
          <ul className="mt-6 space-y-3">
            {perks.map((perk) => (
              <li
                key={perk}
                className="flex items-start gap-3 text-sm text-ink"
              >
                <svg
                  viewBox="0 0 20 20"
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary"
                  fill="currentColor"
                >
                  <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.6 3.6 6.7-6.7a1 1 0 011.4 0z" />
                </svg>
                {perk}
              </li>
            ))}
          </ul>
        </div>
        <div id="lista-espera-profissional" className="flex flex-col justify-center">
          <p className="mb-3 text-sm font-medium text-ink">
            Cadastre seu interesse no beta:
          </p>
          <WaitlistForm defaultRole="profissional" />
        </div>
      </div>
    </section>
  );
}
