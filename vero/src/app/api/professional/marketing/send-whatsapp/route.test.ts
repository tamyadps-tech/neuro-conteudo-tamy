import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/professional/marketing/send-whatsapp", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/professional/marketing/send-whatsapp", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects an invalid template id", async () => {
    const response = await POST(
      makeRequest({ token: "abc", templateId: "nao-existe", phones: ["5511999999999"] })
    );
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await POST(
      makeRequest({ token: "abc", templateId: "convite", phones: ["5511999999999"] })
    );
    expect(response.status).toBe(503);
  });
});
