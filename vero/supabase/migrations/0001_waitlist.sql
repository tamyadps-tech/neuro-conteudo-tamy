-- Lista de espera pré-lançamento (landing page).
create table if not exists waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null check (role in ('cliente', 'profissional')),
  created_at timestamptz not null default now()
);

alter table waitlist_signups enable row level security;

-- Nenhuma policy de leitura/escrita pública: apenas a service role (usada
-- pelo backend em /api/waitlist) pode inserir. Sem acesso via client-side.
