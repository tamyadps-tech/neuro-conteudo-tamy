-- Disponibilidade recorrente e duração de sessão.
-- Ainda não aplicado a um projeto Supabase real (ver README).
--
-- Sem login de profissional ainda, quem cadastra a disponibilidade é o
-- admin (vocês), em /admin/profissionais/[id]. Quando existir dashboard de
-- profissional, ele passa a gerenciar a própria agenda.

alter table sessions
  add column duration_minutes smallint not null default 50
    check (duration_minutes > 0);

create table availability_slots (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6), -- 0 = domingo
  start_time time not null,
  created_at timestamptz not null default now(),
  unique (professional_id, weekday, start_time)
);

create index availability_slots_professional_idx
  on availability_slots (professional_id);

alter table availability_slots enable row level security;

create policy "Horários de profissionais aprovados são públicos"
  on availability_slots for select
  using (
    exists (
      select 1 from professionals p
      where p.id = availability_slots.professional_id
        and p.vetting_status = 'aprovado'
    )
  );
