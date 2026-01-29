# 🚀 Google News Scraper - Deployment Guide (Gemini API)

A complete guide to deploying the News Scraper using **Google Gemini AI** with search grounding.

---

## 📋 Prerequisites

- **Node.js 18+** → [nodejs.org](https://nodejs.org/)
- **Google Account** → For Gemini API access
- **GitHub Account** → [github.com](https://github.com/)
- **Vercel Account** → [vercel.com](https://vercel.com/) (free)

---

## 🔑 Step 1: Get Your Gemini API Key (FREE)

### Option A: Google AI Studio (Easiest - Recommended)

1. Go to **[Google AI Studio](https://aistudio.google.com/app/apikey)**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select a project (or create a new one)
5. **Copy your API key** - you'll need this!

> ✅ **Free Tier**: Gemini API has a generous free tier:
> - 15 requests per minute (RPM)
> - 1 million tokens per minute
> - 1,500 requests per day

### Option B: Google Cloud Console (More Control)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **"Generative Language API"**
4. Go to **APIs & Services → Credentials**
5. Click **Create Credentials → API Key**
6. Copy the key

---

## 💻 Step 2: Local Setup & Testing

### 2.1 Extract & Install

```bash
# Unzip the project
unzip gemini-news-scraper.zip
cd gemini-deployment

# Install dependencies
npm install
```

### 2.2 Configure Environment

```bash
# Create local environment file
cp .env.example .env.local
```

Edit `.env.local` and add your API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

### 2.3 Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Test a search to make sure everything works!

---

## 🌐 Step 3: Deploy to Vercel (FREE)

### 3.1 Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - News Scraper with Gemini"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/gemini-news-scraper.git
git branch -M main
git push -u origin main
```

### 3.2 Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub

2. Click **"Add New..."** → **"Project"**

3. **Import** your `gemini-news-scraper` repository

4. **⚠️ IMPORTANT: Add Environment Variable BEFORE deploying:**
   - Expand **"Environment Variables"**
   - Name: `GEMINI_API_KEY`
   - Value: `your_api_key_here`
   - Click **Add**

5. Click **"Deploy"**

6. Wait ~1 minute... 🎉 **Your app is live!**

Vercel gives you a URL like: `https://gemini-news-scraper.vercel.app`

---

## 📁 Project Structure

```
gemini-news-scraper/
├── app/
│   ├── api/
│   │   └── search/
│   │       └── route.js    ← Gemini API calls (server-side, secure)
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── components/
│   └── NewsScraper.jsx     ← Main UI component
├── .env.example            ← Environment template
├── .env.local              ← Your actual keys (never commit!)
├── .gitignore
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json
└── package.json
```

---

## ⚙️ How It Works

1. **User enters search query** in the frontend
2. **Frontend sends POST request** to `/api/search`
3. **API route calls Gemini** with search grounding enabled
4. **Gemini searches the web** and returns structured news data
5. **Results displayed** with publisher, date, summary, relevance
6. **Export options**: CSV, JSON, PDF

### Gemini Search Grounding
The app uses Gemini's built-in `googleSearch` tool, which:
- Searches the real web in real-time
- Returns grounded, factual information
- Includes source URLs and metadata

---

## 💰 Pricing Summary

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Gemini API** | 1,500 req/day | Pay-as-you-go |
| **Vercel Hosting** | 100GB bandwidth | $20/mo Pro |

**For personal projects, the free tiers are more than enough!**

---

## 🔧 Troubleshooting

### "API key not valid"
- Double-check the key is correct in Vercel environment variables
- Ensure there are no extra spaces
- **Redeploy** after adding/changing env vars

### "No results found"
- Try different search terms
- Check if Gemini API is accessible in your region
- Verify the API key has the correct permissions

### Build fails on Vercel
- Check the build logs for specific errors
- Ensure all files are committed to GitHub
- Try deleting `node_modules` and `package-lock.json`, then reinstall

### Rate limit errors
- Free tier: 15 requests/minute
- Add delays between searches if hitting limits
- Consider upgrading for higher limits

---

## 🔄 Making Updates

After changing code:
```bash
git add .
git commit -m "Your changes"
git push
```
Vercel **auto-deploys** on every push to `main`!

---

## 🛡️ Security Notes

- ✅ API key is stored in environment variables (never in code)
- ✅ API calls happen server-side (key not exposed to browser)
- ✅ `.env.local` is in `.gitignore` (never committed)

---

## 📚 Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://aistudio.google.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

## ✨ Features

- 🔍 **Keyword Search** - Search any news topic
- 📅 **Date Filtering** - Filter by date range
- 🔬 **Deep Research Mode** - Comprehensive multi-angle analysis
- 📊 **Export** - CSV, JSON, PDF formats
- 🎨 **Google-Style UI** - Clean, professional design
- ⚡ **Real-time Search** - Powered by Gemini's search grounding

---

Made with ❤️ using Next.js and Google Gemini AI
