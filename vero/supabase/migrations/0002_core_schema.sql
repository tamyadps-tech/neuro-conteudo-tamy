-- Núcleo do marketplace Vero: profissionais, clientes, sessões e avaliações.
-- Desenhado a partir do PRD (RESUMO_EXECUTIVO_PROJETO). Ainda não aplicado a
-- um projeto Supabase real — aplicar com `supabase db push` quando o projeto
-- de produção for criado.

create extension if not exists pgcrypto;

create type professional_category as enum (
  'terapeuta',
  'psicologo',
  'coach',
  'consultor',
  'mentor',
  'palestrante'
);

create type vetting_status as enum ('pendente', 'aprovado', 'rejeitado');

create table professionals (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  category professional_category not null,
  bio text,
  price_cents integer not null check (price_cents >= 0),
  vetting_status vetting_status not null default 'pendente',
  vetting_notes text,
  credential_document_url text,
  created_at timestamptz not null default now()
);

-- Clientes não têm senha: acessam o próprio progresso por link único
-- (client_access_token), enviado por email após cada sessão.
create table clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  access_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create type session_status as enum (
  'agendada',
  'concluida',
  'cancelada_cliente',
  'cancelada_profissional'
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  scheduled_at timestamptz not null,
  status session_status not null default 'agendada',
  topics text[],
  homework text,
  next_session_at timestamptz,
  created_at timestamptz not null default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  professional_id uuid not null references professionals(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (session_id)
);

create index sessions_professional_idx on sessions (professional_id);
create index sessions_client_idx on sessions (client_id);
create index reviews_professional_idx on reviews (professional_id);

alter table professionals enable row level security;
alter table clients enable row level security;
alter table sessions enable row level security;
alter table reviews enable row level security;

-- Perfis aprovados são públicos para leitura (marketplace); o resto passa
-- pela service role no backend. Refinar policies quando o app de
-- profissional/cliente existir.
create policy "Perfis aprovados são públicos"
  on professionals for select
  using (vetting_status = 'aprovado');

create policy "Avaliações são públicas"
  on reviews for select
  using (true);
