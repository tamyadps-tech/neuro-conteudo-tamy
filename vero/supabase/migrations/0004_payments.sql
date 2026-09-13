-- Pagamentos via Stripe Checkout. Ainda não aplicado a um projeto real.
--
-- Modelo simples pra essa fase: o dinheiro entra na conta Stripe da
-- Operadora (não Stripe Connect), e o repasse ao profissional (comissão
-- descontada) é manual, como descrito no Termo de Uso. Automatizar o
-- repasse via Stripe Connect é um passo futuro, não deste MVP.

create type payment_status as enum ('pendente', 'pago', 'falhou', 'reembolsado');

create table payments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references sessions(id) on delete cascade,
  stripe_checkout_session_id text not null unique,
  amount_cents integer not null check (amount_cents >= 0),
  status payment_status not null default 'pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payments_session_idx on payments (session_id);
create index payments_checkout_session_idx on payments (stripe_checkout_session_id);

alter table payments enable row level security;
-- Sem policy de leitura pública: só a service role (backend + webhook) acessa.
