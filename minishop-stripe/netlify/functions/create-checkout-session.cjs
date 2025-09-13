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

    // Basic sanitation: max 20 items, quantities 1..20
    const safe_items = line_items.slice(0, 20).map(li => ({
      price: String(li.price),
      quantity: Math.max(1, Math.min(20, parseInt(li.quantity || 1, 10)))
    }));

    const origin = event.headers.origin || event.headers.referer || "";
    const success_url = process.env.SUCCESS_URL || `${origin}/success.html`;
    const cancel_url  = process.env.CANCEL_URL  || `${origin}/cancel.html`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: safe_items,
      allow_promotion_codes: true,
custom_fields: [
  {
    key: "room_number",
    label: { type: "custom", custom: "Numero camera" },
    type: "text",
    text: {
      maximum_length: 10,
      ...(room ? { default_value: String(room) } : {})
    }
  }
],
      client_reference_id: room ? `room:${room}` : undefined,
      // Enable Stripe Tax automatically if you use it:
      // automatic_tax: { enabled: true },
      // Enable tipping if available in your account:
      // custom_text: { shipping_address: { message: "Grazie!" } },
      success_url,
      cancel_url
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
    body: JSON.stringify({ error: err.message, raw: err }),
  };
}

