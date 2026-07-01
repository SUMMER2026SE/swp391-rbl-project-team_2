const { Room } = require('./src/models');
const { Op } = require('sequelize');

async function updateImages() {
  try {
    const rooms = await Room.findAll({
      where: {
        status: { [Op.notIn]: ['inactive', 'pending', 'rejected'] }
      },
      limit: 5
    });

    const images = [
      '/uploads/room1.png',
      '/uploads/room2.png',
      '/uploads/room3.png',
      '/uploads/room4.png',
      '/uploads/room5.png'
    ];

    for (let i = 0; i < rooms.length; i++) {
      rooms[i].thumbnail_url = images[i % images.length];
      await rooms[i].save();
      console.log(`Updated room ${rooms[i].room_id} with image ${images[i % images.length]}`);
    }
    console.log("SUCCESS");
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

updateImages();
