{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // netlify/functions/deposit.js\
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, \{\
  apiVersion: process.env.STRIPE_API_VERSION || "2023-10-16",\
\});\
\
exports.handler = async (event) => \{\
  try \{\
    // Accetta querystring: ?amount=25&room=IBIMBI-203&guest=Mario%20Rossi&success_url=...&cancel_url=...\
    const qs = event.queryStringParameters || \{\};\
    const amountEur = Number(qs.amount) > 0 ? Number(qs.amount) : 25; // euro\
    const unit_amount = Math.round(amountEur * 100); // centesimi\
    const room = qs.room || "";\
    const guest = qs.guest || "";\
\
    const success_url = qs.success_url || "https://tuo-dominio.com/thanks-deposit";\
    const cancel_url  = qs.cancel_url  || "https://tuo-dominio.com/cancel";\
\
    // Crea sessione Checkout con pre-autorizzazione (manual capture)\
    const session = await stripe.checkout.sessions.create(\{\
      mode: "payment",\
      line_items: [\
        \{\
          price_data: \{\
            currency: "eur",\
            product_data: \{\
              name: "Caparra Garage (chiave/scheda)",\
              description: room ? `Camera/Stanza: $\{room\}` : undefined,\
            \},\
            unit_amount,\
          \},\
          quantity: 1,\
        \},\
      ],\
      payment_intent_data: \{\
        capture_method: "manual",\
        metadata: \{ type: "deposito-garage", room, guest, amount_eur: amountEur.toString() \},\
      \},\
      success_url,\
      cancel_url,\
      payment_method_options: \{ card: \{ request_three_d_secure: "automatic" \} \},\
      // Se vuoi precompilare l\'92email in Checkout:\
      // customer_email: qs.email || undefined,\
    \});\
\
    // Redirect 303 direttamente alla pagina Stripe\
    return \{\
      statusCode: 303,\
      headers: \{ Location: session.url \},\
      body: "",\
    \};\
  \} catch (err) \{\
    console.error(err);\
    return \{ statusCode: 500, body: "Errore creazione pre-autorizzazione" \};\
  \}\
\};}