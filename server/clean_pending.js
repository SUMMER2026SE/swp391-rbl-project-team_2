const { ViewingSchedule, Payment } = require('./src/models');

async function cleanPending() {
  try {
    // Delete pending payments for viewing schedules
    await Payment.destroy({
      where: { payment_type: 'viewing_deposit', status: 'pending' }
    });

    // Update pending_payment schedules to scheduled
    await ViewingSchedule.update(
      { status: 'scheduled' },
      { where: { status: 'pending_payment' } }
    );
    
    console.log('Cleaned up pending viewing payments and schedules!');
  } catch (err) {
    console.error(err);
  }
}

cleanPending();
