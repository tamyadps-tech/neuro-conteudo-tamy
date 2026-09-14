import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/professional/availability", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/professional/availability", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects an invalid weekday", async () => {
    const response = await POST(
      makeRequest({ token: "any-token", weekday: 9, startTime: "09:00" })
    );
    expect(response.status).toBe(400);
  });

  it("rejects a malformed time", async () => {
    const response = await POST(
      makeRequest({ token: "any-token", weekday: 1, startTime: "9am" })
    );
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await POST(
      makeRequest({ token: "any-token", weekday: 1, startTime: "09:00" })
    );
    expect(response.status).toBe(503);
  });
});
