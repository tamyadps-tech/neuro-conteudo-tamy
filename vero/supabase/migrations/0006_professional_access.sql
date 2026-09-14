-- Acesso do profissional ao próprio dashboard, sem senha — mesmo padrão já
-- usado pro cliente (access_token em clients). Sem isso, disponibilidade e
-- prontuário só podiam ser geridos pelo admin.

alter table professionals
  add column access_token uuid not null default gen_random_uuid();

alter table professionals
  add constraint professionals_access_token_key unique (access_token);
