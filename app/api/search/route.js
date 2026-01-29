import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const start = searchParams.get('start') || '1';

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CX;

  if (!apiKey || !cx) {
    return NextResponse.json(
      { error: 'API configuration missing. Please set GOOGLE_API_KEY and GOOGLE_CX environment variables.' },
      { status: 500 }
    );
  }

  try {
    // Build the search query with news-focused terms
    let searchQuery = `${query} news`;
    
    // Build date restriction if provided
    let dateRestrict = '';
    if (dateFrom || dateTo) {
      // Google Custom Search uses dateRestrict parameter
      // Format: d[number] for days, w[number] for weeks, m[number] for months, y[number] for years
      // For specific date ranges, we'll add date terms to the query
      if (dateFrom && dateTo) {
        searchQuery += ` after:${dateFrom} before:${dateTo}`;
      } else if (dateFrom) {
        searchQuery += ` after:${dateFrom}`;
      } else if (dateTo) {
        searchQuery += ` before:${dateTo}`;
      }
    }

    // Google Custom Search API URL
    const url = new URL('https://www.googleapis.com/customsearch/v1');
    url.searchParams.append('key', apiKey);
    url.searchParams.append('cx', cx);
    url.searchParams.append('q', searchQuery);
    url.searchParams.append('num', '10'); // Max 10 results per request
    url.searchParams.append('start', start);
    url.searchParams.append('sort', 'date'); // Sort by date for news
    
    // Optional: Filter for news-like content
    // url.searchParams.append('siteSearch', 'news.google.com');
    // url.searchParams.append('siteSearchFilter', 'i');

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.error) {
      console.error('Google API Error:', data.error);
      return NextResponse.json(
        { error: data.error.message || 'Google API error' },
        { status: data.error.code || 500 }
      );
    }

    // Transform the results to our format
    const articles = (data.items || []).map((item, index) => {
      // Try to extract date from the snippet or metadata
      let publishedDate = '';
      let publishedTime = '';
      
      // Check for metatags
      if (item.pagemap?.metatags?.[0]) {
        const meta = item.pagemap.metatags[0];
        publishedDate = meta['article:published_time'] || 
                       meta['og:updated_time'] || 
                       meta['date'] ||
                       meta['pubdate'] ||
                       '';
        if (publishedDate) {
          const dateObj = new Date(publishedDate);
          if (!isNaN(dateObj.getTime())) {
            publishedDate = dateObj.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            });
            publishedTime = dateObj.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
          }
        }
      }

      // Try to extract date from snippet if not found
      if (!publishedDate && item.snippet) {
        const dateMatch = item.snippet.match(/(\w{3}\s+\d{1,2},\s+\d{4})|(\d{1,2}\s+\w+\s+\d{4})|(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          publishedDate = dateMatch[0];
        }
      }

      // Extract publisher from display link or title
      let publisher = item.displayLink || '';
      publisher = publisher.replace(/^www\./, '').split('.')[0];
      publisher = publisher.charAt(0).toUpperCase() + publisher.slice(1);

      // Check for organization in pagemap
      if (item.pagemap?.organization?.[0]?.name) {
        publisher = item.pagemap.organization[0].name;
      } else if (item.pagemap?.metatags?.[0]?.['og:site_name']) {
        publisher = item.pagemap.metatags[0]['og:site_name'];
      }

      // Calculate a simple relevance score based on position
      const relevanceScore = Math.max(95 - (index * 5) - Math.floor(Math.random() * 10), 50);

      return {
        title: item.title || 'Untitled',
        publisher: publisher || 'Unknown',
        publishedDate: publishedDate || 'Recent',
        publishedTime: publishedTime || '',
        url: item.link || '',
        summary: item.snippet || 'No description available',
        relevanceScore: relevanceScore,
        thumbnail: item.pagemap?.cse_thumbnail?.[0]?.src || 
                   item.pagemap?.cse_image?.[0]?.src || null
      };
    });

    return NextResponse.json({
      articles,
      searchInfo: {
        totalResults: data.searchInformation?.totalResults || '0',
        searchTime: data.searchInformation?.searchTime || 0,
        query: query
      },
      nextPage: data.queries?.nextPage?.[0]?.startIndex || null
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    );
  }
}
