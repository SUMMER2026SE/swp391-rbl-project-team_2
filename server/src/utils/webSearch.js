const axios = require('axios');

/**
 * Performs a search query using Tavily API if configured, otherwise falls back to Wikipedia.
 * @param {string} query The search terms.
 * @returns {Promise<Array<{title: string, link: string, snippet: string}>>}
 */
async function performWebSearch(query) {
  if (!query || !query.trim()) return [];
  
  const tavilyKey = process.env.TAVILY_API_KEY;
  
  if (tavilyKey && tavilyKey !== 'dummy_key') {
    try {
      console.log(`[WebSearch] Using Tavily Search API for query: "${query}"`);
      const response = await axios.post('https://api.tavily.com/search', {
        api_key: tavilyKey,
        query: query,
        search_depth: 'basic',
        max_results: 3
      }, { timeout: 8000 });
      
      if (response.data && response.data.results) {
        console.log(`[WebSearch] Tavily API returned ${response.data.results.length} results.`);
        return response.data.results.map(r => ({
          title: r.title,
          link: r.url,
          snippet: r.content
        }));
      }
    } catch (err) {
      console.error('[WebSearch] Tavily API failed:', err.message);
    }
  }

  // Fallback to Wikipedia API (Completely free, keyless, and never blocked)
  try {
    console.log(`[WebSearch] Falling back to Wikipedia API for query: "${query}"`);
    const wikiUrl = `https://vi.wikipedia.org/w/api.php`;
    const response = await axios.get(wikiUrl, {
      params: {
        action: 'query',
        list: 'search',
        srsearch: query,
        format: 'json',
        utf8: 1,
        formatversion: 2,
        srlimit: 3
      },
      headers: {
        'User-Agent': 'RentalWiseBot/1.0 (nhatkhaiphone@gmail.com) AxiosClient/1.0'
      },
      timeout: 5000
    });
    
    if (response.data && response.data.query && response.data.query.search) {
      const results = response.data.query.search.map(r => ({
        title: r.title,
        link: `https://vi.wikipedia.org/wiki/${encodeURIComponent(r.title)}`,
        snippet: r.snippet.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
      }));
      console.log(`[WebSearch] Wikipedia returned ${results.length} results.`);
      return results;
    }
  } catch (wikiErr) {
    console.error('[WebSearch] Wikipedia Fallback failed:', wikiErr.message);
  }
  
  return [];
}

module.exports = { performWebSearch };
