const axios = require('axios');
async function run() {
  try {
    const res = await axios.get('http://localhost:5000/api/listings/properties/search?page=1&limit=9&sort=newest');
    const properties = res.data.data;
    const khaProperty = properties.find(p => p.title.includes('Kha'));
    console.log(JSON.stringify(khaProperty, null, 2));
  } catch(e) {
    console.log(e);
  }
}
run();
