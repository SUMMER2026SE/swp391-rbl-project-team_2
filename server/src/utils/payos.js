const { PayOS } = require('@payos/node');

let payosInstance = null;
let isMock = false;

const clientId = process.env.PAYOS_CLIENT_ID;
const apiKey = process.env.PAYOS_API_KEY;
const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

if (clientId && apiKey && checksumKey) {
  try {
    payosInstance = new PayOS({ clientId, apiKey, checksumKey });
    console.log('✅ PayOS initialized successfully in REAL mode.');
  } catch (error) {
    console.error('❌ Failed to initialize PayOS, falling back to MOCK mode:', error.message);
    isMock = true;
  }
} else {
  console.log('⚠️ PayOS credentials missing in .env. Running in SIMULATED (mock) mode.');
  isMock = true;
}

const createPaymentLink = async (paymentData) => {
  if (isMock) {
    // Return local mock checkout endpoint
    const mockUrl = `http://localhost:5000/api/tenant/payments/mock-payos-checkout?paymentId=${paymentData.orderCode}&amount=${paymentData.amount}`;
    return {
      checkoutUrl: mockUrl,
      paymentLinkId: `mock_link_${Date.now()}`,
    };
  }
  return await payosInstance.paymentRequests.create(paymentData);
};

const verifyPaymentWebhookData = (body) => {
  if (isMock) {
    return body.data || body;
  }
  return payosInstance.webhooks.verify(body);
};

module.exports = {
  isMock,
  createPaymentLink,
  verifyPaymentWebhookData,
  payosInstance
};
