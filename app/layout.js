import './globals.css'

export const metadata = {
  title: 'News Scraper - Powered by Gemini AI',
  description: 'Search and analyze news articles using Google Gemini AI with web search grounding. Export results to CSV, JSON, or PDF.',
  keywords: 'news, scraper, gemini, google ai, search, articles, export',
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
