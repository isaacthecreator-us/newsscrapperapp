# 🚀 News Scraper - Deployment Guide

Supports **multiple AI providers** - just add one API key!

---

## 🔑 Step 1: Get a FREE API Key (Choose ONE)

### Option A: Groq ⭐ RECOMMENDED
**Best free option - very fast, generous limits**

1. Go to [console.groq.com/keys](https://console.groq.com/keys)
2. Sign up / Log in
3. Click **"Create API Key"**
4. Copy the key

✅ **Free**: 30 requests/minute, 14,400/day

---

### Option B: OpenRouter
**Access to free models (Llama, Gemini, DeepSeek)**

1. Go to [openrouter.ai/keys](https://openrouter.ai/keys)
2. Sign up / Log in
3. Create an API key
4. Copy the key

✅ **Free models available** (look for `:free` suffix)

---

### Option C: Together AI
**$25 free credits on signup**

1. Go to [api.together.xyz](https://api.together.xyz)
2. Sign up
3. Get your API key from dashboard
4. Copy the key

✅ **$25 free credits** to start

---

### Option D: OpenAI
**Most reliable, pay-as-you-go**

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up / Log in
3. Create new secret key
4. Copy the key

💰 **Paid**: ~$0.15 per 1M input tokens (GPT-4o-mini)

---

## 💻 Step 2: Local Setup

```bash
# Extract project
unzip news-scraper.zip
cd multi-provider

# Install dependencies
npm install

# Configure API key
cp .env.example .env.local
```

Edit `.env.local` - add ONE of these:
```env
GROQ_API_KEY=gsk_xxxxxxxxxxxx
# OR
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxx
# OR
TOGETHER_API_KEY=xxxxxxxxxxxx
# OR
OPENAI_API_KEY=sk-xxxxxxxxxxxx
```

```bash
# Run locally
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🌐 Step 3: Deploy to Vercel (FREE)

### 3.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/news-scraper.git
git push -u origin main
```

### 3.2 Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your repository
4. **Add Environment Variable:**
   - Name: `GROQ_API_KEY` (or your chosen provider)
   - Value: Your API key
5. Click **Deploy**

Done! Your app is live at `https://your-app.vercel.app` 🚀

---

## 📁 Project Structure

```
news-scraper/
├── app/
│   ├── api/search/route.js  ← Multi-provider API
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── components/
│   └── NewsScraper.jsx      ← Main UI
├── .env.example
├── package.json
└── ...config files
```

---

## ⚙️ How It Works

1. You configure ONE API key
2. App automatically detects which provider to use
3. On search, it calls that provider's API
4. AI generates news article data
5. Results displayed with export options

### Supported Providers & Models

| Provider | Models | Speed |
|----------|--------|-------|
| Groq | Llama 3.3 70B, Mixtral | ⚡ Fastest |
| OpenRouter | Llama 3.3, Gemini, DeepSeek | Fast |
| Together | Llama 3.3, Mixtral | Fast |
| OpenAI | GPT-4o-mini, GPT-4o | Reliable |

---

## 💰 Cost Comparison

| Provider | Free Tier | Paid |
|----------|-----------|------|
| **Groq** | 30 req/min ✅ | - |
| **OpenRouter** | Free models ✅ | Pay per token |
| **Together** | $25 credits ✅ | Pay per token |
| **OpenAI** | - | ~$0.15/1M tokens |

**For personal use, Groq or OpenRouter free tiers are perfect!**

---

## 🔧 Troubleshooting

### "No API key configured"
- Make sure your `.env.local` has the key
- On Vercel: Add it in Environment Variables, then redeploy

### "Rate limit exceeded"
- Wait 1-2 minutes and try again
- Or switch to a different provider

### Build fails
- Run `npm install` again
- Check all files are committed
- Check Vercel build logs

---

## 🔄 Switching Providers

Just change the environment variable:

**Local:** Edit `.env.local`
**Vercel:** 
1. Go to Project Settings → Environment Variables
2. Delete old key, add new one
3. Redeploy

---

## ✨ Features

- 🔍 Keyword search
- 📅 Date range filtering
- 🔬 Deep research mode
- 📊 Export: CSV, JSON, PDF
- 🎨 Google-style UI
- ⚡ Multiple AI providers

---

Made with ❤️ - Supports Groq, OpenAI, Together AI, OpenRouter
