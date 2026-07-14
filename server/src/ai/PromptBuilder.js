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
=== CHÍNH SÁCH & QUY ĐỊNH CHI TIẾT CỦA HỆ THỐNG RENTWISE ===

📋 QUY TRÌNH THUÊ PHÒNG (CHI TIẾT TỪNG BƯỚC):
Bước 1: TÌM KIẾM PHÒNG
- Sử dụng trang "Khám phá" hoặc thanh tìm kiếm trên trang chủ.
- Có thể lọc theo: thành phố, quận/huyện, giá, diện tích, số người ở, tiện ích phòng (WiFi, điều hòa, ban công...), tiện ích lân cận (gần trường, bệnh viện, siêu thị...).
- Hỗ trợ AI Search: nhập mô tả tự nhiên như "phòng 2 người giá 3 triệu quận 1" để AI tự động tìm.

Bước 2: XEM CHI TIẾT & ĐẶT LỊCH XEM PHÒNG
- Xem ảnh, mô tả, tiện ích, giá, thông tin chủ trọ.
- Nhấn "Đặt lịch xem phòng" (Viewing Schedule) → chọn ngày giờ → gửi yêu cầu.
- Chủ trọ sẽ duyệt hoặc từ chối lịch hẹn.

Bước 3: GỬI YÊU CẦU THUÊ (RENTAL REQUEST)
- Sau khi xem phòng ưng ý, nhấn "Gửi yêu cầu thuê".
- Điền thông tin: ngày bắt đầu, thời hạn thuê, ghi chú.
- Chủ trọ duyệt yêu cầu → Hệ thống tạo hợp đồng.

Bước 4: KÝ HỢP ĐỒNG ĐIỆN TỬ
- Hợp đồng điện tử bao gồm: thông tin hai bên (CCCD, địa chỉ thường trú), giá thuê, thời hạn, điều khoản.
- Cả hai bên ký điện tử trên hệ thống.
- Hợp đồng có giá trị pháp lý.

Bước 5: THANH TOÁN & NHẬN PHÒNG
- Thanh toán tiền cọc + tiền tháng đầu qua VNPay hoặc PayOS.
- Sau khi thanh toán thành công → Nhận phòng.

💰 CHÍNH SÁCH TÀI CHÍNH CHI TIẾT:

🔹 Tiền cọc:
- Thông thường bằng 1-2 tháng tiền thuê (do chủ trọ quy định, ghi rõ trong hợp đồng).
- Tiền cọc được giữ trong suốt thời gian thuê.
- Khi hết hợp đồng và trả phòng đúng hạn: cọc được hoàn lại 100%.
- Nếu vi phạm hợp đồng (trả phòng sớm, hư hỏng tài sản): có thể bị trừ một phần hoặc toàn bộ tiền cọc.

🔹 Thanh toán:
- Hỗ trợ thanh toán qua VNPay (ATM nội địa, Visa, MasterCard, QR Pay).
- Hỗ trợ thanh toán qua PayOS.
- Mỗi giao dịch đều được ghi lại với mã giao dịch rõ ràng.
- Lịch sử thanh toán có thể xem trong trang "Quản lý thanh toán".

🔹 Hoàn tiền:
- Hủy TRƯỚC khi ký hợp đồng: hoàn 100% tiền cọc trong 3-5 ngày làm việc.
- Hủy SAU khi ký hợp đồng: tùy điều khoản hợp đồng (thường mất tiền cọc).
- Hoàn tiền được xử lý tự động qua hệ thống.
- Nếu hoàn tiền quá hạn, liên hệ hỗ trợ qua email.

📄 HỢP ĐỒNG CHI TIẾT:

🔹 Tạo hợp đồng:
- Chủ trọ tạo hợp đồng sau khi duyệt yêu cầu thuê.
- Nội dung hợp đồng: thông tin hai bên (họ tên, CCCD, ngày cấp, nơi cấp, địa chỉ thường trú), giá thuê, thời hạn, quy định.

🔹 Ký hợp đồng:
- Ký điện tử trên hệ thống (chữ ký tay trên màn hình).
- Cả chủ trọ và người thuê đều phải ký.
- Hợp đồng có hiệu lực ngay sau khi cả hai bên ký.

🔹 Thời hạn:
- Tối thiểu 1 tháng (tùy chủ trọ).
- Phổ biến: 6 tháng, 12 tháng.
- Có thể gia hạn trực tuyến trước khi hết hạn.

🔹 Chấm dứt hợp đồng:
- Hết hạn: hợp đồng tự động kết thúc, cọc được hoàn lại.
- Chấm dứt sớm: cần báo trước (thường 30 ngày), có thể mất cọc tùy điều khoản.
- Vi phạm: bên vi phạm chịu trách nhiệm bồi thường theo hợp đồng.

🔹 Gia hạn hợp đồng:
- Khi hợp đồng sắp hết hạn, hệ thống sẽ gửi thông báo.
- Người thuê hoặc chủ trọ có thể đề xuất gia hạn.
- Gia hạn có thể điều chỉnh giá thuê mới.

⚡ ĐIỆN NƯỚC & PHỤ PHÍ:
- Giá điện: tùy chủ trọ (thường từ 3.000-4.000 VNĐ/kWh hoặc theo giá nhà nước).
- Giá nước: tùy chủ trọ (thường từ 15.000-30.000 VNĐ/m³).
- Internet: tùy phòng (một số phòng đã bao gồm WiFi).
- Gửi xe: tùy phòng (thường từ 100.000-200.000 VNĐ/tháng).
- Vệ sinh chung: tùy phòng.
- Tất cả phụ phí đều được ghi rõ trong mô tả phòng và hợp đồng.

🔒 AN NINH & QUY ĐỊNH:
- Chat trực tiếp: người thuê có thể nhắn tin trực tiếp với chủ trọ qua hệ thống.
- Mọi giao dịch thanh toán được ghi lại với mã giao dịch.
- Xác minh danh tính: người dùng có thể xác minh CCCD (ảnh mặt trước, mặt sau, ảnh chân dung) để tăng uy tín.
- Đánh giá: (sắp có) người thuê có thể đánh giá phòng trọ và chủ trọ.

📢 KHIẾU NẠI (COMPLAINT):
- Người thuê có thể gửi khiếu nại qua menu "Khiếu nại" trong dashboard.
- Nội dung khiếu nại: mô tả vấn đề, đính kèm ảnh (nếu có).
- Trạng thái khiếu nại: Pending → In Progress → Resolved.
- Thời gian xử lý: thường trong 3-7 ngày làm việc.
- Admin hệ thống sẽ làm trung gian giải quyết tranh chấp giữa người thuê và chủ trọ.

👥 VAI TRÒ NGƯỜI DÙNG:
🔹 Tenant (Người thuê):
- Tìm kiếm phòng, đặt lịch xem, gửi yêu cầu thuê.
- Ký hợp đồng, thanh toán, gửi khiếu nại.
- Chat với chủ trọ, xem lịch sử giao dịch.
- Sử dụng AI Chat để được tư vấn.

🔹 Landlord (Chủ trọ):
- Đăng phòng (tạo property → thêm phòng → đợi admin duyệt).
- Quản lý yêu cầu thuê, lịch hẹn xem phòng.
- Tạo và quản lý hợp đồng.
- Quản lý tiền cọc, thanh toán.
- Chat với người thuê, xử lý khiếu nại.

🔹 Admin:
- Duyệt phòng mới (approve/reject).
- Quản lý người dùng (ban/unban).
- Xử lý khiếu nại, quản lý hệ thống.
- Xem thống kê tổng quan.

📞 HỖ TRỢ:
- Email hỗ trợ: nhatkhaiphone@gmail.com
- Trợ lý AI RentWise: có mặt 24/7 trên hệ thống.
- Gửi khiếu nại qua hệ thống nếu cần hỗ trợ.
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
  4. Only at the very end of your response, you may add a short friendly note like "Nếu anh/chị cần hỗ trợ thêm thông tin về phòng trọ RentWise, hãy cứ bảo em nhé!".

=== LANGUAGE & TONE RULES (CRITICAL) ===
- ALWAYS detect the language of the user's latest query.
- If they write in English, reply ENTIRELY in English. Do NOT mix Vietnamese.
- If they write in Vietnamese, reply in Vietnamese.
- Match their language tone and style.
- ABSOLUTELY DO NOT use any emojis or icons in your response. Keep the text clean and professional.

=== ANTI-HALLUCINATION RULES ===
1. Only recommend rooms that appear explicitly in the "ROOM DATABASE CONTEXT" section below.
2. If no rooms are listed in the database context, inform the user that no suitable rooms were found in our system. Do NOT fabricate properties, addresses, pricing, or room IDs.
3. Show links to room details strictly in this format: http://localhost:5173/rooms/{room_id} where {room_id} is the exact ID from the database.

=== CITATION RULES ===
- When using information from the real-time web search context, cite the source by appending a number reference like [1], [2] next to the facts.
- At the end of the message, list the citations under a header "Nguồn trích dẫn:" (or "Sources:" in English) using the format:
  [1] Title: [Source Title] | URL: [Link]
  Do not invent URLs. Only use links from the search results.

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

    return `${basePrompt}\n${faqKnowledge}\n${authContext}\n${dataContexts}`;
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
      const images = r.images ? r.images.map(img => img.image_url).join(', ') : 'No images';
      return `Room ID: ${r.room_id}
Title: "${r.title}"
Price: ${r.price_per_month} VND/month
Address: ${r.address}, ${r.district || ''}, ${r.city}
Area: ${r.area_sqm} sqm
Max Occupants: ${r.max_occupants}
Bedrooms: ${r.bedrooms}
Landlord: ${landlord}
Facilities: ${facs}
Images: ${images}
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

  /**
   * Builds a prompt to generate a concise AI summary for the Search page AI Summary Card.
   * @param {Array} rooms List of matched rooms
   * @param {string} query Original user query
   * @param {object} criteria Extracted search criteria
   * @param {number} totalCount Total matching rooms count
   * @returns {Array} Messages array for Groq completion
   */
  static buildSearchSummaryPrompt(rooms, query, criteria, totalCount) {
    const roomSummaries = rooms.slice(0, 6).map(r => {
      const facs = r.facilities ? r.facilities.map(f => f.facility_name).join(', ') : 'N/A';
      return `- "${r.title}" tại ${r.address}, ${r.district || ''}, ${r.city} | Giá: ${Number(r.price_per_month).toLocaleString('vi-VN')} VNĐ/tháng | ${r.area_sqm}m² | Max ${r.max_occupants} người | Tiện ích: ${facs}`;
    }).join('\n');

    const criteriaDesc = [];
    if (criteria.city) criteriaDesc.push(`thành phố: ${criteria.city}`);
    if (criteria.district) criteriaDesc.push(`quận/huyện: ${criteria.district}`);
    if (criteria.priceMax) criteriaDesc.push(`giá tối đa: ${Number(criteria.priceMax).toLocaleString('vi-VN')} VNĐ`);
    if (criteria.priceMin) criteriaDesc.push(`giá tối thiểu: ${Number(criteria.priceMin).toLocaleString('vi-VN')} VNĐ`);
    if (criteria.maxOccupants) criteriaDesc.push(`cho ${criteria.maxOccupants} người`);
    if (criteria.facilities && criteria.facilities.length > 0) criteriaDesc.push(`tiện ích: ${criteria.facilities.join(', ')}`);

    return [
      {
        role: 'system',
        content: `You are RentWise AI, a Vietnamese rental room search assistant. Generate a concise, friendly summary in Vietnamese (2-3 sentences max) of room search results. 
Rules:
- Be concise and natural, like a friendly assistant.
- Mention the total count, price range, and notable features.
- ABSOLUTELY DO NOT use any emojis or icons in your response. Keep the text clean.
- Do NOT list individual rooms.
- Do NOT include links.
- Respond ONLY in Vietnamese.`
      },
      {
        role: 'user',
        content: `Câu hỏi tìm kiếm: "${query}"
Bộ lọc đã trích xuất: ${criteriaDesc.join(', ') || 'không có bộ lọc cụ thể'}
Tổng số phòng tìm thấy: ${totalCount}
Danh sách phòng tiêu biểu:
${roomSummaries || 'Không tìm thấy phòng nào phù hợp.'}

Hãy viết tóm tắt ngắn gọn (2-3 câu) về kết quả tìm kiếm.`
      }
    ];
  }
}

module.exports = PromptBuilder;
