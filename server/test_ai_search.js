const axios = require('axios');

async function run() {
  const cases = [
    { name: 'TC1', q: "Tôi muốn thuê phòng còn trống", expectedStatus: "available", lang: "vi" },
    { name: 'TC2', q: "Show me available rooms in Da Nang", expectedStatus: "available", lang: "en" },
    { name: 'TC3', q: "Tôi muốn phòng giá khoảng 5 triệu", expectedStatus: null, lang: "vi" },
    { name: 'TC4', q: "Cho tôi phòng dưới 4 triệu", expectedStatus: null, lang: "vi" },
    { name: 'TC5', q: "Phòng 2 người ở tại Huế", expectedStatus: null, lang: "vi" },
    { name: 'TC6', q: "Cho tôi phòng còn trống dưới 6 triệu tại Đà Nẵng", expectedStatus: "available", lang: "vi" }
  ];

  for (const tc of cases) {
    try {
      console.log(`\n--- Running ${tc.name} ---`);
      console.log(`Query: ${tc.q}`);
      const res = await axios.post('http://localhost:5000/api/ai/search', { query: tc.q });
      
      const status = res.data.data.status;
      console.log(`Extracted status: ${status} (Expected: ${tc.expectedStatus})`);
      
      // Print first 50 chars of summary to check language
      const summary = res.data.aiSummary;
      console.log(`Summary snippet: ${summary ? summary.substring(0, 100).replace(/\n/g, ' ') : ''}...`);

      if (status !== tc.expectedStatus) {
         console.error(`❌ FAILED ${tc.name}: Expected status ${tc.expectedStatus}, got ${status}`);
      } else {
         console.log(`✅ PASSED ${tc.name}`);
      }
    } catch (e) {
      console.error(`Error on ${tc.name}:`, e.message);
    }
  }
}

run();
