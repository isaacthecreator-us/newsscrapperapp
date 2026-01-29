'use client';

import React, { useState, useCallback } from 'react';
import { 
  Search, Calendar, Download, ExternalLink, Loader2, 
  FileText, FileJson, FileSpreadsheet, Clock, Building2, 
  ChevronDown, Sparkles, X, RefreshCw, ChevronRight
} from 'lucide-react';

// Google Colors
const COLORS = {
  blue: '#4285F4',
  red: '#EA4335',
  yellow: '#FBBC05',
  green: '#34A853',
  darkGray: '#202124',
  lightGray: '#5F6368',
  bgGray: '#F8F9FA',
  borderGray: '#DFE1E5',
  hoverGray: '#E8EAED',
};

export default function NewsScraper() {
  const [keywords, setKeywords] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchMeta, setSearchMeta] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [deepResearch, setDeepResearch] = useState(true);
  const [searchProgress, setSearchProgress] = useState('');
  const [nextPageStart, setNextPageStart] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const performSearch = useCallback(async (loadMore = false) => {
    if (!keywords.trim()) {
      setError('Please enter search keywords');
      return;
    }

    if (loadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setResults([]);
      setSearchMeta(null);
      setNextPageStart(null);
    }
    
    setError('');
    setSearchProgress('Searching news sources...');

    try {
      const searchQueries = deepResearch && !loadMore
        ? [
            keywords,
            `${keywords} latest`,
            `${keywords} breaking news`,
            `${keywords} update`
          ]
        : [keywords];

      let allArticles = loadMore ? [...results] : [];
      let totalSearchTime = 0;
      let lastNextPage = null;

      for (let i = 0; i < searchQueries.length; i++) {
        const query = searchQueries[i];
        setSearchProgress(
          deepResearch && !loadMore
            ? `Deep research: searching "${query}" (${i + 1}/${searchQueries.length})...`
            : 'Fetching results...'
        );

        const params = new URLSearchParams({
          q: query,
          ...(dateFrom && { dateFrom }),
          ...(dateTo && { dateTo }),
          ...(loadMore && nextPageStart && { start: nextPageStart.toString() })
        });

        const response = await fetch(`/api/search?${params}`);
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.articles) {
          // Add articles, avoiding duplicates by URL
          const existingUrls = new Set(allArticles.map(a => a.url));
          const newArticles = data.articles.filter(a => !existingUrls.has(a.url));
          allArticles = [...allArticles, ...newArticles];
        }

        if (data.searchInfo) {
          totalSearchTime += data.searchInfo.searchTime || 0;
        }

        if (data.nextPage) {
          lastNextPage = data.nextPage;
        }

        // Small delay between requests to avoid rate limiting
        if (i < searchQueries.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      // Sort by relevance score
      allArticles.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

      setResults(allArticles);
      setNextPageStart(lastNextPage);
      setSearchMeta({
        totalResults: allArticles.length,
        searchTime: totalSearchTime.toFixed(2),
        query: keywords
      });

    } catch (err) {
      setError(err.message || 'An error occurred during search');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setSearchProgress('');
    }
  }, [keywords, dateFrom, dateTo, deepResearch, results, nextPageStart]);

  const loadMoreResults = () => {
    if (nextPageStart && !isLoadingMore) {
      performSearch(true);
    }
  };

  const exportToCSV = () => {
    const headers = ['Title', 'Publisher', 'Date', 'Time', 'URL', 'Summary', 'Relevance Score'];
    const csvContent = [
      headers.join(','),
      ...results.map(r => [
        `"${(r.title || '').replace(/"/g, '""')}"`,
        `"${(r.publisher || '').replace(/"/g, '""')}"`,
        `"${r.publishedDate || ''}"`,
        `"${r.publishedTime || ''}"`,
        `"${r.url || ''}"`,
        `"${(r.summary || '').replace(/"/g, '""')}"`,
        r.relevanceScore || ''
      ].join(','))
    ].join('\n');

    downloadFile(csvContent, 'news-results.csv', 'text/csv');
  };

  const exportToJSON = () => {
    const exportData = {
      searchQuery: keywords,
      dateRange: { from: dateFrom, to: dateTo },
      exportedAt: new Date().toISOString(),
      totalResults: results.length,
      articles: results
    };
    downloadFile(JSON.stringify(exportData, null, 2), 'news-results.json', 'application/json');
  };

  const exportToPDF = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>News Search Results - ${keywords}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
    body { font-family: 'Roboto', sans-serif; padding: 40px; color: #202124; max-width: 800px; margin: 0 auto; }
    h1 { color: #4285F4; font-size: 24px; border-bottom: 2px solid #4285F4; padding-bottom: 10px; }
    .meta { color: #5F6368; font-size: 12px; margin-bottom: 30px; }
    .article { margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #DFE1E5; }
    .article-title { font-size: 18px; color: #1A0DAB; margin-bottom: 5px; }
    .article-meta { font-size: 12px; color: #5F6368; margin-bottom: 8px; }
    .article-meta span { margin-right: 15px; }
    .article-summary { font-size: 14px; line-height: 1.5; color: #4D5156; }
    .article-url { font-size: 12px; color: #188038; word-break: break-all; }
    .relevance { display: inline-block; background: #E8F0FE; color: #1967D2; padding: 2px 8px; border-radius: 10px; font-size: 11px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>📰 News Search Results</h1>
  <div class="meta">
    <p><strong>Search Query:</strong> ${keywords}</p>
    ${dateFrom || dateTo ? `<p><strong>Date Range:</strong> ${dateFrom || 'Any'} - ${dateTo || 'Any'}</p>` : ''}
    <p><strong>Total Results:</strong> ${results.length}</p>
    <p><strong>Exported:</strong> ${new Date().toLocaleString()}</p>
  </div>
  ${results.map((r, i) => `
    <div class="article">
      <div class="article-title">${i + 1}. ${r.title || 'Untitled'}</div>
      <div class="article-meta">
        <span>📰 ${r.publisher || 'Unknown'}</span>
        <span>📅 ${r.publishedDate || 'Unknown date'}${r.publishedTime ? ' at ' + r.publishedTime : ''}</span>
        ${r.relevanceScore ? `<span class="relevance">Relevance: ${r.relevanceScore}%</span>` : ''}
      </div>
      <div class="article-summary">${r.summary || 'No summary available'}</div>
      <div class="article-url">🔗 ${r.url || ''}</div>
    </div>
  `).join('')}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => printWindow.print();
    }
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearSearch = () => {
    setKeywords('');
    setDateFrom('');
    setDateTo('');
    setResults([]);
    setSearchMeta(null);
    setError('');
    setNextPageStart(null);
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Google Sans', 'Roboto', sans-serif" }}>
      {/* Header */}
      <header className="border-b sticky top-0 bg-white z-50" style={{ borderColor: COLORS.borderGray }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <span style={{ color: COLORS.blue, fontSize: '28px', fontWeight: 500 }}>N</span>
              <span style={{ color: COLORS.red, fontSize: '28px', fontWeight: 500 }}>e</span>
              <span style={{ color: COLORS.yellow, fontSize: '28px', fontWeight: 500 }}>w</span>
              <span style={{ color: COLORS.blue, fontSize: '28px', fontWeight: 500 }}>s</span>
            </div>
            <span style={{ color: COLORS.lightGray, fontSize: '22px', fontWeight: 400, marginLeft: '4px' }}>
              Scraper
            </span>
          </div>

          {/* Deep Research Toggle */}
          <div
            onClick={() => setDeepResearch(!deepResearch)}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all"
            style={{ background: deepResearch ? '#E8F0FE' : COLORS.bgGray }}
          >
            <Sparkles size={18} color={deepResearch ? COLORS.blue : COLORS.lightGray} />
            <span
              className="text-sm font-medium"
              style={{ color: deepResearch ? COLORS.blue : COLORS.lightGray }}
            >
              Deep Research {deepResearch ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Search Section */}
        <div className="mb-8">
          {/* Search Box */}
          <div
            className="flex items-center border rounded-full px-5 py-3 mb-4 transition-shadow"
            style={{
              borderColor: COLORS.borderGray,
              boxShadow: '0 1px 6px rgba(32,33,36,0.1)'
            }}
          >
            <Search size={20} color={COLORS.lightGray} />
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && performSearch()}
              placeholder="Search news topics..."
              className="flex-1 border-none outline-none text-base ml-3 bg-transparent"
              style={{ color: COLORS.darkGray }}
            />
            {keywords && (
              <button onClick={clearSearch} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={18} color={COLORS.lightGray} />
              </button>
            )}
          </div>

          {/* Date Range */}
          <div className="flex gap-4 items-center flex-wrap mb-5">
            <div className="flex items-center gap-2">
              <Calendar size={18} color={COLORS.lightGray} />
              <span className="text-sm" style={{ color: COLORS.lightGray }}>From:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm outline-none"
                style={{ borderColor: COLORS.borderGray, color: COLORS.darkGray }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: COLORS.lightGray }}>To:</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm outline-none"
                style={{ borderColor: COLORS.borderGray, color: COLORS.darkGray }}
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => performSearch()}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 text-sm rounded transition-all hover:shadow-md"
              style={{
                background: COLORS.bgGray,
                border: `1px solid ${COLORS.borderGray}`,
                color: COLORS.darkGray,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Search size={18} />
              )}
              {isLoading ? 'Searching...' : 'Search News'}
            </button>

            {results.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm text-white rounded transition-all hover:opacity-90"
                  style={{ background: COLORS.blue }}
                >
                  <Download size={18} />
                  Export
                  <ChevronDown size={16} />
                </button>

                {showExportMenu && (
                  <div
                    className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl overflow-hidden z-50"
                    style={{ minWidth: '160px' }}
                  >
                    <button
                      onClick={() => { exportToCSV(); setShowExportMenu(false); }}
                      className="w-full px-4 py-3 flex items-center gap-3 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: COLORS.darkGray }}
                    >
                      <FileSpreadsheet size={18} color={COLORS.green} />
                      Export CSV
                    </button>
                    <button
                      onClick={() => { exportToJSON(); setShowExportMenu(false); }}
                      className="w-full px-4 py-3 flex items-center gap-3 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: COLORS.darkGray }}
                    >
                      <FileJson size={18} color={COLORS.yellow} />
                      Export JSON
                    </button>
                    <button
                      onClick={() => { exportToPDF(); setShowExportMenu(false); }}
                      className="w-full px-4 py-3 flex items-center gap-3 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: COLORS.darkGray }}
                    >
                      <FileText size={18} color={COLORS.red} />
                      Export PDF
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 flex items-center gap-2 text-red-600 text-sm">
            <X size={18} />
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="flex justify-center gap-2 mb-6">
              {[COLORS.blue, COLORS.red, COLORS.yellow, COLORS.green].map((color, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: color,
                    animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite`
                  }}
                />
              ))}
            </div>
            <p className="text-sm" style={{ color: COLORS.lightGray }}>{searchProgress}</p>
          </div>
        )}

        {/* Search Meta */}
        {searchMeta && !isLoading && (
          <div
            className="mb-6 p-4 rounded-lg"
            style={{ background: '#E8F5E9', borderLeft: `4px solid ${COLORS.green}` }}
          >
            <p className="text-sm font-medium mb-1" style={{ color: COLORS.darkGray }}>
              Found {results.length} articles
              {searchMeta.searchTime && ` (${searchMeta.searchTime}s)`}
            </p>
            <p className="text-xs" style={{ color: COLORS.lightGray }}>
              Search query: "{searchMeta.query}"
              {deepResearch && ' • Deep research enabled'}
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <div className="space-y-6">
            {results.map((article, index) => (
              <article
                key={`${article.url}-${index}`}
                className="pb-6"
                style={{ borderBottom: index < results.length - 1 ? `1px solid ${COLORS.borderGray}` : 'none' }}
              >
                {/* Publisher & Date */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: COLORS.bgGray }}
                    >
                      <Building2 size={12} color={COLORS.lightGray} />
                    </div>
                    <span className="text-xs font-medium" style={{ color: COLORS.darkGray }}>
                      {article.publisher || 'Unknown Publisher'}
                    </span>
                  </div>
                  <span style={{ color: COLORS.borderGray }}>·</span>
                  <div className="flex items-center gap-1">
                    <Clock size={12} color={COLORS.lightGray} />
                    <span className="text-xs" style={{ color: COLORS.lightGray }}>
                      {article.publishedDate || 'Unknown date'}
                      {article.publishedTime && ` at ${article.publishedTime}`}
                    </span>
                  </div>
                  {article.relevanceScore && (
                    <>
                      <span style={{ color: COLORS.borderGray }}>·</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: article.relevanceScore >= 80 ? '#E8F5E9' : article.relevanceScore >= 50 ? '#FFF3E0' : '#FFEBEE',
                          color: article.relevanceScore >= 80 ? COLORS.green : article.relevanceScore >= 50 ? '#F57C00' : COLORS.red
                        }}
                      >
                        {article.relevanceScore}% match
                      </span>
                    </>
                  )}
                </div>

                {/* Title */}
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-lg mb-1.5 hover:underline"
                  style={{ color: '#1A0DAB', lineHeight: '1.3' }}
                >
                  {article.title || 'Untitled Article'}
                </a>

                {/* URL */}
                <div className="flex items-center gap-1 mb-2">
                  <ExternalLink size={12} color="#188038" />
                  <span
                    className="text-xs truncate max-w-md"
                    style={{ color: '#188038' }}
                  >
                    {article.url}
                  </span>
                </div>

                {/* Summary */}
                <p className="text-sm leading-relaxed" style={{ color: '#4D5156' }}>
                  {article.summary || 'No summary available'}
                </p>
              </article>
            ))}

            {/* Load More Button */}
            {nextPageStart && (
              <div className="text-center pt-4">
                <button
                  onClick={loadMoreResults}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm rounded-full transition-all hover:shadow-md"
                  style={{
                    background: COLORS.bgGray,
                    border: `1px solid ${COLORS.borderGray}`,
                    color: COLORS.blue,
                    cursor: isLoadingMore ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoadingMore ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                  {isLoadingMore ? 'Loading...' : 'Load More Results'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && results.length === 0 && !error && keywords === '' && (
          <div className="text-center py-20">
            <div
              className="w-28 h-28 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ background: COLORS.bgGray }}
            >
              <Search size={48} color={COLORS.borderGray} />
            </div>
            <h2 className="text-xl mb-2" style={{ color: COLORS.darkGray }}>
              Search for news articles
            </h2>
            <p className="text-sm max-w-sm mx-auto" style={{ color: COLORS.lightGray }}>
              Enter keywords to search across multiple news sources. Enable Deep Research for comprehensive coverage.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="border-t py-4 px-6"
        style={{ borderColor: COLORS.borderGray, background: COLORS.bgGray }}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap gap-3">
          <span className="text-xs" style={{ color: COLORS.lightGray }}>
            Powered by Google Custom Search API
          </span>
          <span className="text-xs" style={{ color: COLORS.lightGray }}>
            Export: CSV, JSON, PDF
          </span>
        </div>
      </footer>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}
