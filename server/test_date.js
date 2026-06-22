const { Message } = require('./src/models');
async function test() {
  const msg = await Message.findOne({ order: [['created_at', 'DESC']] });
  console.log("Raw object:", msg.created_at);
  console.log("JSON:", JSON.stringify(msg.created_at));
}
test();
