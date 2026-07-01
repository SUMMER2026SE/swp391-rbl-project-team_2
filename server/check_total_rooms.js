const { sequelize, Room } = require('./src/models');

async function check() {
    try {
        const count = await Room.count({ where: { landlord_id: 2, is_deleted: false } });
        console.log(`Landlord 2 has ${count} rooms.`);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
check();
