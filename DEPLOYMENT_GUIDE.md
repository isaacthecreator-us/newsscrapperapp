# 🚀 News Scraper - Deployment Guide

**Real article links + AI-powered search + Racing APIs for speed**

---

## ✨ What's New

- ✅ **Real working links** via GNews API
- ✅ **15-25+ articles** per search  
- ✅ **Racing APIs** - uses fastest response automatically
- ✅ **AI enhancement** - better summaries
- ✅ **Verified badges** - shows which links are real

---

## 🔑 Step 1: Get API Keys

### GNews API ⭐ ESSENTIAL (For real links)

1. Go to **[gnews.io](https://gnews.io)**
2. Click **"Get API Key"** (top right)
3. Sign up (free)
4. Copy your API key

✅ **Free**: 100 requests/day (plenty for personal use)

---

### AI Provider (Choose ONE for enhanced summaries)

#### Option A: Groq ⚡ RECOMMENDED
1. Go to **[console.groq.com/keys](https://console.groq.com/keys)**
2. Sign up with Google/GitHub
3. Create API key
4. Copy the key

✅ **Free**: 30 req/min, very fast

#### Option B: OpenRouter
1. Go to **[openrouter.ai/keys](https://openrouter.ai/keys)**
2. Sign up, create key

✅ **Free models** available

#### Option C: Together AI
1. Go to **[api.together.xyz](https://api.together.xyz)**
2. Sign up, get key

✅ **$25 free credits**

---

## 💻 Step 2: Local Setup

```bash
# Extract
unzip news-scraper-final.zip
cd final-version

# Install
npm install

# Configure
cp .env.example .env.local
```

Edit `.env.local`:
```env
GNEWS_API_KEY=your_gnews_key_here
GROQ_API_KEY=your_groq_key_here
```

```bash
# Run
npm run dev
```

Open **[localhost:3000](http://localhost:3000)** 🎉

---

## 🌐 Step 3: Deploy to Vercel

### Push to GitHub

```bash
git init
git add .
git commit -m "News scraper with GNews + AI"
git branch -M main
git remote add origin https://github.com/YOU/news-scraper.git
git push -u origin main
```

### Deploy on Vercel

1. Go to **[vercel.com](https://vercel.com)**
2. Sign in with GitHub
3. **Add New** → **Project**
4. Import your repo
5. **Add Environment Variables:**

| Name | Value |
|------|-------|
| `GNEWS_API_KEY` | your_gnews_key |
| `GROQ_API_KEY` | your_groq_key |

6. Click **Deploy**

🎉 **Your app is live!**

---

## ⚙️ How It Works

```
User Search
    │
    ▼
┌─────────────────────────────────────┐
│  1. GNews API (Real Articles)       │
│     - Fetches 15-25 real articles   │
│     - Working URLs ✓                │
│     - Real publishers ✓             │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  2. AI Enhancement (Optional)       │
│     - Races all configured APIs     │
│     - Uses fastest response         │
│     - Enhanced summaries            │
└─────────────────────────────────────┘
    │
    ▼
Results with verified links + AI summaries
```

### API Racing

When multiple AI providers are configured:
- All are called **simultaneously**
- **First successful response wins**
- Fallback if one fails

---

## 💰 Cost Summary

| API | Free Tier | Monthly |
|-----|-----------|---------|
| **GNews** | 100 req/day | $9+ for more |
| **Groq** | 30 req/min | Free |
| **OpenRouter** | Free models | Pay per use |
| **Together** | $25 credits | Pay per use |

**For personal use, the free tiers are perfect!**

---

## 📁 Project Structure

```
final-version/
├── app/
│   ├── api/search/route.js   ← GNews + AI racing logic
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── components/
│   └── NewsScraper.jsx       ← Main UI
├── .env.example
└── package.json
```

---

## 🔧 Troubleshooting

### "Links not working"
- Make sure `GNEWS_API_KEY` is set
- Check [gnews.io dashboard](https://gnews.io/dashboard) for usage

### "No results"
- GNews free tier = 100 req/day
- Wait until tomorrow or upgrade

### "AI enhancement not working"
- App still works! GNews provides basic summaries
- Add any AI key for better summaries

### Rate limits
- GNews: 100/day free
- Groq: 30/min free
- Space out searches if needed

---

## 🔄 Updating

After code changes:
```bash
git add .
git commit -m "Update"
git push
```
Vercel auto-deploys!

---

## ✨ Features Recap

- 🔍 **Keyword search** with date filtering
- 📰 **15-25+ real articles** with working links
- ⚡ **Racing APIs** - fastest wins
- 🏷️ **Verified badges** on real links
- 📊 **Export**: CSV, JSON, PDF
- 🎨 **Google-style UI**

---

Made with ❤️ - GNews + Groq/OpenAI/Together/OpenRouter
