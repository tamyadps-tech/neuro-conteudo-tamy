import Stripe from "stripe";

let cachedClient: Stripe | null = null;
let cachedKey: string | null = null;

/**
 * Sem STRIPE_SECRET_KEY configurado, retorna null — o agendamento continua
 * funcionando sem cobrança (modo gratuito), consistente com o resto do
 * app: nada quebra por falta de uma integração externa ainda não montada.
 */
export function getStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;

  if (!cachedClient || cachedKey !== key) {
    cachedClient = new Stripe(key);
    cachedKey = key;
  }
  return cachedClient;
}
