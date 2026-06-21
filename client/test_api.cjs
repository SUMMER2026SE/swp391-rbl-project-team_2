const http = require('http');

http.get('http://localhost:5000/api/listings', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const room = json.data.find(r => r.images && r.images.length > 0);
    console.log(JSON.stringify(room.images, null, 2));
  });
});
