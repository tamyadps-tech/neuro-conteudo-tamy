# Vero

Marketplace de terapeutas, psicólogos, coaches, consultores, mentores e
palestrantes — com vetting de credenciais, avaliações públicas e progresso
visual sem login. Ver [`BRANDING.md`](./BRANDING.md) para nome, cores e
tom de voz, e [`docs/planning/`](./docs/planning) para o PRD original.

**Estágio atual**: pré-lançamento, ainda não está no ar. A landing page
captura interesse na lista de espera; já existem cadastro/vetting de
profissional, busca/perfil público, agendamento de sessão, prontuário
compartilhado, progresso sem login e avaliações públicas. Falta email
automático e pagamento.

## Stack

Abordagem **híbrida**, escolhida para manter custo próximo de zero
enquanto o projeto valida demanda:

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4** — código
  próprio para o núcleo do produto (marketplace, perfis, dashboard)
- **Supabase** (Postgres) para dados — schema em [`supabase/migrations`](./supabase/migrations),
  ainda não aplicado a um projeto real (ver "Próximos passos")
- Serviços prontos só onde é essencial e barato: Stripe para pagamento e um
  provedor de email transacional, quando essas features forem construídas

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
  components/       # UI da landing page + admin/ (painel)
  lib/              # markdown renderer, cliente Supabase (server-only),
                     # métricas de BI, categorias/formatos compartilhados,
                     # cálculo de horários disponíveis (availability.ts,
                     # puro e testado isoladamente)
  proxy.ts          # HTTP Basic Auth em /admin e /api/admin (Next 16 "proxy")
docs/
  legal/          # Termo de Uso e Política de Privacidade (fonte .md)
  email-templates/ # template de resumo de sessão com a marca Vero
  planning/       # PRD original (sumário executivo, resumo do projeto)
supabase/
  migrations/     # schema SQL: waitlist + entidades do marketplace
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
  categoria) — a base do painel de BI. Assinaturas fica como placeholder
  até existir cobrança (Stripe)
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
- Ao agendar, o cliente recebe na tela (ainda sem email automático) um link
  pessoal `/c/[token]` — sem login — onde vê a próxima sessão e o histórico
  com tópicos/tarefas de cada sessão passada
- Nesse mesmo link, depois de uma sessão concluída, o cliente avalia (nota
  1–5 + comentário opcional). A avaliação aparece pública e anônima no
  perfil do profissional e como resumo (média + contagem) na busca —
  "Novo na Vero" honestamente quando ainda não há avaliações

Tudo isso funciona sem quebrar mesmo sem Supabase configurado: as rotas
respondem 503 com uma mensagem clara em vez de dar erro.

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
5. Continuar o marketplace: email automático de confirmação/lembrete/resumo
   de sessão (template já pronto em `docs/email-templates/`, falta o envio
   de verdade) e cobrança (Stripe) — isso também destrava a seção
   "Assinaturas" do admin. Depois disso, o MVP descrito no PRD original
   está essencialmente completo.
