# Sonic Admin API Contract

## Overview
This document defines the complete API contract between the Sonic Admin Next.js frontend and the backend API. The frontend expects all endpoints to follow this specification exactly.

**Base URL**: `{NEXT_PUBLIC_BACKEND_URL}/api/admin` (default: `http://localhost/api/admin`)

---

## Authentication & Headers

All API requests should include:
```
Content-Type: application/json
Authorization: Bearer {token} (if authentication is implemented)
```

---

## Response Format

All API responses should follow this standard format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}, // or [] for arrays
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

---

## 1. Dashboard Endpoints

### GET `/dashboard/stats`
Get dashboard statistics and metrics.

**Response Data Structure:**
```typescript
{
  totalVendors: number;
  totalDrivers: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingVendors: number;
  activeDrivers: number;
  todayOrders: number;
  // Chart data
  monthlyRevenue: number[];
  ordersByStatus: {
    pending: number;
    confirmed: number;
    delivered: number;
    cancelled: number;
  };
  topVendors: Array<{
    id: number;
    business_name: string;
    orders_count: number;
    revenue: number;
  }>;
}
```

### GET `/dashboard/latest-order`
Get recent orders for dashboard.

**Response Data Structure:**
```typescript
Array<{
  id: number;
  order_number: string;
  customer_name: string;
  vendor_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}>
```

---

## 2. Vendor Management Endpoints

### GET `/vendor`
Get all vendors with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by status
- `category` (optional): Filter by category
- `search` (optional): Search in business_name, contact_name, email

**Response Data Structure:**
```typescript
{
  vendors: Array<{
    id: number;
    business_name: string;
    category: string;
    contact_name: string;
    phone_number: string;
    email: string;
    business_address: string;
    store_logo?: string;
    cover_image?: string;
    opening_hours?: string;
    closing_hours?: string;
    delivery_radius?: number;
    bank_details?: string;
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'DELETED';
    created_at: string;
    updated_at: string;
    orders_count?: number;
    rating?: number;
  }>
}
```

### GET `/vendor/{id}`
Get vendor details by ID.

**Response Data Structure:**
```typescript
{
  data: {
    id: number;
    business_name: string;
    category: string;
    contact_name: string;
    phone_number: string;
    email: string;
    business_address: string;
    store_logo?: string;
    cover_image?: string;
    opening_hours?: string;
    closing_hours?: string;
    delivery_radius?: number;
    bank_details?: string;
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'DELETED';
    created_at: string;
    updated_at: string;
    orders_count?: number;
    rating?: number;
    // Additional details
    total_orders?: number;
    total_revenue?: number;
    last_order_date?: string;
  }
}
```

### POST `/vendor`
Create a new vendor.

**Request Body:**
```typescript
{
  business_name: string;
  category: string;
  contact_name: string;
  phone_number: string;
  email: string;
  password?: string;
  business_address: string;
  store_logo?: string;
  cover_image?: string;
  opening_hours?: string;
  closing_hours?: string;
  delivery_radius?: number;
  bank_details?: string;
}
```

**Response:** Standard success response with created vendor data.

### PUT `/vendor/{id}`
Update vendor information.

**Request Body:** Same as POST `/vendor` but all fields optional.

**Response:** Standard success response with updated vendor data.

### PUT `/vendor/approve`
Approve a vendor.

**Request Body:**
```typescript
{
  vendor_id: number;
  approval_notes?: string;
}
```

**Response:** Standard success response.

### PUT `/vendor/reject`
Reject a vendor.

**Request Body:**
```typescript
{
  vendor_id: number;
  reason: string;
}
```

**Response:** Standard success response.

### PUT `/vendor/suspend`
Suspend a vendor.

**Request Body:**
```typescript
{
  vendor_id: number;
  reason: string;
}
```

**Response:** Standard success response.

### PUT `/vendor/activate`
Activate a suspended vendor.

**Request Body:**
```typescript
{
  vendor_id: number;
}
```

**Response:** Standard success response.

### DELETE `/vendor`
Soft delete a vendor.

**Request Body:**
```typescript
{
  vendor_id: number;
}
```

**Response:** Standard success response.

---

## 3. Driver Management Endpoints

### GET `/driver`
Get all drivers.

**Response Data Structure:**
```typescript
{
  drivers: Array<{
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    license_number: string;
    vehicle_type: string;
    vehicle_model: string;
    vehicle_plate: string;
    profile_image?: string;
    license_image?: string;
    vehicle_image?: string;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED' | 'ACTIVE' | 'INACTIVE';
    is_online: boolean;
    rating?: number;
    total_deliveries?: number;
    created_at: string;
    updated_at: string;
  }>
}
```

### GET `/driver/{id}`
Get driver details by ID.

**Response Data Structure:**
```typescript
{
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  license_number: string;
  vehicle_type: string;
  vehicle_model: string;
  vehicle_plate: string;
  profile_image?: string;
  license_image?: string;
  vehicle_image?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED' | 'ACTIVE' | 'INACTIVE';
  is_online: boolean;
  rating?: number;
  total_deliveries?: number;
  total_earnings?: number;
  last_delivery_date?: string;
  created_at: string;
  updated_at: string;
  // Recent deliveries
  recent_orders?: Array<{
    id: number;
    order_number: string;
    customer_name: string;
    delivery_date: string;
    amount: number;
  }>;
}
```

### PUT `/driver/verify`
Verify a driver.

**Request Body:**
```typescript
{
  driver_id: number;
  verification_notes?: string;
}
```

**Response:** Standard success response.

### PUT `/driver/reject`
Reject a driver.

**Request Body:**
```typescript
{
  driver_id: number;
  reason: string;
}
```

**Response:** Standard success response.

### DELETE `/driver`
Delete a driver.

**Request Body:**
```typescript
{
  driver_id: number;
}
```

**Response:** Standard success response.

---

## 4. Order Management Endpoints

### GET `/order`
Get all orders.

**Query Parameters:**
- `status` (optional): Filter by status
- `vendor_id` (optional): Filter by vendor
- `driver_id` (optional): Filter by driver
- `date_from` (optional): Filter from date
- `date_to` (optional): Filter to date

**Response Data Structure:**
```typescript
{
  data: Array<{
    id: number;
    order_number: string;
    customer_id: number;
    customer_name: string;
    customer_phone: string;
    vendor_id: number;
    vendor_name: string;
    driver_id?: number;
    driver_name?: string;
    status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';
    total_amount: number;
    delivery_fee: number;
    tax_amount: number;
    discount_amount?: number;
    delivery_address: string;
    delivery_notes?: string;
    estimated_delivery_time?: string;
    actual_delivery_time?: string;
    created_at: string;
    updated_at: string;
  }>
}
```

### GET `/order/{id}`
Get order details by ID.

**Response Data Structure:**
```typescript
{
  data: {
    id: number;
    order_number: string;
    customer_id: number;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    vendor_id: number;
    vendor_name: string;
    vendor_address: string;
    driver_id?: number;
    driver_name?: string;
    driver_phone?: string;
    status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';
    total_amount: number;
    delivery_fee: number;
    tax_amount: number;
    discount_amount?: number;
    delivery_address: string;
    delivery_notes?: string;
    estimated_delivery_time?: string;
    actual_delivery_time?: string;
    created_at: string;
    updated_at: string;
    // Order items
    items: Array<{
      id: number;
      product_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      special_instructions?: string;
    }>;
    // Order timeline
    timeline: Array<{
      status: string;
      timestamp: string;
      notes?: string;
    }>;
  }
}
```

---

## 5. User/Customer Management Endpoints

### GET `/user`
Get all users/customers.

**Response Data Structure:**
```typescript
{
  users: Array<{
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    profile_image?: string;
    is_verified: boolean;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    total_orders?: number;
    total_spent?: number;
    last_order_date?: string;
    created_at: string;
    updated_at: string;
  }>
}
```

### PUT `/user/verify`
Verify a user.

**Request Body:**
```typescript
{
  user_id: number;
}
```

**Response:** Standard success response.

### DELETE `/user`
Delete a user.

**Request Body:**
```typescript
{
  user_id: number;
}
```

**Response:** Standard success response.

---

## 6. Authentication Endpoints (Optional)

### POST `/auth/login`
Admin login.

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  success: true,
  message: "Login successful",
  data: {
    token: string;
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
    }
  }
}
```

### POST `/auth/logout`
Admin logout.

**Response:** Standard success response.

---

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity (validation errors)
- `500` - Internal Server Error

### Validation Errors
For validation errors, return status `422` with detailed field errors:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required.", "The email must be a valid email address."],
    "phone_number": ["The phone number field is required."]
  }
}
```

---

## File Upload Handling

For endpoints that handle file uploads (store_logo, cover_image, profile_image, etc.):

1. Accept multipart/form-data requests
2. Return the uploaded file URL in the response
3. Support common image formats (jpg, jpeg, png, gif)
4. Implement file size limits (recommended: 5MB max)

**Example Response for File Upload:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "file_url": "https://your-domain.com/uploads/vendors/logo_123.jpg"
  }
}
```

---

## Environment Variables

The frontend expects these environment variables:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost/api/admin
NEXT_PUBLIC_APP_NAME=Sonic Admin
```

---

## Notes for Backend Implementation

1. **Consistent Response Format**: All endpoints must follow the standard response format defined above.

2. **Status Management**: Implement proper status transitions for vendors and drivers with validation.

3. **Soft Deletes**: Use soft deletes for vendors, drivers, and users (set status to 'DELETED' instead of removing records).

4. **Pagination**: While not currently implemented in frontend, consider adding pagination support for large datasets.

5. **Search & Filtering**: Implement search functionality for vendor and driver lists.

6. **File Storage**: Set up proper file storage for images with public URLs.

7. **Validation**: Implement comprehensive validation for all input fields.

8. **Logging**: Log all admin actions for audit purposes.

9. **Rate Limiting**: Implement rate limiting for API endpoints.

10. **CORS**: Configure CORS properly for the frontend domain.

---

## Frontend Adjustments Needed

Based on backend implementation, the frontend may need these adjustments:

1. **Authentication**: Implement JWT token handling if authentication is added.
2. **Error Handling**: Enhance error handling based on actual error responses.
3. **File Upload**: Add file upload components for image fields.
4. **Pagination**: Add pagination components if backend implements pagination.
5. **Real-time Updates**: Consider WebSocket integration for real-time order updates.
6. **Loading States**: Enhance loading states for better UX.
7. **Caching**: Implement proper data caching strategies.

---

## Testing Checklist

- [ ] All endpoints return data in the expected format
- [ ] Error responses follow the standard format
- [ ] Status transitions work correctly for vendors and drivers
- [ ] File uploads work and return proper URLs
- [ ] Search and filtering work as expected
- [ ] Validation errors are properly formatted
- [ ] CORS is configured correctly
- [ ] All CRUD operations work as expected
- [ ] Dashboard statistics are calculated correctly
- [ ] Order details include all required information

---

This contract ensures seamless integration between the Sonic Admin frontend and backend. Any deviations from this specification should be communicated and agreed upon by both teams.