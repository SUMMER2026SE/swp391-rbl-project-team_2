require('dotenv').config();
const { register } = require('./src/controllers/authController');

const req = {
  body: {
    fullName: 'Test',
    email: 'test2@example.com',
    phone: '0123456789',
    password: 'password123',
    role: 'Tenant'
  }
};

const res = {
  status: (code) => {
    console.log('Status:', code);
    return { json: (data) => console.log('JSON:', data) };
  }
};

const next = (err) => {
  console.log('Error caught by next:', err);
};

(async () => {
  await register(req, res, next);
  process.exit(0);
})();
