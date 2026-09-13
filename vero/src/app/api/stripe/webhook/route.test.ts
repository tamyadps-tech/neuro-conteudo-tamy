import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Stripe from "stripe";
import { POST } from "./route";

const WEBHOOK_SECRET = "whsec_test_secret";

function makeRequest(body: string, signature?: string) {
  const headers = new Headers();
  if (signature) headers.set("stripe-signature", signature);
  return new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    headers,
    body,
  });
}

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it("returns 503 when Stripe isn't configured yet", async () => {
    const response = await POST(makeRequest("{}"));
    expect(response.status).toBe(503);
  });

  it("returns 400 when the signature header is missing", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
    process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;

    const response = await POST(makeRequest("{}"));
    expect(response.status).toBe(400);
  });

  it("returns 400 for an invalid signature", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
    process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;

    const response = await POST(makeRequest("{}", "t=1,v1=bogus"));
    expect(response.status).toBe(400);
  });

  it("accepts a validly signed event and returns 503 when Supabase isn't configured", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
    process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;

    const payload = JSON.stringify({
      id: "evt_test",
      object: "event",
      type: "checkout.session.completed",
      data: { object: { id: "cs_test_123" } },
    });
    const signature = Stripe.webhooks.generateTestHeaderString({
      payload,
      secret: WEBHOOK_SECRET,
    });

    const response = await POST(makeRequest(payload, signature));
    // Passou da verificação de assinatura — só falta o Supabase configurado.
    expect(response.status).toBe(503);
  });
});
