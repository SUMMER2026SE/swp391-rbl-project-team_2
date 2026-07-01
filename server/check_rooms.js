const { sequelize, Room } = require('./src/models');

async function check() {
    try {
        const rooms = await Room.findAll({ where: { room_id: [73, 74] }, raw: true });
        console.log("Rooms:", rooms);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
check();
