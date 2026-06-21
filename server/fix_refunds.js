require('dotenv').config();
const { ViewingSchedule, Payment, Room } = require('./src/models');
const sequelize = require('./src/config/database');

async function fixRefunds() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    const payments = await Payment.findAll({
      where: {
        status: 'completed',
        payment_type: 'viewing_deposit'
      }
    });

    let count = 0;
    for (const payment of payments) {
      if (payment.viewing_schedule_id) {
        const schedule = await ViewingSchedule.findByPk(payment.viewing_schedule_id);
        if (schedule && (schedule.status === 'cancelled' || schedule.status === 'rejected')) {
          payment.status = 'refunded';
          payment.refund_amount = payment.amount;
          payment.platform_fee = 0;
          payment.net_amount = 0;
          await payment.save();
          
          console.log(`Refunded payment ${payment.payment_id} for viewing schedule ${payment.viewing_schedule_id}`);
          
          if (schedule.room_id) {
            await Room.update(
              { status: 'available' }, 
              { where: { room_id: schedule.room_id } }
            );
            console.log(`Made room ${schedule.room_id} available`);
          }
          count++;
        }
      }
    }
    console.log(`Fixed ${count} orphaned completed payments.`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

fixRefunds();
