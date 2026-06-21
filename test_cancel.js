const sequelize = require('./server/src/config/database');
const { Payment } = require('./server/src/models');

async function test() {
  try {
    const payment = await Payment.findOne({ where: { payment_type: 'viewing_deposit' } });
    if (!payment) {
      console.log('No payment found');
      process.exit(0);
    }
    
    console.log('Found payment', payment.payment_id, payment.status);
    payment.status = 'refunded';
    await payment.save();
    console.log('Successfully saved to refunded!');
  } catch (err) {
    console.error('ERROR SAVING:', err.message);
  } finally {
    process.exit(0);
  }
}
test();
