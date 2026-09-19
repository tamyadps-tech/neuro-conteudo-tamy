import { headers } from "next/headers";
import { AdminNav } from "@/components/admin/AdminNav";
import { MarketingPlatformList } from "@/components/admin/MarketingPlatformList";
import { MarketingTemplateCard } from "@/components/admin/MarketingTemplateCard";
import { MarketingCampaignSender } from "@/components/admin/MarketingCampaignSender";
import { WhatsAppCampaignSender } from "@/components/admin/WhatsAppCampaignSender";
import {
  EMAIL_MARKETING_PLATFORMS,
  WHATSAPP_MARKETING_PLATFORMS,
  getEmailMarketingStatus,
  getWhatsAppMarketingStatus,
} from "@/lib/marketing-integrations";
import { resolveCampaignTemplates } from "@/lib/marketing-campaign-templates";
import { RECIPIENT_SEGMENTS } from "@/lib/marketing-recipients";

export const dynamic = "force-dynamic";

export default async function AdminMarketingPage() {
  const headersList = await headers();
  const siteUrl = `${headersList.get("x-forwarded-proto") ?? "https"}://${headersList.get("host") ?? "vero.app"}`;

  const emailStatus = getEmailMarketingStatus();
  const whatsappStatus = getWhatsAppMarketingStatus();
  const templates = resolveCampaignTemplates(siteUrl);

  return (
    <>
      <AdminNav active="/admin/marketing" />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Marketing</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Ferramentas pra divulgar a própria Vero — não a agenda de um profissional
          específico.
        </p>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Email marketing
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Automação de vendas, acompanhamento e pós-venda — modelos prontos abaixo.
          </p>
          <div className="mt-3">
            <MarketingPlatformList
              platforms={EMAIL_MARKETING_PLATFORMS}
              status={emailStatus}
              envVarsHint="BREVO_API_KEY e BREVO_FROM"
            />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {templates.map((template) => (
              <MarketingTemplateCard key={template.id} template={template} />
            ))}
          </div>

          <div className="mt-5">
            <MarketingCampaignSender templates={templates} segments={RECIPIENT_SEGMENTS} />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            WhatsApp em massa
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Pra quem já topou receber mensagem — use os mesmos modelos, em versão curta.
          </p>
          <div className="mt-3">
            <MarketingPlatformList
              platforms={WHATSAPP_MARKETING_PLATFORMS}
              status={whatsappStatus}
              envVarsHint="ZENVIA_API_TOKEN e ZENVIA_WHATSAPP_FROM"
            />
          </div>

          <div className="mt-5">
            <WhatsAppCampaignSender templates={templates} />
          </div>
        </section>
      </main>
    </>
  );
}
