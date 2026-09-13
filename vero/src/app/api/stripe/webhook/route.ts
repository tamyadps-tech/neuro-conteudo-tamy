import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";
import { bookingConfirmationEmail } from "@/lib/email-templates";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe ainda não está configurado." },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe/webhook] Assinatura inválida:", error);
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase ainda não está configurado." },
      { status: 503 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .update({ status: "pago", updated_at: new Date().toISOString() })
      .eq("stripe_checkout_session_id", checkoutSession.id)
      .select("session_id")
      .single();

    if (paymentError || !payment) {
      console.error(
        "[stripe/webhook] Pagamento não encontrado para o checkout:",
        checkoutSession.id,
        paymentError?.message
      );
      // 200 mesmo assim: retentativa da Stripe não vai resolver um dado
      // que não existe do nosso lado.
      return NextResponse.json({ ok: true });
    }

    const { data: session } = await supabase
      .from("sessions")
      .select(
        "scheduled_at, professional:professionals(full_name), client:clients(full_name, email, access_token)"
      )
      .eq("id", payment.session_id)
      .single();

    const client = session?.client as unknown as
      | { full_name: string; email: string; access_token: string }
      | undefined;
    const professional = session?.professional as unknown as
      | { full_name: string }
      | undefined;

    if (session && client && professional) {
      const { subject, html } = bookingConfirmationEmail({
        clientName: client.full_name,
        professionalName: professional.full_name,
        scheduledAt: session.scheduled_at,
        progressUrl: `${new URL(request.url).origin}/c/${client.access_token}`,
      });
      await sendEmail({ to: client.email, subject, html });
    }
  }

  if (event.type === "checkout.session.expired") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    await supabase
      .from("payments")
      .update({ status: "falhou", updated_at: new Date().toISOString() })
      .eq("stripe_checkout_session_id", checkoutSession.id);
  }

  return NextResponse.json({ ok: true });
}
