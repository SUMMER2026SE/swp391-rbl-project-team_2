const axios = require('axios');

async function testPayment() {
  try {
    const res = await axios.post('http://localhost:5000/api/tenant/payments/create_payment_url', {
      amount: 50000,
      roomId: 1, // Assumes room 1 exists
      bankCode: 'NCB',
      language: 'vn'
    }, {
      headers: {
        // I don't have a token. This will fail with 401.
      }
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}

testPayment();
