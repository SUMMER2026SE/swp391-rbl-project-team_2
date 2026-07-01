const { Room, RoomImage } = require('./src/models');
const { Op } = require('sequelize');
const fs = require('fs');

async function insertImages() {
  try {
    const rooms = await Room.findAll({
      where: {
        status: { [Op.notIn]: ['inactive', 'pending', 'rejected'] }
      },
      limit: 5
    });

    const angleGroups = [
      ['room1_angle2', 'room1_angle3'],
      ['room2_angle2', 'room2_angle3'],
      ['room3_angle2', 'room3_angle3'],
      ['room4_angle2', 'room4_angle3'],
      ['room5_angle2', 'room5_angle3'],
    ];

    const files = fs.readdirSync('./uploads');

    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      const angles = angleGroups[i % angleGroups.length];
      
      await RoomImage.destroy({ where: { room_id: room.room_id } });
      
      for (const anglePrefix of angles) {
        const filename = files.find(f => f.startsWith(anglePrefix));
        if (filename) {
          await RoomImage.create({
            room_id: room.room_id,
            image_url: `/uploads/${filename}`
          });
          console.log(`Added ${filename} to room ${room.room_id}`);
        }
      }
      
      if (room.thumbnail_url) {
         await RoomImage.create({
            room_id: room.room_id,
            image_url: room.thumbnail_url
         });
         console.log(`Added thumbnail ${room.thumbnail_url} to room ${room.room_id}`);
      }
    }
    console.log("SUCCESS");
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

insertImages();
