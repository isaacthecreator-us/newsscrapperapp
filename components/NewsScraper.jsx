'use client';

import React, { useState, useCallback } from 'react';
import { 
  Search, Calendar, Download, ExternalLink, Loader2, 
  FileText, FileJson, FileSpreadsheet, Clock, Building2, 
  ChevronDown, Sparkles, X, AlertCircle
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

  const performSearch = useCallback(async () => {
    if (!keywords.trim()) {
      setError('Please enter search keywords');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults([]);
    setSearchMeta(null);
    setSearchProgress(deepResearch ? 'Conducting deep research with Gemini AI...' : 'Searching news sources...');

    try {
      const startTime = Date.now();

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: keywords,
          dateFrom,
          dateTo,
          deepResearch
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const searchTime = ((Date.now() - startTime) / 1000).toFixed(2);

      setResults(data.articles || []);
      setSearchMeta({
        summary: data.searchSummary || '',
        totalSources: data.totalSources || data.articles?.length || 0,
        searchTime,
        groundingInfo: data.groundingMetadata
      });

    } catch (err) {
      setError(err.message || 'An error occurred during search');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
      setSearchProgress('');
    }
  }, [keywords, dateFrom, dateTo, deepResearch]);

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
    .meta { color: #5F6368; font-size: 12px; margin-bottom: 30px; padding: 15px; background: #F8F9FA; border-radius: 8px; }
    .article { margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #DFE1E5; }
    .article-title { font-size: 18px; color: #1A0DAB; margin-bottom: 5px; }
    .article-meta { font-size: 12px; color: #5F6368; margin-bottom: 8px; }
    .article-meta span { margin-right: 15px; }
    .article-summary { font-size: 14px; line-height: 1.6; color: #4D5156; }
    .article-url { font-size: 12px; color: #188038; word-break: break-all; margin-top: 8px; }
    .relevance { display: inline-block; background: #E8F0FE; color: #1967D2; padding: 2px 8px; border-radius: 10px; font-size: 11px; }
    @media print { body { padding: 20px; } .meta { background: #fff; border: 1px solid #DFE1E5; } }
  </style>
</head>
<body>
  <h1>📰 News Search Results</h1>
  <div class="meta">
    <p><strong>Search Query:</strong> ${keywords}</p>
    ${dateFrom || dateTo ? `<p><strong>Date Range:</strong> ${dateFrom || 'Any'} → ${dateTo || 'Any'}</p>` : ''}
    <p><strong>Total Results:</strong> ${results.length} articles</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Powered by:</strong> Google Gemini AI</p>
  </div>
  ${results.map((r, i) => `
    <div class="article">
      <div class="article-title">${i + 1}. ${r.title || 'Untitled'}</div>
      <div class="article-meta">
        <span>📰 ${r.publisher || 'Unknown'}</span>
        <span>📅 ${r.publishedDate || 'Unknown date'}${r.publishedTime ? ' at ' + r.publishedTime : ''}</span>
        ${r.relevanceScore ? `<span class="relevance">${r.relevanceScore}% relevant</span>` : ''}
      </div>
      <div class="article-summary">${r.summary || 'No summary available'}</div>
      <div class="article-url">🔗 <a href="${r.url}">${r.url || 'No URL'}</a></div>
    </div>
  `).join('')}
  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #DFE1E5; font-size: 11px; color: #5F6368; text-align: center;">
    Generated by News Scraper • Powered by Google Gemini AI
  </footer>
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
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Google Sans', 'Roboto', sans-serif" }}>
      {/* Header */}
      <header className="border-b sticky top-0 bg-white z-50 shadow-sm" style={{ borderColor: COLORS.borderGray }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex">
              <span style={{ color: COLORS.blue, fontSize: '26px', fontWeight: 500 }}>N</span>
              <span style={{ color: COLORS.red, fontSize: '26px', fontWeight: 500 }}>e</span>
              <span style={{ color: COLORS.yellow, fontSize: '26px', fontWeight: 500 }}>w</span>
              <span style={{ color: COLORS.blue, fontSize: '26px', fontWeight: 500 }}>s</span>
            </div>
            <span style={{ color: COLORS.lightGray, fontSize: '20px', fontWeight: 400 }}>Scraper</span>
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full" style={{ background: '#E8F0FE', color: COLORS.blue }}>
              Gemini AI
            </span>
          </div>

          {/* Deep Research Toggle */}
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
            className="flex items-center border rounded-full px-5 py-3 mb-4 transition-all focus-within:shadow-lg"
            style={{ borderColor: COLORS.borderGray, boxShadow: '0 2px 8px rgba(32,33,36,0.1)' }}
          >
            <Search size={20} color={COLORS.lightGray} />
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
                className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                style={{ borderColor: COLORS.borderGray }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: COLORS.lightGray }}>To:</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                style={{ borderColor: COLORS.borderGray }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={performSearch}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-md transition-all disabled:opacity-50"
              style={{
                background: COLORS.blue,
                color: '#fff',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              {isLoading ? 'Searching...' : 'Search News'}
            </button>

            {results.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md transition-all border"
                  style={{ borderColor: COLORS.borderGray, color: COLORS.darkGray }}
                >
                  <Download size={18} />
                  Export
                  <ChevronDown size={16} />
                </button>

                {showExportMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border z-50 overflow-hidden" style={{ borderColor: COLORS.borderGray, minWidth: '150px' }}>
                      {[
                        { icon: FileSpreadsheet, color: COLORS.green, label: 'CSV', action: exportToCSV },
                        { icon: FileJson, color: COLORS.yellow, label: 'JSON', action: exportToJSON },
                        { icon: FileText, color: COLORS.red, label: 'PDF', action: exportToPDF },
                      ].map(({ icon: Icon, color, label, action }) => (
                        <button
                          key={label}
                          onClick={() => { action(); setShowExportMenu(false); }}
                          className="w-full px-4 py-3 flex items-center gap-3 text-sm hover:bg-gray-50 transition-colors"
                          style={{ color: COLORS.darkGray }}
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
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle size={20} />
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="flex justify-center gap-2 mb-6">
              {[COLORS.blue, COLORS.red, COLORS.yellow, COLORS.green].map((color, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full animate-bounce"
                  style={{ background: color, animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-sm" style={{ color: COLORS.lightGray }}>{searchProgress}</p>
            <p className="text-xs mt-2" style={{ color: COLORS.borderGray }}>
              Gemini AI is searching and analyzing news sources...
            </p>
          </div>
        )}

        {/* Search Summary */}
        {searchMeta && !isLoading && (
          <div className="mb-6 p-4 rounded-lg border-l-4" style={{ background: '#E8F5E9', borderColor: COLORS.green }}>
            <p className="text-sm font-medium mb-1" style={{ color: COLORS.darkGray }}>
              Found {results.length} articles in {searchMeta.searchTime}s
            </p>
            {searchMeta.summary && (
              <p className="text-sm mt-2" style={{ color: COLORS.lightGray }}>{searchMeta.summary}</p>
            )}
          </div>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <div className="space-y-6">
            {results.map((article, index) => (
              <article
                key={index}
                className="pb-6 group"
                style={{ borderBottom: index < results.length - 1 ? `1px solid ${COLORS.borderGray}` : 'none' }}
              >
                {/* Meta */}
                <div className="flex items-center gap-2 mb-2 flex-wrap text-xs">
                  <div className="flex items-center gap-1.5">
                    <Building2 size={14} color={COLORS.lightGray} />
                    <span className="font-medium" style={{ color: COLORS.darkGray }}>
                      {article.publisher || 'Unknown'}
                    </span>
                  </div>
                  <span style={{ color: COLORS.borderGray }}>•</span>
                  <div className="flex items-center gap-1">
                    <Clock size={14} color={COLORS.lightGray} />
                    <span style={{ color: COLORS.lightGray }}>
                      {article.publishedDate || 'Unknown date'}
                      {article.publishedTime && ` · ${article.publishedTime}`}
                    </span>
                  </div>
                  {article.relevanceScore && (
                    <>
                      <span style={{ color: COLORS.borderGray }}>•</span>
                      <span
                        className="px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: article.relevanceScore >= 80 ? '#E8F5E9' : article.relevanceScore >= 50 ? '#FFF8E1' : '#FFEBEE',
                          color: article.relevanceScore >= 80 ? COLORS.green : article.relevanceScore >= 50 ? '#F9A825' : COLORS.red
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
                  className="block text-lg font-normal mb-2 hover:underline transition-colors"
                  style={{ color: '#1A0DAB', lineHeight: 1.3 }}
                >
                  {article.title || 'Untitled Article'}
                </a>

                {/* URL */}
                <div className="flex items-center gap-1.5 mb-2">
                  <ExternalLink size={12} color="#188038" />
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs truncate max-w-lg hover:underline"
                    style={{ color: '#188038' }}
                  >
                    {article.url}
                  </a>
                </div>

                {/* Summary */}
                <p className="text-sm leading-relaxed" style={{ color: '#4D5156' }}>
                  {article.summary || 'No summary available'}
                </p>
              </article>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && results.length === 0 && !error && !keywords && (
          <div className="text-center py-20">
            <div
              className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ background: COLORS.bgGray }}
            >
              <Search size={40} color={COLORS.borderGray} />
            </div>
            <h2 className="text-xl mb-2 font-normal" style={{ color: COLORS.darkGray }}>
              Search news with AI
            </h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: COLORS.lightGray }}>
              Enter keywords to search across news sources using Google Gemini AI. 
              Enable Deep Research for comprehensive, multi-perspective coverage.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-4 px-6 mt-auto" style={{ borderColor: COLORS.borderGray, background: COLORS.bgGray }}>
        <div className="max-w-5xl mx-auto flex justify-between items-center text-xs" style={{ color: COLORS.lightGray }}>
          <span>Powered by Google Gemini AI with Search Grounding</span>
          <span>Export: CSV · JSON · PDF</span>
        </div>
      </footer>
    </div>
  );
}
