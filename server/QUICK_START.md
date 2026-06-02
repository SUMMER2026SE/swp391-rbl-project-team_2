# Landlord API - Quick Start Guide

## 🚀 Getting Started

### 1. Start the Server
```bash
npm run dev
```
Server runs on `http://localhost:5000`

### 2. Get Authentication Token
First, register and login to get a JWT token:
```bash
# Register
POST /api/auth/register
{
  "fullName": "John Landlord",
  "email": "landlord@example.com",
  "password": "password123",
  "role": "LANDLORD"
}

# Login
POST /api/auth/login
{
  "email": "landlord@example.com",
  "password": "password123"
}
```

Response includes `token` - use this for all landlord endpoints.

---

## 📋 Common Tasks

### Create a Room
```bash
POST /api/landlord/rooms
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Cozy Studio",
  "description": "Beautiful studio apartment",
  "address": "123 Main Street",
  "city": "Ho Chi Minh City",
  "district": "District 1",
  "pricePerMonth": 5000000,
  "areaSqm": 30,
  "roomType": "single",
  "maxOccupants": 1
}
```

### Upload Room Image
```bash
POST /api/landlord/rooms/1/images
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <file>
```

### Add Facility
```bash
POST /api/landlord/rooms/1/facilities
Authorization: Bearer <token>
Content-Type: application/json

{
  "facilityName": "Air Conditioner",
  "facilityType": "appliance"
}
```

### View Rental Requests
```bash
GET /api/landlord/rental-requests?status=pending
Authorization: Bearer <token>
```

### Approve Rental Request
```bash
PUT /api/landlord/rental-requests/1/approve
Authorization: Bearer <token>
```

### Create Contract
```bash
POST /api/landlord/contracts
Authorization: Bearer <token>
Content-Type: application/json

{
  "roomId": 1,
  "tenantId": 5,
  "startDate": "2024-01-01",
  "endDate": "2025-01-01",
  "monthlyRent": 5000000,
  "depositAmount": 10000000
}
```

### View Payments
```bash
GET /api/landlord/payments?status=completed
Authorization: Bearer <token>
```

### Get Dashboard Stats
```bash
GET /api/landlord/dashboard/statistics
Authorization: Bearer <token>
```

### Send Message
```bash
POST /api/landlord/conversations/1/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello, interested in the room?"
}
```

### View Notifications
```bash
GET /api/landlord/notifications?isRead=false
Authorization: Bearer <token>
```

---

## 🔑 Key Endpoints by Feature

### Profile Management
- `GET /profile` - View profile
- `PUT /profile` - Update profile
- `PUT /profile/avatar` - Upload avatar
- `PUT /profile/password` - Change password

### Room Management
- `POST /rooms` - Create room
- `GET /rooms` - List rooms
- `GET /rooms/:id` - View room details
- `PUT /rooms/:id` - Update room
- `DELETE /rooms/:id` - Delete room
- `PUT /rooms/:id/status` - Change status

### Room Images
- `POST /rooms/:id/images` - Upload image
- `GET /rooms/:id/images` - List images
- `DELETE /rooms/:id/images/:imageId` - Delete image
- `PUT /rooms/:id/images/:imageId/primary` - Set primary

### Facilities
- `POST /rooms/:id/facilities` - Add facility
- `GET /rooms/:id/facilities` - List facilities
- `PUT /rooms/:id/facilities/:facilityId` - Update facility
- `DELETE /rooms/:id/facilities/:facilityId` - Remove facility

### Rental Requests
- `GET /rental-requests` - List requests
- `GET /rental-requests/:id` - View request
- `PUT /rental-requests/:id/approve` - Approve
- `PUT /rental-requests/:id/reject` - Reject

### Payments
- `GET /payments` - List payments
- `GET /payments/:id` - View payment
- `GET /payments/history/:contractId` - Payment history
- `GET /payments/statistics` - Revenue stats

### Contracts
- `POST /contracts` - Create contract
- `GET /contracts` - List contracts
- `GET /contracts/:id` - View contract
- `PUT /contracts/:id` - Update contract
- `POST /contracts/:id/renew` - Renew contract
- `PUT /contracts/:id/terminate` - Terminate contract

### Viewing Schedules
- `POST /viewing-schedules` - Create schedule
- `GET /viewing-schedules` - List schedules
- `GET /viewing-schedules/:id` - View schedule
- `PUT /viewing-schedules/:id` - Update schedule
- `DELETE /viewing-schedules/:id` - Delete schedule

### Complaints
- `GET /complaints` - List complaints
- `GET /complaints/:id` - View complaint
- `PUT /complaints/:id/status` - Update status
- `PUT /complaints/:id/priority` - Update priority

### Messages
- `POST /conversations` - Create/get conversation
- `GET /conversations` - List conversations
- `GET /conversations/:id/messages` - Get messages
- `POST /conversations/:id/messages` - Send message
- `PUT /conversations/:id/close` - Close conversation

### Notifications
- `GET /notifications` - List notifications
- `GET /notifications/unread/count` - Unread count
- `PUT /notifications/:id/read` - Mark as read
- `PUT /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification
- `DELETE /notifications/delete-all` - Delete all

### Dashboard
- `GET /dashboard/statistics` - Overview stats
- `GET /dashboard/recent-activity` - Recent activity
- `GET /dashboard/revenue-chart` - Revenue data
- `GET /dashboard/room-status` - Room status distribution

---

## 📊 Query Parameters

### Pagination
```
?page=1&limit=10
```

### Filtering
```
?status=available
?status=pending&priority=high
?isRead=false
```

### Date Range
```
?startDate=2024-01-01&endDate=2024-12-31
```

### Sorting
```
?months=12  (for revenue chart)
```

---

## 🔐 Authentication

All endpoints require Bearer token:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token obtained from login endpoint and valid for 7 days.

---

## 📝 Common Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |

---

## 🛠️ Useful Tools

### cURL Examples

**Get all rooms:**
```bash
curl -X GET http://localhost:5000/api/landlord/rooms \
  -H "Authorization: Bearer <token>"
```

**Create room:**
```bash
curl -X POST http://localhost:5000/api/landlord/rooms \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Studio",
    "address": "123 Main St",
    "city": "HCMC",
    "pricePerMonth": 5000000
  }'
```

**Upload image:**
```bash
curl -X POST http://localhost:5000/api/landlord/rooms/1/images \
  -H "Authorization: Bearer <token>" \
  -F "image=@room.jpg"
```

### Postman Collection

Import the API endpoints into Postman:
1. Create new collection "Landlord API"
2. Add requests for each endpoint
3. Set `{{token}}` variable for Authorization header
4. Use environment variables for base URL

---

## 🎯 Workflow Examples

### Complete Room Listing Workflow
1. Create room: `POST /rooms`
2. Upload images: `POST /rooms/:id/images`
3. Add facilities: `POST /rooms/:id/facilities`
4. Update status: `PUT /rooms/:id/status`

### Rental Request Workflow
1. View requests: `GET /rental-requests`
2. Review request: `GET /rental-requests/:id`
3. Approve/Reject: `PUT /rental-requests/:id/approve` or `reject`
4. Create contract: `POST /contracts`

### Payment Tracking Workflow
1. View payments: `GET /payments`
2. Check statistics: `GET /payments/statistics`
3. View history: `GET /payments/history/:contractId`
4. Track revenue: `GET /dashboard/revenue-chart`

### Complaint Management Workflow
1. View complaints: `GET /complaints`
2. Update status: `PUT /complaints/:id/status`
3. Set priority: `PUT /complaints/:id/priority`
4. Add resolution: `PUT /complaints/:id/status` with notes

---

## 📱 Mobile App Integration

### Headers Required
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Pagination for Mobile
```
?page=1&limit=20  (smaller limit for mobile)
```

### Image URLs
All image URLs are relative:
```
/uploads/image-1234567890.jpg
```

Full URL: `http://localhost:5000/uploads/image-1234567890.jpg`

---

## 🐛 Debugging

### Check Server Status
```bash
GET http://localhost:5000/api
```

### View Logs
```bash
npm run dev  # Shows all logs in console
```

### Test Database Connection
```bash
# Server logs will show:
# ✅ Database connected successfully!
# ✅ Database tables synced
```

---

## 📚 Additional Resources

- **Full API Documentation**: See `LANDLORD_API.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Database Schema**: Check models in `src/models/`
- **Error Handling**: See `src/middlewares/errorHandler.js`

---

## 💡 Tips

1. **Always include Bearer token** in Authorization header
2. **Use pagination** for large datasets
3. **Check response status** before processing data
4. **Handle errors gracefully** in frontend
5. **Cache notifications** to reduce API calls
6. **Batch operations** when possible
7. **Use filtering** to reduce data transfer
8. **Validate input** before sending to API

---

## 🚨 Common Issues

### 401 Unauthorized
- Token is missing or invalid
- Token has expired (get new token by logging in)
- User role is not Landlord

### 404 Not Found
- Resource doesn't exist
- Wrong resource ID
- Resource was deleted

### 400 Bad Request
- Missing required fields
- Invalid data format
- Invalid enum values

### 409 Conflict
- Duplicate entry (e.g., duplicate email)
- Resource already exists

---

## 📞 Support

For issues or questions:
1. Check the API documentation
2. Review error messages
3. Check server logs
4. Verify authentication token
5. Validate request format

---

## 🎓 Learning Path

1. **Start**: Understand authentication (login/register)
2. **Basic**: Create and manage rooms
3. **Intermediate**: Handle rental requests and contracts
4. **Advanced**: Manage payments and analytics
5. **Expert**: Implement notifications and messaging

---

Last Updated: 2024
API Version: 1.0.0
