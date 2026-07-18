const axios = require('axios');
const fs = require('fs');

// =========================================================================
// CẤU HÌNH CHẾ ĐỘ QUÉT CCCD:
// 'MOCK'   - Chế độ giả lập ngẫu nhiên
// 'GEMINI' - Quét thật bằng Google Gemini 2.5 Flash (Hoạt động rất nhanh và ổn định)
// =========================================================================
const OCR_MODE = 'GEMINI';

/**
 * Chuyển đổi đường dẫn ảnh hoặc Cloudinary URL thành chuỗi Base64
 */
async function getBase64Data(imagePath) {
  try {
    if (imagePath.startsWith('http')) {
      let targetUrl = imagePath;
      // Tối ưu hóa ảnh trên Cloudinary xuống kích thước 800px rộng, chất lượng auto
      // Việc này giúp giảm dung lượng ảnh từ ~4MB xuống còn ~50KB để tải cực nhanh
      if (imagePath.includes('/image/upload/')) {
        targetUrl = imagePath.replace('/image/upload/', '/image/upload/w_800,q_auto/');
        console.log('🔄 [OCR] Đang tải ảnh nén từ Cloudinary:', targetUrl);
      }
      const response = await axios.get(targetUrl, { responseType: 'arraybuffer' });
      return Buffer.from(response.data, 'binary').toString('base64');
    } else {
      const fileBuffer = fs.readFileSync(imagePath);
      return fileBuffer.toString('base64');
    }
  } catch (error) {
    console.error('Lỗi chuyển đổi ảnh sang Base64:', error.message);
    throw error;
  }
}

/**
 * Service to handle OCR scanning for CCCD
 */
class OcrService {
  async scanCCCD(frontImagePath, backImagePath) {
    try {
      console.log(`ℹ️ [OCR] Bắt đầu quét CCCD (Tải lên Cloudinary trước) ở chế độ: ${OCR_MODE}`);

      // =========================================================================
      // 1. CHẾ ĐỘ GIẢ LẬP (MOCK)
      // =========================================================================
      if (OCR_MODE === 'MOCK') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const cccdPrefixes = ['001', '038', '079', '040', '031'];
        const randomPrefix = cccdPrefixes[Math.floor(Math.random() * cccdPrefixes.length)];
        const randomSuffix = Math.floor(100000000 + Math.random() * 900000000).toString();
        const randomIcNumber = randomPrefix + '0' + randomSuffix.substring(1);
        
        const issueYears = ['2020', '2021', '2022', '2023', '2024'];
        const randomYear = issueYears[Math.floor(Math.random() * issueYears.length)];
        const randomMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const randomDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        
        const addresses = [
          'Phường Dịch Vọng, Quận Cầu Giấy, Thành phố Hà Nội',
          'Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh',
          'Phường Hòa Khánh Bắc, Quận Liên Chiểu, Thành phố Đà Nẵng',
          'Phường Hàng Bài, Quận Hoàn Kiếm, Thành phố Hà Nội',
          'Phường Xuân Khánh, Quận Ninh Kiều, Thành phố Cần Thơ'
        ];
        
        return {
          success: true,
          data: {
            icNumber: randomIcNumber,
            icIssueDate: `${randomYear}-${randomMonth}-${randomDay}`,
            icIssuePlace: 'Cục Cảnh sát quản lý hành chính về trật tự xã hội',
            permanentAddress: addresses[Math.floor(Math.random() * addresses.length)],
          },
        };
      }

      // =========================================================================
      // 2. CHẾ ĐỘ QUÉT THẬT BẰNG GOOGLE GEMINI 2.5 FLASH
      // =========================================================================
      if (OCR_MODE === 'GEMINI') {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error('Thiếu GEMINI_API_KEY trong file .env');
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        const parts = [
          {
            text: `Đây là ảnh mặt trước và mặt sau của Căn cước công dân Việt Nam. Hãy đọc kỹ từng chữ trên ảnh và bóc tách các thông tin sau thành một đối tượng JSON chuẩn (chỉ trả về JSON, không thêm bất kỳ ký tự giải thích hay định dạng markdown \`\`\`json nào cả).

            LƯU Ý CỰC KỲ QUAN TRỌNG VỀ TIẾNG VIỆT:
            - Phải đọc chính xác từng dấu thanh (huyền, sắc, hỏi, ngã, nặng) của tiếng Việt. Không được tự ý lược bỏ hoặc nhận diện sai dấu thanh. Ví dụ, nếu trên ảnh ghi "Trường Đồng" thì PHẢI trích xuất đúng là "Trường Đồng", tuyệt đối không được ghi sai thành "Trường Đông".
            - Hãy đối chiếu với các địa danh thực tế của Việt Nam để ghi đúng tên xã/phường, quận/huyện, tỉnh/thành phố.

            {
              "icNumber": "Số CCCD (chuỗi 12 chữ số viết liền)",
              "icIssueDate": "Ngày cấp định dạng YYYY-MM-DD",
              "icIssuePlace": "Nơi cấp (ghi chính xác cụm từ trên thẻ như 'Cục Cảnh sát QLHC về TTXH' hoặc tương đương)",
              "permanentAddress": "Địa chỉ thường trú (ghi đầy đủ xã/phường, quận/huyện, tỉnh/thành phố)"
            }`
          }
        ];

        // Tải ảnh mặt trước từ Cloudinary URL rồi mã hóa sang Base64
        if (frontImagePath) {
          console.log('📷 Đang tải ảnh mặt trước từ Cloudinary và mã hóa...');
          const frontBase64 = await getBase64Data(frontImagePath);
          parts.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: frontBase64
            }
          });
        }

        // Tải ảnh mặt sau từ Cloudinary URL rồi mã hóa sang Base64
        if (backImagePath) {
          console.log('📷 Đang tải ảnh mặt sau từ Cloudinary và mã hóa...');
          const backBase64 = await getBase64Data(backImagePath);
          parts.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: backBase64
            }
          });
        }

        console.log('🤖 Gemini 2.5 Flash đang phân tích hình ảnh (Sau khi tải từ Cloudinary)...');
        const response = await axios.post(url, {
          contents: [{ parts }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        });

        const resultText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!resultText) {
          throw new Error('Không nhận được phản hồi từ Gemini API.');
        }

        console.log('✅ Kết quả trả về từ Gemini:', resultText);
        const parsedData = JSON.parse(resultText.trim());

        return {
          success: true,
          data: {
            icNumber: parsedData.icNumber || '',
            icIssueDate: parsedData.icIssueDate || '',
            icIssuePlace: parsedData.icIssuePlace || '',
            permanentAddress: parsedData.permanentAddress || '',
          }
        };
      }

      throw new Error('Chế độ quét OCR_MODE không hợp lệ.');
    } catch (error) {
      console.error('OCR Service Error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.error?.message || error.message || 'Lỗi khi quét thông tin CCCD',
      };
    }
  }
}

module.exports = new OcrService();
