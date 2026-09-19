import { describe, it, expect } from "vitest";
import { CAMPAIGN_TEMPLATES, getCampaignTemplate } from "./marketing-campaign-templates";

describe("marketing-campaign-templates", () => {
  it("has exactly the three requested stages", () => {
    expect(CAMPAIGN_TEMPLATES.map((t) => t.stage)).toEqual([
      "Venda",
      "Acompanhamento",
      "Pós-venda",
    ]);
  });

  it("every template renders a non-empty subject, html and whatsapp text with the site URL", () => {
    const siteUrl = "https://vero.app";
    for (const template of CAMPAIGN_TEMPLATES) {
      const email = template.email(siteUrl);
      expect(email.subject.length).toBeGreaterThan(0);
      expect(email.html).toContain(siteUrl);

      const whatsapp = template.whatsapp(siteUrl);
      expect(whatsapp.length).toBeGreaterThan(0);
    }
  });

  it("looks up a template by id", () => {
    expect(getCampaignTemplate("convite")?.label).toBe("Convite pra conhecer a Vero");
    expect(getCampaignTemplate("inexistente")).toBeUndefined();
  });
});
