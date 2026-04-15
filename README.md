# Sonic Admin - Next.js

Modern admin dashboard for Sonic Mega Logistics built with Next.js 15, React, TypeScript, and PrimeReact.

## 🚀 Features

### ✅ Completed Modules

- **Dashboard** - Real-time statistics, charts, and recent orders
- **Vendor Management** - Complete CRUD with approval workflow
- **Driver Management** - Driver verification and management
- **Order Management** - Order tracking and details
- **Customer Management** - User verification and management
- **Authentication** - Login page (ready for integration)

### 🎨 UI/UX

- Responsive design (mobile, tablet, desktop)
- PrimeReact component library
- PrimeFlex utility classes
- Dark/Light theme support
- Toast notifications
- Confirm dialogs
- Loading states
- Form validation

### 🔧 Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: PrimeReact 3.x
- **Styling**: Tailwind CSS + PrimeFlex + SASS
- **State Management**: Zustand (ready to use)
- **Charts**: Chart.js + react-chartjs-2
- **Icons**: PrimeIcons
- **HTTP Client**: Native Fetch API

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_BACKEND_URL=https://your-api-url.com/api/admin
```

## 📁 Project Structure

```
sonic-admin-next/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (dashboard)/          # Dashboard layout group
│   │   │   ├── page.tsx          # Dashboard home
│   │   │   ├── vendor/           # Vendor module
│   │   │   ├── driver/           # Driver module
│   │   │   ├── order/            # Order module
│   │   │   ├── user/             # Customer module
│   │   │   └── layout.tsx        # Dashboard layout
│   │   ├── login/                # Login page
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   └── layout/               # Layout components
│   │       ├── AppTopbar.tsx
│   │       ├── AppMenu.tsx
│   │       ├── AppSubmenu.tsx
│   │       └── AppFooter.tsx
│   ├── services/                 # API services
│   │   ├── VendorService.ts
│   │   ├── DriverService.ts
│   │   ├── OrderService.ts
│   │   ├── CustomerService.ts
│   │   └── DashboardService.ts
│   ├── lib/                      # Utilities
│   │   └── menuData.ts           # Menu configuration
│   ├── types/                    # TypeScript types
│   │   └── menu.ts
│   └── styles/                   # SASS styles
│       └── layout.scss
├── public/                       # Static assets
│   ├── images/
│   └── data/
└── package.json
```

## 🎯 Key Features by Module

### Vendor Management

- ✅ List all vendors with filters
- ✅ Create new vendor
- ✅ View/Edit vendor details
- ✅ Approve/Reject vendors
- ✅ Suspend/Activate vendors
- ✅ Soft delete vendors
- ✅ Status management (Draft, Pending, Approved, Rejected, Suspended)

### Driver Management

- ✅ List all drivers with filters
- ✅ View driver details
- ✅ Verify drivers
- ✅ Reject drivers with reason
- ✅ Delete drivers

### Order Management

- ✅ List all orders with filters
- ✅ View order details
- ✅ Order timeline
- ✅ Payment information
- ✅ Customer & driver details

### Customer Management

- ✅ List all customers
- ✅ Verify customers
- ✅ Delete customers
- ✅ Search and filter

### Dashboard

- ✅ Total orders, customers, drivers stats
- ✅ Growth rate calculations
- ✅ Order status breakdown
- ✅ Recent orders table
- ✅ Sales chart

## 🔐 Authentication

The login page is ready for integration. To implement authentication:

1. Create an auth service in `src/services/AuthService.ts`
2. Use NextAuth.js or implement custom JWT authentication
3. Add middleware for protected routes
4. Store tokens in cookies or localStorage

## 🎨 Customization

### Theme

Edit `src/app/layout.tsx` to change the PrimeReact theme:

```tsx
import "primereact/resources/themes/lara-light-blue/theme.css"; // Change theme here
```

Available themes: lara-light-blue, lara-dark-blue, md-light-indigo, etc.

### Menu

Edit `src/lib/menuData.ts` to customize the sidebar menu:

```typescript
export const menuData: MenuModel[] = [
  {
    label: "Menu",
    items: [
      { label: "Dashboard", icon: "pi pi-fw pi-home", to: "/" },
      // Add more menu items
    ],
  },
];
```

### Colors

Edit `src/styles/layout.scss` to customize colors and spacing.

## 📊 API Integration

All services use the `NEXT_PUBLIC_BACKEND_URL` environment variable. Example:

```typescript
// src/services/VendorService.ts
const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default class VendorService {
  getAllVendors() {
    return fetch(`${apiUrl}/vendor`)
      .then(res => res.json())
      .then(d => d.vendors);
  }
}
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Development Guidelines

1. **Components**: Use PrimeReact components for consistency
2. **Styling**: Use PrimeFlex utility classes + Tailwind
3. **State**: Use React hooks (useState, useEffect)
4. **Forms**: Implement validation before submission
5. **Error Handling**: Always show toast notifications
6. **Loading States**: Show loading indicators for async operations

## 🐛 Known Issues

- None currently

## 📄 License

Private - Sonic Mega Logistics

## 👥 Contributors

- Development Team

## 📞 Support

For support, contact the development team.

---

Built with ❤️ using Next.js and PrimeReact
