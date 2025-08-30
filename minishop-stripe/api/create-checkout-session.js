// Vercel API Route: /api/create-checkout-session
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: process.env.STRIPE_API_VERSION || "2023-10-16",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }
  try {
    const { line_items = [], room = "" } = req.body || {};

    if (!Array.isArray(line_items) || line_items.length === 0) {
      return res.status(400).send("No line items.");
    }

    const safe_items = line_items.slice(0, 20).map(li => ({
      price: String(li.price),
      quantity: Math.max(1, Math.min(20, parseInt(li.quantity || 1, 10)))
    }));

    const origin = req.headers.origin || "";
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
          text: { maximum_length: 10, minimum_length: 0, default_value: String(room || "") }
        }
      ],
      client_reference_id: room ? `room:${room}` : undefined,
      // automatic_tax: { enabled: true },
      success_url,
      cancel_url
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
}
