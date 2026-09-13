# Vero

Marketplace de terapeutas, psicólogos, coaches, consultores, mentores e
palestrantes — com vetting de credenciais, avaliações públicas e progresso
visual sem login. Ver [`BRANDING.md`](./BRANDING.md) para nome, cores e
tom de voz, e [`docs/planning/`](./docs/planning) para o PRD original.

**Estágio atual**: pré-lançamento, ainda não está no ar. A landing page
captura interesse na lista de espera; já existem cadastro/vetting de
profissional, busca/perfil público, agendamento de sessão, prontuário
compartilhado, progresso sem login, avaliações públicas, email
transacional e cobrança via Stripe — todos com fallback gracioso: sem as
chaves configuradas, o app funciona igual, só no "modo grátis/sem email".

## Stack

Abordagem **híbrida**, escolhida para manter custo próximo de zero
enquanto o projeto valida demanda:

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4** — código
  próprio para o núcleo do produto (marketplace, perfis, dashboard)
- **Supabase** (Postgres) para dados — schema em [`supabase/migrations`](./supabase/migrations),
  ainda não aplicado a um projeto real (ver "Próximos passos")
- Serviços prontos só onde é essencial e barato: **Stripe Checkout** para
  pagamento (sem Stripe Connect ainda — o repasse ao profissional é manual)
  e **Resend** para email transacional (camada gratuita, 100/dia)

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em [http://localhost:3000](http://localhost:3000).

Copie `.env.example` para `.env.local` e preencha:

- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — de um projeto Supabase com
  as migrations de `supabase/migrations/` aplicadas. Sem isso, a lista de
  espera e o cadastro de profissional respondem 503 em vez de gravar.
- `ADMIN_USER` / `ADMIN_PASSWORD` — credenciais de HTTP Basic Auth pra
  acessar `/admin` (visão geral, fila de vetting). Sem isso, `/admin`
  responde 503. É proteção mínima pra "só vocês dois" — trocar por login de
  verdade (Supabase Auth) antes de dar acesso a mais gente.
- `RESEND_API_KEY` / `RESEND_FROM` — pra emails de confirmação e resumo de
  sessão saírem de verdade. Sem isso, o app só loga um aviso e segue —
  ninguém recebe email, mas nada quebra. Conta grátis em
  [resend.com](https://resend.com).
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — pra cobrar a sessão via
  Stripe Checkout. Sem isso, o agendamento continua de graça (não cobra
  nada). Conta grátis em [stripe.com](https://stripe.com) — comece com as
  chaves de **teste** (`sk_test_...`); ver comentários no `.env.example`
  para o passo a passo do webhook.

Nenhuma dessas contas (Supabase, Resend, Stripe) é algo que eu crie por
vocês — precisam ser criadas por vocês mesmos, com os dados reais do
negócio. O código já está pronto pra usar assim que as chaves existirem.

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
                              # detalhe do profissional (disponibilidade +
                              # prontuário das sessões), assinaturas (placeholder)
    c/[token]/                # progresso do cliente, sem login (link único)
    api/
      waitlist/                    # POST lista de espera
      professionals/apply/         # POST candidatura de profissional
      sessions/book/                # POST agendar sessão
      admin/professionals/[id]/     # PATCH aprovar/rejeitar
      admin/.../availability/       # POST/DELETE horários (protegido pelo proxy)
      admin/sessions/[id]/          # PATCH tópicos/tarefa/status da sessão
      reviews/                      # POST avaliação (rating + comentário)
      stripe/webhook/               # confirma pagamento (checkout.session.completed)
  components/       # UI da landing page + admin/ (painel)
  lib/              # markdown renderer, cliente Supabase (server-only),
                     # métricas de BI, categorias/formatos compartilhados,
                     # cálculo de horários disponíveis (availability.ts,
                     # puro e testado isoladamente), email.ts (Resend),
                     # email-templates.ts, stripe.ts
  proxy.ts          # HTTP Basic Auth em /admin e /api/admin (Next 16 "proxy")
docs/
  legal/          # Termo de Uso e Política de Privacidade (fonte .md)
  email-templates/ # template original (referência) — o de verdade que o
                    # app usa é src/lib/email-templates.ts
  planning/       # PRD original (sumário executivo, resumo do projeto)
supabase/
  migrations/     # schema SQL: waitlist + entidades do marketplace + pagamentos
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
- Vocês cadastram a disponibilidade semanal recorrente de cada profissional
  em `/admin/profissionais/[id]` (sem dashboard de profissional ainda);
  cliente escolhe um horário no perfil público, preenche nome/email e
  agenda. O servidor sempre recalcula a disponibilidade de verdade antes de
  confirmar, pra evitar duplo agendamento
- Depois da sessão, vocês registram tópicos abordados, tarefa e próxima
  sessão em `/admin/profissionais/[id]` (o "prontuário" — sem dashboard de
  profissional ainda, é manual)
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

Tudo isso funciona sem quebrar mesmo sem Supabase/Resend/Stripe
configurados: as rotas respondem 503 ou seguem em modo grátis/sem email,
nunca com erro.

## Próximos passos

1. **Revisão jurídica**: os documentos em `docs/legal/` têm campos
   `[a definir]` (razão social, CNPJ, telefone) e precisam de revisão por
   advogado especializado em LGPD antes de publicar de verdade.
2. **Provisionar Supabase**: criar o projeto real e aplicar as migrations
   em `supabase/migrations/` (isso tem passo de aprovação separado, por
   envolver criar um recurso de conta — perguntar antes de criar).
3. **Login de verdade no admin**: trocar o Basic Auth por Supabase Auth
   assim que mais de vocês dois precisar de acesso.
4. **Domínio e deploy**: registrar domínio e colocar no ar — combinado que
   isso só acontece depois que o produto estiver mais construído.
5. **Ativar Resend e Stripe**: criar as contas (gratuitas para começar) e
   preencher as chaves no `.env.local`/nas variáveis de ambiente do deploy
   — ver `.env.example`. Sem isso o app funciona, só não manda email nem
   cobra.
6. Repasse aos profissionais ainda é manual (a Vero recebe 100% via Stripe,
   sem Stripe Connect); automatizar isso é um passo futuro, não deste MVP.
7. Lembrete de sessão 24h antes precisa de um agendador (cron) — só faz
   sentido configurar depois que o app estiver de fato no ar.
8. Com Resend e Stripe ativados, o MVP descrito no PRD original está
   essencialmente completo.
