# 📰 Google News Scraper

A beautiful, Google-styled news scraper web application that searches news articles based on keywords and date ranges. Built with Next.js and powered by Google Custom Search API.

![News Scraper Preview](https://via.placeholder.com/800x400/4285F4/FFFFFF?text=News+Scraper)

## ✨ Features

- 🔍 **Keyword Search** - Search across multiple news sources
- 📅 **Date Range Filtering** - Filter results by specific date ranges
- 🔬 **Deep Research Mode** - Comprehensive multi-angle searches for thorough coverage
- 📊 **Export Options** - Download results as CSV, JSON, or PDF
- 🎨 **Google-Inspired Design** - Clean, professional UI matching Google's design language
- 📱 **Responsive** - Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Google Cloud Account
- Google Custom Search API enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/google-news-scraper.git
   cd google-news-scraper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your Google API credentials:
   ```
   GOOGLE_API_KEY=your_api_key
   GOOGLE_CX=your_search_engine_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Getting Google API Credentials

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project

### 2. Enable Custom Search API
1. Go to **APIs & Services** → **Library**
2. Search for "Custom Search API"
3. Click **Enable**

### 3. Create API Key
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy the key

### 4. Create Search Engine
1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/cse/all)
2. Click **Add** to create a new search engine
3. Copy the **Search Engine ID (cx)**

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `GOOGLE_API_KEY`
   - `GOOGLE_CX`
5. Deploy!

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API**: Google Custom Search API

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   └── search/
│   │       └── route.js      # API endpoint for Google Search
│   ├── globals.css           # Global styles
│   ├── layout.js             # Root layout
│   └── page.js               # Home page
├── components/
│   └── NewsScraper.jsx       # Main scraper component
├── .env.example              # Environment variables template
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── package.json
```

## 💰 API Pricing

### Google Custom Search API
- **Free**: 100 queries/day
- **Paid**: $5 per 1,000 queries

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ using Next.js and Google Custom Search API
