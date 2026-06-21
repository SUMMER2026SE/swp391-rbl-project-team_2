const http = require('http');

const data = JSON.stringify({
  message: 'Hello',
  history: [{ role: 'assistant', content: 'Hi there!' }]
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/ai/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
