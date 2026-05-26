require('dotenv').config();
const { Sequelize, DataTypes, Op } = require('sequelize');
const sequelize = require('./src/config/database');

const TestModel = sequelize.define('TestModel', {
  otp_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  expired_at: { type: DataTypes.DATE } // Keep it as DATE in model
}, { tableName: 'otp_verifications', timestamps: false });

(async () => {
  try {
    await sequelize.authenticate();
    const result = await TestModel.findOne({
      where: {
        expired_at: { [Op.gt]: sequelize.literal('GETDATE()') }
      }
    });
    console.log('Query success!');
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
})();
