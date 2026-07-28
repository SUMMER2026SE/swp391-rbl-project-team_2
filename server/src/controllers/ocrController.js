const { GoogleGenerativeAI } = require('@google/generative-ai');

const ocrController = {
  scanCCCD: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy file ảnh CCCD.',
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
      // Use gemini-1.5-flash as it's the recommended model for multimodal tasks
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
Bạn là một chuyên gia trích xuất dữ liệu từ Căn cước công dân (CCCD) Việt Nam.
Hãy đọc ảnh mặt trước CCCD này và trích xuất các thông tin sau.
Trạng thái ngày tháng (dob, issueDate) phải giữ nguyên định dạng trên thẻ (thường là dd/mm/yyyy).
Trả về KẾT QUẢ DUY NHẤT LÀ ĐÚNG 1 CHUỖI JSON CHUẨN, không có bất kỳ định dạng markdown (\`\`\`json) nào hay văn bản giải thích nào khác.
Cấu trúc JSON yêu cầu:
{
  "fullName": "Họ và tên",
  "idNumber": "Số CCCD (12 số)",
  "dob": "Ngày sinh",
  "address": "Nơi thường trú (lấy đầy đủ)",
  "issueDate": "Ngày cấp (nếu có, không có để trống)",
  "issuePlace": "Nơi cấp (thường là Cục Cảnh sát Quản lý hành chính về trật tự xã hội)"
}
`;
      
      const imagePart = {
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype
        }
      };

      const result = await model.generateContent([prompt, imagePart]);
      const responseText = result.response.text();
      
      // Clean up markdown block if Gemini still returns it
      const cleanedJsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      let parsedData;
      try {
        parsedData = JSON.parse(cleanedJsonText);
      } catch (parseErr) {
        console.error('Failed to parse Gemini JSON:', cleanedJsonText);
        return res.status(400).json({
          success: false,
          message: 'Không thể trích xuất thông tin. Ảnh có thể bị mờ hoặc không phải CCCD.',
        });
      }

      if (!parsedData.idNumber || !parsedData.fullName) {
        return res.status(400).json({
          success: false,
          message: 'Ảnh không rõ ràng, không tìm thấy Số CCCD và Họ tên.',
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
