const { sequelize, Property } = require('../src/models');

async function check() {
    try {
        const properties = await Property.findAll({
            attributes: ['property_id', 'name', 'city', 'district', 'ward', 'address']
        });
        console.log("PROPERTIES:");
        properties.forEach(p => {
            console.log(`- ID: ${p.property_id}, name: ${p.name}, city: "${p.city}", district: "${p.district}", ward: "${p.ward}", address: "${p.address}"`);
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
