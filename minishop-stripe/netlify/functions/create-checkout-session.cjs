// Netlify Function: create-checkout-session
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: process.env.STRIPE_API_VERSION || "2023-10-16",
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body || "{}");
    const { line_items = [], room = "" } = data;

    if (!Array.isArray(line_items) || line_items.length === 0) {
      return { statusCode: 400, body: "No line items." };
    }

    // Sanitize: max 20 items, quantity 1..20
    const safe_items = line_items.slice(0, 20).map((li) => ({
      price: String(li.price),
      quantity: Math.max(1, Math.min(20, parseInt(li.quantity || 1, 10))),
    }));

    // Costruisci origin sicuro (anche con dominio custom)
    const origin =
      event.headers.origin ||
      (event.headers.host ? `https://${event.headers.host}` : "");

    const success_url =
      process.env.SUCCESS_URL || `${origin}/success.html`;
    const cancel_url =
      process.env.CANCEL_URL || `${origin}/cancel.html`;

    // Niente minimum_length; default_value sempre stringa (anche vuota)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: safe_items,
      allow_promotion_codes: true,
// costruisco il campo testuale e aggiungo default_value SOLO se "room" è valorizzato
const textField = { maximum_length: 10 };
if (room && String(room).trim() !== "") {
  textField.default_value = String(room).trim();
}

custom_fields: [
  {
    key: "room_number",
    label: { type: "custom", custom: "Numero camera" },
    type: "text",
    text: textField,
  }
],
      client_reference_id: room ? `room:${room}` : undefined,
      success_url,
      cancel_url,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("❌ Stripe error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
}; // <-- chiusura mancata prima
