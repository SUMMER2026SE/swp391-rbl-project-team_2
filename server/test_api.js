const http = require('http');

const data = JSON.stringify({
  message: 'test',
  startDate: '2026-08-01',
  durationMonths: 6,
  tenantName: 'test',
  tenantIc: '012345678901',
  tenantIcIssueDate: '2022-01-01',
  tenantIcIssuePlace: 'test',
  tenantPermanentAddress: 'test'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/tenant/viewing-schedules/2/request-contract',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Authorization': 'Bearer test' // I don't have a valid token, so it will fail auth
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
