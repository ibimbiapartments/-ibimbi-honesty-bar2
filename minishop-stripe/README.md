# Mini‑shop (Static) + Stripe Checkout
A lightweight QR‑menu that lets guests select items and pay via Stripe Checkout. 
Works on **Netlify** (serverless function) or **Vercel** (API route).

## 1) Stripe setup
1. In Stripe Dashboard → **Products**, create one product per item (e.g., Water, Beer, Snack) and create **Prices** (tax‑inclusive if you prefer).
2. Copy the **Price IDs** (they look like `price_...`). You'll paste them into `catalog.json`.
3. (Optional) Enable **Checkout Tax** and/or **Tipping** for the session in code if you want it.

## 2) Configure environment variables
- `STRIPE_SECRET_KEY` = your live or test secret key (e.g., `sk_live_...` or `sk_test_...`). 
- (Optional) `STRIPE_API_VERSION` = `2023-10-16` (or your default).
- (Optional) `SUCCESS_URL` and `CANCEL_URL`. If not set, defaults are used.

### Netlify
- In Netlify dashboard → Site settings → **Environment variables**, add the vars above.
- The serverless endpoint will be: `/.netlify/functions/create-checkout-session`.

### Vercel
- In Vercel project → **Environment Variables**, add the vars above.
- The serverless endpoint will be: `/api/create-checkout-session`.

## 3) Replace sample Price IDs
Edit `public/catalog.json` and replace the placeholder `price_XXXX` with your actual Stripe Price IDs.
You can also change names, images, and descriptions.

## 4) Deploy

### Netlify
1. Click “New site from Git” (or “Deploy manually”).
2. Build command: none (static).
3. Publish directory: `public`
4. Functions directory: `netlify/functions`
5. After deploy, test: `https://<yoursite>.netlify.app/`

### Vercel
1. Import the repo to Vercel.
2. Framework preset: “Other” (no build step needed).
3. Root directory: `/`
4. After deploy, test: `https://<yoursite>.vercel.app/`

## 5) Printing QR codes
Use any QR generator to encode your site URL, e.g., `https://<yoursite>/`. 
If you want a **per‑room** QR (for analytics), add a query param like `?room=3` — it will auto‑fill the room number.

## 6) Notes / Options
- **Custom field (Room number):** Collected in Checkout via `custom_fields`. Also auto‑filled from `?room=...`.
- **Taxes:** Consider enabling Stripe Tax in your Checkout session as needed.
- **Tips:** You can enable `automatic_tax` or a dedicated “Tip” line item or Stripe's tipping (if available in your account/region).
- **Inventory:** This simple demo doesn’t decrement inventory. You can add stock checks server‑side before creating the session.
- **Security:** Prices are enforced server‑side using Stripe `price` IDs; the client sends only `price`+`quantity` pairs.
- **Languages:** The Checkout page localizes automatically by browser locale.

---

## Project structure
.
├─ public/
│  ├─ index.html
│  ├─ success.html
│  ├─ cancel.html
│  ├─ styles.css
│  ├─ catalog.json
│  └─ favicon.ico (optional)
├─ netlify/
│  └─ functions/
│     └─ create-checkout-session.js
├─ api/
│  └─ create-checkout-session.js   (for Vercel)
├─ netlify.toml
├─ vercel.json
├─ package.json
└─ README.md

