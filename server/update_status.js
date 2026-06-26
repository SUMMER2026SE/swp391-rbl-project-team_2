require('dotenv').config();
const sequelize = require('./src/config/database');
sequelize.query("UPDATE rental_requests SET status = 'contract_requested' WHERE request_id = 1").then(res => { console.log('Updated'); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });
