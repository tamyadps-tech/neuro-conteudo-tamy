import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

const VALID_TOKEN = "11111111-1111-1111-1111-111111111111";
const PHQ9_ZEROS = new Array(9).fill(0);

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/assessments/submit", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/assessments/submit", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects a malformed token", async () => {
    const response = await POST(
      makeRequest({ token: "not-a-uuid", templateSlug: "phq9", answers: PHQ9_ZEROS })
    );
    expect(response.status).toBe(400);
  });

  it("rejects an unknown template", async () => {
    const response = await POST(
      makeRequest({ token: VALID_TOKEN, templateSlug: "nao-existe", answers: PHQ9_ZEROS })
    );
    expect(response.status).toBe(400);
  });

  it("rejects a wrong number of answers", async () => {
    const response = await POST(
      makeRequest({ token: VALID_TOKEN, templateSlug: "phq9", answers: [0, 1] })
    );
    expect(response.status).toBe(400);
  });

  it("rejects an out-of-range answer", async () => {
    const answers = [...PHQ9_ZEROS];
    answers[0] = 99;
    const response = await POST(
      makeRequest({ token: VALID_TOKEN, templateSlug: "phq9", answers })
    );
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await POST(
      makeRequest({ token: VALID_TOKEN, templateSlug: "phq9", answers: PHQ9_ZEROS })
    );
    expect(response.status).toBe(503);
  });
});
