# Warranty Vault

**Snap a receipt. Never lose money on an expired warranty.**

Warranty Vault is a hackathon project that turns receipts into a live warranty tracker. It extracts purchase details from a photo, counts down every warranty, shows how much money is still covered, and drafts the claim email for you.

This repository contains the **web demo**: a single self-contained HTML file with a marketing page and a working multi-page app flow.

---

## The problem

People lose money because they can't find receipts or miss warranty deadlines. Paper fades, boxes get thrown out, and the deadline passes unnoticed.

## What makes it different

A plain receipt scanner stores data. Warranty Vault also:

- **Quantifies money at risk** with a live dollar total of active warranties.
- **Acts for you** by drafting a ready-to-send claim or return email.

---

## How it works

| Step | What happens |
|------|--------------|
| 1. Capture | The user photographs a receipt, product box, or warranty card. |
| 2. Extract | A vision LLM returns item, purchase date, price, store, and warranty length (stated, or inferred from the item category). |
| 3. Store | Data is saved locally on the device. No backend needed. |
| 4. Track | The dashboard shows items, days remaining, and total value of active warranties. |
| 5. Alert | A local notification fires a few days before expiry. |
| 6. Act | "Draft return email" uses the LLM to write a claim email the user can copy or share. |

---

## Pages in the demo

| Page | Route | Purpose |
|------|-------|---------|
| Home | `#home` | Landing page: hero, problem, how it works, comparison, pricing, tech stack, roadmap |
| Sign in | `#signin` | Returning users log in |
| Create account | `#signup` | New users register |
| My vault | `#app` | Main dashboard with stats and the item list |
| New warranty item | `#add` | Manual form plus "Scan sample receipt" |
| Paywall | `#pay` | Upgrade screen with monthly and annual plans |
| Premium | `#premium` | Pro benefits, or Pro status once unlocked |

Navigation uses hash routes, so the app works as a static file with no server.

---

## Pricing and paywall

| | Free | Pro |
|---|------|-----|
| Items | Up to 3 | Unlimited |
| Drafted emails | No | Yes |
| Price | $0 | $3.99/month or $29.99/year |

The paywall appears at exactly two moments, both tied to the core value of avoiding lost money:

1. The user tries to add a **4th item**.
2. The user taps **Draft return email**.

---

## RevenueCat integration

The paywall is wired to RevenueCat using a **test (sandbox) API key**:

```js
const RC_KEY = 'test_OAHnTjVUPYvUSapPhEoSLMDbGwR';
```

On "Unlock Pro", the page loads the RevenueCat Web SDK, configures it with the signed-in user's ID, and attempts to fetch offerings and start a purchase. If the SDK can't reach RevenueCat (offline, restricted hosting, or no offering configured), the demo falls back to a **sandbox unlock** so the flow can still be shown. No real charge is ever made.

**Before going to production:**

- Replace the test key with your production public key.
- Create an offering with monthly and annual packages in the RevenueCat dashboard.
- Confirm the SDK version and key type match your RevenueCat project (Web Billing vs. app store keys).
- Move the key into environment configuration rather than hardcoding it.

---

## Run it

No build step and no dependencies.

1. Download `warranty-vault.html`.
2. Open it in any modern browser, or host it on Netlify Drop, Vercel, or GitHub Pages.
3. Click **Try the demo**, create an account, and tap **Scan sample receipt**.

### Suggested demo walkthrough

1. Create an account.
2. Add three items with "Scan sample receipt". Watch money at risk update.
3. Try to add a 4th item to see the paywall.
4. Unlock Pro in sandbox mode.
5. Tap **Draft return email** on any item, then **Copy email**.

---

## Tech

- **Front end:** HTML, CSS, and vanilla JavaScript in one file
- **Fonts:** Bricolage Grotesque and DM Sans (Google Fonts)
- **Storage:** browser `localStorage`, with an in-memory fallback
- **Payments:** RevenueCat Web SDK
- **Design:** one accent color, light and dark mode, responsive from 375px, respects `prefers-reduced-motion`, keyboard focus styles throughout

Planned product stack for the mobile app: a vision LLM API, a local database, local notifications, and RevenueCat.

---

## Demo limitations

This is a demo, not production software.

- **Receipt scanning is simulated.** "Scan sample receipt" fills the form with hardcoded sample data. No image or LLM API call is made.
- **Drafted emails are templates** filled from the item's details, not LLM output.
- **Authentication is not secure.** Accounts and items live in the browser, and passwords are only base64-encoded. Do not use real credentials.
- **Notifications are not implemented** in the web demo.
- Data is per browser. Clearing site data removes it.

---

## Roadmap

**Next: barcode scanning and retailer partnerships.**

Also worth building after the hackathon:

- Real vision-LLM extraction with confidence checks and manual correction
- Real LLM-drafted emails with tone options
- Secure authentication and optional encrypted backup
- Local push notifications on mobile
- A Pro-only expiry timeline

---

