import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getUpcomingSlotsForProfessional } from "@/lib/booking";
import { sendEmail } from "@/lib/email";
import { bookingConfirmationEmail } from "@/lib/email-templates";
import { getStripeClient } from "@/lib/stripe";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { professionalId, slot, clientName, clientEmail } = (body ?? {}) as {
    professionalId?: unknown;
    slot?: unknown;
    clientName?: unknown;
    clientEmail?: unknown;
  };

  if (typeof professionalId !== "string" || !UUID_RE.test(professionalId)) {
    return NextResponse.json({ error: "Profissional inválido." }, { status: 400 });
  }

  const slotDate = typeof slot === "string" ? new Date(slot) : null;
  if (!slotDate || Number.isNaN(slotDate.getTime()) || slotDate.getTime() < Date.now()) {
    return NextResponse.json({ error: "Horário inválido." }, { status: 400 });
  }

  const fullName = typeof clientName === "string" ? clientName.trim() : "";
  if (fullName.length < 3) {
    return NextResponse.json({ error: "Informe seu nome completo." }, { status: 400 });
  }

  const email = typeof clientEmail === "string" ? clientEmail.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Informe um email válido." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Agendamento ainda não está conectado ao banco de dados. Tente novamente em breve.",
      },
      { status: 503 }
    );
  }

  // Recalcula os horários de verdade no servidor — nunca confia no horário
  // que o cliente mandou de volta (evita corrida/duplo agendamento e
  // horários fora da disponibilidade real do profissional).
  const upcoming = await getUpcomingSlotsForProfessional(professionalId);
  const isStillAvailable = (upcoming ?? []).some(
    (candidate) => candidate.getTime() === slotDate.getTime()
  );
  if (!isStillAvailable) {
    return NextResponse.json(
      { error: "Esse horário não está mais disponível. Escolha outro." },
      { status: 409 }
    );
  }

  const { data: professional, error: professionalError } = await supabase
    .from("professionals")
    .select("full_name, price_cents")
    .eq("id", professionalId)
    .single();

  if (professionalError || !professional) {
    return NextResponse.json({ error: "Profissional não encontrado." }, { status: 404 });
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .upsert({ full_name: fullName, email }, { onConflict: "email" })
    .select("id, access_token")
    .single();

  if (clientError || !client) {
    console.error("[sessions/book] client upsert failed:", clientError?.message);
    return NextResponse.json(
      { error: "Não foi possível agendar agora. Tente novamente." },
      { status: 500 }
    );
  }

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      professional_id: professionalId,
      client_id: client.id,
      scheduled_at: slotDate.toISOString(),
      status: "agendada",
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    console.error("[sessions/book] session insert failed:", sessionError?.message);
    return NextResponse.json(
      { error: "Não foi possível agendar agora. Tente novamente." },
      { status: 500 }
    );
  }

  const origin = new URL(request.url).origin;
  const progressUrl = `${origin}/c/${client.access_token}`;

  const stripe = getStripeClient();
  if (stripe && professional.price_cents > 0) {
    // Cobrança ligada: a sessão já está marcada como agendada (segura o
    // horário), e o cliente paga em seguida no Checkout hospedado pela
    // própria Stripe. O email de confirmação sai só depois do pagamento
    // confirmado (webhook), pra não avisar antes da hora.
    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        currency: "brl",
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: "brl",
              unit_amount: professional.price_cents,
              product_data: { name: `Sessão com ${professional.full_name}` },
            },
            quantity: 1,
          },
        ],
        success_url: `${progressUrl}?pago=1`,
        cancel_url: `${origin}/profissionais/${professionalId}?cancelado=1`,
        metadata: { sessionId: session.id },
      });

      const { error: paymentError } = await supabase.from("payments").insert({
        session_id: session.id,
        stripe_checkout_session_id: checkoutSession.id,
        amount_cents: professional.price_cents,
      });

      if (paymentError) {
        console.error("[sessions/book] payment insert failed:", paymentError.message);
      } else if (checkoutSession.url) {
        return NextResponse.json({
          ok: true,
          progressToken: client.access_token,
          checkoutUrl: checkoutSession.url,
        });
      }
    } catch (error) {
      console.error("[sessions/book] Stripe checkout failed:", error);
      // Segue sem cobrança em vez de travar o agendamento inteiro — a
      // sessão já está válida, é melhor cobrar depois do que perder o
      // agendamento por uma falha da Stripe.
    }
  }

  // Sem Stripe configurado (ou falha ao criar o checkout): email é um
  // bônus, não um bloqueio — se falhar, o agendamento já está valendo e o
  // cliente ainda vê o link de progresso na tela.
  const { subject, html } = bookingConfirmationEmail({
    clientName: fullName,
    professionalName: professional.full_name,
    scheduledAt: slotDate.toISOString(),
    progressUrl,
  });
  await sendEmail({ to: email, subject, html });

  return NextResponse.json({ ok: true, progressToken: client.access_token });
}
