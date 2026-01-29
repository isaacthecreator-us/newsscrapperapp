import { NextResponse } from 'next/server';

// ============================================
// PROVIDER CONFIGURATIONS
// ============================================

const AI_PROVIDERS = {
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
    keyEnv: 'GROQ_API_KEY',
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    models: ['gpt-4o-mini', 'gpt-3.5-turbo'],
    keyEnv: 'OPENAI_API_KEY',
  },
  together: {
    url: 'https://api.together.xyz/v1/chat/completions',
    models: ['meta-llama/Llama-3.3-70B-Instruct-Turbo'],
    keyEnv: 'TOGETHER_API_KEY',
  },
  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    models: ['meta-llama/llama-3.3-70b-instruct:free', 'google/gemini-2.0-flash-exp:free'],
    keyEnv: 'OPENROUTER_API_KEY',
  },
};

// ============================================
// GNEWS API - Real articles with working links
// ============================================

async function fetchGNews(query, apiKey, dateFrom, dateTo, maxResults = 10) {
  const params = new URLSearchParams({
    q: query,
    lang: 'en',
    max: Math.min(maxResults, 10).toString(), // GNews max is 10 per request
    apikey: apiKey,
  });

  if (dateFrom) params.append('from', dateFrom);
  if (dateTo) params.append('to', dateTo);

  const response = await fetch(`https://gnews.io/api/v4/search?${params}`);
  const data = await response.json();

  if (data.errors || !data.articles) {
    throw new Error(data.errors?.[0] || 'GNews API error');
  }

  return data.articles.map((article, index) => ({
    title: article.title,
    publisher: article.source?.name || 'Unknown',
    publishedDate: new Date(article.publishedAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    }),
    publishedTime: new Date(article.publishedAt).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    }),
    url: article.url,
    summary: article.description || article.content?.substring(0, 200) || '',
    image: article.image,
    relevanceScore: Math.max(98 - (index * 3), 60),
    source: 'gnews'
  }));
}

// Fetch multiple pages/variations from GNews to get more results
async function fetchGNewsMultiple(query, apiKey, dateFrom, dateTo, targetResults = 20) {
  const allArticles = [];
  const seenUrls = new Set();

  // Different query variations to get more diverse results
  const queries = [
    query,
    `${query} latest`,
    `${query} news`,
    `${query} update`,
  ];

  const fetchPromises = queries.slice(0, 3).map(async (q, index) => {
    try {
      // Stagger requests slightly to avoid rate limits
      await new Promise(r => setTimeout(r, index * 100));
      return await fetchGNews(q, apiKey, dateFrom, dateTo, 10);
    } catch (e) {
      console.error(`GNews query "${q}" failed:`, e.message);
      return [];
    }
  });

  const results = await Promise.all(fetchPromises);
  
  for (const articles of results) {
    for (const article of articles) {
      if (!seenUrls.has(article.url)) {
        seenUrls.add(article.url);
        allArticles.push(article);
      }
    }
  }

  return allArticles.slice(0, targetResults);
}

// ============================================
// AI PROVIDERS - For enhanced summaries
// ============================================

async function callAIProvider(provider, apiKey, model, prompt, timeout = 10000) {
  const config = AI_PROVIDERS[provider];
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = process.env.SITE_URL || 'http://localhost:3000';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4096,
      })
    });

    clearTimeout(timeoutId);
    return { provider, model, data: await response.json() };
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

// Race multiple AI providers - use fastest response
async function raceAIProviders(prompt, timeout = 15000) {
  const availableProviders = [];

  for (const [name, config] of Object.entries(AI_PROVIDERS)) {
    const key = process.env[config.keyEnv];
    if (key) {
      availableProviders.push({ name, key, models: config.models });
    }
  }

  if (availableProviders.length === 0) {
    return null;
  }

  // Create race promises for all available providers
  const racePromises = [];

  for (const provider of availableProviders) {
    for (const model of provider.models.slice(0, 1)) { // Use first model only for speed
      racePromises.push(
        callAIProvider(provider.name, provider.key, model, prompt, timeout)
          .then(result => {
            if (result.data.choices?.[0]?.message?.content) {
              return result;
            }
            throw new Error('No content in response');
          })
          .catch(e => {
            console.log(`${provider.name}/${model} failed:`, e.message);
            throw e;
          })
      );
    }
  }

  // Race all providers - first successful response wins
  try {
    return await Promise.any(racePromises);
  } catch (e) {
    console.error('All AI providers failed');
    return null;
  }
}

// ============================================
// AI-ONLY SEARCH (fallback when no GNews key)
// ============================================

async function searchWithAIOnly(query, dateFrom, dateTo, deepResearch) {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  let dateContext = '';
  if (dateFrom && dateTo) {
    dateContext = `Focus on news published between ${dateFrom} and ${dateTo}.`;
  } else if (dateFrom) {
    dateContext = `Focus on news published after ${dateFrom}.`;
  } else if (dateTo) {
    dateContext = `Focus on news published before ${dateTo}.`;
  }

  const prompt = `You are a news research assistant. Today is ${currentDate}.

Search for 20+ news articles about: "${query}"

${dateContext}
${deepResearch ? 'Provide comprehensive coverage with multiple perspectives.' : ''}

For EACH article provide:
- title: Realistic headline
- publisher: Real news org (BBC, Reuters, CNN, NYT, AP, Bloomberg, etc.)
- publishedDate: Recent realistic date (e.g., "Jan 28, 2025")
- publishedTime: Time (e.g., "2:30 PM")
- url: Realistic URL for that publisher
- summary: 2-3 sentence summary
- relevanceScore: 60-98

Return ONLY valid JSON:
{
  "articles": [...],
  "searchSummary": "Overview of coverage"
}

Provide at least 15-20 articles from diverse sources.`;

  const result = await raceAIProviders(prompt);
  
  if (!result) {
    throw new Error('No AI provider available');
  }

  const content = result.data.choices[0].message.content;
  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error('Could not parse AI response');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  
  return {
    articles: (parsed.articles || []).map(a => ({ ...a, source: 'ai' })),
    searchSummary: parsed.searchSummary || '',
    provider: result.provider,
    model: result.model
  };
}

// ============================================
// ENHANCE ARTICLES WITH AI SUMMARIES
// ============================================

async function enhanceWithAI(articles, query) {
  if (articles.length === 0) return articles;

  const prompt = `Analyze these news articles about "${query}" and provide enhanced summaries.

Articles:
${articles.slice(0, 15).map((a, i) => `${i + 1}. "${a.title}" - ${a.publisher}`).join('\n')}

Return JSON array with enhanced 2-3 sentence summaries for each:
{
  "summaries": ["summary1", "summary2", ...],
  "overallAnalysis": "Brief analysis of the news coverage"
}`;

  try {
    const result = await raceAIProviders(prompt, 10000);
    if (result) {
      const content = result.data.choices[0].message.content;
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.summaries) {
          articles.forEach((article, i) => {
            if (parsed.summaries[i]) {
              article.summary = parsed.summaries[i];
            }
          });
        }
        return { articles, analysis: parsed.overallAnalysis };
      }
    }
  } catch (e) {
    console.log('AI enhancement failed, using original summaries');
  }

  return { articles, analysis: null };
}

// ============================================
// MAIN API HANDLER
// ============================================

export async function POST(request) {
  const startTime = Date.now();
  const { query, dateFrom, dateTo, deepResearch } = await request.json();

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  const gnewsKey = process.env.GNEWS_API_KEY;
  const hasAnyAI = Object.values(AI_PROVIDERS).some(p => process.env[p.keyEnv]);

  // No API keys at all
  if (!gnewsKey && !hasAnyAI) {
    return NextResponse.json({
      error: 'No API keys configured',
      setup: {
        gnews: 'Get free key (100 req/day) at https://gnews.io',
        groq: 'Get free key at https://console.groq.com/keys',
        openrouter: 'Free models at https://openrouter.ai/keys'
      }
    }, { status: 500 });
  }

  try {
    let articles = [];
    let searchSummary = '';
    let provider = null;
    let model = null;

    // Strategy: Use GNews for real links, AI for fallback/enhancement
    if (gnewsKey) {
      console.log('Fetching from GNews...');
      
      try {
        // Fetch real articles from GNews
        articles = await fetchGNewsMultiple(
          query, 
          gnewsKey, 
          dateFrom, 
          dateTo, 
          deepResearch ? 25 : 15
        );
        provider = 'gnews';

        // Optionally enhance with AI summaries
        if (hasAnyAI && articles.length > 0) {
          console.log('Enhancing with AI...');
          const enhanced = await enhanceWithAI(articles, query);
          articles = enhanced.articles;
          searchSummary = enhanced.analysis || `Found ${articles.length} articles about "${query}"`;
        } else {
          searchSummary = `Found ${articles.length} articles about "${query}"`;
        }

      } catch (gnewsError) {
        console.error('GNews failed:', gnewsError.message);
        
        // Fallback to AI-only if GNews fails
        if (hasAnyAI) {
          console.log('Falling back to AI-only search...');
          const aiResult = await searchWithAIOnly(query, dateFrom, dateTo, deepResearch);
          articles = aiResult.articles;
          searchSummary = aiResult.searchSummary;
          provider = aiResult.provider;
          model = aiResult.model;
        } else {
          throw gnewsError;
        }
      }
    } else {
      // No GNews key - use AI only
      console.log('Using AI-only search...');
      const aiResult = await searchWithAIOnly(query, dateFrom, dateTo, deepResearch);
      articles = aiResult.articles;
      searchSummary = aiResult.searchSummary;
      provider = aiResult.provider;
      model = aiResult.model;
    }

    // Date filtering (extra safety)
    if (dateFrom || dateTo) {
      articles = articles.filter(article => {
        if (!article.publishedDate) return true;
        const articleDate = new Date(article.publishedDate);
        if (isNaN(articleDate.getTime())) return true;
        if (dateFrom && new Date(dateFrom) > articleDate) return false;
        if (dateTo && new Date(dateTo) < articleDate) return false;
        return true;
      });
    }

    // Sort by relevance
    articles.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    const searchTime = ((Date.now() - startTime) / 1000).toFixed(2);

    return NextResponse.json({
      articles,
      searchSummary,
      totalResults: articles.length,
      provider,
      model,
      searchTime,
      sources: {
        gnews: articles.filter(a => a.source === 'gnews').length,
        ai: articles.filter(a => a.source === 'ai').length
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ 
      error: error.message || 'Search failed',
      suggestion: 'Try adding a GNews API key for real article links'
    }, { status: 500 });
  }
}
