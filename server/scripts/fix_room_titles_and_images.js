const { Room, Property } = require('../src/models');
const fs = require('fs');
const path = require('path');

const realisticTitles = [
  "Phòng Trọ Ban Công Cửa Sổ Thoáng",
  "Căn Hộ Mini Full Nội Thất",
  "Phòng Studio Tiện Nghi Mới Xây",
  "Phòng Gác Lửng Rộng Rãi",
  "Phòng Trọ Tiêu Chuẩn Giờ Giấc Tự Do",
  "Phòng Giá Rẻ Cho Sinh Viên",
  "Phòng Trọ Cao Cấp An Ninh 24/7",
  "Căn Hộ Khép Kín Gần Trung Tâm",
  "Phòng Đôi Có Cửa Sổ Lớn",
  "Phòng Đơn Yên Tĩnh Sạch Sẽ"
];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function assignUniqueImages() {
  try {
    const properties = await Property.findAll();
    
    // Get all valid room image files from uploads
    const allFiles = fs.readdirSync('../uploads');
    const validImages = allFiles.filter(f => 
      f.startsWith('room') && f.endsWith('.png')
    );
    
    if (validImages.length === 0) {
      console.log("No images found in uploads.");
      return;
    }

    let titleCounter = 0;

    for (let i = 0; i < properties.length; i++) {
      const prop = properties[i];
      const rooms = await Room.findAll({ where: { property_id: prop.property_id } });
      
      // Shuffle the images pool for this property so each room gets a completely different image
      const shuffledImages = shuffle([...validImages]);
      
      for (let j = 0; j < rooms.length; j++) {
        const room = rooms[j];
        
        // Fix spam titles just in case
        if (room.title.length < 10 || room.title.includes('fsgs') || room.title.includes('tfvgh') || room.title.includes('1dug')) {
          room.title = realisticTitles[titleCounter % realisticTitles.length];
          titleCounter++;
        }
        
        // Pick a truly unique image for each room in this property
        const assignedImage = shuffledImages[j % shuffledImages.length];
        room.thumbnail_url = `/uploads/${assignedImage}`;
        
        await room.save();
      }
    }
    
    // Do the same for standalone rooms
    const standaloneRooms = await Room.findAll({ where: { property_id: null } });
    const shuffledImagesForStandalone = shuffle([...validImages]);
    for (let j = 0; j < standaloneRooms.length; j++) {
      const room = standaloneRooms[j];
      
      if (room.title.length < 10 || room.title.includes('fsgs') || room.title.includes('tfvgh') || room.title.includes('1dug')) {
        room.title = realisticTitles[titleCounter % realisticTitles.length];
        titleCounter++;
      }
      
      const assignedImage = shuffledImagesForStandalone[j % shuffledImagesForStandalone.length];
      room.thumbnail_url = `/uploads/${assignedImage}`;
      
      await room.save();
    }

    console.log("SUCCESSFULLY ASSIGNED UNIQUE IMAGES TO EVERY ROOM");
  } catch (err) {
    console.error(err);
  }
}

assignUniqueImages();
