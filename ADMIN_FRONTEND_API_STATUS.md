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

### Not currently supported
- `POST /auth/login` (frontend contract path mismatch)
- `POST /auth/logout`
- `POST /admin/logout` (not implemented)
- Token refresh endpoint (not present in admin routes)

### Notes for frontend
- Use `Authorization: Bearer {token}` for protected admin routes.
- The backend currently authenticates admin tokens through `/admin` routes only.

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
Backend errors currently return:
```json
{
  "success": false,
  "message": "...",
  "error": { ... }
}
```

> Frontend should not assume the contract field name `errors`; the current backend uses `error`.

## Currently supported admin APIs

### User management
- `GET /admin/user`
- `PUT /admin/user/verify`
- `DELETE /admin/user`

### Driver management
- `GET /admin/driver`
- `GET /admin/driver/:userId`
- `PUT /admin/driver/verify`
- `PUT /admin/driver/reject`
- `DELETE /admin/driver`
- `POST /admin/seed-driver`

### Vendor management
- `GET /admin/vendor`
- `PUT /admin/vendor/:id/approve`
- `DELETE /admin/vendor/:id`
- `POST /admin/vendor/seed`

### Order management
- `GET /admin/order`
- `GET /admin/order/:orderId`
- `POST /admin/order/:order_id/generate-code`

### Voucher management
- `POST /admin/voucher`
- `GET /admin/voucher`
- `GET /admin/voucher/:voucherId`
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
