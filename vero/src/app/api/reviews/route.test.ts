import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

const VALID_TOKEN = "11111111-1111-1111-1111-111111111111";
const VALID_SESSION_ID = "22222222-2222-2222-2222-222222222222";

const VALID_BODY = {
  token: VALID_TOKEN,
  sessionId: VALID_SESSION_ID,
  rating: 5,
  comment: "Ótima sessão!",
};

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/reviews", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/reviews", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects a malformed token", async () => {
    const response = await POST(makeRequest({ ...VALID_BODY, token: "not-a-uuid" }));
    expect(response.status).toBe(400);
  });

  it("rejects a malformed sessionId", async () => {
    const response = await POST(
      makeRequest({ ...VALID_BODY, sessionId: "not-a-uuid" })
    );
    expect(response.status).toBe(400);
  });

  it("rejects a rating outside 1-5", async () => {
    const response = await POST(makeRequest({ ...VALID_BODY, rating: 6 }));
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await POST(makeRequest(VALID_BODY));
    expect(response.status).toBe(503);
  });
});
