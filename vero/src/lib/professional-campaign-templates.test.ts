import { describe, it, expect } from "vitest";
import {
  PROFESSIONAL_CAMPAIGN_TEMPLATES,
  getProfessionalCampaignTemplate,
  resolveProfessionalCampaignTemplates,
} from "./professional-campaign-templates";

describe("professional-campaign-templates", () => {
  it("has the three expected templates", () => {
    expect(PROFESSIONAL_CAMPAIGN_TEMPLATES.map((t) => t.id)).toEqual([
      "convite",
      "reengajamento",
      "cuidado",
    ]);
  });

  it("every template renders a non-empty subject/html/whatsapp text with the professional's name", () => {
    const name = "Ana Souza";
    const profileUrl = "https://vero.app/profissionais/123";
    for (const template of PROFESSIONAL_CAMPAIGN_TEMPLATES) {
      const email = template.email(name, profileUrl);
      expect(email.subject).toContain(name);
      expect(email.html).toContain(name);

      const whatsapp = template.whatsapp(name, profileUrl);
      expect(whatsapp).toContain(name);
    }
  });

  it("looks up a template by id", () => {
    expect(getProfessionalCampaignTemplate("convite")?.label).toBe("Convite pra agendar");
    expect(getProfessionalCampaignTemplate("inexistente")).toBeUndefined();
  });

  it("resolves all templates with plain data (no functions)", () => {
    const resolved = resolveProfessionalCampaignTemplates("Ana Souza", "https://vero.app/x");
    expect(resolved).toHaveLength(3);
    for (const template of resolved) {
      expect(typeof template.email.subject).toBe("string");
      expect(typeof template.email.html).toBe("string");
      expect(typeof template.whatsapp).toBe("string");
    }
  });
});
