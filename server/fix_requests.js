require('dotenv').config();
const sequelize = require('./src/config/database');
sequelize.query("UPDATE rental_requests SET status = 'completed' WHERE status = 'contract_created' AND request_id IN (SELECT r.request_id FROM rental_requests r JOIN Contracts c ON r.room_id = c.room_id AND r.tenant_id = c.tenant_id WHERE c.status IN ('pending_payment', 'active', 'completed'))").then(() => {
  console.log('Fixed stuck rental requests');
  process.exit(0);
}).catch(console.error);
