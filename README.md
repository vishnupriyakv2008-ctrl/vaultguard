# VaultGuard

Receipt and warranty custody vault: receipt capture with local OCR simulation, warranty-expiry tracking,
a return/claim email drafter, and a RevenueCat-gated Free/Pro tier.

Stack: React 19 + Vite + Tailwind CSS 4 (frontend), Express + TypeScript (backend, JSON file store in `data/`).

## Requirements

Node.js 22 or newer.

## Run in development

```bash
npm install
npm run dev
```

Open http://localhost:3000. Sign in with the pre-filled demo account (`devin@custody.io` / `password123`).

## Run in production

```bash
npm install
npm run build
npm start
```

## Configuration (optional)

Copy `.env.example` to `.env` to change the port, RevenueCat key, or the JWT/encryption secrets.
Runtime data is written to `data/vault-store.json` on first change and can be deleted to reset the demo.
