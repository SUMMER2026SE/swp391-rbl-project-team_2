const puppeteer = require('puppeteer');

const formatCurrency = (val) => {
  if (!val) return '0';
  return new Intl.NumberFormat('vi-VN').format(val);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

/**
 * Generates a signed PDF contract buffer using Puppeteer
 * @param {Object} contractData - Contract, room, landlord, and tenant details
 * @returns {Promise<Buffer>} PDF Buffer
 */
const generateContractPdfBuffer = async (contractData) => {
  const {
    contractNumber = '',
    startDate = '',
    endDate = '',
    monthlyRent = 0,
    depositAmount = 0,
    room = {},
    landlord = {},
    tenant = {},
    landlordName = '',
    landlordIc = '',
    landlordIcIssueDate = '',
    landlordIcIssuePlace = '',
    landlordPermanentAddress = '',
    landlordSignature = '',
    tenantName = '',
    tenantIc = '',
    tenantIcIssueDate = '',
    tenantIcIssuePlace = '',
    tenantPermanentAddress = '',
    tenantSignature = '',
  } = contractData;

  const roomTitle = room.title || 'Phòng trọ';
  const fullAddress = `${room.address || ''}${room.ward ? `, ${room.ward}` : ''}${room.district ? `, ${room.district}` : ''}${room.city ? `, ${room.city}` : ''}`;
  const finalLandlordName = landlordName || landlord.full_name || 'Bên cho thuê';
  const finalTenantName = tenantName || tenant.full_name || 'Bên thuê';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      <title>Hợp Đồng Thuê Nhà Trọ - ${contractNumber}</title>
      <style>
        @page { size: A4; margin: 20mm; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.5; color: #000; background: #fff; margin: 0; padding: 0; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h3 { margin: 0 0 4px 0; font-size: 13pt; font-weight: bold; text-transform: uppercase; }
        .header h4 { margin: 0 0 12px 0; font-size: 12pt; font-weight: bold; }
        .title { text-align: center; font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 20px 0 10px 0; }
        .section-title { font-size: 13pt; font-weight: bold; margin-top: 14px; margin-bottom: 6px; }
        .grid-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .grid-table td { padding: 4px 0; vertical-align: top; }
        .grid-table td.label { width: 35%; font-weight: normal; }
        ul { margin: 4px 0 10px 20px; padding: 0; }
        li { margin-bottom: 6px; text-align: justify; }
        .signatures { width: 100%; margin-top: 30px; border-collapse: collapse; page-break-inside: avoid; }
        .signatures td { width: 50%; text-align: center; vertical-align: top; padding: 10px; }
        .sig-name { font-weight: bold; margin-bottom: 4px; }
        .sig-sub { font-style: italic; font-size: 11pt; color: #444; margin-bottom: 12px; }
        .sig-img { max-height: 90px; max-width: 200px; margin-top: 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h3>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
        <h4>Độc lập - Tự do - Hạnh phúc</h4>
        <div style="width: 160px; height: 1px; background: #000; margin: 0 auto;"></div>
      </div>

      <div class="title">HỢP ĐỒNG THUÊ PHÒNG TRỌ</div>
      <div style="text-align: center; font-style: italic; margin-bottom: 20px;">Số: ${contractNumber}</div>

      <p>Hôm nay, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}, chúng tôi gồm có:</p>

      <div class="section-title">BÊN CHO THUÊ (BÊN A):</div>
      <table class="grid-table">
        <tr><td class="label">Họ và tên:</td><td><strong>${finalLandlordName}</strong></td></tr>
        <tr><td class="label">Số CCCD/CMND:</td><td>${landlordIc || '...........................................'}</td></tr>
        <tr><td class="label">Ngày cấp:</td><td>${formatDate(landlordIcIssueDate) || '.....................'} ${landlordIcIssuePlace ? `tại ${landlordIcIssuePlace}` : ''}</td></tr>
        <tr><td class="label">Địa chỉ thường trú:</td><td>${landlordPermanentAddress || fullAddress}</td></tr>
      </table>

      <div class="section-title">BÊN THUÊ (BÊN B):</div>
      <table class="grid-table">
        <tr><td class="label">Họ và tên:</td><td><strong>${finalTenantName}</strong></td></tr>
        <tr><td class="label">Số CCCD/CMND:</td><td>${tenantIc || '...........................................'}</td></tr>
        <tr><td class="label">Ngày cấp:</td><td>${formatDate(tenantIcIssueDate) || '.....................'} ${tenantIcIssuePlace ? `tại ${tenantIcIssuePlace}` : ''}</td></tr>
        <tr><td class="label">Địa chỉ thường trú:</td><td>${tenantPermanentAddress || '...........................................................................'}</td></tr>
      </table>

      <p>Sau khi thỏa thuận, hai bên nhất trí ký kết hợp đồng thuê phòng trọ với các điều khoản sau:</p>

      <div class="section-title">1. Nội dung hợp đồng</div>
      <ul>
        <li>Bên A đồng ý cho Bên B thuê phòng trọ thuộc căn hộ/nhà tại địa chỉ: <strong>${fullAddress}</strong> (${roomTitle}).</li>
        <li>Thời hạn thuê: Từ ngày <strong>${formatDate(startDate)}</strong> đến ngày <strong>${formatDate(endDate)}</strong>.</li>
        <li>Giá tiền thuê phòng: <strong>${formatCurrency(monthlyRent)} VNĐ/tháng</strong>.</li>
        <li>Tiền đặt cọc: <strong>${formatCurrency(depositAmount)} VNĐ</strong>.</li>
      </ul>

      <div class="section-title">2. Trách nhiệm Bên A</div>
      <ul>
        <li>Đảm bảo căn nhà cho thuê không có tranh chấp, khiếu kiện.</li>
        <li>Đăng ký với chính quyền địa phương về thủ tục cho thuê phòng trọ.</li>
      </ul>

      <div class="section-title">3. Trách nhiệm Bên B</div>
      <ul>
        <li>Đặt cọc với số tiền là <strong>${formatCurrency(depositAmount)} VNĐ</strong>, thanh toán tiền thuê phòng hàng tháng là <strong>${formatCurrency(monthlyRent)} VNĐ</strong> vào ngày <strong>10</strong> (cộng thêm tiền điện, nước tiêu thụ thực tế).</li>
        <li>Đảm bảo các thiết bị và sửa chữa các hư hỏng trong phòng trong khi sử dụng. Nếu không sửa chữa thì khi trả phòng, bên A sẽ trừ vào tiền đặt cọc.</li>
        <li>Chỉ sử dụng phòng trọ vào mục đích ở, giữ gìn an ninh trật tự, nếp sống văn hóa đô thị, không vi phạm pháp luật.</li>
        <li>Không được tự ý cải tạo kiến trúc phòng khi chưa được Bên A đồng ý.</li>
      </ul>

      <div class="section-title">4. Điều khoản thực hiện</div>
      <ul>
        <li>Hai bên phải tạo điều kiện thuận lợi cho nhau để thực hiện hợp đồng.</li>
        <li>Nếu một trong hai bên vi phạm hợp đồng trong thời gian hợp đồng vẫn còn hiệu lực thì bên còn lại có quyền đơn phương chấm dứt hợp đồng thuê nhà trọ. Ngoài ra, nếu hành vi vi phạm đó gây tổn thất cho bên bị vi phạm thì bên vi phạm sẽ phải bồi thường mọi thiệt hại đã gây ra.</li>
        <li>Trong trường hợp muốn chấm dứt hợp đồng trước thời hạn, bên đơn phương chấm dứt hợp đồng phải chịu mất tiền đặt cọc và bồi thường cho bên còn lại số tiền tương đương với 01 tháng tiền thuê phòng trọ. Đồng thời phải báo trước cho bên kia ít nhất 30 ngày.</li>
        <li>Kết thúc hợp đồng, Bên A phải trả lại đầy đủ tiền đặt cọc cho bên B.</li>
        <li>Bên nào vi phạm các điều khoản chung thì phải chịu trách nhiệm trước pháp luật.</li>
        <li>Hợp đồng này được lập thành 02 bản và có giá trị pháp lý như nhau, mỗi bên giữ một bản.</li>
      </ul>

      <table class="signatures">
        <tr>
          <td>
            <div class="sig-name">BÊN B (NGƯỜI THUÊ)</div>
            <div class="sig-sub">(Ký, ghi rõ họ tên)</div>
            ${tenantSignature ? `<img src="${tenantSignature}" class="sig-img" alt="Tenant Signature" /><br/>` : '<div style="height: 60px;"></div>'}
            <div><strong>${finalTenantName}</strong></div>
          </td>
          <td>
            <div class="sig-name">BÊN A (CHỦ TRỌ)</div>
            <div class="sig-sub">(Ký, ghi rõ họ tên)</div>
            ${landlordSignature ? `<img src="${landlordSignature}" class="sig-img" alt="Landlord Signature" /><br/>` : '<div style="height: 60px;"></div>'}
            <div><strong>${finalLandlordName}</strong></div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' }
    });
    return pdfBuffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = {
  generateContractPdfBuffer
};
