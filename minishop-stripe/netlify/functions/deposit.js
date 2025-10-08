// netlify/functions/deposit.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: process.env.STRIPE_API_VERSION || "2023-10-16",
});

export async function handler(event) {
  try {
    const qs = event.queryStringParameters || {};
    const amountEur = Number(qs.amount) > 0 ? Number(qs.amount) : 25;
    const unit_amount = Math.round(amountEur * 100);
    const room = qs.room || "";
    const guest = qs.guest || "";

    const success_url = qs.success_url || "https://bar.ibimbiapartments.it/thanks-deposit";
    const cancel_url  = qs.cancel_url  || "https://bar.ibimbiapartments.it/cancel";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: "Caparra Garage (chiave/scheda)",
            description: room ? `Camera/Stanza: ${room}` : undefined,
          },
          unit_amount,
        },
        quantity: 1,
      }],
      payment_intent_data: {
        capture_method: "manual",
        metadata: { type: "deposito-garage", room, guest, amount_eur: String(amountEur) },
      },
      success_url,
      cancel_url,
      payment_method_options: { card: { request_three_d_secure: "automatic" } },
    });

    return { statusCode: 303, headers: { Location: session.url }, body: "" };
  } catch (err) {
    console.error("deposit function error:", err);
    return { statusCode: 500, body: `Errore creazione pre-autorizzazione: ${err.message}` };
  }
}
