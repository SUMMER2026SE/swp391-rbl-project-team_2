const { sequelize, Room, Contract } = require('./src/models');
const { Op } = require('sequelize');

async function check() {
    try {
        const rooms = await Room.findAll({
            where: { property_id: 1, is_deleted: false },
            attributes: ['room_id', 'title', 'status', 'quantity', 'available_quantity']
        });
        console.log("ROOMS:");
        rooms.forEach(r => {
            console.log(`- ID: ${r.room_id}, title: ${r.title}, status: ${r.status}, quantity: ${r.quantity}, available: ${r.available_quantity}`);
        });

        const roomIds = rooms.map(r => r.room_id);
        const contracts = await Contract.findAll({
            where: { room_id: { [Op.in]: roomIds }, status: 'active' },
            attributes: ['contract_id', 'room_id', 'status']
        });
        console.log("\nCONTRACTS:");
        contracts.forEach(c => {
            console.log(`- Contract ID: ${c.contract_id}, Room ID: ${c.room_id}, status: ${c.status}`);
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
