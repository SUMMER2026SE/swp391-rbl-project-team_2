const { URL } = require('url');

/**
 * Service to process search references and build citations without hallucinations.
 */
class CitationService {
  /**
   * Generates clean citations from search results
   * @param {Array<{title: string, link: string, snippet: string}>} searchResults Raw web results
   * @returns {Array<{title: string, website: string, url: string}>} Structured citations
   */
  static extractCitations(searchResults) {
    if (!searchResults || searchResults.length === 0) return [];

    return searchResults.map(res => {
      let website = 'Website';
      try {
        if (res.link) {
          const parsedUrl = new URL(res.link);
          // Get clean domain name (e.g., 'wikipedia.org' from 'vi.wikipedia.org')
          const hostname = parsedUrl.hostname;
          const parts = hostname.split('.');
          if (parts.length >= 2) {
            website = parts.slice(-2).join('.');
          } else {
            website = hostname;
          }
        }
      } catch (e) {
        // Fallback if parsing fails
      }

      return {
        title: res.title || 'Untitled Source',
        website: website,
        url: res.link || ''
      };
    });
  }

  /**
   * Helper to format web search results for LLM prompt context
   * @param {Array} searchResults Raw search results
   * @returns {string} Formatted context
   */
  static formatForPrompt(searchResults) {
    if (!searchResults || searchResults.length === 0) return '';
    return searchResults.map((r, i) => 
      `[Result ${i + 1}] Title: ${r.title}\nURL: ${r.link}\nSnippet: ${r.snippet}`
    ).join('\n\n');
  }
}

module.exports = CitationService;
