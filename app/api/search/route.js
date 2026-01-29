import { NextResponse } from 'next/server';

// Models to try in order of preference
const MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest', 
  'gemini-1.5-pro',
  'gemini-2.0-flash',
];

async function callGeminiAPI(apiKey, model, systemInstruction, userPrompt, useGrounding = true) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    }
  };

  // Add grounding tool if enabled
  if (useGrounding) {
    requestBody.tools = [{ googleSearch: {} }];
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  return response.json();
}

export async function POST(request) {
  const { query, dateFrom, dateTo, deepResearch } = await request.json();

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API configuration missing. Please set GEMINI_API_KEY environment variable.' },
      { status: 500 }
    );
  }

  try {
    // Build date context for the prompt
    let dateContext = '';
    if (dateFrom && dateTo) {
      dateContext = `Focus on news articles published between ${dateFrom} and ${dateTo}.`;
    } else if (dateFrom) {
      dateContext = `Focus on news articles published after ${dateFrom}.`;
    } else if (dateTo) {
      dateContext = `Focus on news articles published before ${dateTo}.`;
    }

    const systemInstruction = `You are an expert news research assistant. Your task is to search for and compile comprehensive, accurate news articles about the given topic.

CRITICAL INSTRUCTIONS:
1. Search thoroughly for recent news articles related to the query
2. ${deepResearch ? 'Conduct DEEP research - explore multiple angles, related topics, and various reputable news sources to provide comprehensive coverage.' : 'Find the most relevant and recent news articles.'}
3. For EACH article found, you MUST extract and provide:
   - title: The exact headline of the article
   - publisher: The news organization name (e.g., "BBC News", "Reuters", "CNN")
   - publishedDate: Publication date (format: "Jan 15, 2025" or similar)
   - publishedTime: Time if available, otherwise empty string
   - url: The FULL direct URL to the article (must be a real, working link)
   - summary: A concise 2-3 sentence summary of the article's main points
   - relevanceScore: A number from 1-100 indicating relevance to the query

4. ${dateContext}
5. Prioritize reputable, well-known news sources
6. Include a variety of sources for balanced coverage
7. Sort results by relevance and recency

IMPORTANT: Return ONLY valid JSON in this EXACT format, with no additional text, markdown, or explanation:
{
  "articles": [
    {
      "title": "Article Headline Here",
      "publisher": "Publisher Name",
      "publishedDate": "Jan 15, 2025",
      "publishedTime": "10:30 AM",
      "url": "https://example.com/full-article-url",
      "summary": "Brief summary of the article content.",
      "relevanceScore": 95
    }
  ],
  "searchSummary": "Brief 2-3 sentence overview of the news landscape on this topic",
  "totalSources": 5
}`;

    const userPrompt = `Search for news articles about: "${query}"

${dateContext}

${deepResearch ? 'Conduct comprehensive deep research across multiple reputable news sources. Look for different perspectives and related developments.' : 'Find the most relevant recent news articles on this topic.'}

Return the results as valid JSON only, no other text.`;

    let data = null;
    let lastError = null;
    let usedModel = null;

    // Try each model until one works
    for (const model of MODELS) {
      try {
        console.log(`Trying model: ${model}`);
        data = await callGeminiAPI(apiKey, model, systemInstruction, userPrompt, true);
        
        // Check if we got a quota error
        if (data.error) {
          const errorMsg = data.error.message || '';
          if (errorMsg.includes('quota') || errorMsg.includes('rate') || errorMsg.includes('limit')) {
            console.log(`Quota exceeded for ${model}, trying next...`);
            lastError = data.error;
            
            // Wait a bit before trying next model
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          // Some other error - still try next model
          lastError = data.error;
          continue;
        }

        // Success!
        usedModel = model;
        break;
      } catch (err) {
        console.error(`Error with model ${model}:`, err);
        lastError = err;
        continue;
      }
    }

    // If all models with grounding failed, try without grounding as last resort
    if (!usedModel && lastError) {
      console.log('Trying without grounding...');
      for (const model of MODELS) {
        try {
          data = await callGeminiAPI(apiKey, model, systemInstruction, userPrompt, false);
          if (!data.error) {
            usedModel = model;
            break;
          }
        } catch (err) {
          continue;
        }
      }
    }

    // If still no success, return helpful error
    if (!usedModel || data?.error) {
      const errorMessage = lastError?.message || data?.error?.message || 'Unknown error';
      
      // Check for quota error and provide helpful message
      if (errorMessage.includes('quota') || errorMessage.includes('rate') || errorMessage.includes('limit')) {
        return NextResponse.json({
          error: 'API quota exceeded. Please try again in a few minutes, or check your Google AI Studio dashboard to monitor usage.',
          details: 'Free tier limits: 15 requests/minute, 1500 requests/day. Consider enabling billing for higher limits.',
          retryAfter: 60
        }, { status: 429 });
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: data?.error?.code || 500 }
      );
    }

    // Extract text from Gemini response
    let fullText = '';
    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.text) {
          fullText += part.text;
        }
      }
    }

    // Extract grounding metadata if available (for source URLs)
    let groundingMetadata = null;
    if (data.candidates && data.candidates[0]?.groundingMetadata) {
      groundingMetadata = data.candidates[0].groundingMetadata;
    }

    // Clean and parse JSON from response
    // Remove markdown code blocks if present
    let cleanedText = fullText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Find JSON object in the response
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not parse JSON from response:', fullText);
      return NextResponse.json(
        { error: 'Could not parse search results from AI response' },
        { status: 500 }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Text:', jsonMatch[0]);
      return NextResponse.json(
        { error: 'Invalid JSON in AI response' },
        { status: 500 }
      );
    }

    // Enhance articles with grounding sources if available
    let articles = parsed.articles || [];
    
    if (groundingMetadata?.groundingChunks) {
      // Add any additional sources from grounding
      groundingMetadata.groundingChunks.forEach((chunk, index) => {
        if (chunk.web?.uri && !articles.find(a => a.url === chunk.web.uri)) {
          // This is a backup - add sources from grounding that weren't in the main response
        }
      });
    }

    // Filter by date if specified (additional client-side filtering)
    if (dateFrom || dateTo) {
      articles = articles.filter(article => {
        if (!article.publishedDate) return true;
        
        // Try to parse the date
        const articleDate = new Date(article.publishedDate);
        if (isNaN(articleDate.getTime())) return true; // Keep if can't parse
        
        if (dateFrom && new Date(dateFrom) > articleDate) return false;
        if (dateTo && new Date(dateTo) < articleDate) return false;
        return true;
      });
    }

    // Sort by relevance score
    articles.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    return NextResponse.json({
      articles,
      searchSummary: parsed.searchSummary || '',
      totalSources: parsed.totalSources || articles.length,
      model: usedModel,
      groundingMetadata: groundingMetadata ? {
        searchQueries: groundingMetadata.webSearchQueries || [],
        sourceCount: groundingMetadata.groundingChunks?.length || 0
      } : null
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search results: ' + error.message },
      { status: 500 }
    );
  }
}
