const Groq = require('groq-sdk');
const { normalizeCity } = require('../utils/cityNormalizer');

const groqApiKey = process.env.GROQ_API_KEY || 'dummy_key';
const groq = new Groq({ apiKey: groqApiKey });
const AI_MODEL = 'llama-3.3-70b-versatile';

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
2. Detect the language of the user's message: "vi" for Vietnamese, "en" for English.
3. If the intent is "RENTWISE", classify the subIntent into EITHER "ROOM_SEARCH" (looking for rooms to rent) or "POLICY_FAQ" (asking about rules, deposits, contracts, complaints, platform usage).
4. If the subIntent is "ROOM_SEARCH", extract search criteria if the user is looking for rooms. Match these fields (set to null if not mentioned):
   - status: room availability status. CRITICAL RULE: ONLY set this if the user EXPLICITLY mentions room availability.
     Choose from: "available", "rented", "upcoming_vacancy", or null.
     - "còn trống", "available", "trống", "phòng trống" → "available"
     - "đã thuê", "rented", "occupied" → "rented"
     - "sắp trống", "upcoming vacancy", "available soon" → "upcoming_vacancy"
     - If the user does NOT mention room status at all → null. DO NOT assume "available" by default.
   - keyword: any specific keywords (e.g. "gần đại học", "hẻm xe hơi").
   - city: standardized city name. Resolve abbreviations like "HCM", "Sài Gòn", "SG" -> "Thành phố Hồ Chí Minh", "HN" -> "Thành phố Hà Nội", "ĐN", "Đà Nẵng" -> "Thành phố Đà Nẵng", "HP" -> "Thành phố Hải Phòng", "CT", "Cần Thơ" -> "Thành phố Cần Thơ", "VT", "Vũng Tàu" -> "Tỉnh Bà Rịa - Vũng Tàu", "BD" -> "Tỉnh Bình Dương", "ĐNai" -> "Tỉnh Đồng Nai", "Huế" -> "Tỉnh Thừa Thiên Huế". Must map exactly to Vietnam official province names.
   - district: standardized district name (e.g. "Quận 1", "Quận Bình Thạnh", "Quận Gò Vấp", "Quận 10", etc. Resolve "Q1", "Bình Thạnh", "quận tân bình" accordingly).
   - priceMin: minimum price in VND (number). Use this ONLY if the user specifies a lower bound (e.g., "trên 2 triệu", "từ 2 triệu trở lên", "hơn 3 triệu"). Do NOT use this for maximum budgets or single target prices.
   - priceMax: maximum price in VND (number). If the user specifies a maximum budget or price limit (e.g., "dưới 3 triệu", "tầm 3 triệu trở xuống", "tối đa 4 triệu"), map it to priceMax. If the user specifies a single target price (e.g., "trọ 4 triệu", "phòng 3 triệu", "tầm 5 triệu"), map it to priceMax. If the user specifies a range (e.g., "từ 2 đến 4 triệu"), map the upper bound to priceMax and lower bound to priceMin.
   - maxOccupants: maximum number of people (number, e.g., "cho 2 người" = 2).
   - minArea: minimum area in square meters (number).
   - facilities: array of facility names. Choose ONLY from this list:
     ['WiFi', 'Air Conditioner', 'Parking', 'Private Bathroom', 'Balcony', 'Bed', 'Wardrobe', 'Kitchen', 'Security Camera'].
     Map terms like "điều hòa"/"máy lạnh" to "Air Conditioner", "chỗ để xe"/"đỗ xe" to "Parking", "ban công" to "Balcony", "wc riêng"/"vệ sinh riêng" to "Private Bathroom".
   - nearbyFacilities: array of nearby facility names. Choose ONLY from this list:
     ['Near University', 'Near Hospital', 'Near Supermarket', 'Near Bus Station', 'Near Market', 'Near Park', 'Near Convenience Store'].
     Map terms like "gần trường"/"gần đại học" to "Near University".

---
FEW-SHOT EXAMPLES:

Example 1: "Tôi muốn thuê phòng còn trống."
Response:
{
  "intent": "RENTWISE",
  "subIntent": "ROOM_SEARCH",
  "language": "vi",
  "searchCriteria": {
    "status": "available",
    "keyword": null,
    "city": null,
    "district": null,
    "priceMin": null,
    "priceMax": null,
    "maxOccupants": null,
    "minArea": null,
    "facilities": [],
    "nearbyFacilities": []
  }
}

Example 2: "Show me available rooms in Da Nang."
Response:
{
  "intent": "RENTWISE",
  "subIntent": "ROOM_SEARCH",
  "language": "en",
  "searchCriteria": {
    "status": "available",
    "keyword": null,
    "city": "Thành phố Đà Nẵng",
    "district": null,
    "priceMin": null,
    "priceMax": null,
    "maxOccupants": null,
    "minArea": null,
    "facilities": [],
    "nearbyFacilities": []
  }
}

Example 3: "Tôi muốn phòng giá khoảng 5 triệu."
Response:
{
  "intent": "RENTWISE",
  "subIntent": "ROOM_SEARCH",
  "language": "vi",
  "searchCriteria": {
    "status": null,
    "keyword": null,
    "city": null,
    "district": null,
    "priceMin": null,
    "priceMax": 5000000,
    "maxOccupants": null,
    "minArea": null,
    "facilities": [],
    "nearbyFacilities": []
  }
}

Example 4: "Cho tôi phòng dưới 4 triệu."
Response:
{
  "intent": "RENTWISE",
  "subIntent": "ROOM_SEARCH",
  "language": "vi",
  "searchCriteria": {
    "status": null,
    "keyword": null,
    "city": null,
    "district": null,
    "priceMin": null,
    "priceMax": 4000000,
    "maxOccupants": null,
    "minArea": null,
    "facilities": [],
    "nearbyFacilities": []
  }
}

Example 5: "Phòng 2 người ở tại Huế."
Response:
{
  "intent": "RENTWISE",
  "subIntent": "ROOM_SEARCH",
  "language": "vi",
  "searchCriteria": {
    "status": null,
    "keyword": null,
    "city": "Tỉnh Thừa Thiên Huế",
    "district": null,
    "priceMin": null,
    "priceMax": null,
    "maxOccupants": 2,
    "minArea": null,
    "facilities": [],
    "nearbyFacilities": []
  }
}

Example 6: "Cho tôi phòng còn trống dưới 6 triệu tại Đà Nẵng."
Response:
{
  "intent": "RENTWISE",
  "subIntent": "ROOM_SEARCH",
  "language": "vi",
  "searchCriteria": {
    "status": "available",
    "keyword": null,
    "city": "Thành phố Đà Nẵng",
    "district": null,
    "priceMin": null,
    "priceMax": 6000000,
    "maxOccupants": null,
    "minArea": null,
    "facilities": [],
    "nearbyFacilities": []
  }
}

Example 7: "phòng trên 3 triệu ở quận 1"
Response:
{
  "intent": "RENTWISE",
  "subIntent": "ROOM_SEARCH",
  "language": "vi",
  "searchCriteria": {
    "status": null,
    "keyword": null,
    "city": null,
    "district": "Quận 1",
    "priceMin": 3000000,
    "priceMax": null,
    "maxOccupants": null,
    "minArea": null,
    "facilities": [],
    "nearbyFacilities": []
  }
}

Example 8: "Show me rooms under 6 million VND."
Response:
{
  "intent": "RENTWISE",
  "subIntent": "ROOM_SEARCH",
  "language": "en",
  "searchCriteria": {
    "status": null,
    "keyword": null,
    "city": null,
    "district": null,
    "priceMin": null,
    "priceMax": 6000000,
    "maxOccupants": null,
    "minArea": null,
    "facilities": [],
    "nearbyFacilities": []
  }
}

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
  "subIntent": "ROOM_SEARCH" or "POLICY_FAQ" or null,
  "language": "vi" or "en",
  "searchCriteria": {
    "status": "available" or "rented" or "upcoming_vacancy" or null,
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
      
      // Standardize search criteria city and post-process price criteria
      if (parsed.searchCriteria) {
        if (parsed.searchCriteria.city) {
          parsed.searchCriteria.city = normalizeCity(parsed.searchCriteria.city);
        }
        IntentClassifier.postProcessPriceCriteria(message, parsed.searchCriteria);
      }

      return {
        intent: parsed.intent || 'GENERAL',
        subIntent: parsed.subIntent || null,
        language: parsed.language || 'vi',
        searchCriteria: parsed.searchCriteria || {}
      };
    } catch (err) {
      console.error('[IntentClassifier] error:', err.message);
      return this.heuristicFallback(message);
    }
  }

  /**
   * Post-process search criteria to correct price bounds based on explicit keywords in query
   */
  static postProcessPriceCriteria(query, criteria) {
    if (!criteria) return;
    const q = (query || '').toLowerCase();

    // Keywords indicating maximum bounds ("dưới", "đến", "tối đa", etc.)
    const underKeywords = ['dưới', 'thấp hơn', 'nhỏ hơn', 'tối đa', 'đổ xuống', 'trở xuống', 'không quá', 'dưới mức', 'ít hơn'];
    // Keywords indicating minimum bounds ("trên", "hơn", "tối thiểu", etc.)
    const overKeywords = ['trên', 'hơn', 'lớn hơn', 'từ', 'trở lên', 'đổ lên', 'tối thiểu', 'cao hơn', 'ít nhất'];
    // Keywords indicating range queries ("từ...đến", "khoảng...đến", etc.)
    const rangeKeywords = ['đến', 'tới', 'đến mức', 'tới mức', '-'];

    const hasUnder = underKeywords.some(kw => q.includes(kw));
    const hasOver = overKeywords.some(kw => q.includes(kw));
    const hasRange = rangeKeywords.some(kw => q.includes(kw)) && (q.includes('từ') || q.includes('khoảng') || /\d+\s*-\s*\d+/.test(q));

    // If query is strictly a maximum bound filter: e.g. "dưới 3 triệu"
    if (hasUnder && !hasOver && !hasRange) {
      if (criteria.priceMin) {
        criteria.priceMax = criteria.priceMin;
        criteria.priceMin = null;
      }
    }

    // If query is strictly a minimum bound filter: e.g. "trên 3 triệu"
    if (hasOver && !hasUnder && !hasRange) {
      if (criteria.priceMax) {
        criteria.priceMin = criteria.priceMax;
        criteria.priceMax = null;
      }
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
    const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(q);
    return {
      intent: isRental ? 'RENTWISE' : 'GENERAL',
      subIntent: isRental ? 'ROOM_SEARCH' : null,
      language: hasVietnamese ? 'vi' : (/^[a-zA-Z0-9\s.,!?'"\-]+$/.test(q) ? 'en' : 'vi'),
      searchCriteria: {}
    };
  }
}

module.exports = IntentClassifier;
