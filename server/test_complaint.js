const { Complaint, Room, User } = require('./src/models');
async function test() {
  try {
    const res = await Complaint.findAndCountAll({
      where: { tenant_id: 2 },
      include: [
        { model: Room, as: 'room' },
        { model: User, as: 'landlordComplaint' }
      ]
    });
    console.log("SUCCESS", res.count);
  } catch (e) {
    console.error("ERROR:", e.message);
  }
  process.exit();
}
test();
