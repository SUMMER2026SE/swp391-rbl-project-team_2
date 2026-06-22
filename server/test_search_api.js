const axios = require('axios');
async function test() {
  try {
    const res = await axios.get('http://localhost:5000/api/rooms/search?keyword=');
    console.log("Search results:", res.data.data.length);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
test();
