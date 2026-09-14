# Vero

Marketplace de terapeutas, psicólogos, coaches, consultores, mentores e
palestrantes — com vetting de credenciais, avaliações públicas e progresso
visual sem login. Ver [`BRANDING.md`](./BRANDING.md) para nome, cores e
tom de voz, e [`docs/planning/`](./docs/planning) para o PRD original.

**Estágio atual**: pré-lançamento — o produto está funcionalmente completo
e conectado a serviços reais (Supabase, Resend, Stripe em modo teste), mas
ainda não está publicado em nenhum domínio. A landing page captura
interesse na lista de espera; já existem cadastro/vetting de profissional,
busca/perfil público, agendamento de sessão, prontuário compartilhado,
progresso sem login, autoavaliações (PHQ-9, GAD-7, Roda da Vida),
avaliações públicas, email transacional e cobrança via Stripe — todos com
fallback gracioso: sem alguma chave configurada, essa parte específica
cai pro "modo grátis/sem email" em vez de quebrar.

## Stack

Abordagem **híbrida**, escolhida para manter custo próximo de zero
enquanto o projeto valida demanda:

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4** — código
  próprio para o núcleo do produto (marketplace, perfis, dashboard)
- **Supabase** (Postgres) para dados — schema em [`supabase/migrations`](./supabase/migrations),
  já aplicado no projeto real (organização "tamyadps-tech's Projects" na
  Supabase)
- Serviços prontos só onde é essencial e barato: **Stripe Checkout** para
  pagamento (sem Stripe Connect ainda — o repasse ao profissional é manual)
  e **Resend** para email transacional (camada gratuita, 100/dia)

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em [http://localhost:3000](http://localhost:3000).

Copie `.env.example` para `.env.local` e preencha (ver o arquivo pra
instruções detalhadas de cada uma):

- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — **já configurados e
  testados** no projeto real (peça as credenciais salvas, não estão no
  repo). Sem isso, a lista de espera e o cadastro de profissional
  respondem 503 em vez de gravar.
- `ADMIN_USER` / `ADMIN_PASSWORD` — credenciais de HTTP Basic Auth pra
  acessar `/admin`. **Já configurado** — pedir a senha salva. Proteção
  mínima pra "só vocês dois" — trocar por login de verdade (Supabase Auth)
  antes de dar acesso a mais gente.
- `RESEND_API_KEY` / `RESEND_FROM` — **já configurado** (chave real, ainda
  usando o domínio de teste da Resend — só entrega pro próprio email
  cadastrado lá até verificar um domínio próprio). Sem isso, o app só
  loga um aviso e segue — ninguém recebe email, mas nada quebra.
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` — **já configurados**
  (chaves de **teste**, `sk_test_...`/`pk_test_...`). Sem isso, o
  agendamento continua de graça (não cobra nada).
- `STRIPE_WEBHOOK_SECRET` — **ainda pendente**: precisa de uma URL pública
  (Developers → Webhooks no painel Stripe, apontando pra
  `<seu-domínio>/api/stripe/webhook`) — só dá pra configurar depois do
  deploy.

As contas (Supabase, Resend, Stripe) foram criadas por vocês — eu não
crio contas de terceiros. O código já está plugado e testado (o Supabase
foi validado com insert/delete reais via MCP); só falta publicar em
algum lugar pra testar o fluxo completo clicando no site.

## Testes

```bash
npm run test       # unitários (Vitest + Testing Library)
npm run test:watch # unitários em watch mode
npm run test:e2e   # smoke test end-to-end (Playwright)
npm run build      # build de produção + checagem de tipos
```

## Estrutura

```
src/
  app/
    (landing, /termos, /privacidade)
    profissionais/            # busca (/profissionais) e perfil público (/profissionais/[id])
                              # com o widget de agendamento
    profissionais/cadastro/   # formulário público de candidatura
    admin/                    # visão geral (BI), fila de vetting,
                              # detalhe do profissional (referência/suporte),
                              # assinaturas (placeholder)
    c/[token]/                # progresso do cliente, sem login (link único)
    p/[token]/                 # painel do profissional, sem login (link único):
                              # agenda, prontuário, CRM de clientes,
                              # financeiro e divulgação (link do perfil público)
    api/
      waitlist/                    # POST lista de espera
      professionals/apply/         # POST candidatura de profissional
      sessions/book/                # POST agendar sessão
      admin/professionals/[id]/     # PATCH aprovar/rejeitar
      admin/.../availability/       # POST/DELETE horários (protegido pelo proxy)
      admin/sessions/[id]/          # PATCH tópicos/tarefa/status da sessão
      professional/availability/    # POST/DELETE horários (auth por token, sem senha)
      professional/sessions/[id]/   # PATCH tópicos/tarefa/status (auth por token)
      reviews/                      # POST avaliação (rating + comentário)
      assessments/submit/           # POST autoavaliação (PHQ-9, GAD-7, Roda da Vida)
      stripe/webhook/               # confirma pagamento (checkout.session.completed)
  components/       # UI da landing page + admin/ (painel) + professional/
                     # (painel do profissional)
  lib/              # markdown renderer, cliente Supabase (server-only),
                     # métricas de BI, categorias/formatos compartilhados,
                     # cálculo de horários disponíveis (availability.ts,
                     # puro e testado isoladamente), email.ts (Resend),
                     # email-templates.ts, stripe.ts, assessments.ts
                     # (PHQ-9/GAD-7/Roda da Vida, scoring puro e testado),
                     # professional-auth.ts (resolve token -> profissional,
                     # nunca confia em id vindo do corpo da requisição),
                     # professional-clients.ts (CRM), professional-finance.ts
  proxy.ts          # HTTP Basic Auth em /admin e /api/admin (Next 16 "proxy")
docs/
  legal/          # Termo de Uso e Política de Privacidade (fonte .md)
  email-templates/ # template original (referência) — o de verdade que o
                    # app usa é src/lib/email-templates.ts
  planning/       # PRD original (sumário executivo, resumo do projeto)
supabase/
  migrations/     # schema SQL: waitlist + entidades do marketplace + pagamentos
                  # + autoavaliações + access_token do profissional — já
                  # aplicado no projeto real
e2e/              # testes Playwright
```

## O que já dá pra fazer

- Visitante entra na lista de espera (cliente ou profissional)
- Profissional se candidata em `/profissionais/cadastro`, informando
  categoria, anos de experiência, especialidades, métodos/abordagens,
  estilo de atendimento e formato (online/presencial/híbrido, com
  cidade/estado quando há ponto físico)
- Vocês dois revisam candidaturas em `/admin/profissionais` e
  aprovam/rejeitam
- `/admin` mostra métricas (lista de espera, profissionais por status e
  categoria, sessões, receita) — a base do painel de BI. Assinaturas
  (planos SaaS mensais) fica como placeholder, é diferente da comissão por
  sessão que já funciona
- Cliente busca profissionais aprovados em `/profissionais` (filtro por
  categoria, formato, texto) e vê o perfil público em `/profissionais/[id]`
- Ao ser aprovado, o profissional recebe por email um link pessoal
  `/p/[token]` — sem login — onde administra o próprio negócio na Vero:
  cadastra a disponibilidade semanal recorrente, registra o prontuário de
  cada sessão (tópicos, tarefa, próxima sessão), vê a lista dos próprios
  clientes com histórico e valor pago (CRM básico), acompanha o financeiro
  (recebido/pendente por sessão) e tem o link do próprio perfil público
  pronto pra divulgar. Cliente escolhe um horário no perfil público,
  preenche nome/email e agenda; o servidor sempre recalcula a
  disponibilidade de verdade antes de confirmar, pra evitar duplo
  agendamento
- O admin também vê disponibilidade e prontuário em
  `/admin/profissionais/[id]` (referência/suporte da equipe — o
  profissional aprovado já gerencia isso pelo próprio painel)
- Ao agendar, o cliente recebe na tela (e por email, se o Resend estiver
  configurado) um link pessoal `/c/[token]` — sem login — onde vê a
  próxima sessão e o histórico com tópicos/tarefas de cada sessão passada
- Nesse mesmo link, depois de uma sessão concluída, o cliente avalia (nota
  1–5 + comentário opcional). A avaliação aparece pública e anônima no
  perfil do profissional e como resumo (média + contagem) na busca —
  "Novo na Vero" honestamente quando ainda não há avaliações
- Se o profissional tiver preço > 0 e o Stripe estiver configurado, o
  cliente paga no Checkout hospedado pela Stripe antes de a sessão ser
  confirmada; o email de confirmação sai só depois do pagamento (via
  webhook). Sem Stripe configurado, a sessão fica marcada na hora, de
  graça — nada trava por falta da chave
- Quando o admin marca uma sessão como concluída (com tópicos/tarefa
  preenchidos), o cliente recebe o resumo por email automaticamente
- No link de progresso, o cliente também pode fazer autoavaliações
  (PHQ-9, GAD-7, Roda da Vida) quando quiser, e ver o histórico de scores
  ao longo do tempo — só instrumentos de domínio público ou de autoria
  própria por enquanto, os demais do PRD original (DASS-21, Rosenberg
  etc.) ficam de fora até verificar licenciamento

Tudo isso funciona sem quebrar mesmo sem alguma das chaves configurada:
as rotas respondem 503 ou seguem em modo grátis/sem email, nunca com erro.
Hoje (com Supabase, Resend e Stripe configurados) só falta mesmo o
`STRIPE_WEBHOOK_SECRET` e o deploy.

## Próximos passos

1. **Deploy**: publicar num host real (Vercel é o mais natural pro
   Next.js, tem tier gratuito) com as mesmas variáveis de ambiente do
   `.env.local`. Só depois disso dá pra testar o fluxo inteiro clicando
   no site (agendar → pagar → receber email) e configurar o
   `STRIPE_WEBHOOK_SECRET`.
2. **Revisão jurídica**: os documentos em `docs/legal/` têm campos
   `[a definir]` (razão social, CNPJ, telefone) e precisam de revisão por
   advogado especializado em LGPD antes de publicar de verdade.
3. **Login de verdade no admin**: trocar o Basic Auth por Supabase Auth
   assim que mais de vocês dois precisar de acesso.
4. Repasse aos profissionais ainda é manual (a Vero recebe 100% via Stripe,
   sem Stripe Connect); automatizar isso é um passo futuro, não deste MVP.
5. Lembrete de sessão 24h antes precisa de um agendador (cron) — só faz
   sentido configurar depois que o app estiver de fato no ar.
6. Domínio de email verificado na Resend (hoje usa o domínio de teste
   deles, que só entrega pro próprio email cadastrado lá).
7. Mais autoavaliações (DASS-21, Rosenberg, etc.) — verificar licenciamento
   antes de adicionar.
