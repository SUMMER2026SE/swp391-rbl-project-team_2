const { sequelize, Contract, Room } = require('./src/models');

async function check() {
    try {
        const contracts = await Contract.findAll({ raw: true });
        console.log("Contracts:", contracts);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
check();
