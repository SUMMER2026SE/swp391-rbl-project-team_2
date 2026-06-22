const { Payment } = require('./src/models');

async function updateFees() {
  try {
    const payments = await Payment.findAll({
      where: { status: 'completed' }
    });

    for (let p of payments) {
      if (p.platform_fee && p.amount) {
        const total = parseFloat(p.amount);
        const fee = total * 0.05;
        const net = total * 0.95;
        
        await p.update({
          platform_fee: fee,
          net_amount: net
        });
      }
    }
    console.log("Updated fees to 5% for all completed payments");
  } catch (err) {
    console.error(err);
  }
}
updateFees();
