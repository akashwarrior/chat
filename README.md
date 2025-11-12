<a href="https://chat.akashgupta.tech">
  <p align="center">
    <img alt="Chat logo" src="public/logo.svg" width="80" />
  </p>
  <h1 align="center">Chat · Assistant</h1>
</a>

<p align="center">
  Lightweight AI chat powered by Google Gemini, resumable streaming, and secure authentication.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy</strong></a> ·
  <a href="#running-locally"><strong>Run Locally</strong></a>
</p>

---

## Features

- Next.js 16 App Router with shared layouts and SWR-powered history.
- Vercel AI SDK + `resumable-stream` for smooth, reconnectable responses.
- Google Gemini tools: search, URL context, and code execution.
- Inline regenerate/edit, citations, reasoning trace, and copy actions.
- Attachment uploads via Vercel Blob (images & PDFs up to 5 MB).
- Better Auth with Google OAuth and Redis-backed session caching.
- User customization (name, traits, preferences) and visual settings.
- Chat history export/backup with full message data.

## Model Providers

- Gemini 2.5 Pro, Flash, and Flash Lite configured in `src/ai/config.ts`.
- Reasoning output (`thinking`) and tool calls ship enabled by default.
- Swap IDs or extend the list to adopt future Gemini releases.

## Deploy Your Own

1. Provision PostgreSQL, Redis, and Vercel Blob storage.
2. Create Google OAuth credentials and allow your production callback URL.
3. Copy `.env.example` to `.env` and set all required values.
4. Deploy with Vercel or your preferred Next.js host.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## Running Locally

```bash
pnpm install
cp .env.example .env
```

Required environment variables:

| Variable                       | Description                                                            |
| ------------------------------ | ---------------------------------------------------------------------- |
| `DATABASE_URL`                 | PostgreSQL connection string for Drizzle ORM.                          |
| `BETTER_AUTH_SECRET`           | Secret for signing sessions (generate with `openssl rand -base64 32`). |
| `BETTER_AUTH_URL`              | Base URL for auth callbacks (e.g., `http://localhost:3000`).           |
| `GOOGLE_CLIENT_ID`             | Google OAuth client ID.                                                |
| `GOOGLE_CLIENT_SECRET`         | Google OAuth client secret.                                            |
| `GOOGLE_GENERATIVE_AI_API_KEY` | API key for Gemini models.                                             |
| `CHAT_REDIS_URL`               | Redis connection for sessions and stream state.                        |
| `BLOB_READ_WRITE_TOKEN`        | Vercel Blob token for file uploads.                                    |

```bash
pnpm db:generate   # optional, sync SQL
pnpm db:migrate    # apply migrations
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000), sign in with Google, and start chatting.

Useful scripts: `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm db:studio`.
