const { GoogleGenerativeAI } = require('@google/generative-ai');

const ocrController = {
  scanCCCD: async (req, res) => {
    try {
      if (!req.files || req.files.length !== 2) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng tải lên đầy đủ 2 ảnh (mặt trước và mặt sau) của Căn cước công dân.',
        });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          success: false,
          message: 'Chưa cấu hình GEMINI_API_KEY trên server.',
        });
      }

      // Initialize Gemini
      const genAI = new GoogleGenerativeAI(apiKey);

      const prompt = `
Bạn là một chuyên gia trích xuất dữ liệu từ Căn cước công dân (CCCD) Việt Nam.
Tôi đã gửi cho bạn 2 hình ảnh. Một ảnh là mặt trước, và một ảnh là mặt sau của cùng một Căn cước công dân (CCCD).
Hãy phân tích cả hai ảnh và trích xuất các thông tin sau.
Trạng thái ngày tháng (dob, issueDate) phải giữ nguyên định dạng trên thẻ (thường là dd/mm/yyyy).

LƯU Ý QUAN TRỌNG:
- Bạn phải kiểm tra kỹ lưỡng xem hai ảnh này có phải là mặt trước và mặt sau của một Căn cước công dân (hoặc Chứng minh nhân dân) Việt Nam hợp lệ và rõ nét hay không.
- Nếu một hoặc cả hai ảnh bị mờ, bị cắt góc, bị che khuất thông tin, không đọc được, hoặc không phải là mặt trước và mặt sau của CCCD Việt Nam, hãy đặt "isValidCccd" thành false.
- Chỉ trả về duy nhất chuỗi JSON chuẩn dưới đây, không kèm định dạng markdown hay giải thích nào khác.

Cấu trúc JSON yêu cầu:
{
  "isValidCccd": true/false (true nếu có đủ cả mặt trước và mặt sau rõ nét và hợp lệ, false nếu ngược lại),
  "fullName": "Họ và tên",
  "idNumber": "Số CCCD (12 số)",
  "dob": "Ngày sinh (dd/mm/yyyy)",
  "address": "Nơi thường trú (lấy đầy đủ)",
  "issueDate": "Ngày cấp (dd/mm/yyyy)",
  "issuePlace": "Nơi cấp (thường là Cục trưởng Cục Cảnh sát quản lý hành chính về trật tự xã hội hoặc Cục Cảnh sát QLHC về TTXH)"
}
`;
      
      const imageParts = req.files.map(file => ({
        inlineData: {
          data: file.buffer.toString("base64"),
          mimeType: file.mimetype
        }
      }));

      let responseText = '';
      let errorMsgs = [];

      // Try gemini-2.5-flash first, fallback to gemini-1.5-flash and gemini-2.0-flash if needed
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent([prompt, ...imageParts]);
        responseText = result.response.text();
      } catch (err) {
        console.warn('Failed with gemini-2.5-flash, trying gemini-1.5-flash fallback:', err.message);
        errorMsgs.push('gemini-2.5-flash: ' + err.message);
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const result = await model.generateContent([prompt, ...imageParts]);
          responseText = result.response.text();
        } catch (err2) {
          console.warn('Failed with gemini-1.5-flash, trying gemini-2.0-flash fallback:', err2.message);
          errorMsgs.push('gemini-1.5-flash: ' + err2.message);
          try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent([prompt, ...imageParts]);
            responseText = result.response.text();
          } catch (err3) {
            console.error('All Gemini model requests failed:', err3);
            errorMsgs.push('gemini-2.0-flash: ' + err3.message);
            throw new Error('Tất cả các mô hình AI đều không khả dụng. Chi tiết lỗi: ' + errorMsgs.join('; '));
          }
        }
      }
      
      // Clean up markdown block if Gemini still returns it
      const cleanedJsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      let parsedData;
      try {
        parsedData = JSON.parse(cleanedJsonText);
      } catch (parseErr) {
        console.error('Failed to parse Gemini JSON:', cleanedJsonText);
        return res.status(400).json({
          success: false,
          message: 'Không thể trích xuất thông tin. Ảnh tải lên có thể bị mờ, lóa sáng hoặc không phải Căn cước công dân. Vui lòng chụp lại ảnh rõ nét và thử lại!',
        });
      }

      if (parsedData.isValidCccd === false || !parsedData.idNumber || !parsedData.fullName || !parsedData.issueDate) {
        return res.status(400).json({
          success: false,
          message: 'Hình ảnh tải lên không hợp lệ hoặc không rõ ràng. Vui lòng tải lên ảnh chụp đầy đủ cả MẶT TRƯỚC và MẶT SAU Căn cước công dân rõ nét và thử lại!',
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          idNumber: parsedData.idNumber,
          fullName: parsedData.fullName,
          dob: parsedData.dob,
          address: parsedData.address,
          issueDate: parsedData.issueDate || '',
          issuePlace: parsedData.issuePlace || 'Cục Cảnh sát Quản lý hành chính về trật tự xã hội'
        }
      });

    } catch (error) {
      console.error('OCR Gemini Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi trong quá trình kết nối với máy chủ AI: ' + error.message,
      });
    }
  }
};

module.exports = ocrController;
