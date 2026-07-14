const IntentClassifier = require('../ai/IntentClassifier');
const GroqService = require('../ai/GroqService');
const TavilyService = require('../ai/TavilyService');
const SQLSearchService = require('../ai/SQLSearchService');
const PromptBuilder = require('../ai/PromptBuilder');
const CitationService = require('../ai/CitationService');
const ResponseFormatter = require('../ai/ResponseFormatter');
const StreamingService = require('../ai/StreamingService');

/**
 * Controller to handle AI Search and AI Chat actions.
 */
const aiController = {
  /**
   * Processes natural language search queries to extract structured filters for the search page.
   */
  processSearch: async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ success: false, message: 'Query is required' });
      }

      // 1. Classify search query
      const classification = await IntentClassifier.classify(query);
      const { intent, searchCriteria } = classification;

      if (intent === 'GENERAL') {
        // Generate a quick friendly greeting/conversational response
        const messages = [
          {
            role: 'system',
            content: 'You are RentWise AI. In 1-2 friendly sentences, acknowledge the user\'s query in their language. Explain that you can assist them with this general query or help them find rental rooms on RentWise. Keep it very concise.'
          },
          {
            role: 'user',
            content: query
          }
        ];
        
        let reply = "Xin chào! Em là trợ lý RentWise AI. Em có thể giải đáp các câu hỏi chung của bạn hoặc hỗ trợ bạn tìm phòng trọ phù hợp nhé ạ! 😊";
        try {
          reply = await GroqService.chatCompletion(messages, { temperature: 0.5 });
        } catch (e) {
          // Use default reply on error
        }

        return res.json({
          success: true,
          isConversational: true,
          reply: reply,
          data: null
        });
      } else {
        // RENTWISE search -> Return structured database criteria
        return res.json({
          success: true,
          isConversational: false,
          reply: null,
          data: {
            keyword: searchCriteria.keyword || null,
            city: searchCriteria.city || null,
            district: searchCriteria.district || null,
            priceMin: searchCriteria.priceMin || null,
            priceMax: searchCriteria.priceMax || null,
            facilities: searchCriteria.facilities || [],
            nearbyFacilities: searchCriteria.nearbyFacilities || []
          }
        });
      }
    } catch (error) {
      console.error('[AI Controller] processSearch error:', error.message);
      return res.json({
        success: true,
        isConversational: true,
        reply: "Xin chào! Em có thể giúp gì cho bạn về việc tìm kiếm phòng trọ hoặc các thông tin thuê phòng không ạ? 😊",
        data: null
      });
    }
  },

  /**
   * Main AI Chat agent endpoint with SSE streaming support.
   */
  chat: async (req, res) => {
    const { message, history, stream } = req.body;
    const userId = req.user?.userId;
    const isAuthenticated = !!userId;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const isStreaming = stream === true || stream === 'true';

    if (isStreaming) {
      StreamingService.initStream(res);
    }

    try {
      // 1. Intent Classification
      if (isStreaming) StreamingService.sendStatus(res, 'Searching database...');
      const classification = await IntentClassifier.classify(message, history || []);
      const { intent, searchCriteria } = classification;
      
      console.log(`[AI Controller] Query: "${message}" | Intent: ${intent} | Criteria:`, JSON.stringify(searchCriteria));

      let sqlContext = '';
      let tavilyContext = '';
      let rawWebResults = [];
      let validRoomIds = [];

      // 2. Data Retrieval based on Routing Logic
      if (intent === 'RENTWISE') {
        const lowerMsg = message.toLowerCase();
        
        // Check for personal records request keywords
        const isBookingQuery = ['lịch hẹn', 'lịch đặt', 'đặt lịch', 'đặt phòng', 'booking', 'lịch xem'].some(kw => lowerMsg.includes(kw));
        const isContractQuery = ['hợp đồng', 'ký hợp đồng', 'hợp đồng của tôi', 'contract'].some(kw => lowerMsg.includes(kw));
        const isComplaintQuery = ['khiếu nại', 'complaint', 'phản ánh'].some(kw => lowerMsg.includes(kw));

        if (isBookingQuery || isContractQuery || isComplaintQuery) {
          if (!isAuthenticated) {
            const reply = "Dạ, để hỗ trợ xem lịch đặt phòng, hợp đồng hoặc khiếu nại của bạn, xin vui lòng đăng nhập vào tài khoản RentWise trước nhé ạ! 😊";
            if (isStreaming) {
              StreamingService.sendChunk(res, reply);
              StreamingService.sendFollowups(res, [
                "Hướng dẫn đăng ký tài khoản?",
                "Chính sách cọc tiền thế nào?",
                "Tìm phòng trọ Quận Bình Thạnh"
              ]);
              return StreamingService.sendDone(res);
            } else {
              return res.json({
                success: true,
                reply,
                followups: [
                  "Hướng dẫn đăng ký tài khoản?",
                  "Chính sách cọc tiền thế nào?",
                  "Tìm phòng trọ Quận Bình Thạnh"
                ],
                sources: []
              });
            }
          }

          // Retrieve personal details
          const personalData = {};
          if (isBookingQuery) personalData.bookings = await SQLSearchService.getTenantBookings(userId);
          if (isContractQuery) personalData.contracts = await SQLSearchService.getTenantContracts(userId);
          if (isComplaintQuery) personalData.complaints = await SQLSearchService.getTenantComplaints(userId);

          sqlContext = PromptBuilder.formatPersonalContext(personalData);
        } else {
          // Perform room database query
          const rooms = await SQLSearchService.searchRooms(searchCriteria);
          validRoomIds = rooms.map(r => String(r.room_id));
          
          if (rooms.length > 0) {
            sqlContext = PromptBuilder.formatRoomsForContext(rooms);
          } else {
            // No results in local database -> fallback search on Tavily
            if (isStreaming) StreamingService.sendStatus(res, 'Searching web...');
            rawWebResults = await TavilyService.search(message);
            tavilyContext = CitationService.formatForPrompt(rawWebResults);
            sqlContext = 'Không tìm thấy phòng trọ nào phù hợp trong hệ thống cơ sở dữ liệu RentWise.';
          }
        }
      } else {
        // GENERAL intent -> directly execute Tavily search
        if (isStreaming) StreamingService.sendStatus(res, 'Searching web...');
        rawWebResults = await TavilyService.search(message);
        tavilyContext = CitationService.formatForPrompt(rawWebResults);
      }

      // Generate and stream citations if available
      const citations = CitationService.extractCitations(rawWebResults);
      if (isStreaming && citations.length > 0) {
        StreamingService.sendStatus(res, 'Reading sources...');
        StreamingService.sendSources(res, citations);
      }

      // 3. Prompt Construction and LLM Completion Call
      if (isStreaming) StreamingService.sendStatus(res, 'Thinking...');
      const systemPrompt = PromptBuilder.buildSystemPrompt({
        intent,
        sqlContext,
        tavilyContext,
        isAuthenticated
      });

      const formattedHistory = [
        { role: 'system', content: systemPrompt }
      ];

      // Limit history count to optimize token counts
      const trimmedHistory = (history || []).slice(-7);
      trimmedHistory.forEach(msg => {
        formattedHistory.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        });
      });

      formattedHistory.push({ role: 'user', content: message });

      if (isStreaming) {
        StreamingService.sendStatus(res, 'Generating answer...');
        let fullText = '';
        try {
          const stream = await GroqService.chatCompletionStream(formattedHistory);
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content || '';
            if (delta) {
              fullText += delta;
              StreamingService.sendChunk(res, delta);
            }
          }

          // Clean, validate links and pull out XML follow-up chips
          const formatted = await ResponseFormatter.format(fullText, validRoomIds);
          
          // Stream follow-ups and complete SSE write
          StreamingService.sendFollowups(res, formatted.followups);
          StreamingService.sendDone(res);
        } catch (streamError) {
          console.error('[AI Controller] Streaming completion failed:', streamError.message);
          StreamingService.sendChunk(res, "\n\n⚠️ Có lỗi xảy ra trong quá trình kết nối với AI. Bạn vui lòng thử lại nhé.");
          StreamingService.sendDone(res);
        }
      } else {
        // Non-streaming completion call
        const responseText = await GroqService.chatCompletion(formattedHistory);
        const formatted = await ResponseFormatter.format(responseText, validRoomIds);

        res.json({
          success: true,
          reply: formatted.reply,
          followups: formatted.followups,
          sources: citations
        });
      }
    } catch (error) {
      console.error('[AI Controller] Chat endpoint failed:', error.message);
      const fallbackReply = "Dạ, hệ thống đang gặp lỗi kết nối với máy chủ AI. Bạn vui lòng thử lại sau giây lát nhé! 🙏";
      const fallbackFollowups = [
        "Khám phá phòng trọ trống",
        "Quy trình thuê phòng trọ?",
        "Liên hệ hỗ trợ kỹ thuật"
      ];

      if (isStreaming) {
        try {
          StreamingService.sendChunk(res, fallbackReply);
          StreamingService.sendFollowups(res, fallbackFollowups);
          StreamingService.sendDone(res);
        } catch (err) {
          // Connection closed
        }
      } else {
        res.json({
          success: true,
          reply: fallbackReply,
          followups: fallbackFollowups,
          sources: []
        });
      }
    }
  }
};

module.exports = aiController;
