const { sequelize, Room, Property } = require('./src/models');

async function check() {
    try {
        const rooms = await Room.findAll({
            where: { property_id: 1, is_deleted: false },
            attributes: ['room_id', 'title', 'room_number', 'status', 'landlord_id', 'price_per_month']
        });
        console.log("Rooms for Property 1:");
        console.log(JSON.stringify(rooms, null, 2));

        const prop = await Property.findOne({ where: { property_id: 1 }});
        console.log("Property 1 Landlord ID:", prop.landlord_id);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
check();
