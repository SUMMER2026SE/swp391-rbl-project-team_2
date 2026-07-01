const { sequelize, RentalRequest } = require('./src/models');

async function check() {
    try {
        const reqs = await RentalRequest.findAll({ raw: true });
        console.log("Rental Requests:", reqs);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
check();
