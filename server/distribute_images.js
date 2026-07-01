const { Room, RoomImage, Property } = require('./src/models');
const { Op } = require('sequelize');
const fs = require('fs');

async function distributeImages() {
  try {
    const properties = await Property.findAll();
    
    // 4 clean styles: Modern Studio, Bright Airy, Premium Luxury, Cozy Minimalist
    const styles = [
      ['room1', 'room1_angle2', 'room1_angle3'],
      ['room5', 'room5_angle2', 'room5_angle3'],
      ['room4', 'room4_angle2', 'room4_angle3'],
      ['room2', 'room2_angle2', 'room2_angle3']
    ];
    
    const files = fs.readdirSync('./uploads');

    for (let i = 0; i < properties.length; i++) {
      const prop = properties[i];
      const style = styles[i % styles.length];
      
      const thumbFile = files.find(f => f === `${style[0]}.png` || f.startsWith(`${style[0]}_thumb`));
      if (thumbFile) {
        prop.thumbnail_url = `/uploads/${thumbFile}`;
        await prop.save();
      }
      
      const rooms = await Room.findAll({ where: { property_id: prop.property_id } });
      for (const room of rooms) {
        await RoomImage.destroy({ where: { room_id: room.room_id } });
        
        if (thumbFile) {
          room.thumbnail_url = `/uploads/${thumbFile}`;
          await room.save();
        }

        for (const anglePrefix of style) {
          const filename = files.find(f => f.startsWith(anglePrefix) && f.endsWith('.png'));
          if (filename) {
            await RoomImage.create({
              room_id: room.room_id,
              image_url: `/uploads/${filename}`
            });
          }
        }
      }
    }
    
    const standaloneRooms = await Room.findAll({ where: { property_id: null } });
    const landlords = [...new Set(standaloneRooms.map(r => r.landlord_id))];
    
    for (const room of standaloneRooms) {
      const lIndex = landlords.indexOf(room.landlord_id);
      const style = styles[(properties.length + lIndex) % styles.length];
      
      await RoomImage.destroy({ where: { room_id: room.room_id } });
      
      const thumbFile = files.find(f => f === `${style[0]}.png` || f.startsWith(`${style[0]}_thumb`));
      if (thumbFile) {
        room.thumbnail_url = `/uploads/${thumbFile}`;
        await room.save();
      }

      for (const anglePrefix of style) {
        const filename = files.find(f => f.startsWith(anglePrefix) && f.endsWith('.png'));
        if (filename) {
          await RoomImage.create({
            room_id: room.room_id,
            image_url: `/uploads/${filename}`
          });
        }
      }
    }

    console.log("SUCCESS DISTRIBUTING UNIQUE STYLES");
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

distributeImages();
