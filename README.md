# Sumedh Patil — Portfolio (Full Stack)

A portfolio site with a working contact form backed by a real database and
an admin page to view submissions.

```
sumedh-portfolio/
├── frontend/          → static site, deploy to Vercel
│   ├── index.html
│   ├── admin.html      (private — view messages here)
│   ├── style.css
│   └── script.js
└── backend/           → API, deploy to Render
    ├── server.js
    ├── routes/api.js
    ├── models/Message.js
    ├── package.json
    └── .env.example
```

## 1. Set up MongoDB Atlas (free database)

1. Go to mongodb.com/cloud/atlas and create a free account.
2. Create a free M0 cluster (any region close to you).
3. Under **Database Access**, create a user with a username and password — save these.
4. Under **Network Access**, add IP address `0.0.0.0/0` (allow from anywhere — fine for this project).
5. Click **Connect** → **Drivers** → copy the connection string. It looks like:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. Add `/portfolio` before the `?` so it targets a database named `portfolio`:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority`

## 2. Set up Gmail App Password (for email notifications)

Gmail blocks your normal password for this — you need an App Password.

1. Turn on 2-Step Verification on your Google account (required first).
2. Go to myaccount.google.com/apppasswords.
3. Create an app password named "portfolio", copy the 16-character code.
4. This is your `SMTP_PASS`. Your `SMTP_USER` is your full Gmail address.

If you skip this step, the form still saves messages to the database — it just won't email you.

## 3. Deploy the backend to Render

1. Push the `backend/` folder to a GitHub repo (see Git steps below).
2. Go to render.com → New → Web Service → connect your GitHub repo.
3. Set:
   - **Root Directory:** `backend` (if frontend + backend are in the same repo)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Under **Environment**, add these variables (from `.env.example`):
   - `MONGODB_URI` — your Atlas connection string
   - `SMTP_USER` — your Gmail address
   - `SMTP_PASS` — your 16-char app password
   - `NOTIFY_EMAIL` — sumedhpatil700@gmail.com
   - `ADMIN_KEY` — make up a long random string, e.g. `sk_admin_a8x9k2m...`
   - `CORS_ORIGIN` — your future Vercel URL, e.g. `https://sumedh-portfolio.vercel.app` (you can use `*` temporarily until you have it)
5. Deploy. Render gives you a URL like `https://sumedh-portfolio-api.onrender.com`.
6. Visit that URL — you should see `{"status":"ok","message":"Portfolio backend is running."}`.

Note: Render's free tier spins down when idle, so the first request after inactivity takes ~30-50 seconds to wake up. This is normal.

## 4. Connect the frontend to the backend

In `frontend/script.js`, replace:
```js
const API_URL = 'https://YOUR-BACKEND-URL.onrender.com/api/contact';
```
with your real Render URL.

In `frontend/admin.html`, replace:
```js
const API_BASE = 'https://YOUR-BACKEND-URL.onrender.com/api';
```
with the same Render URL (no `/contact` at the end here).

## 5. Deploy the frontend to Vercel

1. Push the `frontend/` folder to GitHub (same repo or a separate one).
2. Go to vercel.com → Add New → Project → import your repo.
3. Set **Root Directory** to `frontend` if it's in the same repo as the backend.
4. Framework Preset: **Other** (it's plain HTML/CSS/JS, no build step needed).
5. Deploy. Vercel gives you a live URL like `https://sumedh-portfolio.vercel.app`.

Go back to Render and update `CORS_ORIGIN` to this exact Vercel URL, then redeploy the backend (Render auto-redeploys on env var changes).

## 6. Test it

1. Visit your Vercel URL, fill out the contact form, submit.
2. Check your email for the notification (may take a few seconds).
3. Visit `https://your-vercel-url.vercel.app/admin.html`, enter your `ADMIN_KEY`, and confirm the message appears.

## Local development (before deploying)

Backend:
```bash
cd backend
npm install
cp .env.example .env   # then fill in real values
npm run dev             # runs on http://localhost:5000
```

Frontend: open `frontend/index.html` with VS Code's Live Server extension,
but temporarily point `API_URL` and `API_BASE` to `http://localhost:5000/api/...`
while testing locally.

## Security notes

- `admin.html` is not indexed by search engines (`noindex` meta tag) but is
  still publicly reachable at that URL — anyone who finds it still needs your
  `ADMIN_KEY` to see any messages, and the key is never stored in the code.
- Don't commit `.env` to GitHub — `.gitignore` already excludes it.
- The contact route is rate-limited (5 submissions per 15 minutes per IP) to deter spam.
