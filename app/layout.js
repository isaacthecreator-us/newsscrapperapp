import './globals.css'

export const metadata = {
  title: 'News Scraper - Real Links + AI Search',
  description: 'Search news with real working links via GNews API + AI-powered summaries. Export to CSV, JSON, PDF.',
  keywords: 'news, scraper, gnews, ai, groq, search, articles',
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
