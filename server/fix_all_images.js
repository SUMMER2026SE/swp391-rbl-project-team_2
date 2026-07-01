const { Room, RoomImage, Property } = require('./src/models');
const { Op } = require('sequelize');
const fs = require('fs');

async function fixAllImages() {
  try {
    const rooms = await Room.findAll({
      order: [['room_id', 'ASC']]
    });

    const cleanAngleGroups = [
      ['room1', 'room1_angle2', 'room1_angle3'],
      ['room5', 'room5_angle2', 'room5_angle3'],
    ];

    const files = fs.readdirSync('./uploads');

    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      const angles = cleanAngleGroups[i % 2];
      
      // Delete existing RoomImages
      await RoomImage.destroy({ where: { room_id: room.room_id } });
      
      // Update thumbnail
      const thumbFile = files.find(f => f === `${angles[0]}.png` || f.startsWith(`${angles[0]}_thumb`));
      if (thumbFile) {
        room.thumbnail_url = `/uploads/${thumbFile}`;
        await room.save();
      }

      // Add to RoomImage table (gallery)
      for (const anglePrefix of angles) {
        const filename = files.find(f => f.startsWith(anglePrefix) && f.endsWith('.png'));
        if (filename) {
          await RoomImage.create({
            room_id: room.room_id,
            image_url: `/uploads/${filename}`
          });
        }
      }
    }
    
    const properties = await Property.findAll();
    for (let i = 0; i < properties.length; i++) {
      const prop = properties[i];
      const angles = cleanAngleGroups[i % 2];
      const thumbFile = files.find(f => f === `${angles[0]}.png` || f.startsWith(`${angles[0]}_thumb`));
      if (thumbFile) {
        prop.thumbnail_url = `/uploads/${thumbFile}`;
        await prop.save();
      }
    }
    
    console.log(`Successfully updated ${rooms.length} rooms and ${properties.length} properties.`);
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

fixAllImages();
