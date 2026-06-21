const { Favorite, Booking, RentalRequest } = require('./src/models');
const sequelize = require('./src/config/database');

async function test() {
  await sequelize.authenticate();
  console.log('Favorites count:', await Favorite.count());
  console.log('Bookings count:', await Booking.count());
  console.log('RentalRequests count:', await RentalRequest.count());
  process.exit(0);
}
test();
