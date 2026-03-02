# Cyber Bazi (知命) - AI Destiny Analysis

Cyber Bazi is a premium web application that combines traditional Chinese Four Pillars of Destiny (Bazi) astrology with advanced AI (Google Gemini) to provide deep, personalized life insights.

![Cyber Bazi Preview](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

## ✨ Features

- **Multi-AI Provider**: Supports **Google Gemini**, **OpenAI**, and **DeepSeek** (OpenAI compatible).
- **Global Reach**: Supports both **Traditional Chinese** and **English** (Bilingual) reporting.
- **Guest Checkout**: Seamless payment flow via **Lemon Squeezy** (Credit Card, PayPal, Alipay).
- **Interactive Map**: Precise birth location selection with automatic True Solar Time conversion.
- **SEO Optimized**: Full Metadata, JSON-LD, Sitemap, and Robots.txt integration.
- **Monetization**: Integrated Google AdSense support.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: Cloudflare Pages (Edge Runtime)
- **Database**: Cloudflare D1 (SQL)
- **AI Engine**: Google Gemini API
- **Payments**: Lemon Squeezy
- **UI/UX**: Tailwind CSS, Framer Motion, Lucide Icons

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and configure the following:

| Variable | Description |
| :--- | :--- |
| `AI_PROVIDER` | `gemini` or `openai` |
| `AI_MODEL` | Model name (e.g., `gemini-2.0-flash`, `gpt-4o`) |
| `GEMINI_API_KEY` | Required if provider is `gemini` |
| `OPENAI_API_KEY` | Required if provider is `openai` |
| `OPENAI_BASE_URL` | Optional for OpenAI-compatible APIs (e.g., DeepSeek) |
| `LEMON_SQUEEZY_API_KEY` | Lemon Squeezy API Key |
| `LEMON_SQUEEZY_STORE_ID` | Your Lemon Squeezy Store ID |
| `LEMON_SQUEEZY_VARIANT_ID` | Your Product Variant ID |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | Webhook signing secret |
| `APP_URL` | Your deployment URL (e.g., https://cyber-bazi.pages.dev) |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Google AdSense Client ID (ca-pub-xxx) |

## 🚀 Deployment

### 1. Database Setup
Register a Cloudflare D1 database and initialize the schema:
```bash
npx wrangler d1 create reports
npx wrangler d1 execute reports --file=./schema.sql
```

### 2. Configure wrangler.toml
Update the `database_id` in `wrangler.toml` with your new D1 ID.

### 3. Deploy to Cloudflare
```bash
npm run pages:deploy
```

## 📝 License

Private / All Rights Reserved.
