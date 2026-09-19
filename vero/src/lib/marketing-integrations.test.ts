import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getEmailMarketingStatus,
  getWhatsAppMarketingStatus,
  sendMarketingEmail,
  sendBulkMarketingEmail,
  sendWhatsAppMessage,
  sendBulkWhatsAppMessages,
  EMAIL_MARKETING_PLATFORMS,
  WHATSAPP_MARKETING_PLATFORMS,
} from "./marketing-integrations";

describe("marketing-integrations", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.BREVO_API_KEY;
    delete process.env.BREVO_FROM;
    delete process.env.ZENVIA_API_TOKEN;
    delete process.env.ZENVIA_WHATSAPP_FROM;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it("exposes exactly one recommended platform per channel", () => {
    expect(EMAIL_MARKETING_PLATFORMS.filter((p) => p.recommended)).toHaveLength(1);
    expect(WHATSAPP_MARKETING_PLATFORMS.filter((p) => p.recommended)).toHaveLength(1);
  });

  it("reports email marketing as not configured without env vars", () => {
    const status = getEmailMarketingStatus();
    expect(status.configured).toBe(false);
    expect(status.missing).toEqual(["BREVO_API_KEY", "BREVO_FROM"]);
  });

  it("reports WhatsApp marketing as not configured without env vars", () => {
    const status = getWhatsAppMarketingStatus();
    expect(status.configured).toBe(false);
    expect(status.missing).toEqual(["ZENVIA_API_TOKEN", "ZENVIA_WHATSAPP_FROM"]);
  });

  it("reports configured once both env vars are set", () => {
    process.env.BREVO_API_KEY = "key";
    process.env.BREVO_FROM = "contato@vero.app";
    expect(getEmailMarketingStatus()).toEqual({ configured: true, missing: [] });

    process.env.ZENVIA_API_TOKEN = "token";
    process.env.ZENVIA_WHATSAPP_FROM = "5511999999999";
    expect(getWhatsAppMarketingStatus()).toEqual({ configured: true, missing: [] });
  });

  it("does not call fetch and returns not_configured when Brevo isn't set up", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendMarketingEmail({
      to: "lead@example.com",
      subject: "Oi",
      html: "<p>Oi</p>",
    });

    expect(result).toEqual({ sent: false, reason: "not_configured" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends via Brevo REST API when configured", async () => {
    process.env.BREVO_API_KEY = "key";
    process.env.BREVO_FROM = "contato@vero.app";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendMarketingEmail({
      to: "lead@example.com",
      subject: "Oi",
      html: "<p>Oi</p>",
    });

    expect(result).toEqual({ sent: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.brevo.com/v3/smtp/email",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "api-key": "key" }),
      })
    );
  });

  it("aggregates bulk email results, sent and failed", async () => {
    process.env.BREVO_API_KEY = "key";
    process.env.BREVO_FROM = "contato@vero.app";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false, status: 400, text: async () => "bad" });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendBulkMarketingEmail(["a@example.com", "b@example.com"], {
      subject: "Oi",
      html: "<p>Oi</p>",
    });

    expect(result).toEqual({ sent: 1, failed: 1, reasons: ["brevo_400"] });
  });

  it("does not call fetch and returns not_configured when Zenvia isn't set up", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendWhatsAppMessage("5511999999999", "Oi");

    expect(result).toEqual({ sent: false, reason: "not_configured" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends via Zenvia REST API when configured", async () => {
    process.env.ZENVIA_API_TOKEN = "token";
    process.env.ZENVIA_WHATSAPP_FROM = "5511999999999";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendWhatsAppMessage("5511988888888", "Oi");

    expect(result).toEqual({ sent: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.zenvia.com/v2/channels/whatsapp/messages",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-API-TOKEN": "token" }),
      })
    );
  });

  it("aggregates bulk WhatsApp results, sent and failed", async () => {
    process.env.ZENVIA_API_TOKEN = "token";
    process.env.ZENVIA_WHATSAPP_FROM = "5511999999999";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false, status: 401, text: async () => "unauthorized" });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendBulkWhatsAppMessages(
      ["5511988888888", "5511977777777"],
      "Oi"
    );

    expect(result).toEqual({ sent: 1, failed: 1, reasons: ["zenvia_401"] });
  });
});
