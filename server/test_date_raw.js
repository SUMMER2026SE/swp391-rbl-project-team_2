const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 1433,
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true,
        useUTC: false,
      },
    },
    timezone: '+07:00', // Try changing this
  }
);
async function test() {
  const [results] = await sequelize.query('SELECT TOP 1 created_at FROM messages ORDER BY created_at DESC');
  console.log("DB value:", results[0].created_at);
  console.log("JSON:", JSON.stringify(results[0].created_at));
}
test();
