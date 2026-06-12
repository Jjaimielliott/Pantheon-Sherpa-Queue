# Pantheon Sherpa Queue

Real-time Destiny 2 Sherpa queue app. Guardians join via browser, queue syncs live for everyone.

## Stack
- Node.js + Express
- Socket.io (real-time sync)
- No database needed — runs in memory

---

## Deploy to Railway (recommended, free)

1. Create a free account at https://railway.app
2. Click **New Project → Deploy from GitHub repo**
   - Or use **Deploy from local** and upload this folder
3. Railway auto-detects Node.js and runs `npm start`
4. Go to your project → **Variables** tab, add:
   ```
   SHERPA_PASSWORD = your_secret_password_here
   ```
5. Under **Settings → Networking**, click **Generate Domain**
6. Share that URL in your Discord server — done!

---

## Deploy to Render (alternative, also free)

1. Create a free account at https://render.com
2. Click **New → Web Service**
3. Connect your GitHub repo (or upload the files)
4. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Add environment variable:
   ```
   SHERPA_PASSWORD = your_secret_password_here
   ```
6. Click **Create Web Service** — Render gives you a free `.onrender.com` URL

> ⚠️ Render free tier spins down after 15 min of inactivity (first load takes ~30s to wake up).
> Railway free tier stays always-on. Recommended for 24/7 use.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SHERPA_PASSWORD` | `pantheon2024` | Password to unlock Sherpa controls |
| `PORT` | `3000` | Port (auto-set by Railway/Render) |

**Change the default password before deploying.**

---

## How it works

- Anyone with the link can join the queue with their Bungie ID + Discord username
- Click **Sherpa** in the top-right and enter the password to unlock controls
- **Call Next Guardian** — marks the top of the queue as the active run
- **✓ Done** — moves them to Completed, next person is ready to call
- **✕** — remove anyone from the queue
- All changes sync live to every browser connected

---

## Local development

```bash
npm install
SHERPA_PASSWORD=yourpassword node server.js
# Open http://localhost:3000
```
