# Admin Frontend API Status

## Purpose

This document tells the frontend team exactly what the current backend supports, what is not yet implemented, and what API changes should be planned.

## Base URL

- Admin backend base path: `/api/admin`
- Example full path: `http://localhost/api/admin` if `NEXT_PUBLIC_BACKEND_URL` is `http://localhost`

## Authentication

### Supported

- `POST /admin/login`
  - Login admin users
  - Expects `email` and `password`
- `GET /admin/status`
  - Checks whether an admin account exists
- `POST /admin/register`
  - Creates the first admin account
  - Expects `email`, `password`, `first_name`, `last_name`
- `GET /admin/profile`
  - Get current admin profile
  - Requires Bearer token
- `PUT /admin/profile`
  - Update admin profile (first_name, last_name, email)
  - Requires Bearer token
- `PUT /admin/change-password`
  - Change admin password
  - Expects `current_password`, `new_password`, `confirm_new_password`
  - Requires Bearer token
- `POST /admin/refresh-token`
  - Refresh admin access token
  - Expects `refresh_token`
- `POST /admin/logout`
  - Logout admin and revoke refresh token
  - Requires Bearer token

### Notes for frontend

- Use `Authorization: Bearer {token}` for protected admin routes.
- All admin routes are protected except `/login`, `/status`, `/register`, and `/refresh-token`.
- Token refresh is supported - store both access and refresh tokens.

## Response format

### Success

Backend responses follow:

```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "meta": { ... } // optional
}
```

### Error

Backend errors return:

```json
{
  "error_code": 400,
  "error": "Bad Request",
  "message": "...",
  "details": "..."
}
```

## Currently supported admin APIs

### User management

- `GET /admin/user` - List all users with pagination
- `PUT /admin/user/verify` - Verify a user
- `DELETE /admin/user` - Delete a user

### Driver management

- `GET /admin/driver` - List all drivers with pagination
- `GET /admin/driver/:userId` - Get driver by ID
- `PUT /admin/driver/verify` - Verify a driver
- `PUT /admin/driver/reject` - Reject a driver
- `DELETE /admin/driver` - Delete a driver
- `POST /admin/seed-driver` - Seed test driver data

### Vendor management

- `GET /admin/vendor` - List all vendors with pagination
- `POST /admin/vendor` - Create new vendor
- `GET /admin/vendor/:id` - Get vendor by ID
- `PUT /admin/vendor/:id` - Update vendor
- `PUT /admin/vendor/reject` - Reject vendor
- `PUT /admin/vendor/suspend` - Suspend vendor
- `PUT /admin/vendor/activate` - Activate vendor
- `PUT /admin/vendor/:id/approve` - Approve vendor
- `DELETE /admin/vendor/:id` - Delete vendor
- `POST /admin/vendor/seed` - Seed test vendor data

### Order management

- `GET /admin/order` - List all orders with pagination
- `GET /admin/order/:orderId` - Get order by ID
- `POST /admin/order/:order_id/generate-code` - Generate verification code

### Voucher management

- `POST /admin/voucher` - Create voucher
- `GET /admin/voucher` - List all vouchers with pagination
- `GET /admin/voucher/:voucherId` - Get voucher by ID
- `PUT /admin/voucher/:voucherId` - Update voucher
- `DELETE /admin/voucher` - Delete voucher

### Dashboard

- `GET /admin/dashboard/stats` - Get dashboard statistics
- `GET /admin/dashboard/latest-order` - Get latest orders

### FAQ management

- `POST /admin/faq` - Create FAQ
- `GET /admin/faq` - List all FAQs with pagination and search
- `GET /admin/faq/:faqId` - Get FAQ by ID
- `PUT /admin/faq/:faqId` - Update FAQ
- `DELETE /admin/faq` - Delete FAQ

### Support

- `GET /admin/support/contact-info` - Get contact information
- `PUT /admin/support/contact-info` - Update contact information

## API Documentation

- Interactive Swagger UI available at `/api-docs`
- All endpoints are documented with OpenAPI 3.0 specifications
- Includes request/response schemas and authentication requirements

## Implementation Notes

- All list endpoints support pagination with query parameters
- Search and filtering available on applicable endpoints (users, drivers, vendors, orders, vouchers, FAQs)
- Proper error handling with detailed validation messages
- TypeScript compilation validated - no type errors
- Prisma client regenerated after schema updates
- `PUT /admin/voucher/:voucherId`
- `DELETE /admin/voucher`

### Dashboard

- `GET /admin/dashboard/stats`
- `GET /admin/dashboard/latest-order`

### FAQ management

- `POST /admin/faq`
- `GET /admin/faq`
- `GET /admin/faq/:faqId`
- `PUT /admin/faq/:faqId`
- `DELETE /admin/faq`

### Support contact info

- `GET /admin/support/contact-info`
- `PUT /admin/support/contact-info`

## Supported features the frontend can build now

- Login/register for admin users
- Dashboard summary pages using `/dashboard/stats` and `/dashboard/latest-order`
- User list page with verify/delete actions
- Driver list and driver details page with verify/reject/delete functionality
- Vendor listing and approve/delete workflows
- Order list/detail page and verification code generation
- Voucher create/read/update/delete flows
- FAQ management pages
- Admin support contact info editor

## Frontend features to postpone until backend support exists

### Backend not ready for these frontend contract features

- Vendor detail page using `GET /vendor/{id}`
- Vendor create flow using `POST /vendor`
- Vendor update flow using `PUT /vendor/{id}`
- Vendor reject via `PUT /vendor/reject`
- Vendor suspend via `PUT /vendor/suspend`
- Vendor activate via `PUT /vendor/activate`
- Authentication logout endpoint
- File upload forms for vendor/driver images
- Pagination support on admin lists (not explicitly implemented)
- Search/filter query support on admin list endpoints (not currently supported)

## Implementation notes for frontend

1. Use `/admin` path prefix for all admin backend calls.
2. Send `Authorization: Bearer {token}` on all protected routes.
3. Expect `error` instead of `errors` in failure responses.
4. Keep vendor create/update/suspend features disabled or hidden until backend adds them.
5. Build list pages using existing endpoints first, and add filtering/pagination later once backend supports them.
6. Add generic error handling for 400/401/404/500 responses.

## Recommended frontend contract updates

- Replace contract path `/auth/login` with `/admin/login`.
- Add logout support only after a backend logout endpoint is added.
- Keep `meta` optional for now.
- Avoid relying on file upload payloads until backend implements upload handling.
- Align response error shape with current backend: use `error` not `errors`.
