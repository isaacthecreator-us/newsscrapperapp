# 🚀 Google News Scraper - Deployment Guide

## Overview
This guide will help you deploy the News Scraper using Google's Custom Search API on Vercel (free tier available).

---

## 📋 Prerequisites

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **Google Cloud Account** - [Console](https://console.cloud.google.com/)
3. **Vercel Account** - [Sign up](https://vercel.com/) (free with GitHub)
4. **GitHub Account** - [Sign up](https://github.com/)

---

## 🔑 Step 1: Set Up Google Custom Search API

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Name it `news-scraper` and click **Create**

### 1.2 Enable Custom Search API
1. Go to **APIs & Services** → **Library**
2. Search for **"Custom Search API"**
3. Click on it and press **Enable**

### 1.3 Create API Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"API key"**
3. Copy your API key (you'll need this later)
4. (Optional) Click **"Edit API key"** to restrict it to Custom Search API only

### 1.4 Create a Custom Search Engine
1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/cse/all)
2. Click **"Add"** to create a new search engine
3. Under "Sites to search", enter `*` (or specific news sites)
4. Name it `News Search`
5. Click **Create**
6. Go to **Control Panel** → Copy your **Search Engine ID (cx)**

### 1.5 Configure for News Search
1. In the Control Panel, go to **Search features**
2. Enable **"Search the entire web"**
3. Under **Advanced**, you can restrict to news sites if desired

---

## 📁 Step 2: Project Setup

### 2.1 Create Project Folder
```bash
mkdir google-news-scraper
cd google-news-scraper
npm init -y
```

### 2.2 Install Dependencies
```bash
npm install next react react-dom lucide-react
npm install -D tailwindcss postcss autoprefixer @types/node @types/react
npx tailwindcss init -p
```

### 2.3 Update package.json
Replace the `scripts` section:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

### 2.4 Create Project Structure
```
google-news-scraper/
├── app/
│   ├── layout.js
│   ├── page.js
│   ├── globals.css
│   └── api/
│       └── search/
│           └── route.js
├── components/
│   └── NewsScraper.jsx
├── .env.local (create this - DO NOT commit to git)
├── .gitignore
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🔐 Step 3: Environment Variables

### 3.1 Create `.env.local` file (LOCAL DEVELOPMENT)
```env
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CX=your_search_engine_id_here
```

### 3.2 Create `.gitignore`
```
node_modules
.next
.env.local
.env*.local
```

⚠️ **NEVER commit your API keys to GitHub!**

---

## 🌐 Step 4: Deploy to Vercel

### 4.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/google-news-scraper.git
git push -u origin main
```

### 4.2 Deploy on Vercel
1. Go to [vercel.com](https://vercel.com/) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your `google-news-scraper` repository
4. **Before deploying**, add Environment Variables:
   - Click **"Environment Variables"**
   - Add `GOOGLE_API_KEY` = your API key
   - Add `GOOGLE_CX` = your Search Engine ID
5. Click **Deploy**

### 4.3 Your App is Live! 🎉
Vercel will give you a URL like: `https://google-news-scraper.vercel.app`

---

## 💰 API Pricing & Limits

### Google Custom Search API
- **Free Tier**: 100 queries/day
- **Paid**: $5 per 1,000 queries (up to 10,000/day)
- Enable billing in Google Cloud Console if you need more

### Vercel
- **Free Tier (Hobby)**: Generous limits for personal projects
- Includes SSL, CDN, and automatic deployments

---

## 🔧 Troubleshooting

### "API key not valid"
- Check that Custom Search API is enabled
- Verify the API key is correct in Vercel environment variables
- Redeploy after adding environment variables

### "No results found"
- Verify your Search Engine ID (cx) is correct
- Check that "Search the entire web" is enabled in your search engine settings

### Build Errors
- Make sure all files are saved with correct names
- Run `npm install` to ensure all dependencies are installed
- Check for typos in import statements

---

## 📚 Additional Resources

- [Google Custom Search API Docs](https://developers.google.com/custom-search/v1/overview)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

## 🔄 Updating Your App

After making changes:
```bash
git add .
git commit -m "Your update message"
git push
```
Vercel automatically redeploys when you push to GitHub!
