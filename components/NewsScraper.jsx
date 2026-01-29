'use client';

import React, { useState, useCallback } from 'react';
import { 
  Search, Calendar, Download, ExternalLink, Loader2, 
  FileText, FileJson, FileSpreadsheet, Clock, Building2, 
  ChevronDown, Sparkles, X, AlertCircle, Zap, Newspaper,
  CheckCircle, Link2
} from 'lucide-react';

const COLORS = {
  blue: '#4285F4',
  red: '#EA4335',
  yellow: '#FBBC05',
  green: '#34A853',
  darkGray: '#202124',
  lightGray: '#5F6368',
  bgGray: '#F8F9FA',
  borderGray: '#DFE1E5',
};

const PROVIDER_INFO = {
  gnews: { color: '#10B981', label: 'GNews', icon: '📰' },
  groq: { color: '#F55036', label: 'Groq', icon: '⚡' },
  openai: { color: '#10A37F', label: 'OpenAI', icon: '🤖' },
  together: { color: '#6366F1', label: 'Together', icon: '🚀' },
  openrouter: { color: '#8B5CF6', label: 'OpenRouter', icon: '🔗' },
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

  const performSearch = useCallback(async () => {
    if (!keywords.trim()) {
      setError('Please enter search keywords');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults([]);
    setSearchMeta(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: keywords, dateFrom, dateTo, deepResearch })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data.articles || []);
      setSearchMeta({
        summary: data.searchSummary || '',
        totalResults: data.totalResults || data.articles?.length || 0,
        searchTime: data.searchTime,
        provider: data.provider,
        model: data.model,
        sources: data.sources
      });

    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [keywords, dateFrom, dateTo, deepResearch]);

  const exportToCSV = () => {
    const headers = ['Title', 'Publisher', 'Date', 'Time', 'URL', 'Summary', 'Relevance'];
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
  <title>News Results - ${keywords}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 40px; color: #202124; max-width: 850px; margin: 0 auto; line-height: 1.5; }
    h1 { color: #4285F4; font-size: 24px; border-bottom: 3px solid #4285F4; padding-bottom: 12px; margin-bottom: 20px; }
    .meta { color: #5F6368; font-size: 13px; margin-bottom: 30px; padding: 16px; background: #F8F9FA; border-radius: 8px; }
    .meta p { margin: 6px 0; }
    .article { margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px solid #E0E0E0; }
    .article:last-child { border-bottom: none; }
    .article-num { display: inline-block; background: #4285F4; color: white; width: 24px; height: 24px; border-radius: 50%; text-align: center; font-size: 12px; line-height: 24px; margin-right: 10px; }
    .article-title { font-size: 17px; color: #1A0DAB; margin-bottom: 8px; font-weight: 500; }
    .article-meta { font-size: 12px; color: #5F6368; margin-bottom: 10px; }
    .article-meta span { margin-right: 12px; }
    .article-summary { font-size: 14px; color: #4D5156; margin-bottom: 10px; }
    .article-url { font-size: 12px; color: #188038; word-break: break-all; }
    .verified { color: #34A853; font-weight: 500; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>📰 News Search Results</h1>
  <div class="meta">
    <p><strong>Search Query:</strong> ${keywords}</p>
    ${dateFrom || dateTo ? `<p><strong>Date Range:</strong> ${dateFrom || 'Any'} → ${dateTo || 'Any'}</p>` : ''}
    <p><strong>Total Results:</strong> ${results.length} articles</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
  </div>
  ${results.map((r, i) => `
    <div class="article">
      <div class="article-title"><span class="article-num">${i + 1}</span>${r.title || 'Untitled'}</div>
      <div class="article-meta">
        <span>📰 ${r.publisher || 'Unknown'}</span>
        <span>📅 ${r.publishedDate || 'Unknown'}${r.publishedTime ? ' · ' + r.publishedTime : ''}</span>
        ${r.source === 'gnews' ? '<span class="verified">✓ Verified Link</span>' : ''}
      </div>
      <div class="article-summary">${r.summary || 'No summary available'}</div>
      <div class="article-url">🔗 <a href="${r.url}">${r.url || 'No URL'}</a></div>
    </div>
  `).join('')}
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (w) w.onload = () => w.print();
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
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Google Sans', 'Roboto', sans-serif" }}>
      {/* Header */}
      <header className="border-b sticky top-0 bg-white z-50 shadow-sm" style={{ borderColor: COLORS.borderGray }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex">
              <span style={{ color: COLORS.blue, fontSize: '28px', fontWeight: 500 }}>N</span>
              <span style={{ color: COLORS.red, fontSize: '28px', fontWeight: 500 }}>e</span>
              <span style={{ color: COLORS.yellow, fontSize: '28px', fontWeight: 500 }}>w</span>
              <span style={{ color: COLORS.blue, fontSize: '28px', fontWeight: 500 }}>s</span>
            </div>
            <span style={{ color: COLORS.lightGray, fontSize: '22px' }}>Scraper</span>
          </div>

          <button
            onClick={() => setDeepResearch(!deepResearch)}
            className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
            style={{ 
              background: deepResearch ? '#E8F0FE' : COLORS.bgGray,
              border: `1px solid ${deepResearch ? COLORS.blue : COLORS.borderGray}`
            }}
          >
            <Sparkles size={18} color={deepResearch ? COLORS.blue : COLORS.lightGray} />
            <span className="text-sm font-medium" style={{ color: deepResearch ? COLORS.blue : COLORS.lightGray }}>
              Deep Research {deepResearch ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Search Box */}
        <div className="mb-8">
          <div
            className="flex items-center border rounded-full px-5 py-3.5 mb-4 transition-all focus-within:shadow-lg focus-within:border-blue-400"
            style={{ borderColor: COLORS.borderGray, boxShadow: '0 2px 8px rgba(32,33,36,0.08)' }}
          >
            <Search size={22} color={COLORS.lightGray} />
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && performSearch()}
              placeholder="Search for news topics..."
              className="flex-1 border-none outline-none text-base ml-3 bg-transparent"
              style={{ color: COLORS.darkGray }}
            />
            {keywords && (
              <button onClick={clearSearch} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <X size={18} color={COLORS.lightGray} />
              </button>
            )}
          </div>

          {/* Date Filters */}
          <div className="flex gap-4 items-center flex-wrap mb-6">
            <div className="flex items-center gap-2">
              <Calendar size={18} color={COLORS.lightGray} />
              <span className="text-sm" style={{ color: COLORS.lightGray }}>From:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                style={{ borderColor: COLORS.borderGray }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: COLORS.lightGray }}>To:</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                style={{ borderColor: COLORS.borderGray }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={performSearch}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-md transition-all disabled:opacity-50 hover:shadow-md"
              style={{ background: COLORS.blue, color: '#fff' }}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              {isLoading ? 'Searching...' : 'Search News'}
            </button>

            {results.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md border hover:bg-gray-50 transition-colors"
                  style={{ borderColor: COLORS.borderGray, color: COLORS.darkGray }}
                >
                  <Download size={18} />
                  Export
                  <ChevronDown size={16} />
                </button>

                {showExportMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border z-50 overflow-hidden" style={{ borderColor: COLORS.borderGray }}>
                      {[
                        { icon: FileSpreadsheet, color: COLORS.green, label: 'CSV', action: exportToCSV },
                        { icon: FileJson, color: COLORS.yellow, label: 'JSON', action: exportToJSON },
                        { icon: FileText, color: COLORS.red, label: 'PDF', action: exportToPDF },
                      ].map(({ icon: Icon, color, label, action }) => (
                        <button
                          key={label}
                          onClick={() => { action(); setShowExportMenu(false); }}
                          className="w-full px-4 py-3 flex items-center gap-3 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <Icon size={18} color={color} />
                          Export {label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-4 mb-6">
            <div className="flex items-start gap-3 text-red-700">
              <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
            <button onClick={performSearch} className="mt-3 text-sm text-red-700 hover:text-red-900 underline">
              Try again
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="flex justify-center gap-2 mb-6">
              {[COLORS.blue, COLORS.red, COLORS.yellow, COLORS.green].map((color, i) => (
                <div
                  key={i}
                  className="w-3.5 h-3.5 rounded-full animate-bounce"
                  style={{ background: color, animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </div>
            <p className="text-sm font-medium" style={{ color: COLORS.darkGray }}>Searching news sources...</p>
            <p className="text-xs mt-2" style={{ color: COLORS.lightGray }}>Racing APIs for fastest results</p>
          </div>
        )}

        {/* Search Summary */}
        {searchMeta && !isLoading && (
          <div className="mb-6 p-4 rounded-xl border" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: COLORS.green }}>
                  <CheckCircle size={20} color="white" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: COLORS.darkGray }}>
                    Found {searchMeta.totalResults} articles
                    <span className="font-normal ml-2" style={{ color: COLORS.lightGray }}>
                      in {searchMeta.searchTime}s
                    </span>
                  </p>
                  {searchMeta.sources && (
                    <p className="text-xs mt-0.5" style={{ color: COLORS.lightGray }}>
                      {searchMeta.sources.gnews > 0 && (
                        <span className="inline-flex items-center gap-1 mr-3">
                          <Link2 size={12} /> {searchMeta.sources.gnews} verified links
                        </span>
                      )}
                      {searchMeta.sources.ai > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Zap size={12} /> {searchMeta.sources.ai} AI-generated
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              
              {searchMeta.provider && (
                <div 
                  className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5"
                  style={{ 
                    background: `${PROVIDER_INFO[searchMeta.provider]?.color || COLORS.blue}15`,
                    color: PROVIDER_INFO[searchMeta.provider]?.color || COLORS.blue
                  }}
                >
                  <span>{PROVIDER_INFO[searchMeta.provider]?.icon || '⚡'}</span>
                  {PROVIDER_INFO[searchMeta.provider]?.label || searchMeta.provider}
                </div>
              )}
            </div>
            
            {searchMeta.summary && (
              <p className="text-sm mt-3 pl-13" style={{ color: COLORS.lightGray, marginLeft: '52px' }}>
                {searchMeta.summary}
              </p>
            )}
          </div>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <div className="space-y-5">
            {results.map((article, index) => (
              <article
                key={index}
                className="p-4 rounded-lg border transition-all hover:shadow-md hover:border-gray-300"
                style={{ borderColor: COLORS.borderGray, background: '#fff' }}
              >
                {/* Header Row */}
                <div className="flex items-center gap-2 mb-2 flex-wrap text-xs">
                  <div className="flex items-center gap-1.5">
                    <Building2 size={14} color={COLORS.lightGray} />
                    <span className="font-semibold" style={{ color: COLORS.darkGray }}>
                      {article.publisher || 'Unknown'}
                    </span>
                  </div>
                  <span style={{ color: COLORS.borderGray }}>•</span>
                  <div className="flex items-center gap-1">
                    <Clock size={13} color={COLORS.lightGray} />
                    <span style={{ color: COLORS.lightGray }}>
                      {article.publishedDate || 'Unknown'}
                      {article.publishedTime && ` · ${article.publishedTime}`}
                    </span>
                  </div>
                  
                  {/* Source Badge */}
                  {article.source === 'gnews' && (
                    <>
                      <span style={{ color: COLORS.borderGray }}>•</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: '#DCFCE7', color: '#15803D' }}>
                        <CheckCircle size={11} /> Verified
                      </span>
                    </>
                  )}
                  
                  {article.relevanceScore && (
                    <>
                      <span style={{ color: COLORS.borderGray }}>•</span>
                      <span
                        className="px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: article.relevanceScore >= 80 ? '#DCFCE7' : '#FEF9C3',
                          color: article.relevanceScore >= 80 ? '#15803D' : '#A16207'
                        }}
                      >
                        {article.relevanceScore}%
                      </span>
                    </>
                  )}
                </div>

                {/* Title */}
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-lg font-medium mb-2 hover:underline transition-colors"
                  style={{ color: '#1A0DAB', lineHeight: 1.35 }}
                >
                  {article.title || 'Untitled'}
                </a>

                {/* URL */}
                <div className="flex items-center gap-1.5 mb-2">
                  <ExternalLink size={13} color="#15803D" />
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs truncate hover:underline"
                    style={{ color: '#15803D', maxWidth: '90%' }}
                  >
                    {article.url}
                  </a>
                </div>

                {/* Summary */}
                <p className="text-sm leading-relaxed" style={{ color: '#4D5156' }}>
                  {article.summary || 'No summary available'}
                </p>

                {/* Image (if available) */}
                {article.image && (
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="mt-3 rounded-lg w-full h-40 object-cover"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
              </article>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && results.length === 0 && !error && !keywords && (
          <div className="text-center py-20">
            <div className="w-28 h-28 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: COLORS.bgGray }}>
              <Newspaper size={48} color={COLORS.borderGray} />
            </div>
            <h2 className="text-xl font-medium mb-2" style={{ color: COLORS.darkGray }}>Search News with AI</h2>
            <p className="text-sm max-w-md mx-auto mb-6" style={{ color: COLORS.lightGray }}>
              Get 15+ real news articles with verified working links. 
              Uses GNews API + AI for comprehensive coverage.
            </p>
            <div className="flex justify-center gap-2 text-xs" style={{ color: COLORS.lightGray }}>
              <span className="px-2 py-1 rounded-full" style={{ background: COLORS.bgGray }}>📰 GNews</span>
              <span className="px-2 py-1 rounded-full" style={{ background: COLORS.bgGray }}>⚡ Groq</span>
              <span className="px-2 py-1 rounded-full" style={{ background: COLORS.bgGray }}>🤖 OpenAI</span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-4 px-6 mt-auto" style={{ borderColor: COLORS.borderGray, background: COLORS.bgGray }}>
        <div className="max-w-5xl mx-auto flex justify-between items-center flex-wrap gap-2 text-xs" style={{ color: COLORS.lightGray }}>
          <span>Powered by GNews + AI (Groq, OpenAI, Together, OpenRouter)</span>
          <span>Export: CSV · JSON · PDF</span>
        </div>
      </footer>
    </div>
  );
}
