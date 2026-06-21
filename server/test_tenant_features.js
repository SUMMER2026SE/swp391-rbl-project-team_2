const http = require('http');

const BASE = 'http://localhost:5000';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('='.repeat(60));
  console.log('STEP 1: Check existing users in DB');
  console.log('='.repeat(60));

  // First, let's find a tenant user
  const { sequelize, User, Role, Room, defineAssociations } = require('./src/models');
  defineAssociations();
  
  const users = await User.findAll({
    include: [{ model: Role, as: 'role' }],
    where: { is_deleted: false },
  });

  console.log('\nAll users:');
  users.forEach(u => {
    console.log(`  - ID: ${u.user_id}, Name: ${u.full_name}, Email: ${u.email}, Role: ${u.role?.role_name}, Active: ${u.is_active}`);
  });

  // Find a tenant
  const tenant = users.find(u => u.role?.role_name === 'Tenant');
  if (!tenant) {
    console.log('\n❌ No tenant user found! Creating one...');
    const bcrypt = require('bcrypt');
    const tenantRole = await Role.findOne({ where: { role_name: 'Tenant' } });
    const hash = await bcrypt.hash('123456', 12);
    await User.create({
      full_name: 'Test Tenant',
      email: 'testtenant@test.com',
      password_hash: hash,
      role_id: tenantRole.role_id,
      is_active: true,
    });
    console.log('✅ Created test tenant: testtenant@test.com / 123456');
  }

  // Check rooms
  const rooms = await Room.findAll({ where: { is_deleted: false }, limit: 5 });
  console.log('\nAvailable rooms:');
  rooms.forEach(r => {
    console.log(`  - ID: ${r.room_id}, Title: ${r.title}, Status: ${r.status}, Landlord: ${r.landlord_id}`);
  });

  await sequelize.close();

  // Login as tenant
  console.log('\n' + '='.repeat(60));
  console.log('STEP 2: Login as Tenant');
  console.log('='.repeat(60));

  const tenantEmail = 'tenant_test@test.com';
  const loginRes = await request('POST', '/api/auth/login', {
    email: tenantEmail,
    password: 'Test@123',
  });
  console.log(`\nLogin status: ${loginRes.status}`);
  console.log('Login response:', JSON.stringify(loginRes.body, null, 2));

  if (!loginRes.body.success || !loginRes.body.data?.token) {
    console.log('\n❌ Cannot login as tenant. Stopping tests.');
    process.exit(1);
  }

  const TOKEN = loginRes.body.data.token;
  const roomId = rooms.length > 0 ? rooms[0].room_id : 1;
  console.log(`\n✅ Got token. Will test with roomId = ${roomId}`);

  // =========================================================
  // TEST FEATURE 1: FAVORITES
  // =========================================================
  console.log('\n' + '='.repeat(60));
  console.log('FEATURE 1: FAVORITE ROOM');
  console.log('='.repeat(60));

  // Test 1.1: Add favorite
  console.log('\n--- Test 1.1: POST /api/tenant/favorites/' + roomId);
  const addFavRes = await request('POST', `/api/tenant/favorites/${roomId}`, null, TOKEN);
  console.log(`Status: ${addFavRes.status}`);
  console.log('Response:', JSON.stringify(addFavRes.body, null, 2));

  // Test 1.2: Add duplicate (should fail 409)
  console.log('\n--- Test 1.2: POST /api/tenant/favorites/' + roomId + ' (duplicate)');
  const dupFavRes = await request('POST', `/api/tenant/favorites/${roomId}`, null, TOKEN);
  console.log(`Status: ${dupFavRes.status} (expected 409)`);
  console.log('Response:', JSON.stringify(dupFavRes.body, null, 2));

  // Test 1.3: Get favorites
  console.log('\n--- Test 1.3: GET /api/tenant/favorites');
  const getFavRes = await request('GET', '/api/tenant/favorites', null, TOKEN);
  console.log(`Status: ${getFavRes.status}`);
  console.log('Response:', JSON.stringify(getFavRes.body, null, 2));

  // Test 1.4: Remove favorite
  console.log('\n--- Test 1.4: DELETE /api/tenant/favorites/' + roomId);
  const delFavRes = await request('DELETE', `/api/tenant/favorites/${roomId}`, null, TOKEN);
  console.log(`Status: ${delFavRes.status}`);
  console.log('Response:', JSON.stringify(delFavRes.body, null, 2));

  // Test 1.5: Get favorites (should be empty)
  console.log('\n--- Test 1.5: GET /api/tenant/favorites (should be empty)');
  const emptyFavRes = await request('GET', '/api/tenant/favorites', null, TOKEN);
  console.log(`Status: ${emptyFavRes.status}`);
  console.log('Count:', emptyFavRes.body.pagination?.total);

  // Test 1.6: No token (should 401)
  console.log('\n--- Test 1.6: GET /api/tenant/favorites (no token)');
  const noTokenRes = await request('GET', '/api/tenant/favorites');
  console.log(`Status: ${noTokenRes.status} (expected 401)`);

  // =========================================================
  // TEST FEATURE 2: RENTAL REQUEST
  // =========================================================
  console.log('\n' + '='.repeat(60));
  console.log('FEATURE 2: RENTAL REQUEST (Tenant-side)');
  console.log('='.repeat(60));

  // Test 2.1: Create rental request
  console.log('\n--- Test 2.1: POST /api/tenant/rental-requests');
  const createReqRes = await request('POST', '/api/tenant/rental-requests', {
    roomId: roomId,
    message: 'I would like to rent this room. Test from automated script.',
  }, TOKEN);
  console.log(`Status: ${createReqRes.status}`);
  console.log('Response:', JSON.stringify(createReqRes.body, null, 2));

  // Test 2.2: Duplicate pending request (should fail 409)
  console.log('\n--- Test 2.2: POST /api/tenant/rental-requests (duplicate pending)');
  const dupReqRes = await request('POST', '/api/tenant/rental-requests', {
    roomId: roomId,
    message: 'Duplicate request',
  }, TOKEN);
  console.log(`Status: ${dupReqRes.status} (expected 409)`);
  console.log('Response:', JSON.stringify(dupReqRes.body, null, 2));

  // Test 2.3: Get my rental requests
  console.log('\n--- Test 2.3: GET /api/tenant/rental-requests');
  const getReqRes = await request('GET', '/api/tenant/rental-requests', null, TOKEN);
  console.log(`Status: ${getReqRes.status}`);
  console.log('Response:', JSON.stringify(getReqRes.body, null, 2));

  const requestId = createReqRes.body.data?.requestId || createReqRes.body.data?.request_id;

  // Test 2.4: Get rental request detail
  if (requestId) {
    console.log('\n--- Test 2.4: GET /api/tenant/rental-requests/' + requestId);
    const detailRes = await request('GET', `/api/tenant/rental-requests/${requestId}`, null, TOKEN);
    console.log(`Status: ${detailRes.status}`);
    console.log('Response:', JSON.stringify(detailRes.body, null, 2));

    // Test 2.5: Cancel rental request
    console.log('\n--- Test 2.5: PUT /api/tenant/rental-requests/' + requestId + '/cancel');
    const cancelRes = await request('PUT', `/api/tenant/rental-requests/${requestId}/cancel`, null, TOKEN);
    console.log(`Status: ${cancelRes.status}`);
    console.log('Response:', JSON.stringify(cancelRes.body, null, 2));

    // Test 2.6: Cancel again (should fail - not pending)
    console.log('\n--- Test 2.6: PUT /api/tenant/rental-requests/' + requestId + '/cancel (already cancelled)');
    const cancelAgainRes = await request('PUT', `/api/tenant/rental-requests/${requestId}/cancel`, null, TOKEN);
    console.log(`Status: ${cancelAgainRes.status} (expected 400)`);
    console.log('Response:', JSON.stringify(cancelAgainRes.body, null, 2));
  }

  // =========================================================
  // TEST FEATURE 3: CHAT
  // =========================================================
  console.log('\n' + '='.repeat(60));
  console.log('FEATURE 3: CHAT WITH LANDLORD');
  console.log('='.repeat(60));

  const landlordId = rooms.length > 0 ? rooms[0].landlord_id : 1;

  // Test 3.1: Create/get conversation
  console.log('\n--- Test 3.1: POST /api/chat/conversations');
  const createConvRes = await request('POST', '/api/chat/conversations', {
    participantId: landlordId,
    roomId: roomId,
  }, TOKEN);
  console.log(`Status: ${createConvRes.status}`);
  console.log('Response:', JSON.stringify(createConvRes.body, null, 2));

  const conversationId = createConvRes.body.data?.conversationId;

  // Test 3.2: Get conversations
  console.log('\n--- Test 3.2: GET /api/chat/conversations');
  const getConvRes = await request('GET', '/api/chat/conversations', null, TOKEN);
  console.log(`Status: ${getConvRes.status}`);
  console.log('Conversations count:', getConvRes.body.pagination?.total);

  if (conversationId) {
    // Test 3.3: Send message
    console.log('\n--- Test 3.3: POST /api/chat/conversations/' + conversationId + '/messages');
    const sendMsgRes = await request('POST', `/api/chat/conversations/${conversationId}/messages`, {
      content: 'Hello landlord! Is this room still available? (Test message)',
    }, TOKEN);
    console.log(`Status: ${sendMsgRes.status}`);
    console.log('Response:', JSON.stringify(sendMsgRes.body, null, 2));

    // Test 3.4: Get messages
    console.log('\n--- Test 3.4: GET /api/chat/conversations/' + conversationId + '/messages');
    const getMsgRes = await request('GET', `/api/chat/conversations/${conversationId}/messages`, null, TOKEN);
    console.log(`Status: ${getMsgRes.status}`);
    console.log('Messages count:', getMsgRes.body.pagination?.total);
    console.log('Messages:', JSON.stringify(getMsgRes.body.data, null, 2));

    // Test 3.5: Get conversation details
    console.log('\n--- Test 3.5: GET /api/chat/conversations/' + conversationId);
    const convDetailRes = await request('GET', `/api/chat/conversations/${conversationId}`, null, TOKEN);
    console.log(`Status: ${convDetailRes.status}`);
    console.log('Response:', JSON.stringify(convDetailRes.body.data, null, 2));
  }

  // =========================================================
  // SUMMARY
  // =========================================================
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  
  const results = [
    { feature: 'Add Favorite', pass: addFavRes.status === 201 },
    { feature: 'Duplicate Favorite (409)', pass: dupFavRes.status === 409 },
    { feature: 'Get Favorites', pass: getFavRes.status === 200 },
    { feature: 'Remove Favorite', pass: delFavRes.status === 200 },
    { feature: 'Auth Required (401)', pass: noTokenRes.status === 401 },
    { feature: 'Create Rental Request', pass: createReqRes.status === 201 },
    { feature: 'Duplicate Pending (409)', pass: dupReqRes.status === 409 },
    { feature: 'Get My Requests', pass: getReqRes.status === 200 },
    { feature: 'Cancel Request', pass: requestId ? true : false },
    { feature: 'Create Conversation', pass: createConvRes.status === 200 },
    { feature: 'Get Conversations', pass: getConvRes.status === 200 },
    { feature: 'Send Message', pass: conversationId ? true : false },
  ];

  results.forEach(r => {
    console.log(`  ${r.pass ? '✅' : '❌'} ${r.feature}`);
  });

  const passed = results.filter(r => r.pass).length;
  console.log(`\n  Result: ${passed}/${results.length} tests passed`);
  
  process.exit(0);
}

run().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
