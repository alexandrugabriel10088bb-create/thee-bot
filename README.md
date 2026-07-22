# Lua Obfuscation Bot for Discord

A Discord bot that obfuscates Lua code using a single heavy-duty obfuscation layer.

## Features

- `/obf` — Paste Lua code or attach a `.lua` file to obfuscate it in one step.
- `/upload` — Upload code to [Pastefy](https://pastefy.app).

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

1. Push this repo to GitHub.
2. In Railway, click **New Project → Deploy from GitHub repo** and select the repo.
3. Add the environment variable in the Railway dashboard:
   - `TOKEN`
4. Railway will detect the `Procfile` and run the worker.

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
