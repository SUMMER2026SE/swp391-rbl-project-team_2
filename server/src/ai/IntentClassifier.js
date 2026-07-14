const Groq = require('groq-sdk');

const groqApiKey = process.env.GROQ_API_KEY || 'dummy_key';
const groq = new Groq({ apiKey: groqApiKey });
const AI_MODEL = 'llama-3.1-8b-instant';

/**
 * Classifies a user query into RENTWISE or GENERAL, with sub-intents, and extracts search parameters.
 */
class IntentClassifier {
  /**
   * Classify user query using Groq
   * @param {string} message Latest user query
   * @param {Array} history Conversation history
   * @returns {Promise<{intent: 'RENTWISE'|'GENERAL', subIntent: string, searchCriteria: object}>}
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

Sub-intents for RENTWISE:
- ROOM_SEARCH: User wants to find or browse rooms (e.g., "tìm phòng quận 1", "phòng 2 người", "5 triệu", "phòng có điều hòa").
- POLICY_FAQ: User asks about platform policies, rules, processes (e.g., "quy trình thuê phòng", "chính sách hoàn tiền", "cách đăng ký").
- CONTRACT: User asks about contracts (e.g., "hợp đồng", "ký hợp đồng", "gia hạn hợp đồng", "chấm dứt hợp đồng").
- DEPOSIT: User asks about deposits (e.g., "tiền cọc", "đặt cọc", "hoàn cọc", "mất cọc").
- PAYMENT: User asks about payments (e.g., "thanh toán", "VNPay", "chuyển khoản", "tiền thuê").
- COMPLAINT: User asks about complaints (e.g., "khiếu nại", "phản ánh", "tranh chấp").
- PERSONAL: User asks about their own bookings, contracts, complaints (e.g., "lịch hẹn của tôi", "hợp đồng của tôi").
- GENERAL_RENTWISE: Other RentWise-related queries that don't fit above sub-intents.

Category B: GENERAL
Everything else. E.g., programming, math, technology, shopping, cooking, movies, travel, history, health, general science, conversational greetings (hi, hello, etc. that do not ask about rooms), or general translations.

---
TASK:
1. Classify the user's latest query into EITHER "RENTWISE" or "GENERAL".
2. If RENTWISE, also determine the sub-intent from the list above.
3. If the sub-intent is "ROOM_SEARCH", extract search criteria. Match these fields (set to null if not mentioned):
   - keyword: any specific keywords (e.g. "gần đại học", "hẻm xe hơi").
   - city: standardized city name. You MUST resolve standalone names like "đà nẵng", "hà nội", "hcm", "sài gòn", "cần thơ" to their full official names (e.g. "Thành phố Đà Nẵng", "Thành phố Hà Nội", "Thành phố Hồ Chí Minh", "Thành phố Cần Thơ"). If a city is mentioned, extract it here, NOT in keyword.
   - district: standardized district name (e.g. "Quận 1", "Quận Bình Thạnh", "Quận Gò Vấp", "Quận 10", etc. Resolve "Q1", "Bình Thạnh", "quận tân bình" accordingly).
   - priceMin: minimum price in VND (number, e.g., 2 triệu = 2000000).
   - priceMax: maximum price in VND (number, e.g., dưới 3 triệu = 3000000, 4.5tr = 4500000).
   - maxOccupants: maximum number of people (number, e.g., "cho 2 người" = 2, "tôi có 2 người" = 2).
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
  "subIntent": "ROOM_SEARCH" | "POLICY_FAQ" | "CONTRACT" | "DEPOSIT" | "PAYMENT" | "COMPLAINT" | "PERSONAL" | "GENERAL_RENTWISE" | "NONE",
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
        subIntent: parsed.subIntent || 'NONE',
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

    // Sub-intent keyword groups
    const depositKeywords = ['cọc', 'đặt cọc', 'tiền cọc', 'hoàn cọc', 'mất cọc', 'deposit'];
    const contractKeywords = ['hợp đồng', 'ký hợp đồng', 'gia hạn', 'chấm dứt hợp đồng', 'contract'];
    const paymentKeywords = ['thanh toán', 'chuyển khoản', 'vnpay', 'payos', 'trả tiền', 'payment', 'tiền thuê hàng tháng'];
    const complaintKeywords = ['khiếu nại', 'complaint', 'phản ánh', 'tranh chấp', 'tố cáo'];
    const policyKeywords = ['chính sách', 'quy trình', 'quy định', 'hướng dẫn', 'cách thuê', 'cách đăng ký', 'policy', 'vai trò', 'landlord', 'tenant'];
    const personalKeywords = ['lịch hẹn', 'lịch đặt', 'đặt lịch', 'đặt phòng', 'booking', 'lịch xem', 'hợp đồng của tôi', 'của tôi', 'my booking', 'my contract'];
    const roomSearchKeywords = [
      'phòng', 'trọ', 'nhà', 'thuê', 'căn hộ', 'chung cư', 'room', 'rent', 'tìm',
      'quận', 'giá', 'triệu', 'người', 'bình thạnh', 'gò vấp', 'phú nhuận', 'tân bình', 'tân phú',
      'thủ đức', 'tiện ích', 'wifi', 'điều hòa', 'máy lạnh', 'wc', 'toilet', 'tắm', 'bếp',
      'trống', 'tháng', 'địa chỉ', 'chủ nhà', 'diện tích', 'm2', 'ban công',
      'đà nẵng', 'hồ chí minh', 'hà nội', 'hcm', 'sài gòn'
    ];

    // Check sub-intents in priority order
    if (personalKeywords.some(kw => q.includes(kw))) {
      return { intent: 'RENTWISE', subIntent: 'PERSONAL', searchCriteria: {} };
    }
    if (depositKeywords.some(kw => q.includes(kw))) {
      return { intent: 'RENTWISE', subIntent: 'DEPOSIT', searchCriteria: {} };
    }
    if (contractKeywords.some(kw => q.includes(kw))) {
      return { intent: 'RENTWISE', subIntent: 'CONTRACT', searchCriteria: {} };
    }
    if (paymentKeywords.some(kw => q.includes(kw))) {
      return { intent: 'RENTWISE', subIntent: 'PAYMENT', searchCriteria: {} };
    }
    if (complaintKeywords.some(kw => q.includes(kw))) {
      return { intent: 'RENTWISE', subIntent: 'COMPLAINT', searchCriteria: {} };
    }
    if (policyKeywords.some(kw => q.includes(kw))) {
      return { intent: 'RENTWISE', subIntent: 'POLICY_FAQ', searchCriteria: {} };
    }
    if (roomSearchKeywords.some(kw => q.includes(kw))) {
      return { intent: 'RENTWISE', subIntent: 'ROOM_SEARCH', searchCriteria: {} };
    }

    return {
      intent: 'GENERAL',
      subIntent: 'NONE',
      searchCriteria: {}
    };
  }
}

module.exports = IntentClassifier;
