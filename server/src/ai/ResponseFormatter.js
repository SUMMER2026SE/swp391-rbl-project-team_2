const { Room } = require('../models');
const { Op } = require('sequelize');

/**
 * Service to process and format LLM responses, handle anti-hallucination checks, and extract XML tags.
 */
class ResponseFormatter {
  /**
   * Cleans raw AI response, validates room links, and extracts followups.
   * @param {string} text Raw AI output
   * @param {Array<string>} [knownRoomIds] Optional list of matched room IDs in the search context
   * @returns {Promise<{reply: string, followups: string[]}>}
   */
  static async format(text, knownRoomIds = []) {
    if (!text) return { reply: '', followups: [] };

    // 1. Validate Room Links
    const validatedText = await this.validateRoomLinks(text, knownRoomIds);

    // 2. Extract and strip followups
    const result = this.extractFollowups(validatedText);

    return result;
  }

  /**
   * Helper to validate room links in assistant replies.
   */
  static async validateRoomLinks(text, knownRoomIds = []) {
    const roomLinkRegex = /http:\/\/localhost:\d+\/rooms\/([\w-]+)/g;
    let match;
    const foundIds = [];
    
    while ((match = roomLinkRegex.exec(text)) !== null) {
      foundIds.push(match[1]);
    }

    if (foundIds.length === 0) return text;

    let validIds = knownRoomIds;
    if (!validIds || validIds.length === 0) {
      try {
        const existingRooms = await Room.findAll({
          where: { 
            room_id: { [Op.in]: foundIds.map(id => parseInt(id)).filter(id => !isNaN(id)) },
            is_deleted: false 
          },
          attributes: ['room_id']
        });
        validIds = existingRooms.map(r => String(r.room_id));
      } catch (err) {
        console.error('[ResponseFormatter] Failed to query existing room IDs:', err.message);
      }
    }

    let cleanedReply = text;
    const validIdSet = new Set(validIds.map(String));

    for (const id of foundIds) {
      if (!validIdSet.has(String(id))) {
        console.warn(`[AI VALIDATION] Removing hallucinated room link with ID: ${id}`);
        const fakeLinkRegex = new RegExp(`http:\/\/localhost:\\d+\/rooms\/${id}`, 'g');
        cleanedReply = cleanedReply.replace(fakeLinkRegex, '[link không khả dụng]');
      }
    }

    // Add general notice if all links were removed
    const remainingLinks = /http:\/\/localhost:\d+\/rooms\/[\w-]+/g;
    if (foundIds.length > 0 && !remainingLinks.test(cleanedReply)) {
      cleanedReply += '\n\n⚠️ *Lưu ý: Một số thông tin phòng trọ do AI gợi ý không chính xác. Bạn có thể sử dụng chức năng "Khám phá" để xem danh sách phòng thực tế.*';
    }

    return cleanedReply;
  }

  /**
   * Extracts follow-up questions from the response and strips XML tags.
   */
  static extractFollowups(text) {
    const followupRegex = /<followup>([\s\S]*?)<\/followup>/g;
    let match;
    const followups = [];
    while ((match = followupRegex.exec(text)) !== null) {
      const q = match[1].trim();
      if (q) followups.push(q);
    }

    // Clean up the text by removing the XML blocks
    let cleanedText = text.replace(/<followups>[\s\S]*?<\/followups>/g, '').trim();
    cleanedText = cleanedText.replace(/<followup>[\s\S]*?<\/followup>/g, '').trim();

    // Default fallback if no followups found
    if (followups.length === 0) {
      followups.push(
        "Tìm phòng trọ Quận 1 giá tốt?",
        "Quy trình thanh toán đặt cọc như thế nào?",
        "Chính sách cọc tiền của RentalWise?"
      );
    }

    // Fill up if fewer than 3
    while (followups.length < 3) {
      followups.push("Tìm phòng trọ gần đây");
    }

    return {
      reply: cleanedText,
      followups: followups.slice(0, 3)
    };
  }
}

module.exports = ResponseFormatter;
