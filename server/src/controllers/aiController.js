const Groq = require('groq-sdk');
const { Room, Facility } = require('../models');

const groqApiKey = process.env.GROQ_API_KEY || 'dummy_key';
const groq = new Groq({ apiKey: groqApiKey });

const aiController = {
  // 1. Process Natural Language Search
  processSearch: async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) return res.status(400).json({ success: false, message: 'Query is required' });

      if (groqApiKey === 'dummy_key') {
        console.warn('Using mock AI search because GROQ_API_KEY is not set');
        return res.json({
          success: true,
          data: {
            keyword: query,
            priceMax: query.includes('4M') ? 4000000 : null,
            district: query.includes('District 1') ? 'District 1' : null
          }
        });
      }

      const prompt = `
        You are an AI assistant for a room rental platform in Vietnam.
        Extract search parameters from the following user query.
        Possible fields to extract (all are optional, return null if not mentioned):
        - keyword: Any specific text or location name to search for.
        - priceMin: Minimum price in VND (number). (e.g. 1M = 1000000)
        - priceMax: Maximum price in VND (number).
        - district: District name.
        - roomType: 'single', 'double', 'apartment', 'house', 'shared', or null.
        - bedrooms: Number of bedrooms (integer).
        
        User Query: "${query}"
        
        Respond ONLY with a valid JSON object matching this structure:
        { "keyword": string|null, "priceMin": number|null, "priceMax": number|null, "district": string|null, "roomType": string|null, "bedrooms": number|null }
      `;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
      });

      const responseText = chatCompletion.choices[0]?.message?.content || "";

      // Extract JSON from response
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedParams = JSON.parse(jsonStr);

      res.json({ success: true, data: parsedParams });
    } catch (error) {
      console.error('AI Search Error (Groq):', error);
      res.status(500).json({ success: false, message: 'Failed to process AI search' });
    }
  },

  // 2. AI Chatbot
  chat: async (req, res) => {
    try {
      const { message, history } = req.body;

      if (groqApiKey === 'dummy_key') {
        return res.json({
          success: true,
          reply: "I am a mock AI assistant. Please configure GROQ_API_KEY in the server .env file to talk to the real AI!"
        });
      }

      const systemContext = `
        You are a professional AI assistant for a room rental platform named "RoomMaster" in Vietnam.
        CRITICAL RULES:
        1. DO NOT invent, hallucinate, or suggest any rooms that are not explicitly provided in the "CURRENTLY AVAILABLE" list below.
        2. If the user asks for a room (e.g. in District 1) and there are no matching rooms in the list, you MUST say: "Hiện tại hệ thống chưa có phòng trống phù hợp với yêu cầu của bạn."
        3. ALWAYS use the exact Price, Title, and Location from the provided list.
        4. Answer concisely and politely in Vietnamese.
        5. FORMATTING RULES: Use emojis to make the room information visually appealing. For EACH room you recommend, use this exact format:
           🏠 Tên phòng
           📍 Địa chỉ
           💰 Giá tiền
           🛋️ Tiện ích
           🔗 Link: [URL]
           (separate each room with a blank line)
      `;

      let roomDataString = "";
      try {
        const availableRooms = await Room.findAll({
          where: { status: 'available' },
          limit: 15,
          order: [['created_at', 'DESC']],
          include: [{ model: Facility, as: 'facilities', attributes: ['facility_name'], through: { attributes: [] } }]
        });

        if (availableRooms && availableRooms.length > 0) {
          roomDataString = "Here is the list of CURRENTLY AVAILABLE rooms in the database. Use this exact information to advise the tenant. For each room you recommend, ALWAYS include its link at the end so the tenant can view details.\n" + availableRooms.map(r => {
            const facs = r.facilities ? r.facilities.map(f => f.facility_name).join(', ') : 'Không có';
            const link = `http://localhost:5173/rooms/${r.room_id}`;
            return `- Room ID: ${r.room_id} | Title: "${r.title}" | Price: ${r.price_per_month?.toLocaleString('vi-VN')} VND/month | Location: ${r.address}, ${r.district}, ${r.city} | Type: ${r.room_type} | Area: ${r.area_sqm}m2 | Max Occupants: ${r.max_occupants} | Amenities: ${facs} | Link: ${link}`;
          }).join('\n');
        } else {
          roomDataString = "Currently, there are no available rooms in the database. Tell the user to check back later.";
        }
      } catch (err) {
        console.error("Failed to fetch rooms for AI context:", err);
      }

      const finalSystemContext = systemContext + "\n\n" + roomDataString;

      // Convert history to Groq format
      const formattedMessages = [
        { role: 'system', content: finalSystemContext }
      ];

      if (history && history.length > 0) {
        history.forEach((msg, idx) => {
          if (idx === 0 && msg.role === 'assistant') {
            formattedMessages.push({ role: 'user', content: 'Xin chào' });
          }
          formattedMessages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          });
        });
      }

      // Add the latest user message
      formattedMessages.push({ role: 'user', content: message });

      const chatCompletion = await groq.chat.completions.create({
        messages: formattedMessages,
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
      });

      const reply = chatCompletion.choices[0]?.message?.content || "I couldn't understand that.";

      res.json({ success: true, reply: reply.trim() });
    } catch (error) {
      console.error('AI Chat Error (Groq):', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = aiController;
