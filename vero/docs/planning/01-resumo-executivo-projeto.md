# 📋 RESUMO EXECUTIVO - PLATAFORMA AGENCIADORA

## **Visão Geral**

Marketplace + SaaS que conecta **profissionais de saúde e bem-estar** (terapeutas, psicólogos, coaches, consultores, mentores, palestrantes) com **clientes**, oferecendo agenda, prontuário compartilhado, testes de avaliação, e rastreamento de progresso.

**Modelo de Receita**: Comissão por sessão (20-25%) + SaaS opcional + Testes premium + Certificação

---

## 🎯 PROBLEMA & OPORTUNIDADE

### Problema
- Profissionais usam 5-6 ferramentas separadas (Calendly, Stripe, Gmail, Notion, WhatsApp, Excel)
- Clientes não veem progresso = baixo engagement = alto churn
- Sem marketplace = profissional precisa atrair cliente sozinho
- Sem validação = cliente não confia (charlatões competem com profissionais reais)

### Oportunidade
- TAM Brasil: ~R$50B (terapeutas, coaches, consultores, palestrantes)
- Benchmarks: BetterHelp ($2B), Preply ($1B), iClinic (~$100M)
- Lacuna: Ninguém faz Marketplace + Ficha + Testes + Progresso Visual integrado
- First-mover advantage no Brasil

---

## 🏗️ ARQUITETURA FASE 1 MVP (4-5 meses)

### **Tech Stack (Frankensteined - Validação Rápida)**

```
Frontend:
├─ Webflow (marketplace, landing pages, dashboard básico)

Backend/Integrações:
├─ Calendly (agenda + booking)
├─ Stripe (pagamento)
├─ Zapier (automação entre ferramentas)
├─ Notion (prontuário + CRM)
├─ RD Station (email marketing)
├─ Twilio (WhatsApp automático)

Cliente:
├─ Sem login (acessa via link único por email)
├─ Dashboard view-only (progresso, tarefas)
├─ Email com resumo de sessão

Profissional:
├─ Webflow (perfil, cadastro)
├─ Calendly (agenda)
├─ Notion (ficha do cliente)
├─ Dashboard básico (Webflow)

Você (Admin):
├─ Airtable (base dados profissionais, avaliações)
├─ Google Sheets (financeiro, métricas)
├─ Typeform (coleta avaliações)
```

### **Custo MVP**: R$500-700/mês (Webflow + Calendly + Stripe + Zapier + RD + Twilio)

---

## 🎯 3 FEATURES PRINCIPAIS

### 1️⃣ **AVALIAÇÃO + RATING (Prova Social)**

```
Dinâmica:
├─ Depois da sessão, cliente recebe email
├─ "Como foi? Rate 1-5 + comentário" (Typeform)
├─ Rating aparece no perfil profissional
├─ Média: 4.8⭐ (50 avaliações)
├─ Profissional com mais reviews fica em destaque

Impacto:
├─ Taxa conversão +3-4x
├─ Churn -30%
└─ Receita +2.5x (mesmo cliente, mais engagement)

Implementação MVP:
├─ Typeform: Formulário avaliação (1 dia)
├─ Airtable: Base de dados avaliações (1 dia)
├─ Webflow: Display no perfil (manual, 2 dias)
└─ Total: 3 dias, você faz
```

### 2️⃣ **VETTING + VALIDAÇÃO (Confiança)**

```
Processo:
├─ Profissional se cadastra
├─ Envia diploma/CRP/Certificação (email ou formulário)
├─ Você faz vetting manual:
│  ├─ Checa CRP no site CFP.org.br (5 min)
│  ├─ Valida diploma/certificação
│  └─ Aprova ou Rejeita
├─ Profissional entra no marketplace SÓ se aprovado

Critério Aprovação:
├─ Terapeutas/Psicólogos: CRP ativo (90% aprovação)
├─ Coaches: Certificação reconhecida (70% aprovação)
├─ Consultores: Diploma + referências (60% aprovação)
├─ Mentores: Track record + referências (50% aprovação)
├─ Palestrantes: Vídeo palestra anterior (40% aprovação)

Impacto:
├─ Confiança cliente +40%
├─ Taxa conversão +15-20%
├─ Churn profissional ruim é eliminado
└─ Receita +20-30%

Implementação MVP:
├─ Email/Formulário: Coleta credenciais (1 dia)
├─ Google Drive: Você salva documentos (organizado)
├─ Airtable: Status (Pendente/Aprovado/Rejeitado) (1 dia)
├─ Email automático: "Você foi aprovado!" (Zapier, 1 dia)
└─ Total: 3 dias, você faz
```

### 3️⃣ **EMAIL SEM LOGIN + PROGRESSO VISUAL (Engagement)**

```
Dinâmica:
├─ Sessão termina
├─ Profissional preenche ficha no Notion
├─ AUTOMÁTICO: Email pro cliente
│  Subject: "Resumo da sua sessão com Dra. Maria"
│  ├─ Tópicos abordados
│  ├─ Próximas metas
│  ├─ Progresso visual (gráfico antes/depois)
│  ├─ Tarefas (homework)
│  └─ [Botão] "Ver seu progresso completo"
│
├─ Cliente clica no botão
├─ Abre dashboard view-only (SEM LOGIN)
│  ├─ Link único por cliente: plataforma.com/c/uuid123
│  ├─ Vê ficha compartilhada (resumo)
│  ├─ Vê testes (antes/depois)
│  ├─ Vê gráfico progresso
│  ├─ Vê próximas tarefas
│  └─ SEM login (só clica link)

Impacto:
├─ Taxa acesso progresso: 20% → 80%
├─ Churn cliente: -50%
├─ Engagement entre sessões: +60%
├─ Sessões/cliente sobe 20-30%
└─ Receita +20-30%

Implementação MVP:
├─ Notion: Template ficha + testes (1 dia - já feito)
├─ Zapier: Trigger (sessão completa) → SendGrid (email) (1 dia)
├─ Email template: HTML bonito (você ou ChatGPT, 2 dias)
├─ Notion link compartilhado: Cada cliente tem URL pública (1 dia)
└─ Total: 4 dias, você faz
```

---

## 📊 FUNCIONALIDADES PRINCIPAIS (MVP)

### **Para Profissional**
```
├─ Cadastro (Webflow form)
├─ Vetting (espera aprovação)
├─ Perfil público
│  ├─ Bio + foto
│  ├─ Especialidade
│  ├─ Preço/sessão
│  ├─ Reviews (rating + comentários)
│  └─ Disponibilidade
├─ Agenda online (Calendly integrado)
├─ Ficha cliente (Notion)
│  ├─ Dados demográficos
│  ├─ Queixa principal
│  ├─ Metas
│  ├─ Registro por sessão
│  └─ Homework/tarefas
├─ Testes (15+ pré-prontos)
│  ├─ PHQ-9 (depressão)
│  ├─ GAD-7 (ansiedade)
│  ├─ DASS-21
│  ├─ Roda da vida
│  └─ + 11 outros
├─ Pagamento (Stripe)
├─ Dashboard financeiro (Sheets)
└─ Email marketing (RD Station)
```

### **Para Cliente**
```
├─ SEM login necessário
├─ Buscar profissional
│  ├─ Por especialidade
│  ├─ Por tipo (terapeuta, coach, etc)
│  ├─ Por rating
│  └─ Filtros básicos
├─ Ver perfil
│  ├─ Bio, experiência, preço
│  └─ Reviews (avaliações)
├─ Agendar sessão (Calendly)
├─ Pagar (Stripe)
├─ Receber resumo por email
├─ Dashboard view-only (link único)
│  ├─ Ver resumo sessão
│  ├─ Ver testes (antes/depois)
│  ├─ Ver progresso (gráficos)
│  ├─ Ver próximas tarefas
│  └─ SEM login
├─ Avaliar sessão (Typeform)
└─ Receber lembrete próxima sessão (email)
```

### **Para Você (Admin)**
```
├─ Dashboard de aprovações (vetting)
├─ Analytics
│  ├─ Profissionais ativos
│  ├─ Clientes
│  ├─ Sessões/mês
│  ├─ Receita (comissão)
│  └─ NPS
├─ Gestão de avaliações
│  ├─ Moderar reviews
│  ├─ Resolver disputes
│  └─ Ver tendências
├─ Financeiro
│  ├─ Receita total
│  ├─ Comissão por profissional
│  ├─ Previsão (runway)
│  └─ Exportar relatório
└─ CRM básico (Airtable)
```

---

## 🧪 TESTES INTEGRADOS (MVP)

### **Terapeutas/Psicólogos (6 testes)**
- PHQ-9 (Depressão)
- GAD-7 (Ansiedade)
- DASS-21 (Depressão + Ansiedade + Stress)
- Escala Rosenberg (Autoestima)
- UCLA Solidão
- Escala Relacionamento (Casais)

### **Coaches (6 testes)**
- Roda da Vida (Life Wheel)
- Escala de Motivação
- Valores (Values Assessment)
- Readiness for Change
- Satisfação com Carreira
- Inteligência Emocional Básica

### **Consultores (3 testes)**
- PHQ-9 + GAD-7 (mesmos de terapeutas)
- Escala Burnout
- Capacidades Profissionais

**Total MVP: ~15 testes**
**Depois expande: +50 testes (Hogrefe, LabPAM, etc)**

---

## 💰 MODELO DE RECEITA

### **Fluxo 1: Comissão Marketplace (Principal)**
```
Cliente paga R$250 por sessão
Você tira 20% = R$50
Profissional recebe R$200
```

### **Fluxo 2: SaaS Optional (Depois)**
```
Profissional paga R$99-299/mês
├─ Básico: R$99 (agenda + prontuário)
├─ Pro: R$179 (+ email automático + WhatsApp)
└─ Premium: R$299 (+ Instagram ads + BI avançado)

Benefício: Reduz comissão de 20% para 15%
```

### **Fluxo 3: Testes Premium (Future)**
```
Acesso biblioteca ampla de testes
Profissional paga extra
Você tira 20-30% por teste usado
```

### **Projeção MÊS 6 (Com 3 Features)**
```
├─ Profissionais: 100
├─ Clientes: 1.000
├─ Sessões/mês: 2.500
├─ Receita comissão: 2.500 × R$250 × 20% = R$125k
├─ Markup operacional (50% margin): R$62.5k
├─ SaaS (30% adoção): +R$10k
├─ Featured/publicidade: +R$5k
└─ TOTAL MRR: ~R$77.500
```

---

## 📅 TIMELINE

### **JAN-FEB 2026 (MÊS 1-2): MVP Gambiarra**
- Setup Webflow + Calendly + Stripe + Zapier
- Notion templates
- Formulários Typeform (avaliação)
- Você faz vetting manualmente
- Launch beta: 20 profissionais
- Resultado: R$5-10k/mês

### **MAR-APR 2026 (MÊS 3-4): Scale**
- 50-100 profissionais
- 500-1.000 clientes
- 3 features rodando (avaliação, vetting, email)
- Resultado: R$30-60k/mês

### **MAY 2026 (MÊS 5): Validação**
- Dados coletados (NPS, conversão, churn)
- Feedback incorporado
- Resultado: R$50-100k/mês, pronto pra pitch

### **JUN 2026: Levanta Capital**
- Pitch: "MVP validado, R$75k+ MRR, 3 features funcionando"
- Target: R$500k
- Resultado: $$$ + contrata 1 dev + 1 CS person

### **JUL-SEP 2026 (MÊS 7-9): Build Versão Real**
- Custom Node + React (não Webflow)
- Avaliações automáticas
- Vetting admin dashboard
- Email automático completo
- Migração dados Notion → PostgreSQL
- Resultado: 200+ profissionais, R$150k+/mês

### **OCT 2026: FASE 2**
- Launch Consultores + Mentores
- Resultado: R$250k+/mês

### **NOV-DEC 2026: Series A**
- Levanta R$3-5M
- Contrata team de verdade
- Escala agressivo

---

## ⚠️ RISCOS & MITIGAÇÕES

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Vetting sobrecarrega você | Alto | Contrata CS person mês 4 |
| Profissional fake passa | Médio | Termo de uso + best effort |
| Review fake/revenge | Médio | Só cliente com sessão pode avaliar |
| Profissional bom sai | Alto | SaaS tools + marketing integrado |
| LGPD não compliance | Crítico | Advogado LGPD ($10k) + criptografia |
| CRP verifica você? | Baixo | Você é intermediária, não responsável |
| Churn cliente alto | Médio | 3 features aumentam engagement |

---

## 📋 CHECKLIST IMPLEMENTAÇÃO

### **Fase 1: Documentos (AGORA)**
- [ ] Termo de Uso (vetting + avaliação)
- [ ] Política de Privacidade (LGPD)
- [ ] Email template (resumo sessão)
- [ ] Script Zapier (automação)

### **Fase 2: Setup (Semana 1-2)**
- [ ] Webflow marketplace
- [ ] Calendly integração
- [ ] Stripe integração
- [ ] Zapier workflows
- [ ] Notion templates (ficha + testes)
- [ ] Typeform (avaliação)
- [ ] RD Station (email)
- [ ] Twilio (WhatsApp)

### **Fase 3: Launch Beta (Semana 3-4)**
- [ ] 20 profissionais
- [ ] 100 clientes
- [ ] Testes vetting
- [ ] Coleta feedback

### **Fase 4: Scale (Mês 2-3)**
- [ ] 100 profissionais
- [ ] 1.000 clientes
- [ ] Análise dados
- [ ] Refinamento features

### **Fase 5: Levanta Capital (Mês 5-6)**
- [ ] Pitch deck
- [ ] Números validados
- [ ] Demo produto

---

## 🎯 MÉTRICAS (O que medir)**

- **Conversão**: Click profissional → Agendamento (target: 25-35%)
- **Churn**: Cliente não volta (target: 20%)
- **Rating médio**: Avaliações (target: 4.5+)
- **Sessões/cliente**: Quantas sessões por cliente (target: 6+)
- **Ticket médio**: Preço médio por sessão (target: R$300)
- **NPS**: Satisfação profissional (target: 50+)
- **CAC**: Custo aquisição cliente (target: R$0, orgânico)
- **LTV**: Lifetime value cliente (target: R$2.000+)

---

## 📞 PRÓXIMOS PASSOS

1. **Aprovação deste documento** ✅
2. **Criar 4 documentos legais/operacionais** (próximo passo)
3. **Setup inicial (Semana 1)**
4. **Beta launch (Semana 3-4)**
5. **Validação (Mês 2-5)**
6. **Pitch + levanta capital (Mês 6)**

---

**Status**: Pronto pra implementar
**Complexidade MVP**: Média (Frankensteined, mas funciona)
**Timeline**: 4-5 meses pra MVP validado
**Custo**: R$500-700/mês (tech) + seu tempo
**Upside**: R$200k+/mês (mês 12)
