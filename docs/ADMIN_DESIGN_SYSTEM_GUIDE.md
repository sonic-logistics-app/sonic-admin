# Admin Design System Guide
## Complete Reference for Building Admin Dashboards

**Version**: 1.0  
**Last Updated**: 2026  
**Status**: Production Ready

---

## 📋 Table of Contents

1. [Introduction](#1-introduction)
2. [Design Philosophy](#2-design-philosophy)
3. [Architecture & Structure](#3-architecture--structure)
4. [Design Tokens](#4-design-tokens)
5. [Component Library](#5-component-library)
6. [Layout Patterns](#6-layout-patterns)
7. [Page Templates](#7-page-templates)
8. [Responsive Design](#8-responsive-design)
9. [Authentication & Security](#9-authentication--security)
10. [API Integration](#10-api-integration)
11. [Best Practices](#11-best-practices)
12. [Implementation Checklist](#12-implementation-checklist)

---

## 1. Introduction

### 1.1 Purpose

This guide provides a complete design system for building modern admin dashboards. It's based on the Sonic Admin Dashboard implementation and serves as a comprehensive reference for development teams building similar applications.

### 1.2 Who Should Use This Guide

- **Frontend Developers**: Building admin interfaces
- **UI/UX Designers**: Creating admin dashboard designs
- **Product Managers**: Understanding admin capabilities
- **Development Teams**: Implementing admin systems from scratch

### 1.3 What's Included

- ✅ Complete design token system
- ✅ 20+ production-ready components
- ✅ 10+ page templates
- ✅ Responsive design patterns
- ✅ Authentication flows
- ✅ API integration patterns
- ✅ Code examples and best practices

### 1.4 Technology Stack

**Core Technologies**:
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 3+
- **State Management**: React Query (TanStack Query)
- **Authentication**: JWT with refresh tokens

**Why These Choices**:
- Next.js: Server-side rendering, excellent performance
- TypeScript: Type safety, better developer experience
- Tailwind: Utility-first, highly customizable
- React Query: Automatic caching, background updates
- JWT: Industry standard, secure, scalable

---


## 2. Design Philosophy

### 2.1 Core Principles

#### Simplicity First
- Clean, uncluttered interfaces
- Flat design (no shadows, minimal gradients)
- Focus on content, not decoration
- White space is your friend

#### Consistency Everywhere
- Same patterns across all pages
- Predictable interactions
- Unified color system
- Consistent spacing and typography

#### Mobile-First Approach
- Design for mobile, enhance for desktop
- Touch-friendly interactions (44px minimum)
- Responsive by default
- Progressive enhancement

#### Accessibility Always
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader friendly
- Sufficient color contrast (4.5:1 minimum)

#### Performance Matters
- Fast initial load (<3s)
- Optimized images and assets
- Efficient rendering
- Minimal dependencies

### 2.2 Visual Language

#### Modern & Professional
- Clean lines and borders
- Rounded corners (8px, 12px, 50px)
- Subtle hover states
- Smooth transitions (150ms-300ms)

#### Color Psychology
- **Blue**: Trust, stability (primary actions)
- **Green**: Success, positive actions
- **Red**: Danger, destructive actions
- **Yellow/Orange**: Warnings, attention
- **Gray**: Neutral, secondary information

#### Typography Hierarchy
- **Large (18-24px)**: Page titles, important metrics
- **Medium (13-16px)**: Body text, labels
- **Small (11-12px)**: Captions, metadata
- **Weight**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### 2.3 User Experience Goals

#### Efficiency
- Quick access to common tasks
- Keyboard shortcuts for power users
- Bulk actions for multiple items
- Smart defaults and auto-fill

#### Clarity
- Clear visual hierarchy
- Obvious call-to-actions
- Helpful error messages
- Contextual help and tooltips

#### Confidence
- Confirmation for destructive actions
- Clear feedback for all actions
- Undo capabilities where possible
- Progress indicators for long operations

#### Flexibility
- Customizable views (table/card)
- Adjustable page sizes
- Sortable and filterable data
- Exportable data

---


## 3. Architecture & Structure

### 3.1 Project Structure

```
admin-dashboard/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   └── forgot-password/
│   ├── (authenticated)/          # Protected routes
│   │   ├── dashboard/
│   │   ├── user/
│   │   ├── order/
│   │   ├── transaction/
│   │   ├── vendor/
│   │   ├── driver/
│   │   ├── voucher/
│   │   ├── faq/
│   │   ├── support/
│   │   └── profile/
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── middleware.ts             # Auth middleware
│
├── components/
│   ├── auth/                     # Auth components
│   │   └── ProtectedRoute.tsx
│   ├── layout/                   # Layout components
│   │   ├── AppSidebar.tsx
│   │   ├── AppHeader.tsx
│   │   ├── AppMenu.tsx
│   │   ├── AppFooter.tsx
│   │   ├── Breadcrumb.tsx
│   │   └── MobileNav.tsx
│   ├── shared/                   # Reusable components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── DataTable.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── SearchBar.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingStates.tsx
│   │   ├── Toast.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── ErrorBoundary.tsx
│   ├── dashboard/                # Dashboard-specific
│   │   ├── DashboardStats.tsx
│   │   ├── SalesChart.tsx
│   │   └── RefundSummaryWidget.tsx
│   └── [feature]/                # Feature-specific components
│
├── lib/
│   ├── api/                      # API clients
│   │   ├── admin/
│   │   │   ├── users.ts
│   │   │   ├── orders.ts
│   │   │   ├── transactions.ts
│   │   │   ├── vendors.ts
│   │   │   ├── drivers.ts
│   │   │   ├── vouchers.ts
│   │   │   ├── refunds.ts
│   │   │   └── faqs.ts
│   │   └── client.ts             # Base API client
│   ├── types/                    # TypeScript types
│   │   └── admin.ts
│   ├── utils/                    # Utility functions
│   │   ├── formatters.ts
│   │   └── validators.ts
│   └── menuData.ts               # Navigation menu data
│
├── hooks/                        # Custom React hooks
│   ├── useDebounce.ts
│   ├── useAuth.ts
│   └── useToast.ts
│
├── services/                     # Business logic
│   └── AuthService.ts
│
├── public/                       # Static assets
│   ├── images/
│   └── data/
│
└── docs/                         # Documentation
    └── ADMIN_DESIGN_SYSTEM_GUIDE.md
```

### 3.2 Routing Strategy

#### Route Groups
- **(auth)**: Public authentication pages
- **(authenticated)**: Protected admin pages

#### Dynamic Routes
- `/user/[id]`: User detail page
- `/order/[id]`: Order detail page
- `/vendor/[id]`: Vendor detail page
- `/driver/[id]`: Driver detail page
- `/faq/[id]`: FAQ detail page

#### Special Routes
- `/order/refund`: Refund management
- `/user/create`: Create new user
- `/vendor/create`: Create new vendor
- `/driver/create`: Create new driver
- `/faq/create`: Create new FAQ

### 3.3 Component Architecture

#### Component Hierarchy

```
Page Component
├── Layout (Sidebar + Header)
├── Page Header (Title + Actions)
├── Filters Section (Search + Filters)
├── Data Section (Table/Cards)
└── Modals/Dialogs
```

#### Component Types

**1. Layout Components**
- Provide structure and navigation
- Persistent across pages
- Handle responsive behavior

**2. Shared Components**
- Reusable across features
- Generic and configurable
- Well-documented APIs

**3. Feature Components**
- Specific to one feature
- Can use shared components
- Business logic included

**4. Page Components**
- Top-level route components
- Compose other components
- Handle data fetching

### 3.4 State Management

#### Local State (useState)
- Component-specific UI state
- Form inputs
- Modal visibility
- Temporary data

#### Server State (React Query)
- API data caching
- Background refetching
- Optimistic updates
- Error handling

#### Global State (Context)
- Authentication state
- User preferences
- Theme settings
- Toast notifications

#### URL State (useSearchParams)
- Filters and search
- Pagination
- Sorting
- Shareable state

### 3.5 Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
API Service Call
    ↓
React Query (Cache + Update)
    ↓
Component Re-render
    ↓
UI Update + Feedback
```

---


## 4. Design Tokens

### 4.1 Color System

#### Primary Colors

```css
/* Blue - Primary Actions */
--primary-50:  #EFF6FF;
--primary-100: #DBEAFE;
--primary-200: #BFDBFE;
--primary-500: #3B82F6;
--primary-600: #2563EB;  /* Main primary */
--primary-700: #1D4ED8;
--primary-800: #1E40AF;

/* Usage */
.button-primary { background: #2563EB; }
.link { color: #2563EB; }
.focus-ring { border-color: #2563EB; }
```

#### Semantic Colors

```css
/* Success - Green */
--success-50:  #ECFDF3;
--success-100: #D1FAE5;
--success-500: #10B981;
--success-600: #059669;  /* Main success */
--success-700: #047857;

/* Danger - Red */
--danger-50:  #FEF2F2;
--danger-100: #FEE2E2;
--danger-500: #EF4444;
--danger-600: #DC2626;   /* Main danger */
--danger-700: #B91C1C;

/* Warning - Yellow/Orange */
--warning-50:  #FEF3C7;
--warning-100: #FDE68A;
--warning-500: #F59E0B;
--warning-600: #D97706;  /* Main warning */
--warning-700: #B45309;

/* Info - Cyan */
--info-50:  #ECFEFF;
--info-100: #CFFAFE;
--info-500: #06B6D4;
--info-600: #0891B2;    /* Main info */
--info-700: #0E7490;
```

#### Neutral Colors

```css
/* Gray Scale */
--gray-50:  #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;

/* Borders */
--border-light: #E1E4EA;
--border-default: #D1D5DB;
--border-dark: #9CA3AF;

/* Text */
--text-primary: #111827;
--text-secondary: #525866;
--text-tertiary: #9CA3AF;
--text-disabled: #D1D5DB;
```

### 4.2 Typography

#### Font Family

```css
/* Primary Font */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 
             'Fira Sans', 'Droid Sans', 'Helvetica Neue', 
             sans-serif;

/* Monospace (for code, IDs) */
font-family: 'SF Mono', Monaco, 'Cascadia Code', 
             'Roboto Mono', Consolas, 'Courier New', 
             monospace;
```

#### Font Sizes

```css
/* Headings */
--text-3xl: 24px;  /* Page titles (desktop) */
--text-2xl: 20px;  /* Section titles */
--text-xl:  18px;  /* Page titles (mobile) */
--text-lg:  16px;  /* Card titles */

/* Body */
--text-base: 15px; /* Large body text */
--text-sm:   13px; /* Default body text */
--text-xs:   12px; /* Small text, badges */
--text-2xs:  11px; /* Captions, labels */
--text-3xs:  10px; /* Tiny text (rare) */
```

#### Font Weights

```css
--font-normal:    400;  /* Body text */
--font-medium:    500;  /* Emphasized text */
--font-semibold:  600;  /* Headings, buttons */
--font-bold:      700;  /* Strong emphasis */
```

#### Line Heights

```css
--leading-tight:  1.25;  /* Headings */
--leading-snug:   1.375; /* Tight paragraphs */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.625; /* Loose paragraphs */
```

### 4.3 Spacing

#### Spacing Scale

```css
--space-0:  0px;
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

#### Common Patterns

```css
/* Component Padding */
.card-mobile { padding: 16px; }      /* p-4 */
.card-desktop { padding: 24px; }     /* p-6 */

/* Section Spacing */
.section-gap { gap: 16px; }          /* gap-4 */
.section-gap-lg { gap: 24px; }       /* gap-6 */

/* Element Spacing */
.element-gap { gap: 8px; }           /* gap-2 */
.element-gap-sm { gap: 4px; }        /* gap-1 */
```

### 4.4 Border Radius

```css
--radius-sm:   4px;   /* Small elements */
--radius-md:   8px;   /* Default */
--radius-lg:   12px;  /* Cards */
--radius-xl:   16px;  /* Large cards */
--radius-2xl:  20px;  /* Extra large cards */
--radius-full: 50px;  /* Pills, buttons */
--radius-round: 9999px; /* Circles */
```

#### Usage

```css
/* Buttons */
.button { border-radius: 50px; }

/* Cards */
.card { border-radius: 20px; }

/* Inputs */
.input { border-radius: 8px; }

/* Badges */
.badge { border-radius: 50px; }

/* Avatars */
.avatar { border-radius: 9999px; }
```

### 4.5 Shadows

**Note**: This design system uses a flat design approach with minimal shadows.

```css
/* Subtle elevation (rare use) */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

/* Modal backdrop */
--shadow-modal: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
                0 10px 10px -5px rgba(0, 0, 0, 0.04);

/* Preferred: Use borders instead */
.card { border: 1px solid #E1E4EA; }
```

### 4.6 Transitions

```css
/* Duration */
--duration-fast:   150ms;  /* Hover states */
--duration-normal: 200ms;  /* Default */
--duration-slow:   300ms;  /* Complex animations */

/* Easing */
--ease-in:     cubic-bezier(0.4, 0, 1, 1);
--ease-out:    cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* Common Transitions */
.transition-colors {
  transition: color 150ms ease-in-out,
              background-color 150ms ease-in-out,
              border-color 150ms ease-in-out;
}

.transition-all {
  transition: all 200ms ease-in-out;
}
```

### 4.7 Breakpoints

```css
/* Mobile First */
--screen-sm:  640px;   /* Small tablets */
--screen-md:  768px;   /* Tablets */
--screen-lg:  1024px;  /* Desktops */
--screen-xl:  1280px;  /* Large desktops */
--screen-2xl: 1536px;  /* Extra large */

/* Usage in Tailwind */
/* Default: Mobile */
.grid { grid-template-columns: 1fr; }

/* sm: Small tablets and up */
@media (min-width: 640px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* md: Tablets and up */
@media (min-width: 768px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}

/* lg: Desktops and up */
@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(4, 1fr); }
}
```

### 4.8 Z-Index Scale

```css
--z-base:     0;
--z-dropdown: 10;
--z-sticky:   20;
--z-fixed:    30;
--z-modal:    40;
--z-popover:  50;
--z-tooltip:  60;
--z-toast:    70;
```

---


## 5. Component Library

### 5.1 Button Component

#### Variants

**Primary Button**
```tsx
<Button variant="primary" size="md">
  Save Changes
</Button>
```
- Background: `#2563EB`
- Text: White
- Hover: `#1D4ED8`
- Use for: Primary actions, form submissions

**Secondary Button**
```tsx
<Button variant="secondary" size="md">
  Cancel
</Button>
```
- Background: White
- Border: `#E1E4EA`
- Text: `#111827`
- Hover: `#F9FAFB`
- Use for: Secondary actions, cancel buttons

**Danger Button**
```tsx
<Button variant="danger" size="md">
  Delete
</Button>
```
- Background: `#DC2626`
- Text: White
- Hover: `#B91C1C`
- Use for: Destructive actions, delete operations

**Ghost Button**
```tsx
<Button variant="ghost" size="md">
  View Details
</Button>
```
- Background: Transparent
- Text: `#2563EB`
- Hover: `#EFF6FF`
- Use for: Tertiary actions, inline links

#### Sizes

```tsx
<Button size="sm">Small</Button>    // h-[32px], text-[12px]
<Button size="md">Medium</Button>   // h-[40px], text-[13px]
<Button size="lg">Large</Button>    // h-[44px], text-[15px]
```

#### With Icons

```tsx
<Button icon="pi pi-plus" iconPosition="left">
  Add New
</Button>

<Button icon="pi pi-download" iconPosition="right">
  Export
</Button>
```

#### Loading State

```tsx
<Button loading>
  Saving...
</Button>
```

#### Full Width

```tsx
<Button fullWidth>
  Submit
</Button>
```

#### Icon-Only Button

```tsx
<IconButton icon="pi pi-trash" variant="danger" size="sm" />
```

---

### 5.2 Input Components

#### Text Input

```tsx
<Input
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  icon="pi pi-envelope"
  iconPosition="left"
  required
/>
```

**Specifications**:
- Height: `38px`
- Border: `1px solid #E1E4EA`
- Border Radius: `8px`
- Font Size: `13px`
- Padding: `0 12px`
- Focus Border: `#2563EB`

#### Input with Error

```tsx
<Input
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
/>
```

#### Textarea

```tsx
<Textarea
  label="Description"
  placeholder="Enter description"
  rows={4}
  maxLength={500}
/>
```

**Specifications**:
- Min Height: `100px`
- Resizable: Vertical only
- Same styling as Input

#### Select Dropdown

```tsx
<Select
  label="Status"
  options={[
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ]}
  placeholder="Select status"
/>
```

#### Checkbox

```tsx
<Checkbox 
  label="I agree to the terms and conditions" 
  checked={agreed}
  onChange={setAgreed}
/>
```

**Specifications**:
- Size: `16px × 16px`
- Border: `2px solid #E1E4EA`
- Checked: `#2563EB` background
- Checkmark: White

#### Radio Button

```tsx
<Radio 
  name="role" 
  value="admin" 
  label="Administrator"
  checked={role === "admin"}
  onChange={() => setRole("admin")}
/>
```

**Specifications**:
- Size: `16px × 16px`
- Border: `2px solid #E1E4EA`
- Selected: `#2563EB` dot

---

### 5.3 DataTable Component

#### Basic Usage

```tsx
const columns = [
  { 
    field: "name", 
    header: "Name", 
    sortable: true 
  },
  { 
    field: "email", 
    header: "Email", 
    sortable: true 
  },
  {
    field: "status",
    header: "Status",
    body: (row) => <StatusBadge status={row.status} />,
  },
  {
    field: "actions",
    header: "Actions",
    body: (row) => (
      <Button size="sm" onClick={() => handleEdit(row)}>
        Edit
      </Button>
    ),
  },
];

<DataTable
  data={users}
  columns={columns}
  loading={loading}
  pagination={{
    page: 1,
    limit: 20,
    total: 100,
  }}
  onPaginationChange={(pagination) => setPagination(pagination)}
  onRowClick={(row) => handleRowClick(row)}
  emptyMessage="No users found"
/>
```

#### Desktop View

**Table Specifications**:
- Border: `1px solid #E1E4EA`
- Border Radius: `12px`
- Header Background: `#F9FAFB`
- Header Padding: `12px 24px`
- Header Font: `13px`, `600` weight
- Row Padding: `16px 24px`
- Row Hover: `#F9FAFB`
- Row Border: `1px solid #E1E4EA`

#### Mobile View (<768px)

Automatically converts to card layout:

```tsx
// Each row becomes a card
<div className="rounded-[12px] border border-[#E1E4EA] p-4">
  <div className="space-y-2">
    <div>
      <span className="text-[11px] text-[#525866]">Name</span>
      <p className="text-[13px] font-semibold">{row.name}</p>
    </div>
    <div>
      <span className="text-[11px] text-[#525866]">Email</span>
      <p className="text-[13px]">{row.email}</p>
    </div>
  </div>
</div>
```

#### Pagination

```tsx
// Pagination controls
<div className="flex items-center justify-between px-6 py-4">
  <div className="text-[13px] text-[#525866]">
    Showing 1-20 of 100
  </div>
  <div className="flex items-center gap-2">
    <Button size="sm" variant="secondary">Previous</Button>
    <Button size="sm" variant="primary">1</Button>
    <Button size="sm" variant="secondary">2</Button>
    <Button size="sm" variant="secondary">3</Button>
    <Button size="sm" variant="secondary">Next</Button>
  </div>
  <Select
    options={[
      { value: "10", label: "10 per page" },
      { value: "20", label: "20 per page" },
      { value: "50", label: "50 per page" },
    ]}
  />
</div>
```

---

### 5.4 StatusBadge Component

#### Usage

```tsx
<StatusBadge status="active" />
<StatusBadge status="pending" />
<StatusBadge status="delivered" />
<StatusBadge status="refunded" />
```

#### Specifications

- Border Radius: `50px` (pill shape)
- Padding: `4px 12px`
- Font Size: `12px`
- Font Weight: `600`
- Status Icon: Included

#### Status Types & Colors

**User Status**:
```tsx
active     → Green (#059669)  ● Active
inactive   → Gray (#6B7280)   ◐ Inactive
suspended  → Orange (#D97706) − Suspended
banned     → Red (#DC2626)    ✗ Banned
```

**Order Status**:
```tsx
pending    → Yellow (#D97706) ◐ Pending
confirmed  → Blue (#2563EB)   ● Confirmed
preparing  → Cyan (#0891B2)   ◐ Preparing
ready      → Green (#059669)  ● Ready
pickup     → Blue (#2563EB)   ● Pickup
in_transit → Blue (#2563EB)   ● In Transit
delivered  → Green (#059669)  ✓ Delivered
cancelled  → Red (#DC2626)    ✗ Cancelled
rejected   → Red (#DC2626)    ✗ Rejected
```

**Payment Status**:
```tsx
paid       → Green (#059669)  ✓ Paid
unpaid     → Gray (#6B7280)   ◐ Unpaid
refunded   → Red (#DC2626)    ↶ Refunded
refund_pending → Orange (#D97706) ◐ Refund Pending
```

**Support Status**:
```tsx
open       → Blue (#2563EB)   ● Open
in_progress → Cyan (#0891B2)  ◐ In Progress
resolved   → Green (#059669)  ✓ Resolved
closed     → Gray (#6B7280)   − Closed
```

---

### 5.5 SearchBar Component

#### Basic Usage

```tsx
<SearchBar
  value={searchValue}
  onChange={(value) => setSearchValue(value)}
  placeholder="Search customers..."
  debounceMs={300}
  showClearButton
/>
```

#### Specifications

- Height: `38px`
- Border: `1px solid #E1E4EA`
- Border Radius: `8px`
- Font Size: `13px`
- Padding: `0 12px 0 40px` (with icon)
- Max Width: `585px` (desktop)
- Debounce: `300ms` default

#### With Keyboard Shortcut

```tsx
<SearchBar
  value={searchValue}
  onChange={setSearchValue}
  placeholder="Search... (Cmd+K)"
  keyboardShortcut="cmd+k"
/>
```

#### Features

- Search icon on left
- Clear button on right (when has value)
- Debounced input
- Keyboard shortcut support (Cmd/Ctrl+K)
- Focus state with blue border

---

### 5.6 EmptyState Component

#### Usage

```tsx
<EmptyState
  icon="pi pi-inbox"
  title="No Customers Found"
  description="You haven't added any customers yet. Click below to get started."
  action={{
    label: "Add First Customer",
    onClick: () => router.push("/user/create"),
    icon: "pi pi-plus",
  }}
/>
```

#### Specifications

- Container Padding: `64px 24px`
- Min Height: `400px`
- Icon Size: `64px`
- Icon Color: `#D1D5DB`
- Title Font: `16px`, `600` weight
- Description Font: `13px`, `#525866`
- Spacing: `16px` between elements

#### Without Action

```tsx
<EmptyState
  icon="pi pi-search"
  title="No Results"
  description="Try adjusting your search or filters"
/>
```

---

### 5.7 LoadingStates Component

#### Full Page Loading

```tsx
<LoadingStates type="full-page" />
```

Shows centered spinner with "Loading..." text.

#### Table Loading

```tsx
<LoadingStates type="table" rows={5} />
```

Shows skeleton rows matching table structure.

#### Card Loading

```tsx
<LoadingStates type="card" />
```

Shows skeleton with avatar and text lines.

#### Inline Loading

```tsx
<LoadingStates type="inline" />
```

Small spinner for inline use.

#### Button Loading

```tsx
<LoadingStates type="button" />
```

Tiny spinner for button loading states.

#### Text Skeleton

```tsx
<TextSkeleton lines={3} />
```

Multiple skeleton lines for text content.

#### Stat Card Skeleton

```tsx
<StatCardSkeleton />
```

Skeleton matching stat card layout.

#### Specifications

- Skeleton Color: `#E5E7EB`
- Animation: Shimmer (2s infinite)
- Border Radius: Matches component
- Height: Matches actual content

---

### 5.8 Toast Component

#### Usage

```tsx
const toast = useRef<ToastRef>(null);

// Show toast
toast.current?.show({
  severity: "success",
  summary: "Success",
  detail: "User created successfully",
  life: 3000,
});

// In component
<Toast ref={toast} />
```

#### Severity Types

```tsx
success  → Green background, checkmark icon
info     → Blue background, info icon
warn     → Orange background, warning icon
error    → Red background, error icon
```

#### Specifications

- Position: Top-right
- Width: `400px` (desktop), `90%` (mobile)
- Border Radius: `12px`
- Padding: `16px`
- Font Size: `13px`
- Auto-dismiss: 3000ms default
- Close button: Top-right

---

### 5.9 ConfirmDialog Component

#### Usage

```tsx
<ConfirmDialog
  visible={showDialog}
  onHide={() => setShowDialog(false)}
  onConfirm={handleDelete}
  title="Delete User"
  message="Are you sure you want to delete this user? This action cannot be undone."
  confirmLabel="Delete"
  cancelLabel="Cancel"
  variant="danger"
  requireReason
/>
```

#### Specifications

- Max Width: `500px`
- Border Radius: `20px`
- Backdrop: `rgba(0, 0, 0, 0.3)`
- Header Padding: `24px`
- Content Padding: `24px`
- Footer Padding: `16px 24px`

#### Variants

```tsx
default → Blue confirm button
danger  → Red confirm button (destructive)
```

#### With Reason Input

```tsx
<ConfirmDialog
  requireReason
  reasonLabel="Reason for deletion"
  reasonPlaceholder="Enter reason..."
/>
```

---

### 5.10 Modal Component

#### Basic Structure

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  {/* Backdrop */}
  <div 
    className="absolute inset-0 bg-black/30"
    onClick={onClose}
  />
  
  {/* Modal Content */}
  <div className="relative bg-white rounded-2xl border border-[#E1E4EA] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b border-[#E1E4EA]">
      <h2 className="text-[18px] font-semibold">Modal Title</h2>
      <button onClick={onClose}>
        <i className="pi pi-times" />
      </button>
    </div>
    
    {/* Content */}
    <div className="p-6">
      {/* Your content */}
    </div>
    
    {/* Footer */}
    <div className="flex justify-end gap-3 p-6 border-t border-[#E1E4EA]">
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary" onClick={onSave}>
        Save
      </Button>
    </div>
  </div>
</div>
```

#### Specifications

- Max Width: `600px` (small), `800px` (medium), `1200px` (large)
- Max Height: `90vh`
- Border Radius: `20px`
- Z-Index: `50`
- Backdrop: `rgba(0, 0, 0, 0.3)`
- Overflow: Auto (scrollable content)

---


### 5.11 DashboardStats Component

#### Usage

```tsx
<DashboardStats
  stats={[
    {
      label: "Total Revenue",
      value: "₦2,450,000",
      icon: "pi pi-money-bill",
      color: "blue",
      growth: "+12.5%",
    },
    {
      label: "Total Orders",
      value: "1,234",
      icon: "pi pi-shopping-cart",
      color: "green",
      growth: "+8.2%",
    },
    {
      label: "Active Users",
      value: "856",
      icon: "pi pi-users",
      color: "cyan",
      growth: "+5.1%",
    },
    {
      label: "Pending Refunds",
      value: "23",
      icon: "pi pi-undo",
      color: "purple",
      growth: "-2.3%",
    },
  ]}
/>
```

#### Specifications

**Grid Layout**:
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 4 columns
- Gap: `16px`

**Card Styling**:
- Background: White
- Border: `1px solid #E1E4EA`
- Border Radius: `20px`
- Padding: `24px`
- Hover: Border color changes to semantic color

**Icon Circle**:
- Size: `40px` (desktop), `36px` (mobile)
- Border Radius: `9999px`
- Background: Semantic color (10% opacity)
- Icon Color: Semantic color

**Typography**:
- Label: `11px`, `500` weight, uppercase, `#525866`
- Value: `24px` (desktop), `20px` (mobile), `700` weight
- Growth: `11px`, `500` weight, color-coded

**Colors**:
```tsx
blue   → #2563EB / #DBEAFE
green  → #059669 / #ECFDF3
cyan   → #0891B2 / #CFFAFE
purple → #7C3AED / #EDE9FE
orange → #D97706 / #FEF3C7
red    → #DC2626 / #FEF2F2
```

---

### 5.12 Breadcrumb Component

#### Usage

```tsx
<Breadcrumb
  items={[
    { label: "Dashboard", url: "/dashboard" },
    { label: "Orders", url: "/order" },
    { label: "Order Details" },
  ]}
/>
```

#### Specifications

- Font Size: `13px`
- Separator: `/` or `›`
- Active Item: `#111827`, `600` weight
- Inactive Item: `#525866`, clickable
- Hover: `#2563EB`

---

### 5.13 ErrorBoundary Component

#### Usage

```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

#### Error UI

```tsx
<div className="flex flex-col items-center justify-center min-h-[400px] p-6">
  <div className="w-16 h-16 rounded-full bg-[#FEF2F2] flex items-center justify-center mb-4">
    <i className="pi pi-exclamation-triangle text-[#DC2626] text-2xl" />
  </div>
  <h2 className="text-[18px] font-semibold text-[#111827] mb-2">
    Something went wrong
  </h2>
  <p className="text-[13px] text-[#525866] text-center mb-6">
    We're sorry, but something unexpected happened. Please try again.
  </p>
  <Button onClick={reset}>
    Try Again
  </Button>
</div>
```

---


## 6. Layout Patterns

### 6.1 Main Layout Structure

```tsx
<div className="flex h-screen overflow-hidden">
  {/* Sidebar - Desktop */}
  <aside className="hidden lg:flex w-[260px] flex-col border-r border-[#E1E4EA]">
    <AppSidebar />
  </aside>
  
  {/* Main Content */}
  <div className="flex-1 flex flex-col overflow-hidden">
    {/* Header */}
    <header className="h-[64px] border-b border-[#E1E4EA]">
      <AppHeader />
    </header>
    
    {/* Page Content */}
    <main className="flex-1 overflow-y-auto bg-[#F9FAFB] p-5">
      {children}
    </main>
  </div>
  
  {/* Mobile Navigation */}
  <MobileNav />
</div>
```

### 6.2 Sidebar Layout

#### Desktop Sidebar

```tsx
<div className="flex flex-col h-full">
  {/* Logo */}
  <div className="h-[64px] flex items-center px-5 border-b border-[#E1E4EA]">
    <img src="/logo.svg" alt="Logo" className="h-8" />
    <span className="ml-3 text-[16px] font-semibold">Admin</span>
  </div>
  
  {/* Navigation */}
  <nav className="flex-1 overflow-y-auto py-5">
    <AppMenu />
  </nav>
  
  {/* User Profile */}
  <div className="p-5 border-t border-[#E1E4EA]">
    <div className="flex items-center gap-3">
      <img src={user.avatar} className="w-10 h-10 rounded-full" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold truncate">{user.name}</p>
        <p className="text-[11px] text-[#525866] truncate">{user.email}</p>
      </div>
    </div>
  </div>
</div>
```

#### Specifications

- Width: `260px`
- Background: White
- Border Right: `1px solid #E1E4EA`
- Logo Height: `64px`
- Menu Item Height: `40px`
- Menu Item Padding: `12px 20px`
- Active Item: `#EFF6FF` background, `#2563EB` text
- Hover Item: `#F9FAFB` background

### 6.3 Header Layout

```tsx
<div className="h-[64px] flex items-center justify-between px-5">
  {/* Left: Mobile Menu + Breadcrumb */}
  <div className="flex items-center gap-4">
    <button className="lg:hidden" onClick={toggleMobileMenu}>
      <i className="pi pi-bars text-xl" />
    </button>
    <Breadcrumb items={breadcrumbItems} />
  </div>
  
  {/* Right: Actions + User */}
  <div className="flex items-center gap-3">
    <button className="w-10 h-10 rounded-full hover:bg-[#F9FAFB]">
      <i className="pi pi-bell" />
    </button>
    <button className="w-10 h-10 rounded-full hover:bg-[#F9FAFB]">
      <i className="pi pi-cog" />
    </button>
    <div className="w-px h-6 bg-[#E1E4EA]" />
    <button onClick={handleLogout}>
      <i className="pi pi-sign-out text-[#DC2626]" />
    </button>
  </div>
</div>
```

### 6.4 Page Layout Pattern

```tsx
<div className="flex flex-col gap-6">
  {/* Page Header */}
  <div className="flex flex-wrap items-center justify-between gap-3">
    <h1 className="text-[24px] font-bold text-[#111827]">
      Page Title
    </h1>
    <div className="flex items-center gap-3">
      <Button variant="secondary">
        Export
      </Button>
      <Button variant="primary" icon="pi pi-plus">
        Add New
      </Button>
    </div>
  </div>
  
  {/* Summary Cards (optional) */}
  <DashboardStats stats={summaryStats} />
  
  {/* Filters */}
  <div className="flex flex-wrap items-center gap-3">
    <div className="flex-1 min-w-[250px]">
      <SearchBar />
    </div>
    <Select options={statusOptions} />
    <Select options={typeOptions} />
    <Button variant="secondary" icon="pi pi-filter">
      More Filters
    </Button>
  </div>
  
  {/* Data Table */}
  <DataTable
    data={data}
    columns={columns}
    loading={loading}
    pagination={pagination}
    onPaginationChange={setPagination}
  />
</div>
```

### 6.5 Card Layout Pattern

```tsx
<div className="bg-white rounded-2xl border border-[#E1E4EA] p-6">
  {/* Card Header */}
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-[16px] font-semibold text-[#111827]">
      Card Title
    </h2>
    <Button size="sm" variant="ghost">
      View All
    </Button>
  </div>
  
  {/* Card Content */}
  <div className="space-y-4">
    {/* Your content */}
  </div>
</div>
```

### 6.6 Form Layout Pattern

```tsx
<form onSubmit={handleSubmit} className="space-y-6">
  {/* Form Section */}
  <div className="bg-white rounded-2xl border border-[#E1E4EA] p-6">
    <h3 className="text-[15px] font-semibold text-[#111827] mb-4">
      Basic Information
    </h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input label="First Name" required />
      <Input label="Last Name" required />
      <Input label="Email" type="email" required />
      <Input label="Phone" type="tel" />
    </div>
  </div>
  
  {/* Another Section */}
  <div className="bg-white rounded-2xl border border-[#E1E4EA] p-6">
    <h3 className="text-[15px] font-semibold text-[#111827] mb-4">
      Additional Details
    </h3>
    
    <div className="space-y-4">
      <Textarea label="Bio" rows={4} />
      <Select label="Role" options={roleOptions} />
      <Checkbox label="Send welcome email" />
    </div>
  </div>
  
  {/* Form Actions */}
  <div className="flex justify-end gap-3">
    <Button variant="secondary" type="button" onClick={onCancel}>
      Cancel
    </Button>
    <Button variant="primary" type="submit" loading={submitting}>
      Save Changes
    </Button>
  </div>
</form>
```

### 6.7 Detail View Layout

```tsx
<div className="flex flex-col gap-6">
  {/* Header with Actions */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <button onClick={goBack}>
        <i className="pi pi-arrow-left" />
      </button>
      <div>
        <h1 className="text-[24px] font-bold">User Details</h1>
        <p className="text-[13px] text-[#525866]">ID: {user.id}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <Button variant="secondary">Edit</Button>
      <Button variant="danger">Delete</Button>
    </div>
  </div>
  
  {/* Info Cards Grid */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Main Info */}
    <div className="lg:col-span-2 space-y-6">
      <Card title="Personal Information">
        {/* Details */}
      </Card>
      <Card title="Activity History">
        {/* Timeline */}
      </Card>
    </div>
    
    {/* Sidebar */}
    <div className="space-y-6">
      <Card title="Status">
        {/* Status info */}
      </Card>
      <Card title="Quick Actions">
        {/* Action buttons */}
      </Card>
    </div>
  </div>
</div>
```

---

## 7. Page Templates

### 7.1 Dashboard Page

**Purpose**: Overview of key metrics and recent activity

**Layout**:
```tsx
<div className="flex flex-col gap-6">
  {/* Welcome Header */}
  <div>
    <h1 className="text-[24px] font-bold">Welcome back, Admin</h1>
    <p className="text-[13px] text-[#525866]">
      Here's what's happening with your platform today
    </p>
  </div>
  
  {/* Stats Grid */}
  <DashboardStats stats={stats} />
  
  {/* Charts Row */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card title="Revenue Trend">
      <SalesChart data={revenueData} />
    </Card>
    <Card title="Order Status">
      <PieChart data={orderStatusData} />
    </Card>
  </div>
  
  {/* Recent Activity */}
  <Card title="Recent Activity">
    <ActivityFeed items={recentActivity} />
  </Card>
</div>
```

### 7.2 List Page (CRUD)

**Purpose**: Display, search, filter, and manage records

**Layout**:
```tsx
<div className="flex flex-col gap-6">
  {/* Header */}
  <div className="flex items-center justify-between">
    <h1 className="text-[24px] font-bold">Users</h1>
    <Button variant="primary" icon="pi pi-plus" onClick={handleCreate}>
      Add User
    </Button>
  </div>
  
  {/* Filters */}
  <div className="flex flex-wrap items-center gap-3">
    <div className="flex-1 min-w-[250px]">
      <SearchBar 
        value={search}
        onChange={setSearch}
        placeholder="Search users..."
      />
    </div>
    <Select 
      value={statusFilter}
      onChange={setStatusFilter}
      options={statusOptions}
    />
    <Button variant="secondary" icon="pi pi-filter" onClick={openFilters}>
      More Filters
    </Button>
  </div>
  
  {/* Data Table */}
  <DataTable
    data={users}
    columns={columns}
    loading={loading}
    pagination={pagination}
    onPaginationChange={setPagination}
    onRowClick={handleRowClick}
    emptyMessage="No users found"
  />
</div>
```

### 7.3 Detail Page

**Purpose**: View and edit single record details

**Layout**:
```tsx
<div className="flex flex-col gap-6">
  {/* Header */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <button onClick={goBack}>
        <i className="pi pi-arrow-left" />
      </button>
      <div>
        <h1 className="text-[24px] font-bold">{user.name}</h1>
        <div className="flex items-center gap-2 mt-1">
          <StatusBadge status={user.status} />
          <span className="text-[13px] text-[#525866]">
            Joined {formatDate(user.createdAt)}
          </span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <Button variant="secondary" onClick={handleEdit}>
        Edit
      </Button>
      <Button variant="danger" onClick={handleDelete}>
        Delete
      </Button>
    </div>
  </div>
  
  {/* Content Grid */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Main Content */}
    <div className="lg:col-span-2 space-y-6">
      <Card title="Personal Information">
        <InfoGrid data={personalInfo} />
      </Card>
      <Card title="Order History">
        <DataTable data={orders} columns={orderColumns} />
      </Card>
    </div>
    
    {/* Sidebar */}
    <div className="space-y-6">
      <Card title="Account Status">
        <StatusInfo user={user} />
      </Card>
      <Card title="Quick Actions">
        <ActionButtons user={user} />
      </Card>
    </div>
  </div>
</div>
```

### 7.4 Create/Edit Form Page

**Purpose**: Create new or edit existing records

**Layout**:
```tsx
<div className="flex flex-col gap-6 max-w-4xl mx-auto">
  {/* Header */}
  <div className="flex items-center gap-4">
    <button onClick={goBack}>
      <i className="pi pi-arrow-left" />
    </button>
    <h1 className="text-[24px] font-bold">
      {isEdit ? "Edit User" : "Create User"}
    </h1>
  </div>
  
  {/* Form */}
  <form onSubmit={handleSubmit} className="space-y-6">
    {/* Basic Info Section */}
    <Card title="Basic Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="First Name" name="firstName" required />
        <Input label="Last Name" name="lastName" required />
        <Input label="Email" name="email" type="email" required />
        <Input label="Phone" name="phone" type="tel" />
      </div>
    </Card>
    
    {/* Additional Info Section */}
    <Card title="Additional Information">
      <div className="space-y-4">
        <Select label="Role" name="role" options={roleOptions} />
        <Textarea label="Bio" name="bio" rows={4} />
        <Checkbox label="Send welcome email" name="sendEmail" />
      </div>
    </Card>
    
    {/* Actions */}
    <div className="flex justify-end gap-3">
      <Button variant="secondary" type="button" onClick={goBack}>
        Cancel
      </Button>
      <Button variant="primary" type="submit" loading={submitting}>
        {isEdit ? "Save Changes" : "Create User"}
      </Button>
    </div>
  </form>
</div>
```

### 7.5 Settings Page

**Purpose**: Configure application settings

**Layout**:
```tsx
<div className="flex flex-col gap-6">
  {/* Header */}
  <h1 className="text-[24px] font-bold">Settings</h1>
  
  {/* Tabs or Sections */}
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
    {/* Sidebar Navigation */}
    <div className="lg:col-span-1">
      <nav className="space-y-1">
        <button className="w-full text-left px-4 py-2 rounded-lg bg-[#EFF6FF] text-[#2563EB]">
          General
        </button>
        <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#F9FAFB]">
          Security
        </button>
        <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#F9FAFB]">
          Notifications
        </button>
      </nav>
    </div>
    
    {/* Content */}
    <div className="lg:col-span-3 space-y-6">
      <Card title="General Settings">
        <form className="space-y-4">
          <Input label="Site Name" />
          <Input label="Support Email" type="email" />
          <Textarea label="Welcome Message" rows={4} />
          <div className="flex justify-end">
            <Button variant="primary">Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  </div>
</div>
```

---

## 8. Responsive Design

### 8.1 Breakpoint Strategy

**Mobile First Approach**:
```css
/* Base styles (mobile) */
.container { padding: 16px; }

/* Small tablets (640px+) */
@media (min-width: 640px) {
  .container { padding: 20px; }
}

/* Tablets (768px+) */
@media (min-width: 768px) {
  .container { padding: 24px; }
}

/* Desktops (1024px+) */
@media (min-width: 1024px) {
  .container { padding: 32px; }
}
```

### 8.2 Layout Adaptations

#### Sidebar
```tsx
/* Mobile: Hidden, drawer on demand */
<aside className="hidden lg:flex">
  <AppSidebar />
</aside>

/* Mobile Navigation */
<MobileNav visible={mobileMenuOpen} onHide={() => setMobileMenuOpen(false)} />
```

#### Grid Layouts
```tsx
/* Stats: 1 → 2 → 4 columns */
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {stats.map(stat => <StatCard key={stat.id} {...stat} />)}
</div>

/* Content: 1 → 2 → 3 columns */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

#### Table to Cards
```tsx
{/* Desktop: Table */}
<div className="hidden md:block">
  <table>...</table>
</div>

{/* Mobile: Cards */}
<div className="md:hidden space-y-3">
  {data.map(row => (
    <div key={row.id} className="rounded-[12px] border p-4">
      {/* Card content */}
    </div>
  ))}
</div>
```

### 8.3 Typography Scaling

```tsx
/* Page Titles */
<h1 className="text-[18px] md:text-[24px] font-bold">
  Page Title
</h1>

/* Stat Values */
<p className="text-[20px] md:text-[24px] font-bold">
  {value}
</p>

/* Body Text */
<p className="text-[13px]">
  Body text stays consistent
</p>
```

### 8.4 Touch Targets

**Minimum Size**: 44px × 44px

```tsx
/* Buttons */
<button className="min-h-[44px] px-4">
  Touch Friendly
</button>

/* Icon Buttons */
<button className="w-[44px] h-[44px] rounded-full">
  <i className="pi pi-heart" />
</button>

/* Table Rows */
<tr className="h-[56px]">
  {/* Cells */}
</tr>
```

### 8.5 Mobile Navigation

```tsx
<div className={`fixed inset-y-0 left-0 w-[280px] bg-white transform transition-transform ${
  visible ? 'translate-x-0' : '-translate-x-full'
} lg:hidden z-50`}>
  {/* Mobile menu content */}
</div>

{/* Backdrop */}
{visible && (
  <div 
    className="fixed inset-0 bg-black/30 lg:hidden z-40"
    onClick={onHide}
  />
)}
```

### 8.6 Responsive Padding

```tsx
/* Page Container */
<main className="p-3 md:p-5">
  {children}
</main>

/* Card Padding */
<div className="p-4 md:p-6">
  {content}
</div>

/* Modal Padding */
<div className="p-4 md:p-6">
  {content}
</div>
```

### 8.7 Responsive Images

```tsx
/* Avatar Sizes */
<img className="w-8 h-8 md:w-10 md:h-10 rounded-full" />

/* Icon Sizes */
<i className="text-lg md:text-xl" />

/* Logo */
<img className="h-6 md:h-8" />
```

---


## 9. Authentication & Security

### 9.1 Authentication Flow

```
User Login
    ↓
POST /api/auth/login
    ↓
Receive JWT Access Token + Refresh Token
    ↓
Store in localStorage/sessionStorage
    ↓
Include in Authorization Header
    ↓
Token Expires (401)
    ↓
Auto Refresh with Refresh Token
    ↓
Continue Request
```

### 9.2 Auth Service Implementation

```typescript
// services/AuthService.ts
export default class AuthService {
  private static ACCESS_TOKEN_KEY = 'admin_access_token';
  private static REFRESH_TOKEN_KEY = 'admin_refresh_token';
  
  // Login
  async login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) throw new Error('Login failed');
    
    const { accessToken, refreshToken, user } = await response.json();
    
    this.setTokens(accessToken, refreshToken);
    return user;
  }
  
  // Store tokens
  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }
  
  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }
  
  // Get refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
  
  // Refresh access token
  async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');
    
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    
    if (!response.ok) {
      this.logout();
      throw new Error('Token refresh failed');
    }
    
    const { accessToken } = await response.json();
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    return accessToken;
  }
  
  // Logout
  logout() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    window.location.href = '/login';
  }
  
  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
  
  // Get auth headers
  getAuthHeaders(): HeadersInit {
    const token = this.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }
}
```

### 9.3 Protected Route Component

```typescript
// components/auth/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/services/AuthService';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const authService = new AuthService();
  
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
    }
  }, []);
  
  if (!authService.isAuthenticated()) {
    return <LoadingStates type="full-page" />;
  }
  
  return <>{children}</>;
}
```

### 9.4 API Client with Auto-Refresh

```typescript
// lib/api/client.ts
import AuthService from '@/services/AuthService';

const authService = new AuthService();

export async function apiClient(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Add auth headers
  const headers = {
    ...authService.getAuthHeaders(),
    ...options.headers,
  };
  
  // Make request
  let response = await fetch(url, { ...options, headers });
  
  // Handle 401 - Token expired
  if (response.status === 401) {
    try {
      // Refresh token
      await authService.refreshAccessToken();
      
      // Retry request with new token
      const newHeaders = {
        ...authService.getAuthHeaders(),
        ...options.headers,
      };
      response = await fetch(url, { ...options, headers: newHeaders });
    } catch (error) {
      // Refresh failed, logout
      authService.logout();
      throw error;
    }
  }
  
  return response;
}
```

### 9.5 Middleware Protection

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_access_token');
  const { pathname } = request.nextUrl;
  
  // Public routes
  const publicRoutes = ['/login', '/forgot-password'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 9.6 Security Best Practices

**1. Token Storage**
- ✅ Use httpOnly cookies for refresh tokens (most secure)
- ✅ Use localStorage for access tokens (acceptable)
- ❌ Never store tokens in sessionStorage for long-term auth
- ❌ Never expose tokens in URL parameters

**2. HTTPS Only**
- ✅ Always use HTTPS in production
- ✅ Set secure flag on cookies
- ✅ Enable HSTS headers

**3. CSRF Protection**
- ✅ Use CSRF tokens for state-changing operations
- ✅ Validate origin headers
- ✅ Use SameSite cookie attribute

**4. XSS Prevention**
- ✅ Sanitize user input
- ✅ Use Content Security Policy headers
- ✅ Escape output in templates
- ✅ Validate and sanitize API responses

**5. Rate Limiting**
- ✅ Implement rate limiting on login endpoint
- ✅ Add exponential backoff for failed attempts
- ✅ Use CAPTCHA after multiple failures

---

## 10. API Integration

### 10.1 API Service Pattern

```typescript
// lib/api/admin/users.ts
import { apiClient } from '../client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default class UserService {
  // Get all users
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const response = await apiClient(
      `${API_URL}/admin/users?${queryParams.toString()}`
    );
    
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  }
  
  // Get user by ID
  async getUserById(id: string): Promise<User> {
    const response = await apiClient(`${API_URL}/admin/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    const data = await response.json();
    return data.data;
  }
  
  // Create user
  async createUser(userData: Partial<User>): Promise<User> {
    const response = await apiClient(`${API_URL}/admin/users`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) throw new Error('Failed to create user');
    const data = await response.json();
    return data.data;
  }
  
  // Update user
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await apiClient(`${API_URL}/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) throw new Error('Failed to update user');
    const data = await response.json();
    return data.data;
  }
  
  // Delete user
  async deleteUser(id: string): Promise<void> {
    const response = await apiClient(`${API_URL}/admin/users/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error('Failed to delete user');
  }
}
```

### 10.2 React Query Integration

```typescript
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UserService from '@/lib/api/admin/users';

const userService = new UserService();

// Get all users
export function useUsers(params?: any) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getAllUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get user by ID
export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  });
}

// Create user
export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: any) => userService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Update user
export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      userService.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });
}

// Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

### 10.3 Usage in Components

```typescript
// app/(authenticated)/user/page.tsx
'use client';

import { useState } from 'react';
import { useUsers, useDeleteUser } from '@/hooks/useUsers';
import DataTable from '@/components/shared/DataTable';
import SearchBar from '@/components/shared/SearchBar';
import { useDebounce } from '@/hooks/useDebounce';

export default function UserListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });
  
  const debouncedSearch = useDebounce(search, 500);
  
  // Fetch users
  const { data, isLoading } = useUsers({
    ...pagination,
    search: debouncedSearch,
    status: statusFilter,
  });
  
  // Delete mutation
  const deleteUser = useDeleteUser();
  
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await deleteUser.mutateAsync(id);
    }
  };
  
  const columns = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    {
      field: 'status',
      header: 'Status',
      body: (row) => <StatusBadge status={row.status} />,
    },
    {
      field: 'actions',
      header: 'Actions',
      body: (row) => (
        <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>
          Delete
        </Button>
      ),
    },
  ];
  
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[24px] font-bold">Users</h1>
      
      <div className="flex gap-3">
        <SearchBar value={search} onChange={setSearch} />
        <Select value={statusFilter} onChange={setStatusFilter} />
      </div>
      
      <DataTable
        data={data?.data || []}
        columns={columns}
        loading={isLoading}
        pagination={{
          ...pagination,
          total: data?.meta.total || 0,
        }}
        onPaginationChange={setPagination}
      />
    </div>
  );
}
```

### 10.4 Error Handling

```typescript
// hooks/useUsers.ts
export function useUsers(params?: any) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getAllUsers(params),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users. Please try again.');
    },
  });
}
```

---

## 11. Best Practices

### 11.1 Component Best Practices

**1. Keep Components Small**
```typescript
// ❌ Bad: One large component
function UserPage() {
  // 500 lines of code...
}

// ✅ Good: Split into smaller components
function UserPage() {
  return (
    <>
      <UserHeader />
      <UserFilters />
      <UserTable />
    </>
  );
}
```

**2. Use Composition**
```typescript
// ✅ Good: Composable components
<Card>
  <CardHeader title="Users" action={<Button>Add</Button>} />
  <CardContent>
    <UserTable />
  </CardContent>
</Card>
```

**3. Extract Reusable Logic**
```typescript
// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}
```

### 11.2 Performance Best Practices

**1. Memoize Expensive Calculations**
```typescript
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.name.localeCompare(b.name));
}, [data]);
```

**2. Use React Query Caching**
```typescript
useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
});
```

**3. Lazy Load Heavy Components**
```typescript
const HeavyChart = lazy(() => import('@/components/HeavyChart'));

<Suspense fallback={<LoadingStates type="card" />}>
  <HeavyChart data={data} />
</Suspense>
```

**4. Optimize Images**
```typescript
import Image from 'next/image';

<Image
  src="/avatar.jpg"
  alt="User"
  width={40}
  height={40}
  className="rounded-full"
/>
```

### 11.3 Accessibility Best Practices

**1. Semantic HTML**
```tsx
// ✅ Good
<button onClick={handleClick}>Click me</button>

// ❌ Bad
<div onClick={handleClick}>Click me</div>
```

**2. ARIA Labels**
```tsx
<button aria-label="Close dialog" onClick={onClose}>
  <i className="pi pi-times" />
</button>
```

**3. Keyboard Navigation**
```tsx
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>
```

**4. Focus Management**
```tsx
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  inputRef.current?.focus();
}, []);

<input ref={inputRef} />
```

### 11.4 TypeScript Best Practices

**1. Define Proper Types**
```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

// ❌ Bad
const user: any = { ... };
```

**2. Use Generics**
```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    total: number;
  };
}

const users: PaginatedResponse<User> = await fetchUsers();
```

**3. Avoid Type Assertions**
```typescript
// ❌ Bad
const user = data as User;

// ✅ Good
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data
  );
}

if (isUser(data)) {
  // TypeScript knows data is User
}
```

### 11.5 Code Organization

**1. Feature-Based Structure**
```
features/
├── users/
│   ├── components/
│   ├── hooks/
│   ├── types/
│   └── utils/
├── orders/
│   ├── components/
│   ├── hooks/
│   ├── types/
│   └── utils/
```

**2. Consistent Naming**
```
- Components: PascalCase (UserTable.tsx)
- Hooks: camelCase with 'use' prefix (useUsers.ts)
- Utils: camelCase (formatDate.ts)
- Types: PascalCase (User.ts)
- Constants: UPPER_SNAKE_CASE (API_URL)
```

**3. File Organization**
```
ComponentName/
├── index.tsx          # Main component
├── ComponentName.tsx  # Implementation
├── types.ts           # Component types
├── utils.ts           # Component utilities
└── styles.module.css  # Component styles (if needed)
```

---

## 12. Implementation Checklist

### 12.1 Setup Phase

- [ ] Initialize Next.js project with TypeScript
- [ ] Install dependencies (Tailwind, React Query, etc.)
- [ ] Configure Tailwind with design tokens
- [ ] Set up folder structure
- [ ] Configure environment variables
- [ ] Set up ESLint and Prettier

### 12.2 Core Components

- [ ] Button component with all variants
- [ ] Input components (text, textarea, select, checkbox, radio)
- [ ] DataTable with pagination
- [ ] StatusBadge with all status types
- [ ] SearchBar with debounce
- [ ] EmptyState component
- [ ] LoadingStates component
- [ ] Toast notification system
- [ ] ConfirmDialog component
- [ ] Modal component
- [ ] ErrorBoundary component

### 12.3 Layout Components

- [ ] AppSidebar with navigation
- [ ] AppHeader with breadcrumb
- [ ] AppMenu with active states
- [ ] MobileNav drawer
- [ ] AppFooter
- [ ] Main layout wrapper

### 12.4 Authentication

- [ ] AuthService implementation
- [ ] Login page
- [ ] Forgot password page
- [ ] ProtectedRoute component
- [ ] Middleware for route protection
- [ ] Token refresh logic
- [ ] Logout functionality

### 12.5 API Integration

- [ ] API client with auto-refresh
- [ ] Service classes for each resource
- [ ] React Query setup
- [ ] Custom hooks for data fetching
- [ ] Error handling
- [ ] Loading states

### 12.6 Pages

- [ ] Dashboard page
- [ ] User list page
- [ ] User detail page
- [ ] User create/edit page
- [ ] Order list page
- [ ] Order detail page
- [ ] Transaction list page
- [ ] Settings page
- [ ] Profile page

### 12.7 Features

- [ ] Search functionality
- [ ] Filtering system
- [ ] Sorting functionality
- [ ] Pagination
- [ ] Bulk actions
- [ ] Export functionality
- [ ] Real-time updates (optional)

### 12.8 Testing

- [ ] Unit tests for utilities
- [ ] Component tests
- [ ] Integration tests
- [ ] E2E tests (optional)
- [ ] Accessibility tests

### 12.9 Performance

- [ ] Code splitting
- [ ] Image optimization
- [ ] Lazy loading
- [ ] Caching strategy
- [ ] Bundle size optimization

### 12.10 Deployment

- [ ] Build configuration
- [ ] Environment setup
- [ ] CI/CD pipeline
- [ ] Error monitoring
- [ ] Analytics setup

---

## Conclusion

This design system provides a complete foundation for building modern, accessible, and performant admin dashboards. Follow these guidelines to ensure consistency, maintainability, and excellent user experience.

### Key Takeaways

1. **Consistency is Key**: Use design tokens and follow patterns
2. **Mobile First**: Always design for mobile, enhance for desktop
3. **Accessibility Matters**: Follow WCAG guidelines
4. **Performance Counts**: Optimize images, code split, cache data
5. **Type Safety**: Use TypeScript properly
6. **Test Everything**: Write tests for critical functionality
7. **Document Well**: Keep documentation up to date

### Resources

- **Tailwind CSS**: https://tailwindcss.com
- **Next.js**: https://nextjs.org
- **React Query**: https://tanstack.com/query
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

### Support

For questions or issues with this design system, please refer to the implementation examples in the Sonic Admin Dashboard codebase.

---

**Document Version**: 1.0  
**Last Updated**: 2026  
**Maintained By**: Development Team

