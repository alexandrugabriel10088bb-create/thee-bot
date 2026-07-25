# Lua Obfuscation Bot for Discord

A Discord bot that obfuscates Lua code using a single heavy-duty obfuscation layer.

## Features

- `/obf` — Paste Lua code or attach a `.lua` file to obfuscate it in one step.
- `/upload` — Upload code to [Pastefy](https://pastefy.app).
- `/api_url` — Store Lua code on the Hosting API and create a protected `loadstring` URL.

## Tech stack

- Node.js 18
- Discord.js 14
- Axios + dotenv

## Setup locally

```bash
npm install
# copy .env.example to .env and fill in your credentials
cp .env.example .env
npm start
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `TOKEN` | Discord bot token (from the [Discord Developer Portal](https://discord.com/developers/applications)) |

## Deploy to Railway

This project has two Railway services:

1. **Bot service** — runs `npm start`.
2. **Hosting API service** — runs `node server.js` and serves the generated script URLs.

1. Push this repo to GitHub.
2. Create two services from the same repository.
3. For the **bot service**, set:
   - `TOKEN`
   - `GUILD_ID`
   - `AUTO_ROLE_ID`
   - `API_URL` — the public URL of the Hosting API service
   - `API_SHARED_SECRET`
4. For the **Hosting API service**, set:
   - `API_PUBLIC_URL` — the public URL of the Hosting API service
   - `API_SHARED_SECRET` — exactly the same value as the bot service
   - `DATA_DIR=/app/data` (recommended when a Railway volume is mounted at `/app/data`)
5. Set the bot service start command to `npm start`.
6. Set the Hosting API service start command to `node server.js`.

The API service exposes:

- `GET /health` — health check.
- `POST /api/scripts` — private endpoint used by the bot to create a script URL.
- `GET /script/:id` — returns the Lua code to Roblox clients and shows a blocked page to normal browsers.

Railway's filesystem is ephemeral unless you attach a volume. Without a volume, generated URLs are lost when the API service is redeployed or restarted. Mount a Railway volume at `/app/data` to keep them.

Or deploy with the Railway CLI:

```bash
railway login
railway link
railway variables set TOKEN=your_token
railway up
```

## Project structure

```
.
├── index.js        # Bot entry point and Discord UI
├── server.js        # Hosting API for generated script URLs
├── obfuscator.js   # Obfuscation engine
├── package.json
├── Procfile
├── railway.json
├── Dockerfile
├── .env.example
└── README.md
```

## Security note

This is a code obfuscation tool for educational purposes. Obfuscation alone is not a substitute for real security.
