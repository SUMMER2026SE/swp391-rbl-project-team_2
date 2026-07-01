const { sequelize, Room } = require('./src/models');

async function fix() {
    try {
        await Room.update(
            { title: 'Phòng 101', room_number: '101' },
            { where: { room_id: 66 } }
        );
        console.log("Room 66 updated successfully.");
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
fix();
