const { sequelize, ViewingSchedule } = require('./src/models');

async function check() {
    try {
        const scheds = await ViewingSchedule.findAll({ raw: true });
        console.log("Viewing Schedules:", scheds);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
check();
