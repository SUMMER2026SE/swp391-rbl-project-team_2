const { User, Payment } = require('./server/src/models');
const jwt = require('jsonwebtoken');

async function testApi() {
  try {
    // Get a tenant
    const tenant = await User.findOne({ where: { role_id: 3 } }); // Assuming 3 is tenant
    const token = jwt.sign({ userId: tenant.user_id, role: tenant.role_id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1d' });

    // Create a dummy payment to cancel
    const payment = await Payment.create({
      tenant_id: tenant.user_id,
      landlord_id: tenant.user_id, // fake
      room_id: 1, // fake
      amount: 100000,
      payment_type: 'viewing_deposit',
      status: 'completed'
    });

    console.log('Created dummy payment:', payment.payment_id);

    const response = await fetch(`http://localhost:5000/api/tenant/payments/${payment.payment_id}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();
    console.log('API RESPONSE:', data);
  } catch (err) {
    console.error('API ERROR:', err.message);
  } finally {
    process.exit(0);
  }
}

testApi();
