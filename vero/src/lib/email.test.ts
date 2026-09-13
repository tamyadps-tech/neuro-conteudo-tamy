import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendEmail } from "./email";

describe("sendEmail", () => {
  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM;
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("no-ops when Resend isn't configured", async () => {
    const result = await sendEmail({
      to: "cliente@example.com",
      subject: "Oi",
      html: "<p>Oi</p>",
    });
    expect(result).toEqual({ sent: false, reason: "not_configured" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("calls the Resend API with the right payload when configured", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM = "Vero <contato@vero.app>";
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({ ok: true });

    const result = await sendEmail({
      to: "cliente@example.com",
      subject: "Oi",
      html: "<p>Oi</p>",
    });

    expect(result).toEqual({ sent: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer re_test_key" }),
      })
    );
    const [, options] = fetchMock.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({
      from: "Vero <contato@vero.app>",
      to: "cliente@example.com",
      subject: "Oi",
      html: "<p>Oi</p>",
    });
  });

  it("reports failure when Resend responds with an error", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM = "Vero <contato@vero.app>";
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 422,
      text: async () => "invalid from address",
    });

    const result = await sendEmail({
      to: "cliente@example.com",
      subject: "Oi",
      html: "<p>Oi</p>",
    });
    expect(result).toEqual({ sent: false, reason: "resend_422" });
  });
});
