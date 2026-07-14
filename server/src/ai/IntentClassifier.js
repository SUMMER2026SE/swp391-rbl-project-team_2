const Groq = require('groq-sdk');

const groqApiKey = process.env.GROQ_API_KEY || 'dummy_key';
const groq = new Groq({ apiKey: groqApiKey });
const AI_MODEL = 'llama-3.1-8b-instant';

/**
 * Classifies a user query into RENTWISE or GENERAL, and extracts search parameters.
 */
class IntentClassifier {
  /**
   * Classify user query using Groq
   * @param {string} message Latest user query
   * @param {Array} history Conversation history
   * @returns {Promise<{intent: 'RENTWISE'|'GENERAL', searchCriteria: object}>}
   */
  static async classify(message, history = []) {
    if (groqApiKey === 'dummy_key') {
      console.warn('[IntentClassifier] GROQ_API_KEY is not set. Falling back to simple heuristic.');
      return this.heuristicFallback(message);
    }

    try {
      const recentContext = history.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n');
      
      const prompt = `
You are an advanced intent classifier and parameter extractor for a rental system called RentWise in Vietnam.
Analyze the user's latest query and the conversation context.

---
CATEGORY DEFINITIONS:

Category A: RENTWISE
Queries about finding rooms, rental rooms, rental prices, deposit, contract, landlord, booking, utilities, policies, amenities, room recommendation, location, district, complaints, and general RentWise platform usage (how to rent, pay deposit, sign contract, contact support, etc.).

Category B: GENERAL
Everything else. E.g., programming, math, technology, shopping, cooking, movies, travel, history, health, general science, conversational greetings (hi, hello, etc. that do not ask about rooms), or general translations.

---
TASK:
1. Classify the user's latest query into EITHER "RENTWISE" or "GENERAL".
2. If the intent is "RENTWISE", extract search criteria if the user is looking for rooms. Match these fields (set to null if not mentioned):
   - keyword: any specific keywords (e.g. "gần đại học", "hẻm xe hơi").
   - city: standardized city name (e.g. "Thành phố Hồ Chí Minh", "Thành phố Hà Nội", etc. Resolve "HCM", "Sài Gòn", "HN" to full official names).
   - district: standardized district name (e.g. "Quận 1", "Quận Bình Thạnh", "Quận Gò Vấp", "Quận 10", etc. Resolve "Q1", "Bình Thạnh", "quận tân bình" accordingly).
   - priceMin: minimum price in VND (number, e.g., 2 triệu = 2000000).
   - priceMax: maximum price in VND (number, e.g., dưới 3 triệu = 3000000, 4.5tr = 4500000).
   - maxOccupants: maximum number of people (number, e.g., "cho 2 người" = 2).
   - minArea: minimum area in square meters (number).
   - facilities: array of facility names. Choose ONLY from this list:
     ['WiFi', 'Air Conditioner', 'Parking', 'Private Bathroom', 'Balcony', 'Bed', 'Wardrobe', 'Kitchen', 'Security Camera'].
     Map terms like "điều hòa"/"máy lạnh" to "Air Conditioner", "chỗ để xe"/"đỗ xe" to "Parking", "ban công" to "Balcony", "wc riêng"/"vệ sinh riêng" to "Private Bathroom".
   - nearbyFacilities: array of nearby facility names. Choose ONLY from this list:
     ['Near University', 'Near Hospital', 'Near Supermarket', 'Near Bus Station', 'Near Market', 'Near Park', 'Near Convenience Store'].
     Map terms like "gần trường"/"gần đại học" to "Near University".

---
CONVERSATION CONTEXT:
${recentContext}

USER'S LATEST MESSAGE:
"${message}"

---
RESPONSE FORMAT:
You MUST respond with exactly a JSON object matching this structure (no markdown wrapper, no explanation):
{
  "intent": "RENTWISE" or "GENERAL",
  "searchCriteria": {
    "keyword": string|null,
    "city": string|null,
    "district": string|null,
    "priceMin": number|null,
    "priceMax": number|null,
    "maxOccupants": number|null,
    "minArea": number|null,
    "facilities": string[],
    "nearbyFacilities": string[]
  }
}
`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: AI_MODEL,
        temperature: 0,
      });

      const text = completion.choices[0]?.message?.content || '{}';
      let jsonStr = text.trim();
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) {
        jsonStr = match[0];
      }

      const parsed = JSON.parse(jsonStr);
      return {
        intent: parsed.intent || 'GENERAL',
        searchCriteria: parsed.searchCriteria || {}
      };
    } catch (err) {
      console.error('[IntentClassifier] error:', err.message);
      return this.heuristicFallback(message);
    }
  }

  /**
   * Simple heuristic fallback in case Groq is unavailable or fails.
   */
  static heuristicFallback(message) {
    const q = (message || '').toLowerCase();
    const rentalKeywords = [
      'phòng', 'trọ', 'nhà', 'thuê', 'căn hộ', 'chung cư', 'room', 'rent', 'ở', 'tìm', 
      'quận', 'giá', 'triệu', 'bình thạnh', 'gò vấp', 'phú nhuận', 'tân bình', 'tân phú', 
      'thủ đức', 'tiện ích', 'wifi', 'điều hòa', 'máy lạnh', 'wc', 'toilet', 'tắm', 'bếp',
      'cọc', 'hợp đồng', 'chính sách', 'trống', 'tiền', 'tháng', 'địa chỉ', 'chủ nhà', 'đặt phòng'
    ];
    
    const isRental = rentalKeywords.some(kw => q.includes(kw));
    return {
      intent: isRental ? 'RENTWISE' : 'GENERAL',
      searchCriteria: {}
    };
  }
}

module.exports = IntentClassifier;
