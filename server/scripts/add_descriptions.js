require('dotenv').config({ path: '../.env' });
const { Property, Room } = require('../src/models');

const propertyDescriptions = [
  "Tòa nhà căn hộ dịch vụ cao cấp thiết kế theo phong cách hiện đại tối giản. Tọa lạc tại khu vực an ninh, yên tĩnh, phù hợp cho người đi làm và gia đình trẻ. Hệ thống an ninh 24/7 với camera giám sát, ra vào bằng vân tay, bãi để xe rộng rãi có bảo vệ. Vị trí đắc địa gần siêu thị, cửa hàng tiện lợi, công viên và nhiều nhà hàng ăn uống.",
  "Khu trọ sinh viên tiện nghi, thân thiện và tiết kiệm. Nằm cách các trường đại học lớn chỉ 10 phút đi xe, thiết kế phòng thông thoáng, đón nhiều ánh sáng tự nhiên. Mỗi tầng đều có không gian sinh hoạt chung sạch sẽ, máy giặt công cộng và sân phơi có mái che. Đây là môi trường lý tưởng để bạn yên tâm học tập và sinh hoạt.",
  "Chung cư mini tiện lợi ở trung tâm, tập trung đầy đủ các tiện ích đáp ứng mọi nhu cầu thiết yếu hàng ngày. Tòa nhà được trang bị thang máy tốc độ cao, hệ thống phòng cháy chữa cháy đạt chuẩn, dịch vụ dọn vệ sinh hàng ngày ở khu vực hành lang. Vị trí thuận lợi dễ dàng di chuyển ra các tuyến đường lớn, giúp bạn tiết kiệm thời gian đi lại mỗi ngày."
];

const roomDescriptions = [
  "Căn phòng mang thiết kế Studio khép kín mang lại sự riêng tư tối đa. Có đầy đủ nội thất cơ bản gồm giường nệm êm ái, tủ quần áo âm tường sức chứa lớn, bàn làm việc thiết kế thông minh và điều hòa Inverter tiết kiệm điện. Khu vực bếp nấu được bố trí tinh tế, gọn gàng sát cửa sổ giúp giảm thiểu mùi khi nấu ăn. Phù hợp cho 1-2 người ở.",
  "Không gian rộng rãi, thoáng đãng với ban công ngắm cảnh tuyệt đẹp. Phòng có cửa sổ lớn đón trọn nắng và gió tự nhiên, giúp tiết kiệm điện năng vào ban ngày. Nội thất cao cấp với nệm lò xo, tủ lạnh 2 cánh, máy giặt riêng, và bộ bàn ghế thư giãn ngoài ban công. Lựa chọn tuyệt vời cho những ai yêu thích sự thoải mái và chất lượng sống cao.",
  "Phòng trọ gác lửng tiết kiệm diện tích tối đa. Không gian phía dưới dành cho bếp, khu sinh hoạt chung và phòng tắm; trong khi gác xép được thiết kế êm ái, kín đáo làm khu vực ngủ nghỉ. Được trang bị điều hòa, máy nước nóng, bếp từ và kệ bếp ốp đá granite sạch sẽ. Không gian hoàn hảo cho sinh viên hoặc người đi làm trẻ tuổi."
];

async function run() {
  try {
    const properties = await Property.findAll();
    for (let i = 0; i < properties.length; i++) {
      const prop = properties[i];
      if (!prop.description || prop.description.length < 50 || prop.description.includes('sgsg')) {
        const desc = propertyDescriptions[i % propertyDescriptions.length];
        await prop.update({ description: desc });
        console.log(`Updated property ${prop.property_id} description`);
      }
    }

    const rooms = await Room.findAll();
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      if (!room.description || room.description.length < 50 || room.description.includes('sgsg')) {
        const desc = roomDescriptions[i % roomDescriptions.length];
        await room.update({ description: desc });
        console.log(`Updated room ${room.room_id} description`);
      }
    }
    
    console.log("SUCCESS ADDING DESCRIPTIONS");
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
