import { NextResponse } from 'next/server';

// Provider configurations
const PROVIDERS = {
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768'],
    keyEnv: 'GROQ_API_KEY',
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
    keyEnv: 'OPENAI_API_KEY',
  },
  together: {
    url: 'https://api.together.xyz/v1/chat/completions',
    models: ['meta-llama/Llama-3.3-70B-Instruct-Turbo', 'mistralai/Mixtral-8x7B-Instruct-v0.1'],
    keyEnv: 'TOGETHER_API_KEY',
  },
  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    models: ['meta-llama/llama-3.3-70b-instruct:free', 'google/gemini-2.0-flash-exp:free', 'deepseek/deepseek-r1:free'],
    keyEnv: 'OPENROUTER_API_KEY',
  },
};

async function callProvider(provider, apiKey, model, systemPrompt, userPrompt) {
  const config = PROVIDERS[provider];
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  // OpenRouter needs extra headers
  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = process.env.SITE_URL || 'http://localhost:3000';
    headers['X-Title'] = 'News Scraper';
  }

  const response = await fetch(config.url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4096,
    })
  });

  return response.json();
}

export async function POST(request) {
  const { query, dateFrom, dateTo, deepResearch } = await request.json();

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  // Find which provider has an API key configured
  let activeProvider = null;
  let apiKey = null;

  for (const [provider, config] of Object.entries(PROVIDERS)) {
    const key = process.env[config.keyEnv];
    if (key) {
      activeProvider = provider;
      apiKey = key;
      break;
    }
  }

  if (!activeProvider) {
    return NextResponse.json({
      error: 'No API key configured. Please set one of: GROQ_API_KEY, OPENAI_API_KEY, TOGETHER_API_KEY, or OPENROUTER_API_KEY',
      setup: {
        groq: 'Free at https://console.groq.com/keys',
        openrouter: 'Free models at https://openrouter.ai/keys',
        together: '$25 free at https://api.together.xyz',
        openai: 'Pay-as-you-go at https://platform.openai.com/api-keys'
      }
    }, { status: 500 });
  }

  try {
    // Build date context
    let dateContext = '';
    if (dateFrom && dateTo) {
      dateContext = `Focus on news published between ${dateFrom} and ${dateTo}.`;
    } else if (dateFrom) {
      dateContext = `Focus on news published after ${dateFrom}.`;
    } else if (dateTo) {
      dateContext = `Focus on news published before ${dateTo}.`;
    }

    const currentDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    const systemPrompt = `You are an expert news research assistant. Today's date is ${currentDate}.

Your task is to provide information about recent news articles on the given topic. Based on your training knowledge, provide realistic and helpful news article information.

INSTRUCTIONS:
1. ${deepResearch ? 'Provide comprehensive coverage with multiple perspectives and sources.' : 'Provide the most relevant recent news.'}
2. For each article, provide:
   - title: A realistic news headline
   - publisher: A real news organization (BBC, Reuters, CNN, NYT, etc.)
   - publishedDate: A realistic recent date
   - publishedTime: A time if appropriate
   - url: A realistic URL structure for that publisher
   - summary: 2-3 sentence summary
   - relevanceScore: 1-100 relevance rating

3. ${dateContext}
4. Use reputable, well-known news sources
5. Provide diverse perspectives

Return ONLY valid JSON in this exact format:
{
  "articles": [
    {
      "title": "Headline",
      "publisher": "Publisher Name",
      "publishedDate": "Jan 28, 2025",
      "publishedTime": "10:30 AM",
      "url": "https://publisher.com/article-slug",
      "summary": "Article summary here.",
      "relevanceScore": 95
    }
  ],
  "searchSummary": "Overview of the news landscape on this topic",
  "totalSources": 5
}`;

    const userPrompt = `Find news articles about: "${query}"

${dateContext}

${deepResearch ? 'Provide comprehensive deep research with multiple angles and sources.' : 'Find the most relevant recent articles.'}

Return JSON only, no other text.`;

    let data = null;
    let usedModel = null;
    let lastError = null;
    const config = PROVIDERS[activeProvider];

    // Try each model for the provider
    for (const model of config.models) {
      try {
        console.log(`Trying ${activeProvider}/${model}`);
        data = await callProvider(activeProvider, apiKey, model, systemPrompt, userPrompt);

        if (data.error) {
          console.log(`Error with ${model}:`, data.error);
          lastError = data.error;
          continue;
        }

        if (data.choices?.[0]?.message?.content) {
          usedModel = model;
          break;
        }
      } catch (err) {
        console.error(`Error with ${model}:`, err);
        lastError = err;
        continue;
      }
    }

    if (!usedModel || !data?.choices?.[0]?.message?.content) {
      const errorMsg = lastError?.message || lastError?.error?.message || 'All models failed';
      
      if (errorMsg.includes('quota') || errorMsg.includes('rate') || errorMsg.includes('limit')) {
        return NextResponse.json({
          error: 'Rate limit exceeded. Please wait a moment and try again.',
          provider: activeProvider,
          retryAfter: 60
        }, { status: 429 });
      }

      return NextResponse.json({ error: errorMsg, provider: activeProvider }, { status: 500 });
    }

    // Parse response
    let fullText = data.choices[0].message.content;
    
    // Clean markdown code blocks
    let cleanedText = fullText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse AI response' }, { status: 500 });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON from AI' }, { status: 500 });
    }

    let articles = parsed.articles || [];

    // Date filtering
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

    articles.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    return NextResponse.json({
      articles,
      searchSummary: parsed.searchSummary || '',
      totalSources: parsed.totalSources || articles.length,
      provider: activeProvider,
      model: usedModel
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
