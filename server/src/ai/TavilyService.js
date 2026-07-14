const axios = require('axios');

const TAVILY_CACHE = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // Cache for 1 hour

/**
 * Service to handle Tavily Web Search with caching and Wikipedia fallback.
 */
class TavilyService {
  /**
   * Performs web search
   * @param {string} query The search terms
   * @returns {Promise<Array<{title: string, link: string, snippet: string}>>}
   */
  static async search(query) {
    if (!query || !query.trim()) return [];

    const normalizedQuery = query.toLowerCase().trim();
    
    // Check Cache
    if (TAVILY_CACHE.has(normalizedQuery)) {
      const { data, timestamp } = TAVILY_CACHE.get(normalizedQuery);
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        console.log(`[TavilyService] Cache hit for query: "${query}"`);
        return data;
      }
      TAVILY_CACHE.delete(normalizedQuery); // Cache expired
    }

    let results = [];
    const tavilyKey = process.env.TAVILY_API_KEY;

    if (tavilyKey && tavilyKey !== 'dummy_key') {
      try {
        console.log(`[TavilyService] Searching Tavily for: "${query}"`);
        const response = await axios.post('https://api.tavily.com/search', {
          api_key: tavilyKey,
          query: query,
          search_depth: 'basic',
          max_results: 4
        }, { timeout: 8000 });

        if (response.data && response.data.results) {
          results = response.data.results.map(r => ({
            title: r.title,
            link: r.url,
            snippet: r.content || r.snippet || ''
          }));
          
          // Save to Cache
          TAVILY_CACHE.set(normalizedQuery, {
            data: results,
            timestamp: Date.now()
          });
          
          return results;
        }
      } catch (err) {
        console.error('[TavilyService] Tavily search failed, falling back to Wikipedia:', err.message);
      }
    } else {
      console.warn('[TavilyService] No Tavily API key configured. Using Wikipedia fallback.');
    }

    // Wikipedia Fallback
    try {
      console.log(`[TavilyService] Falling back to Wikipedia API for: "${query}"`);
      const wikiUrl = `https://vi.wikipedia.org/w/api.php`;
      const response = await axios.get(wikiUrl, {
        params: {
          action: 'query',
          list: 'search',
          srsearch: query,
          format: 'json',
          utf8: 1,
          formatversion: 2,
          srlimit: 4
        },
        headers: {
          'User-Agent': 'RentalWiseBot/1.0 (nhatkhaiphone@gmail.com) AxiosClient/1.0'
        },
        timeout: 5000
      });

      if (response.data && response.data.query && response.data.query.search) {
        results = response.data.query.search.map(r => ({
          title: r.title,
          link: `https://vi.wikipedia.org/wiki/${encodeURIComponent(r.title)}`,
          snippet: r.snippet.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
        }));
        
        // Save to Cache
        TAVILY_CACHE.set(normalizedQuery, {
          data: results,
          timestamp: Date.now()
        });
      }
    } catch (wikiErr) {
      console.error('[TavilyService] Wikipedia fallback failed:', wikiErr.message);
    }

    return results;
  }
}

module.exports = TavilyService;
