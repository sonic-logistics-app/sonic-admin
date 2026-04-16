# Sonic Logistics Admin API Documentation

This document provides detailed API documentation for all admin endpoints, including request/response schemas and examples.

## Base URL
`http://localhost:3001/api/admin`

## Authentication
Most endpoints require Bearer token authentication. Include the token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Response Format
All responses follow a consistent format:

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... } // or specific fields
}
```

### Error Response
```json
{
  "error_code": 400,
  "error": "Bad Request",
  "message": "Detailed error message"
}
```

---

## Authentication Endpoints

### 1. Admin Login
**POST** `/login`

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "admin": {
    "id": "string",
    "email": "string",
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

**Error Responses:**
- 400: Missing email/password
- 404: Admin not found
- 401: Invalid credentials
- 500: Internal server error

### 2. Check Admin Status
**GET** `/status`

**Success Response (200):**
```json
{
  "hasAdmin": true
}
```

### 3. Register First Admin
**POST** `/register`

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "first_name": "string",
  "last_name": "string"
}
```

**Success Response (201):**
```json
{
  "message": "Admin account created successfully",
  "admin": {
    "id": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string"
  }
}
```

**Error Responses:**
- 400: Invalid data
- 403: Admin already exists
- 500: Internal server error

### 4. Get Admin Profile
**GET** `/profile`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "message": "Admin profile fetched successfully",
  "admin": {
    "id": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Update Admin Profile
**PUT** `/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "first_name": "string",
  "last_name": "string",
  "email": "string"
}
```

**Success Response (200):**
```json
{
  "message": "Admin profile updated successfully",
  "admin": {
    "id": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string"
  }
}
```

### 6. Change Admin Password
**PUT** `/change-password`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "current_password": "string",
  "new_password": "string",
  "confirm_new_password": "string"
}
```

**Success Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

### 7. Refresh Admin Token
**POST** `/refresh-token`

**Request Body:**
```json
{
  "refresh_token": "string"
}
```

**Success Response (200):**
```json
{
  "message": "Token refreshed successfully",
  "accessToken": "string",
  "refreshToken": "string"
}
```

### 8. Admin Logout
**POST** `/logout`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "message": "Successfully logged out"
}
```

---

## User Management

### 1. Get All Users
**GET** `/user`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "message": "Users fetched successfully",
  "users": [
    {
      "id": "string",
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "phone": "string",
      "is_verified": true,
      "is_agree": true,
      "welcome_voucher_used": false,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Verify User
**PUT** `/user/verify`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "user_id": "string"
}
```

**Success Response (200):**
```json
{
  "message": "User verified successfully"
}
```

### 3. Delete User
**DELETE** `/user`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "user_id": "string"
}
```

**Success Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

## Driver Management

### 1. Get All Drivers
**GET** `/driver`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "message": "Drivers fetched successfully",
  "drivers": [
    {
      "id": "string",
      "user_id": 1,
      "personal_info": true,
      "document": true,
      "vehicle": true,
      "id_confirmation": true,
      "bank_account": true,
      "is_verified": true,
      "is_rejected": false,
      "created_at": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": 1,
        "email": "string",
        "first_name": "string",
        "last_name": "string",
        "phone": "string"
      }
    }
  ]
}
```

### 2. Get Driver by ID
**GET** `/driver/{userId}`

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `userId` (integer): Driver user ID

**Success Response (200):**
```json
{
  "message": "Driver fetched successfully",
  "driver": {
    "id": "string",
    "user_id": 1,
    "personal_info": true,
    "document": true,
    "vehicle": true,
    "id_confirmation": true,
    "bank_account": true,
    "is_verified": true,
    "is_rejected": false,
    "created_at": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": 1,
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "phone": "string"
    },
    "documents": [...],
    "vehicle": {...},
    "bank_account": {...}
  }
}
```

### 3. Verify Driver
**PUT** `/driver/verify`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "driver_id": "string",
  "personal_info": true,
  "document": true,
  "vehicle": true,
  "id_confirmation": true,
  "bank_account": true
}
```

**Success Response (200):**
```json
{
  "message": "Driver verification updated successfully"
}
```

### 4. Reject Driver
**PUT** `/driver/reject`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "driver_id": "string",
  "personal_info": false,
  "document": false,
  "vehicle": false,
  "id_confirmation": false,
  "bank_account": false
}
```

**Success Response (200):**
```json
{
  "message": "Driver rejection status updated successfully"
}
```

### 5. Delete Driver
**DELETE** `/driver`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "driver_id": "string"
}
```

**Success Response (200):**
```json
{
  "message": "Driver deleted successfully"
}
```

### 6. Seed Test Driver
**POST** `/seed-driver`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "message": "Test driver seeded successfully"
}
```

---

## Vendor Management

### 1. Get All Vendors
**GET** `/vendor`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "message": "Vendors fetched successfully",
  "vendors": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "address": "string",
      "business_type": "string",
      "description": "string",
      "commission_rate": 10.5,
      "minimum_order": 1000,
      "latitude": 6.5244,
      "longitude": 3.3792,
      "status": "pending",
      "kyc_status": "pending",
      "is_accepting_orders": true,
      "is_open": true,
      "onboarding_completed": false,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Create Vendor
**POST** `/vendor`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "business_type": "string",
  "description": "string",
  "business_registration_number": "string",
  "tax_identification_number": "string",
  "account_name": "string",
  "account_number": "string",
  "bank_name": "string",
  "bank_code": "string",
  "commission_rate": 10.5,
  "minimum_order": 1000,
  "latitude": 6.5244,
  "longitude": 3.3792,
  "status": "pending",
  "kyc_status": "pending",
  "is_accepting_orders": true,
  "is_open": true,
  "onboarding_completed": false,
  "timezone": "Africa/Lagos"
}
```

**Success Response (201):**
```json
{
  "message": "Vendor created successfully",
  "vendor": {
    "id": "string",
    "name": "string",
    "email": "string",
    // ... all vendor fields
  }
}
```

### 3. Get Vendor by ID
**GET** `/vendor/{id}`

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (string): Vendor ID

**Success Response (200):**
```json
{
  "message": "Vendor fetched successfully",
  "vendor": {
    "id": "string",
    "name": "string",
    "email": "string",
    // ... all vendor fields
  }
}
```

### 4. Update Vendor
**PUT** `/vendor/{id}`

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (string): Vendor ID

**Request Body:** (same as create, all fields optional)

**Success Response (200):**
```json
{
  "message": "Vendor updated successfully",
  "vendor": {
    // updated vendor object
  }
}
```

### 5. Reject Vendor
**PUT** `/vendor/reject`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "vendor_id": "string",
  "reason": "string"
}
```

**Success Response (200):**
```json
{
  "message": "Vendor rejected successfully"
}
```

### 6. Suspend Vendor
**PUT** `/vendor/suspend`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "vendor_id": "string",
  "reason": "string"
}
```

**Success Response (200):**
```json
{
  "message": "Vendor suspended successfully"
}
```

### 7. Activate Vendor
**PUT** `/vendor/activate`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "vendor_id": "string"
}
```

**Success Response (200):**
```json
{
  "message": "Vendor activated successfully"
}
```

### 8. Approve Vendor
**PUT** `/vendor/{id}/approve`

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (string): Vendor ID

**Success Response (200):**
```json
{
  "message": "Vendor approved successfully"
}
```

### 9. Delete Vendor
**DELETE** `/vendor/{id}`

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (string): Vendor ID

**Success Response (200):**
```json
{
  "message": "Vendor deleted successfully"
}
```

### 10. Seed Vendors
**POST** `/vendor/seed`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "category": "restaurant" // or "all" for all categories
}
```

**Success Response (200):**
```json
{
  "message": "Vendors seeded successfully"
}
```

---

## Order Management

### 1. Get All Orders
**GET** `/order`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "message": "Orders fetched successfully",
  "orders": [
    {
      "id": 1,
      "order_id": "string",
      "user_id": 1,
      "vendor_id": "string",
      "driver_id": "string",
      "status": "pending",
      "total_amount": 2500,
      "delivery_fee": 500,
      "discount": 0,
      "final_amount": 3000,
      "payment_status": "pending",
      "payment_method": "card",
      "created_at": "2024-01-01T00:00:00.000Z",
      "user": {...},
      "vendor": {...},
      "driver": {...},
      "items": [...]
    }
  ]
}
```

### 2. Get Order by ID
**GET** `/order/{orderId}`

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `orderId` (integer): Order ID

**Success Response (200):**
```json
{
  "message": "Order fetched successfully",
  "order": {
    "id": 1,
    "order_id": "string",
    // ... full order object with relations
  }
}
```

### 3. Generate Verification Code
**POST** `/order/{order_id}/generate-code`

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `order_id` (string): Order ID (order_id field)

**Success Response (200):**
```json
{
  "message": "Verification code generated successfully",
  "code": "123456"
}
```

---

## Voucher Management

### 1. Create Voucher
**POST** `/voucher`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "string",
  "amount": 1000,
  "code": "WELCOME10",
  "expiry_type": "never"
}
```

**Success Response (201):**
```json
{
  "message": "Voucher created successfully",
  "voucher": {
    "id": "string",
    "name": "string",
    "amount": 1000,
    "code": "WELCOME10",
    "expiry_type": "never",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Get All Vouchers
**GET** `/voucher`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "message": "Vouchers fetched successfully",
  "vouchers": [
    {
      "id": "string",
      "name": "string",
      "amount": 1000,
      "code": "WELCOME10",
      "expiry_type": "never",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 3. Get Voucher by ID
**GET** `/voucher/{voucherId}`

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `voucherId` (string): Voucher ID

**Success Response (200):**
```json
{
  "message": "Voucher fetched successfully",
  "voucher": {
    "id": "string",
    // ... voucher object
  }
}
```

### 4. Update Voucher
**PUT** `/voucher/{voucherId}`

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `voucherId` (string): Voucher ID

**Request Body:** (same as create, all fields optional)

**Success Response (200):**
```json
{
  "message": "Voucher updated successfully",
  "voucher": {
    // updated voucher object
  }
}
```

### 5. Delete Voucher
**DELETE** `/voucher`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "voucher_id": "string"
}
```

**Success Response (200):**
```json
{
  "message": "Voucher deleted successfully"
}
```

---

## Dashboard

### 1. Get Dashboard Statistics
**GET** `/dashboard/stats`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "message": "Dashboard stats fetched successfully",
  "stats": {
    "totalUsers": 150,
    "totalDrivers": 25,
    "totalVendors": 10,
    "totalOrders": 500,
    "pendingOrders": 20,
    "completedOrders": 450,
    "totalRevenue": 150000,
    "monthlyRevenue": 25000
  }
}
```

### 2. Get Latest Orders
**GET** `/dashboard/latest-order`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "message": "Latest orders fetched successfully",
  "orders": [
    {
      "id": 1,
      "order_id": "string",
      "status": "pending",
      "total_amount": 2500,
      "created_at": "2024-01-01T00:00:00.000Z",
      "user": {
        "first_name": "string",
        "last_name": "string"
      },
      "vendor": {
        "name": "string"
      }
    }
  ]
}
```

---

## FAQ Management

### 1. Create FAQ
**POST** `/faq`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "question": "string",
  "answer": "string",
  "category": "general"
}
```

**Success Response (201):**
```json
{
  "message": "FAQ created successfully",
  "faq": {
    "id": "string",
    "question": "string",
    "answer": "string",
    "category": "general",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Get All FAQs
**GET** `/faq`

**Query Parameters:**
- `category` (optional): Filter by category

**Success Response (200):**
```json
{
  "message": "FAQs fetched successfully",
  "faqs": [
    {
      "id": "string",
      "question": "string",
      "answer": "string",
      "category": "general",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 3. Get FAQ by ID
**GET** `/faq/{faqId}`

**Path Parameters:**
- `faqId` (string): FAQ ID

**Success Response (200):**
```json
{
  "message": "FAQ fetched successfully",
  "faq": {
    "id": "string",
    // ... faq object
  }
}
```

### 4. Update FAQ
**PUT** `/faq/{faqId}`

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `faqId` (string): FAQ ID

**Request Body:** (same as create, all fields optional)

**Success Response (200):**
```json
{
  "message": "FAQ updated successfully",
  "faq": {
    // updated faq object
  }
}
```

### 5. Delete FAQ
**DELETE** `/faq`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "faq_id": "string"
}
```

**Success Response (200):**
```json
{
  "message": "FAQ deleted successfully"
}
```

---

## Support

### 1. Get Contact Information
**GET** `/support/contact-info`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "message": "Contact information fetched successfully",
  "contactInfo": {
    "phone": "string",
    "email": "string",
    "address": "string",
    "city": "string",
    "businessHours": "string",
    "saturdayHours": "string",
    "sundayHours": "string"
  }
}
```

### 2. Update Contact Information
**PUT** `/support/contact-info`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "phone": "string",
  "email": "string",
  "address": "string",
  "city": "string",
  "businessHours": "string",
  "saturdayHours": "string",
  "sundayHours": "string"
}
```

**Success Response (200):**
```json
{
  "message": "Contact information updated successfully",
  "contactInfo": {
    // updated contact info object
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

## Notes

- All timestamps are in ISO 8601 format
- All monetary values are in the smallest currency unit (e.g., kobo for NGN)
- Boolean fields use `true`/`false`
- All IDs are strings unless specified otherwise
- Authentication is required for most endpoints except `/login`, `/status`, and `/register`