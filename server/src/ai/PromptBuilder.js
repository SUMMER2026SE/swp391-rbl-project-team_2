/**
 * Service to build persona-driven system and user prompts.
 */
class PromptBuilder {
  /**
   * Builds the complete system prompt for the chat session.
   * @param {object} params Context inputs
   * @param {string} params.intent RENTWISE or GENERAL
   * @param {string} params.sqlContext Formatted SQL database information (if any)
   * @param {string} params.tavilyContext Formatted web search results (if any)
   * @param {boolean} params.isAuthenticated Is the user authenticated
   * @returns {string} The constructed system prompt
   */
  static buildSystemPrompt({ intent, sqlContext, tavilyContext, isAuthenticated }) {
    const faqKnowledge = `
=== CHÍNH SÁCH & QUY ĐỊNH CỦA HỆ THỐNG RENTALWISE ===

📋 QUY TRÌNH THUÊ PHÒNG:
1. Tìm kiếm phòng trên hệ thống → Xem chi tiết → Đặt lịch xem phòng.
2. Sau khi xem phòng, nếu ưng ý → Gửi yêu cầu thuê (Rental Request).
3. Chủ trọ duyệt yêu cầu → Tạo hợp đồng → Người thuê ký hợp đồng điện tử.
4. Thanh toán tiền cọc và tiền tháng đầu qua VNPay → Nhận phòng.

💰 CHÍNH SÁCH TÀI CHÍNH:
- Tiền cọc: Thông thường bằng 1-2 tháng tiền thuê (tùy chủ trọ quy định).
- Thanh toán: Hỗ trợ thanh toán qua VNPay (ATM nội địa, Visa, MasterCard).
- Hoàn tiền: Nếu hủy trước khi ký hợp đồng, tiền cọc sẽ được hoàn lại trong 3-5 ngày làm việc.
- Hủy hợp đồng sớm: Tùy điều khoản trong hợp đồng, có thể mất tiền cọc.

📄 HỢP ĐỒNG:
- Hợp đồng điện tử có giá trị pháp lý.
- Thời hạn hợp đồng tối thiểu: 1 tháng (tùy chủ trọ).
- Gia hạn hợp đồng: Có thể gia hạn trực tuyến khi hợp đồng sắp hết hạn.

⚡ ĐIỆN NƯỚC & PHỤ PHÍ:
- Giá điện, nước: Tùy theo từng phòng/chủ trọ (thường ghi rõ trong mô tả phòng).
- Phí dịch vụ (nếu có): Internet, gửi xe, vệ sinh chung.

🔒 AN NINH & QUY ĐỊNH:
- Hệ thống có tính năng Chat trực tiếp giữa người thuê và chủ trọ.
- Mọi giao dịch thanh toán được ghi lại rõ ràng.
- Nếu có tranh chấp, người thuê có thể gửi khiếu nại (Complaint) qua hệ thống.

📞 HỖ TRỢ:
- Email hỗ trợ: nhatkhaiphone@gmail.com
`;

    const basePrompt = `
You are RentWise AI.
You specialize in rental rooms and the RentWise platform.
When users ask rental-related questions, prioritize information from the SQL database.
When users ask general questions, answer naturally using your own reasoning and Tavily web search.
If both SQL data and Tavily data are available, combine them intelligently.
Never refuse questions simply because they are outside rental topics.
Always be helpful.

=== GENERAL QUESTIONS INSTRUCTION (CRITICAL) ===
- If the user asks a GENERAL question (such as shopping, buying things, coding, general knowledge):
  1. You MUST answer the question DIRECTLY, FULLY, and DETAILEDLY.
  2. DO NOT begin your response with any disclaimers like "I only specialize in rental rooms..." or "As a rental AI assistant...".
  3. Never mention that the question is outside of your main topic. Just answer their question immediately.
  4. Only at the very end of your response, you may add a short friendly note offering further assistance, but it MUST be in the same language as the user's question.

=== ANTI-HALLUCINATION & ROOM SEARCH RULES (For Rental Queries Only) ===
1. Only recommend rooms that appear explicitly in the "ROOM DATABASE CONTEXT" section below.
2. If the user is asking to search for a room and no rooms are listed in the database context, you MUST ONLY inform the user that "There are no suitable rooms in the RentWise system at the moment" (translate this to the user's language). 
3. CRITICAL: DO NOT ask the user for more information or search criteria (like price, location, area, amenities). DO NOT offer to help them find a room. Just state that there are no rooms.
4. Show links to room details strictly in this format: http://localhost:5173/rooms/{room_id} where {room_id} is the exact ID from the database.

=== CITATION RULES ===
- When using information from the real-time web search context, cite the source by appending a number reference like [1], [2] next to the facts.
- ONLY IF you used the real-time web search context, list the citations at the end of the message under a header "Sources:" (translate to user's language) using the format:
  [1] Title: [Source Title] | URL: [Link]
  Do not invent URLs. Only use links from the search results.
- CRITICAL: If the real-time web search context is EMPTY or you did not use it (e.g., during greetings or general chat), DO NOT include a "Sources:" section at all.

=== FOLLOW-UP QUESTIONS ===
At the very end of your response, you MUST generate exactly THREE helpful follow-up questions related to the conversation.
Format them using custom XML tags so they can be parsed out cleanly:
<followups>
  <followup>First follow-up question?</followup>
  <followup>Second follow-up question?</followup>
  <followup>Third follow-up question?</followup>
</followups>
Do not omit these tags. They are required.
`;

    let dataContexts = '';
    
    if (sqlContext) {
      dataContexts += `\n=== ROOM DATABASE CONTEXT ===\n${sqlContext}\n`;
    }
    
    if (tavilyContext) {
      dataContexts += `\n=== REAL-TIME WEB SEARCH CONTEXT ===\n${tavilyContext}\n`;
    }

    const authContext = isAuthenticated 
      ? `\nUser is currently logged in. You can refer to their active bookings or contracts if provided in the context.\n`
      : `\nUser is NOT logged in. If they ask about their personal contracts or bookings, politely prompt them to log in to access this information.\n`;

    const languageRule = `
=== LANGUAGE RULE (CRITICAL - HIGHEST PRIORITY) ===
- YOU MUST MATCH THE USER'S LANGUAGE EXACTLY.
- If the user writes "hi", "hello", "how are you", or ANY English phrase, you MUST reply ENTIRELY in English. DO NOT output any Vietnamese.
- If the user writes in Vietnamese, reply in Vietnamese.
- Your entire response, including greetings, follow-up questions, and citations, MUST be in the same language as the user's message.
`;

    return `${basePrompt}\n${faqKnowledge}\n${authContext}\n${dataContexts}\n${languageRule}`;
  }

  /**
   * Helper to format SQL room listings for AI consumption.
   * @param {Array} rooms List of database room records
   * @returns {string} Formatted context block
   */
  static formatRoomsForContext(rooms) {
    if (!rooms || rooms.length === 0) {
      return 'NO ROOMS matching the criteria were found in the database.';
    }

    return rooms.map(r => {
      const facs = r.facilities ? r.facilities.map(f => f.facility_name).join(', ') : 'None';
      const landlord = r.landlord ? `${r.landlord.full_name} (Email: ${r.landlord.email}, Phone: ${r.landlord.phone || 'N/A'})` : 'Unknown';
      return `Room ID: ${r.room_id}
Title: "${r.title}"
Price: ${r.price_per_month} VND/month
Address: ${r.address}, ${r.district || ''}, ${r.city}
Area: ${r.area_sqm} sqm
Max Occupants: ${r.max_occupants}
Bedrooms: ${r.bedrooms}
Landlord: ${landlord}
Facilities: ${facs}
Detail Link: http://localhost:5173/rooms/${r.room_id}`;
    }).join('\n\n---\n\n');
  }

  /**
   * Helper to format personal data context (contracts, bookings, complaints).
   * @param {object} personalData Context details
   * @returns {string} Formatted string
   */
  static formatPersonalContext(personalData) {
    let context = '=== USER PERSONAL DATABASE RECORDS ===\n';
    
    if (personalData.bookings && personalData.bookings.length > 0) {
      context += '\nActive/Recent Bookings (Lịch đặt phòng):\n' + personalData.bookings.map(b => 
        `- Booking ID: ${b.booking_id} | Room ID: ${b.room?.room_id} | Title: "${b.room?.title}" | Schedule: ${b.viewing_date || b.booking_date} | Status: ${b.status}`
      ).join('\n');
    } else if (personalData.bookings) {
      context += '\nNo active bookings found.\n';
    }

    if (personalData.contracts && personalData.contracts.length > 0) {
      context += '\nActive/Recent Contracts (Hợp đồng thuê phòng):\n' + personalData.contracts.map(c => 
        `- Contract ID: ${c.contract_id} | Room ID: ${c.room?.room_id} | Title: "${c.room?.title}" | Rent: ${c.price_per_month} VND | Status: ${c.status} | Start Date: ${c.start_date} | End Date: ${c.end_date}`
      ).join('\n');
    } else if (personalData.contracts) {
      context += '\nNo active contracts found.\n';
    }

    if (personalData.complaints && personalData.complaints.length > 0) {
      context += '\nSubmitted Complaints (Khiếu nại):\n' + personalData.complaints.map(cp => 
        `- Complaint ID: ${cp.complaint_id} | Room ID: ${cp.room?.room_id} | Title: "${cp.title}" | Status: ${cp.status} | Description: "${cp.description}"`
      ).join('\n');
    } else if (personalData.complaints) {
      context += '\nNo submitted complaints found.\n';
    }

    return context;
  }

  static buildSearchSummaryPrompt(rooms, query, searchCriteria, totalCount) {
    let roomsData = 'Không tìm thấy phòng trọ nào.';
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let minArea = Infinity;
    let maxArea = -Infinity;
    const cities = new Set();
    const districts = new Set();

    if (rooms && rooms.length > 0) {
      roomsData = rooms.map((r, idx) => {
        const priceNum = Number(r.price_per_month);
        if (!isNaN(priceNum)) {
          if (priceNum < minPrice) minPrice = priceNum;
          if (priceNum > maxPrice) maxPrice = priceNum;
        }
        const areaNum = Number(r.area_sqm);
        if (!isNaN(areaNum)) {
          if (areaNum < minArea) minArea = areaNum;
          if (areaNum > maxArea) maxArea = areaNum;
        }
        if (r.city) cities.add(r.city);
        if (r.district) districts.add(r.district);

        const price = r.price_per_month ? Number(r.price_per_month).toLocaleString('vi-VN') : 'N/A';
        const facilities = r.facilities ? r.facilities.map(f => f.facility_name).join(', ') : 'Không có';
        return `Phòng ${idx + 1}:
- Tên: ${r.title}
- Giá: ${price} VND/tháng
- Địa chỉ: ${r.address}, ${r.district || ''}, ${r.city}
- Diện tích: ${r.area_sqm} m²
- Số người tối đa: ${r.max_occupants}
- Tiện ích: ${facilities}`;
      }).join('\n\n');
    }

    const minPriceStr = minPrice !== Infinity ? (minPrice / 1000000).toLocaleString('vi-VN') + ' triệu' : 'N/A';
    const maxPriceStr = maxPrice !== -Infinity ? (maxPrice / 1000000).toLocaleString('vi-VN') + ' triệu' : 'N/A';
    const priceRangeStr = minPrice === maxPrice ? minPriceStr : `${minPriceStr} đến ${maxPriceStr}`;

    const minAreaStr = minArea !== Infinity ? minArea + ' m²' : 'N/A';
    const maxAreaStr = maxArea !== -Infinity ? maxArea + ' m²' : 'N/A';
    const areaRangeStr = minArea === maxArea ? minAreaStr : `${minAreaStr} đến ${maxAreaStr}`;

    const locationsStr = [...districts].join(', ') + (cities.size > 0 ? `, ${[...cities].join(', ')}` : '');

    return `
Bạn là trợ lý AI thông minh của RentWise. Người dùng vừa tìm kiếm phòng trọ bằng câu hỏi tự nhiên: "${query}".
Hệ thống của chúng tôi đã truy xuất được ${totalCount} phòng trọ từ cơ sở dữ liệu SQL như dưới đây:

=== DANH SÁCH PHÒNG TRUY XUẤT ĐƯỢC ===
${roomsData}

=== THÔNG TIN THỐNG KÊ THỰC TẾ (BẮT BUỘC SỬ DỤNG SỐ LIỆU NÀY) ===
- Số lượng phòng phù hợp: ${totalCount} phòng.
- Khoảng giá thực tế: ${priceRangeStr} VND/tháng.
- Khoảng diện tích thực tế: ${areaRangeStr}.
- Khu vực thực tế: ${locationsStr || 'N/A'}.

=== YÊU CẦU ===
Hãy viết một đoạn TỔNG QUAN TÌM KIẾM CHI TIẾT (AI Overview) bằng chính ngôn ngữ mà người dùng đã sử dụng trong câu hỏi (khoảng 3-5 câu hoặc danh sách gạch đầu dòng ngắn gọn) để tổng hợp các kết quả này cho người dùng.
Đoạn tổng quan cần nêu rõ:
1. Số lượng phòng phù hợp tìm thấy.
2. Khoảng giá dao động thực tế (SỬ DỤNG CHÍNH XÁC: ${priceRangeStr} VND/tháng).
3. Khu vực phân bố chính (SỬ DỤNG CHÍNH XÁC: ${locationsStr}).
4. Các đặc điểm tiện ích nổi bật hoặc sự phù hợp của các phòng.
5. Chỉ ra 1-2 phòng nổi bật nhất để người dùng lưu ý (ví dụ: phòng giá tốt nhất hoặc diện tích rộng nhất).

CHÚ Ý: 
- Trình bày đẹp mắt, chuyên nghiệp theo phong cách "Google AI Overview". Sử dụng các định dạng gạch đầu dòng, chữ đậm (bold) và icon/emoji phù hợp để người dùng dễ theo dõi.
- Không được bịa đặt bất kỳ thông tin nào ngoài danh sách phòng được cung cấp ở trên.
- Phản hồi bằng chính ngôn ngữ mà người dùng đã sử dụng ("${query}"). Nếu tiếng Việt thì xưng "em/mình" và gọi "bạn/anh/chị". Nếu tiếng Anh thì dùng "I/you".
`;
  }
}

module.exports = PromptBuilder;
