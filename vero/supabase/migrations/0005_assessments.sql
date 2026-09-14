-- Autoavaliações do cliente (PHQ-9, GAD-7, Roda da Vida — ver
-- src/lib/assessments.ts). Templates ficam no código, não no banco: são
-- conteúdo estático versionado junto com a aplicação.

create table assessment_responses (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  template_slug text not null,
  answers smallint[] not null,
  score smallint not null,
  severity text not null,
  created_at timestamptz not null default now()
);

create index assessment_responses_client_idx on assessment_responses (client_id);

alter table assessment_responses enable row level security;
-- Sem policy pública: só a service role (backend) grava e lê, a partir do
-- access_token do cliente — mesmo padrão de reviews/sessions.
