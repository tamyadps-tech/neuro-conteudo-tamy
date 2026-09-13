import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

const VALID_BODY = {
  fullName: "Maria Silva",
  email: "maria@example.com",
  category: "terapeuta",
  bio: "Psicóloga com 10 anos de experiência em TCC.",
  yearsExperience: 10,
  specialties: ["Ansiedade", "Burnout"],
  methods: ["TCC"],
  sessionFormat: "online",
  priceCents: 25000,
};

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/professionals/apply", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/professionals/apply", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects a short name", async () => {
    const response = await POST(makeRequest({ ...VALID_BODY, fullName: "Jo" }));
    expect(response.status).toBe(400);
  });

  it("rejects a malformed email", async () => {
    const response = await POST(
      makeRequest({ ...VALID_BODY, email: "not-an-email" })
    );
    expect(response.status).toBe(400);
  });

  it("rejects an invalid category", async () => {
    const response = await POST(
      makeRequest({ ...VALID_BODY, category: "guru" })
    );
    expect(response.status).toBe(400);
  });

  it("rejects a too-short bio", async () => {
    const response = await POST(makeRequest({ ...VALID_BODY, bio: "curto" }));
    expect(response.status).toBe(400);
  });

  it("rejects an out-of-range years of experience", async () => {
    const response = await POST(
      makeRequest({ ...VALID_BODY, yearsExperience: 200 })
    );
    expect(response.status).toBe(400);
  });

  it("rejects an empty specialties list", async () => {
    const response = await POST(makeRequest({ ...VALID_BODY, specialties: [] }));
    expect(response.status).toBe(400);
  });

  it("rejects an invalid session format", async () => {
    const response = await POST(
      makeRequest({ ...VALID_BODY, sessionFormat: "teletransporte" })
    );
    expect(response.status).toBe(400);
  });

  it("requires city/state when the format isn't online", async () => {
    const response = await POST(
      makeRequest({ ...VALID_BODY, sessionFormat: "presencial" })
    );
    expect(response.status).toBe(400);
  });

  it("accepts presencial with city and state", async () => {
    const response = await POST(
      makeRequest({
        ...VALID_BODY,
        sessionFormat: "presencial",
        locationCity: "São Paulo",
        locationState: "SP",
      })
    );
    // 503 porque o Supabase não está configurado neste teste — passou da validação.
    expect(response.status).toBe(503);
  });

  it("rejects a negative price", async () => {
    const response = await POST(
      makeRequest({ ...VALID_BODY, priceCents: -100 })
    );
    expect(response.status).toBe(400);
  });

  it("rejects a malformed credential URL", async () => {
    const response = await POST(
      makeRequest({ ...VALID_BODY, credentialDocumentUrl: "not-a-url" })
    );
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await POST(makeRequest(VALID_BODY));
    expect(response.status).toBe(503);
  });
});
