import './globals.css'

export const metadata = {
  title: 'News Scraper - Search News Articles',
  description: 'A powerful news scraper that searches news articles based on keywords and date ranges. Export results to CSV, JSON, or PDF.',
  keywords: 'news, scraper, search, articles, export, csv, json, pdf',
  authors: [{ name: 'News Scraper' }],
  openGraph: {
    title: 'News Scraper',
    description: 'Search and export news articles with ease',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Product+Sans:wght@400;500;700&family=Roboto:wght@300;400;500;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
