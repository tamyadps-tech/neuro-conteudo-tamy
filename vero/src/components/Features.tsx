const features = [
  {
    title: "Vetting de verdade",
    description:
      "Cada profissional passa por verificação de credenciais (CRP, certificações, diplomas) antes de entrar na Vero. Só aprova quem comprova.",
    icon: (
      <path d="M9 12.5l2 2 4-4.5M12 3l7 3v5c0 4.5-2.9 8.3-7 9.9-4.1-1.6-7-5.4-7-9.9V6l7-3z" />
    ),
  },
  {
    title: "Avaliações públicas",
    description:
      "Só quem realizou sessão pode avaliar. Rating e comentários ficam visíveis no perfil — prova social real, sem espaço para fraude.",
    icon: (
      <path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6z" />
    ),
  },
  {
    title: "Progresso visual, sem login",
    description:
      "Depois de cada sessão, o cliente recebe um resumo por email e acessa seu progresso por um link único — sem senha, sem fricção.",
    icon: (
      <path d="M4 19V5m0 14h16M8 15l3-4 3 3 4-6" />
    ),
  },
];

export function Features() {
  return (
    <section id="confianca" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          Confiança do primeiro clique à última sessão
        </h2>
        <p className="mt-4 text-ink-soft">
          Três pilares resolvem o que mais trava marketplaces de saúde e
          bem-estar: confiança, engajamento e retenção.
        </p>
      </div>
      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-border bg-paper-alt/50 p-6"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {feature.icon}
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-ink">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
