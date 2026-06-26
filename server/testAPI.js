const { User } = require('./src/models');
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function test() {
  try {
    const landlord = await User.findOne({ where: { role_id: 2 } });
    if (!landlord) return console.log('no landlord');
    
    const token = jwt.sign(
      { userId: landlord.user_id, roleId: landlord.role_id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );
    
    const res = await axios.get('http://localhost:5000/api/landlord/contracts', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Success:', res.data.data.length);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
  process.exit(0);
}
test();
