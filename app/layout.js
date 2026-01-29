import './globals.css'

export const metadata = {
  title: 'News Scraper - AI-Powered News Search',
  description: 'Search and analyze news articles using AI. Export to CSV, JSON, or PDF. Supports Groq, OpenAI, Together AI, and OpenRouter.',
  keywords: 'news, scraper, ai, search, groq, openai, export',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Roboto:wght@300;400;500&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
