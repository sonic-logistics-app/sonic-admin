# Admin Dashboard UI Replication Guide

**Complete Design System & Implementation Instructions for Building a Modern Admin Interface**

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Color & Brand System](#color--brand-system)
3. [Typography System](#typography-system)
4. [Spacing & Layout Grid](#spacing--layout-grid)
5. [Layout Architecture](#layout-architecture)
6. [Component Patterns Library](#component-patterns-library)
7. [Page Layout Patterns](#page-layout-patterns)
8. [Sidebar Navigation](#sidebar-navigation)
9. [Profile & User Menu](#profile--user-menu)
10. [Interactive Elements](#interactive-elements)
11. [Responsive Design Guidelines](#responsive-design-guidelines)
12. [Implementation Checklist & Quick Start](#implementation-checklist--quick-start)
13. [Reference Examples](#reference-examples)

---

## Executive Summary

### What This Guide Covers

This comprehensive guide documents the complete UI design system of a modern, professional admin dashboard built with **Next.js + Tailwind CSS**. The design system encompasses:

- **Color palette** with semantic meanings and usage guidelines
- **Typography system** from labels to headers with size scales
- **Spacing grid** with padding, gap, and margin conventions
- **Layout architecture** for responsive desktop, tablet, and mobile experiences
- **10 reusable component patterns** that repeat across all admin pages
- **Responsive behavior** and mobile-first design principles
- **Interactive elements** with proper states and accessibility

### Who Should Use This Guide

- UI/UX developers building a new admin dashboard
- Developers implementing design systems in Next.js + Tailwind
- Teams replicating this design for different applications or brands
- Stakeholders reviewing design consistency and compliance

### How to Use This Guide

1. **Quick Start**: Jump to [Implementation Checklist](#implementation-checklist--quick-start) if you already have Next.js + Tailwind setup
2. **Design Specs First**: Read through color, typography, and spacing sections to understand the design tokens
3. **Component Reference**: Study the component patterns library to understand reusable UI structures
4. **Layout Patterns**: Learn how pages are structured and composed
5. **Responsive Design**: Understand how layouts adapt across screen sizes
6. **Verification**: Cross-reference with actual component implementations

### Key Design Principles

✅ **Mobile-first approach** — Design for mobile, enhance for desktop  
✅ **Consistent spacing** — 4px base unit, predictable gaps and padding  
✅ **Color coding** — Green = active/success, Orange = warning, Red = error  
✅ **Semantic typography** — Font sizes and weights tied to hierarchy  
✅ **Accessibility** — 44px minimum touch targets, sufficient color contrast  
✅ **Responsive transitions** — Content adapts smoothly across breakpoints  
✅ **Reusable patterns** — Same components and patterns across all pages

---

## Color & Brand System

### Primary Color Palette

The color system uses a neutral gray foundation with blue accents and semantic color coding.

#### Brand Colors

| Color                  | Hex Code  | RGB                | Use Case                                   | Tailwind Class           |
| ---------------------- | --------- | ------------------ | ------------------------------------------ | ------------------------ |
| **Brand Orange**       | `#FF563D` | rgb(255, 86, 61)   | Logo, brand accent (optional)              | `bg-brand-primary`       |
| **Brand Orange Light** | `#FF9586` | rgb(255, 149, 134) | Brand hover states (optional)              | `bg-brand-primary-light` |
| **Primary Blue**       | `#2563EB` | rgb(37, 99, 235)   | Interactive elements, active states, links | `bg-blue-600`            |
| **Secondary Blue**     | `#3B82F6` | rgb(59, 130, 246)  | Light blue for backgrounds, hover states   | `bg-blue-500`            |

#### Gray Scale (Foundation Colors)

| Color        | Hex Code  | RGB                | Primary Use                         | Tailwind Class  |
| ------------ | --------- | ------------------ | ----------------------------------- | --------------- |
| **Gray 50**  | `#FBFBFB` | rgb(251, 251, 251) | Page background, light hover states | `bg-gray-50`    |
| **Gray 100** | `#F2F4F7` | rgb(242, 244, 247) | Secondary backgrounds               | `bg-gray-100`   |
| **Gray 200** | `#F7F7F7` | rgb(247, 247, 247) | Secondary backgrounds               | `bg-gray-200`   |
| **Gray 300** | `#D0D5DD` | rgb(208, 213, 221) | Disabled text, subtle divider       | `text-gray-300` |
| **Gray 400** | `#98A2B3` | rgb(152, 162, 179) | Optional text                       | `text-gray-400` |
| **Gray 500** | `#667085` | rgb(102, 112, 133) | Secondary text color, labels        | `text-gray-500` |
| **Gray 600** | `#373F51` | rgb(55, 63, 81)    | Medium text emphasis                | `text-gray-600` |
| **Gray 700** | `#344054` | rgb(52, 64, 84)    | Medium text emphasis                | `text-gray-700` |
| **Gray 800** | `#222834` | rgb(34, 40, 52)    | Dark text                           | `text-gray-800` |
| **Gray 900** | `#14171F` | rgb(20, 23, 31)    | Primary text color                  | `text-gray-900` |

#### Specific Custom Grays (Used Throughout App)

| Color                | Hex Code  | Use Case                              |
| -------------------- | --------- | ------------------------------------- |
| **Border Gray**      | `#E1E4EA` | All borders, dividers                 |
| **Text Secondary**   | `#525866` | Secondary text, descriptions, labels  |
| **Text Tertiary**    | `#606060` | Low-emphasis text                     |
| **Hover Background** | `#F5F5F5` | Hover states for buttons, dropdowns   |
| **White**            | `#FFFFFF` | Card backgrounds, primary backgrounds |

#### Semantic Status Colors

Use these colors to represent status and states across the app:

| Status              | Hex Code  | Use Case                      | Background        | Text Color  |
| ------------------- | --------- | ----------------------------- | ----------------- | ----------- |
| **Active/Success**  | `#059669` | Active users, completed tasks | `#ECFDF3`         | `#059669`   |
| **Pending/Warning** | `#D97706` | Pending status, warnings      | `#FEF3C7`         | `#D97706`   |
| **Error/Banned**    | `#DC2626` | Errors, banned status         | `#FEF2F2`         | `#DC2626`   |
| **Suspended**       | `#F97316` | Suspended status              | Lighter orange bg | Orange text |
| **Draft**           | `#6B7280` | Draft status                  | Light gray bg     | Gray text   |

### Color Usage Guidelines

#### Text Hierarchy

```
Primary Text:        #111827 (Gray 900) ← Main content, titles
Secondary Text:      #525866 (Custom gray) ← Descriptions, subtitles
Tertiary Text:       #606060 (Custom gray) ← Hints, disabled text
Label Text:          #525866 + uppercase → Section labels, form labels
Placeholder Text:    Black with 30% opacity → Input placeholders
```

#### Backgrounds

```
Page Background:     #FBFBFB (Gray 50) ← Main content area
Card Background:     #FFFFFF (White) ← All cards, modals
Hover Background:    #F5F5F5 (Light gray) ← Button/row hover
Disabled Background: #FAFAFA (Gray 50) ← Disabled inputs
```

#### Borders

```
Standard Border:     #E1E4EA ← All card borders, dividers, input borders
Active Border:       #2563EB ← Focused input, active element
Error Border:        #DC2626 ← Error input
```

#### Icon Backgrounds (Stat Cards)

Each stat card icon has a distinct light background:

| Icon Type               | Background Hex | Background Color | Icon Color Hex | Icon Color    |
| ----------------------- | -------------- | ---------------- | -------------- | ------------- |
| Users                   | `#DBEAFE`      | Light blue       | `#2563EB`      | Primary blue  |
| Trending/Active         | `#D1FAE5`      | Light green      | `#059669`      | Success green |
| Briefcase/Opportunities | `#EDE9FE`      | Light purple     | `#7C3AED`      | Purple        |
| Documents/Files         | `#FEF3C7`      | Light yellow     | `#D97706`      | Orange        |
| Target/Talents          | `#E0E7FF`      | Light indigo     | `#4F46E5`      | Indigo        |
| Briefcase/Recruiters    | `#FCE7F3`      | Light pink       | `#DB2777`      | Pink          |
| Education/Mentors       | `#CCFBF1`      | Light teal       | `#0D9488`      | Teal          |
| Calendar/Sessions       | `#CFFAFE`      | Light cyan       | `#0891B2`      | Cyan          |

### Customizing Colors for Your Brand

To adapt this design system to your brand:

1. **Replace brand colors**: Update `brand.primary` and `brand.primary-light` hex values
2. **Change primary blue**: Update `#2563EB` (primary blue) throughout for your brand accent color
3. **Adjust grays**: Keep gray scale consistent, but can adjust `#525866` for secondary text
4. **Preserve status colors**: Green/orange/red should remain for semantic meanings (unless culturally inappropriate)
5. **Icon background palette**: Adjust the color combinations for icon backgrounds to match your brand palette

**Tailwind Config Example:**

```typescript
colors: {
  brand: {
    primary: "#YOUR_BRAND_COLOR_HEX",
    "primary-light": "#YOUR_BRAND_COLOR_LIGHT_HEX",
  },
  gray: {
    50: "#FBFBFB",
    100: "#F2F4F7",
    // ... rest of gray scale
  },
  // Keep blue for interactive elements
  blue: {
    500: "#3B82F6",
    600: "#2563EB",
  }
}
```

---

## Typography System

### Font Family & Setup

```css
/* Tailwind Configuration */
font-family: ["Geist", "-apple-system", "Roboto", "Helvetica", "sans-serif"]

/* Fallback if Geist unavailable */
Alternatives: "Inter", "Segoe UI", "Helvetica Neue", "system-ui"
```

The font stack prioritizes:

1. **Geist** - Modern, clean, geometric sans-serif (preferred)
2. **-apple-system** - macOS/iOS native font (fallback for Apple devices)
3. **Roboto** - Android native font (fallback for Android)
4. **Helvetica** - Widely available fallback
5. **sans-serif** - Generic fallback

### Font Size Scale

| Size Name | Pixel Value | Use Case                          | Tailwind Class | Weight  |
| --------- | ----------- | --------------------------------- | -------------- | ------- |
| **XS**    | 11px        | Labels, badges, secondary info    | `text-[11px]`  | 400-500 |
| **SM**    | 13px        | Body text, descriptions           | `text-[13px]`  | 400     |
| **BASE**  | 15px        | Section titles, form labels       | `text-[15px]`  | 500     |
| **LG**    | 16px        | Page titles, card titles          | `text-[16px]`  | 500-600 |
| **XL**    | 18px        | Section headers, welcome messages | `text-[18px]`  | 600-700 |
| **2XL**   | 20px        | Stat values (mobile)              | `text-[20px]`  | 700     |
| **3XL**   | 24px        | Stat values (desktop)             | `text-[24px]`  | 700     |
| **4XL**   | 32px        | Page hero headers                 | `text-[32px]`  | 700     |

### Font Weight Scale

| Weight Value | Name      | Use Case                                                  |
| ------------ | --------- | --------------------------------------------------------- |
| **400**      | Normal    | Body text, descriptions                                   |
| **500**      | Medium    | Section labels, secondary titles, form labels (uppercase) |
| **600**      | Semi-bold | Page titles, card titles                                  |
| **700**      | Bold      | Stat values, important text, headers                      |

### Typography Patterns

#### Page Title

```
Font Size:    16px (lg:18px on desktop)
Font Weight:  600 (semi-bold) or 700 (bold)
Color:        #111827 (gray-900)
Line Height:  24px (normal)
Letter Space: normal
```

**Tailwind classes**: `text-[16px] md:text-[18px] font-semibold md:font-bold text-gray-900`

#### Section Label / Form Label

```
Font Size:    11px
Font Weight:  500 (medium)
Color:        #525866 (custom gray)
Transform:    UPPERCASE
Letter Space: wider (tracking-wider)
Margin Bot:   4-8px spacing below
```

**Tailwind classes**: `text-[11px] font-medium text-[#525866] uppercase tracking-wider`

#### Body/Description Text

```
Font Size:    13px
Font Weight:  400 (normal)
Color:        #525866 (secondary text) or #111827 (primary)
Line Height:  18px-20px
```

**Tailwind classes**: `text-[13px] text-[#525866]`

#### Stat Card Value

```
Font Size:    20px (mobile), 24px (desktop)
Font Weight:  700 (bold)
Color:        #111827 (gray-900)
```

**Tailwind classes**: `text-[20px] md:text-[24px] font-bold text-gray-900`

#### Welcome/Greeting Text

```
Font Size:    18px
Font Weight:  700 (bold)
Color:        #111827 (gray-900)
Margin Top:   0
```

**Tailwind classes**: `text-[18px] font-bold text-gray-900`

#### Button Text

```
Font Size:    13-15px depending on button size
Font Weight:  500-600 (medium-semibold)
Color:        White or theme color
```

**Tailwind classes**: `text-[13px] font-semibold` or `text-[15px] font-medium`

### Line Height & Spacing

| Element   | Line Height | Letter Spacing |
| --------- | ----------- | -------------- |
| Headers   | 24px-32px   | normal         |
| Body Text | 20px-24px   | normal         |
| Labels    | 16px        | wider          |
| All Caps  | 16px        | wider          |

---

## Spacing & Layout Grid

### Base Unit System

The spacing system is built on a **4-pixel base unit**:

```
1 unit = 4px
2 units = 8px
3 units = 12px
4 units = 16px
5 units = 20px
6 units = 24px
7 units = 28px
8 units = 32px
```

### Padding Scale

Padding values are applied with `px-` (horizontal) and `py-` (vertical) Tailwind utilities:

| Tailwind Class | Pixels | Used For                               |
| -------------- | ------ | -------------------------------------- |
| `px-2`         | 8px    | Tight spacing (buttons)                |
| `px-3`         | 12px   | Mobile page padding, compact sections  |
| `px-4`         | 16px   | Standard padding, card content         |
| `px-5`         | 20px   | Desktop page padding                   |
| `px-6`         | 24px   | Desktop card padding, generous spacing |
| `py-2`         | 8px    | Vertical button padding                |
| `py-3`         | 12px   | Vertical compact spacing               |
| `py-4`         | 16px   | Standard vertical spacing              |
| `py-5`         | 20px   | Desktop vertical spacing               |
| `py-6`         | 24px   | Desktop generous vertical spacing      |

### Common Padding Combinations

```
Page Container:      px-3 py-4 (mobile) / px-5 py-5 (desktop)
Card Content:        p-4 (mobile) / p-6 (desktop)
Modal Content:       px-6 py-5
Button Padding:      px-4 py-2 (for text) / px-5 py-2 (for larger buttons)
Table Cell Padding:  px-4 py-3 or px-6 py-4
Input Padding:       px-3 py-2 (height 38px)
Header Padding:      px-5 py-4
```

### Gap Scale (Component Spacing)

Gap is used to space child elements within flex/grid containers:

| Tailwind Class | Pixels | Used For                                        |
| -------------- | ------ | ----------------------------------------------- |
| `gap-2`        | 8px    | Very close element spacing                      |
| `gap-3`        | 12px   | Stat cards in grid, tight lists                 |
| `gap-4`        | 16px   | Standard component spacing, standard layout gap |
| `gap-5`        | 20px   | Section separation                              |
| `gap-6`        | 24px   | Major section gaps, wide layouts                |

### Common Layout Gaps

```
Stat Grid:           gap-3 (tight grid of cards)
Page Sections:       gap-4 or gap-6 (vertical stacking)
Flex Row Elements:   gap-3 or gap-4 (buttons, icons, text)
Multi-Column Layout: gap-6 (between columns)
Form Fields:         gap-3 or gap-4 (between inputs)
Table Columns:       gap-4 (between column headers)
```

### Border Radius Scale

| Tailwind Class   | Pixels | Used For                                 |
| ---------------- | ------ | ---------------------------------------- |
| `rounded-lg`     | 8px    | Input fields, small components           |
| `rounded-xl`     | 12px   | Some containers                          |
| `rounded-2xl`    | 16px   | Card containers, modals, main components |
| `rounded-3xl`    | 24px   | Large components                         |
| `rounded-[50px]` | 50px   | Pill-shaped buttons, badges              |
| `rounded-full`   | 9999px | Avatar circles                           |

### Specific Border Radius Usage

```
Cards/Containers:    rounded-2xl (16px)
Input Fields:        rounded-lg (8px)
Buttons:             rounded-[50px] (pill-shaped)
Status Badges:       rounded-[50px] (pill-shaped)
Icon Backgrounds:    rounded-full (circular)
Modal Windows:       rounded-2xl (16px)
Table Rows (mobile):  rounded-[12px]
```

### Border Widths

```
Standard Border:     border (1px)
Heavy Border:        border-2 (2px) - not commonly used
Active Border:       border-l-2 (left border accent) - used in sidebar
Focus Border:        border-2 - for focus states
```

### Height & Sizing Conventions

| Component       | Height | Tailwind Class | Notes                     |
| --------------- | ------ | -------------- | ------------------------- |
| Button (SM)     | 32px   | h-8            | For compact buttons       |
| Button (MD)     | 38px   | h-[38px]       | Standard button height    |
| Button (LG)     | 44px   | h-[44px]       | Touch target size, mobile |
| Input Field     | 38px   | h-[38px]       | Standard input height     |
| Toggle Switch   | 20px   | h-5            | Standard toggle size      |
| Icon (Small)    | 16px   | w-4 h-4        | Inline icons              |
| Icon (Medium)   | 20px   | w-5 h-5        | Button icons, list icons  |
| Icon (Large)    | 24px   | w-6 h-6        | Card icons, emphasis      |
| Avatar (Small)  | 32px   | w-8 h-8        | List headers, compact     |
| Avatar (Medium) | 40px   | w-10 h-10      | Sidebar profile           |
| Avatar (Large)  | 48px   | w-12 h-12      | Profile page, emphasis    |

### Minimum Touch Targets

For accessibility and mobile usability:

```
Buttons:             Minimum 44px height × 44px width
Links:               Minimum 44px height × 44px width
Checkboxes:          Minimum 20px × 20px, ideally 24px × 24px
Radio Buttons:       Minimum 20px × 20px, ideally 24px × 24px
Form Inputs:         Minimum 38-44px height
Pagination Buttons:  44px minimum
Tab Targets:         44px minimum height
```

---

## Layout Architecture

### Overall Page Structure

The admin dashboard uses a flexible, responsive layout with a fixed sidebar on desktop that collapses to a mobile drawer on smaller screens.

#### Layout Diagram

```
┌─────────────────────────────────────────────────────────┐
│  DESKTOP (lg: 1024px and above)                         │
├─────────────────────────────────────────────────────────┤
│┌────────────┬────────────────────────────────────────┐  │
││            │                                        │  │
││  SIDEBAR   │        MAIN CONTENT AREA               │  │
││  Width:    │  - Flex-1 (takes remaining space)     │  │
││  256px     │  - overflow-y-auto (scrollable)       │  │
││  Fixed     │  - bg-gray-50 (light background)      │  │
││  Height:   │  - Padding varies by content          │  │
││  100vh     │  - All page content renders here      │  │
││  (screen)  │                                        │  │
││            │                                        │  │
││            │  ┌─ Header Card (optional)            │  │
││            │  ├─ Stats Grid (if applicable)        │  │
││            │  ├─ Search/Filter Bar                 │  │
││            │  ├─ Data Table or Content             │  │
││            │  └─ Pagination (if applicable)        │  │
││            │                                        │  │
│└────────────┴────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  MOBILE (< 768px)                                       │
├─────────────────────────────────────────────────────────┤
│┌─────────────────────────────────────────────────────┐  │
││ [☰] App Title                      [Profile Icon]  │  │
├─────────────────────────────────────────────────────┤  │
││                                                     │  │
││  MAIN CONTENT AREA                                  │  │
││  - Full width (except when drawer is open)        │  │
││  - Starts from top-left corner                    │  │
││  - All page content renders here                  │  │
││  - Overlay backdrop if drawer is open             │  │
││                                                     │  │
││ ┌─ Header Card (optional)                          │  │
││ ├─ Stats Grid (responsive cols)                    │  │
││ ├─ Search/Filter Bar                               │  │
││ ├─ Card-based list (replaces table)                │  │
││ └─ Pagination                                       │  │
││                                                     │  │
│└─────────────────────────────────────────────────────┘  │
│
│ ┌───────────────────────────────────────────────────┐
│ │ MOBILE DRAWER (Hidden, slides from left)         │
│ ├───────────────────────────────────────────────────┤
│ │ Logo + Menu Items                                 │
│ │ - Overlay backdrop behind it                     │
│ │ - Click backdrop to close                        │
│ │ - Full height, ~280px wide                       │
│ └───────────────────────────────────────────────────┘
```

### Sidebar (Desktop Only)

**Visibility**: `hidden lg:block` (visible only on lg breakpoint and above)

**Dimensions**:

- Width: `w-64` (256px fixed)
- Height: `h-screen` (100vh, full viewport height)
- Flex Behavior: `flex-shrink-0` (doesn't shrink)

**Structure**:

```
┌────────────────────────────┐
│ Logo Section               │  ← 50-60px height
│ [Logo] App Name           │
├────────────────────────────┤
│ Main Navigation Items       │  ← Flex-1, scrollable
│ • Dashboard                │
│ • Talents                  │
│ • Recruiters               │
│ • Mentors                  │
│ • Opportunities            │
│ • Analytics                │
│ • Broadcasts               │
│ • Verifications            │
│ • Audit Logs               │
├────────────────────────────┤
│ Secondary Items            │  ← Bottom section
│ • Support                  │
│ • Settings                 │
├────────────────────────────┤
│ Profile Section            │  ← 60-70px height
│ [Avatar] Name ▼            │
└────────────────────────────┘
```

**Styling**:

- Background: `bg-white`
- Border: `border-r border-[#E1E4EA]` (right divider)
- Overflow: `overflow-hidden` (content constrained)

### Main Content Area

**Desktop Layout**:

- Container: `flex-1 flex flex-col overflow-hidden`
- Content wrapper: Flex-1 expands vertically
- Scrolling: `overflow-y-auto` (vertical scroll only)
- Background: `bg-gray-50`
- Padding: `px-5 py-5` (20px on desktop)

**Mobile Layout**:

- Full width: `w-full`
- Padding: `px-3 py-4` (12px horizontal, 16px vertical)
- Background: Same `bg-gray-50`

### Mobile Navigation Drawer

**Visibility**: Appears on mobile (< lg breakpoint), hidden on desktop

**Trigger**: Hamburger menu button in header (top-left)

**Structure**:

- Drawer width: ~250-280px
- Overlay backdrop: `bg-black/30` (semi-transparent)
- Animation: Slides from left (transform: translateX)
- Z-index: High enough to overlap content
- Closes on: Backdrop click or menu item click

**Drawer Content**:

- Logo/branding at top
- Full navigation menu (same items as sidebar)
- Profile section at bottom
- Close button (or X icon)

### Responsive Breakpoints

The design uses Tailwind's standard breakpoints:

```
Mobile:       < 768px    (no prefix, default styles)
Tablet:       768px+     md: prefix used
Desktop:      1024px+    lg: prefix used
Large Screen: 1280px+    xl: prefix used
```

**Key Responsive Changes**:

| Element      | Mobile        | Tablet        | Desktop               |
| ------------ | ------------- | ------------- | --------------------- |
| Sidebar      | Hidden drawer | Hidden drawer | Fixed sidebar (256px) |
| Main padding | px-3 py-4     | px-4 py-4     | px-5 py-5             |
| Card padding | p-4           | p-5           | p-6                   |
| Font sizes   | Smaller       | Medium        | Larger                |
| Grid columns | 1             | 2             | 3-4                   |
| Table        | Card layout   | Card layout   | Table layout          |

### Header/Top Navigation Area

**Location**: Top of main content area (when present on a page)

**Structure**:

```
┌───────────────────────────────────────────┐
│ [Hamburger]  Title              [Profile] │  ← Height: 48-56px
└───────────────────────────────────────────┘
```

**Components**:

- **Left**: Hamburger menu (mobile only) - `width: 24px, height: 24px`
- **Center**: Page title or breadcrumb
- **Right**: Profile icon/dropdown, user menu

**Styling**:

- Background: `bg-white` or transparent
- Border: `border-b border-[#E1E4EA]` (if prominent)
- Padding: `px-5 py-4` (desktop) / `px-3 py-3` (mobile)
- Position: Sticky to trigger sticky header behavior (if desired)
- Height: 48-60px depending on content

### Content Wrapper

**Standard Page Pattern**:

```
<div className="px-3 py-4 md:px-5 md:py-5 flex flex-col gap-4 h-full overflow-y-auto">
  {/* Page content stacks vertically */}
  {/* Each section uses appropriate gap spacing */}
</div>
```

**Applies to**:

- Page container
- Column in multi-column layout
- List containers
- Form sections

### Z-Index Stacking

For layering overlays and stacked elements:

```
Sidebar on mobile:      z-40
Mobile drawer overlay:  z-30
Modals/Dialogs:         z-50
Modal backdrop:         z-40
Dropdowns:              z-10-20
Tooltips:               z-10
```

---

## Component Patterns Library

This section documents the 10 core reusable component patterns that appear across all admin pages. Each pattern is used consistently throughout the design system.

### Pattern 1: Header Section Card

**Purpose**: Introductory card at the top of each page with welcome message, title, and description.

**Usage**: Appears on every admin page as the first element.

**Desktop Appearance**:

```
┌─────────────────────────────────────────────┐
│ Good morning!                               │
│ Dashboard                                   │
│ Monitor platform activity and manage users. │
└─────────────────────────────────────────────┘
```

**Mobile Appearance**: Same structure, responsive padding.

#### Container Styling

```
Width:           100% (w-full)
Border Radius:   16px (rounded-2xl)
Border:          1px solid #E1E4EA
Background:      white (bg-white)
Padding:         p-4 (mobile) / p-6 (desktop)
Flex Shrink:     flex-shrink-0 (keeps header from shrinking)
Cursor:          default (not interactive)
```

#### Structure

```tsx
<div className="w-full rounded-2xl border border-[#E1E4EA] bg-white p-4 md:p-6 flex-shrink-0">
  {/* Greeting */}
  <p className="text-[#525866] text-[11px] mb-2">
    Good morning! {/* Dynamic: morning/afternoon/evening based on time */}
  </p>

  {/* Title */}
  <h1 className="text-[#111827] text-[18px] font-bold mb-2">Dashboard</h1>

  {/* Description */}
  <p className="text-[#525866] text-[13px]">
    Monitor platform activity and manage users, opportunities, and applications.
  </p>
</div>
```

#### Typography

| Element     | Font Size | Weight | Color   | Font Family |
| ----------- | --------- | ------ | ------- | ----------- |
| Greeting    | 11px      | normal | #525866 | Geist       |
| Title       | 18px      | bold   | #111827 | Geist       |
| Description | 13px      | normal | #525866 | Geist       |

#### Customization Points

- **Greeting text**: Change based on time of day (morning/afternoon/evening)
- **Title**: Page-specific (Dashboard, Talents, Analytics, etc.)
- **Description**: Page-specific content description
- **Icon**: Optional icon at right (optional, can add)

---

### Pattern 2: Stat Card

**Purpose**: Display key metrics with value, label, trend, and icon.

**Usage**: Stat grids on Dashboard, Analytics, other summary pages.

**Desktop Appearance** (4 cards in a row):

```
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ [ICON]     │ │ [ICON]     │ │ [ICON]     │ │ [ICON]     │
│ 1,234      │ │ 856        │ │ 45         │ │ 12         │
│ TOTAL      │ │ ACTIVE     │ │ PENDING    │ │ NEW        │
│ USERS      │ │ USERS      │ │ VERIFICATION  REGISTRATIONS
│ +15 this   │ │ +4 this    │ │ +2 awaiting│ │ Today      │
│ week       │ │ week       │ │ review     │ │            │
└────────────┘ └────────────┘ └────────────┘ └────────────┘
```

**Mobile Appearance** (2 cards per row):

```
┌──────────────┐ ┌──────────────┐
│ [ICN] 1,234  │ │ [ICN] 856    │
│ TOTAL USERS  │ │ ACTIVE USERS │
│ +15 this wk  │ │ +4 this week │
└──────────────┘ └──────────────┘
```

#### Container Styling

```
Display:         flex flex-col
Justify:         justify-center
Gap:             gap-3 (12px between sections)
Padding:         p-4 (16px on all sides)
Border Radius:   rounded-2xl (16px)
Border:          1px solid #E1E4EA
Background:      white (bg-white)
Hover:           border changes to #2563EB (primary blue)
Transition:      transition-colors
Cursor:          pointer (if clickable for detail view)
```

#### Grid Layout

**Mobile**:

```
Display:    grid grid-cols-1 (full width, 1 card per row)
Gap:        gap-3
```

**Tablet**:

```
Display:    grid sm:grid-cols-2
Gap:        gap-3
```

**Desktop**:

```
Display:    grid lg:grid-cols-4
Gap:        gap-3
```

#### Structure

```tsx
<div className="flex flex-col justify-center gap-3 p-4 rounded-2xl border border-[#E1E4EA] bg-white hover:border-[#2563EB] transition-colors cursor-pointer">
  {/* Top Row: Text + Icon */}
  <div className="flex justify-between items-center">
    {/* Left: Text Section */}
    <div className="flex flex-col gap-1">
      <h3 className="text-[#525866] text-[11px] font-medium uppercase tracking-wider">
        TOTAL USERS
      </h3>
      <p className="text-[20px] md:text-[24px] font-bold text-[#111827]">
        1,234
      </p>
    </div>

    {/* Right: Icon Circle */}
    <div className="w-[36px] h-[36px] md:w-[40px] md:h-[40px] rounded-full bg-[#DBEAFE] flex items-center justify-center">
      <Users className="w-5 h-5 text-[#2563EB]" />
    </div>
  </div>

  {/* Bottom: Subtitle */}
  <p className="text-[#525866] text-[11px]">15 new this week</p>
</div>
```

#### Icon Styling

Each stat card has:

- **Icon size**: 20px (w-5 h-5) inside the circle
- **Circle size**: 36px (mobile) / 40px (desktop)
- **Circle background**: Light color (varies by card type)
- **Icon color**: Matching semantic color

**Icon Types with Colors**:

| Stat          | Icon            | Circle Background      | Icon Color       |
| ------------- | --------------- | ---------------------- | ---------------- |
| Total Users   | Users icon      | #DBEAFE (light blue)   | #2563EB (blue)   |
| Active Users  | TrendingUp icon | #D1FAE5 (light green)  | #059669 (green)  |
| Opportunities | Briefcase icon  | #EDE9FE (light purple) | #7C3AED (purple) |
| Documents     | FileText icon   | #FEF3C7 (light yellow) | #D97706 (orange) |
| Talents       | Target icon     | #E0E7FF (light indigo) | #4F46E5 (indigo) |
| Recruiters    | Briefcase alt   | #FCE7F3 (light pink)   | #DB2777 (pink)   |
| Mentors       | GraduationCap   | #CCFBF1 (light teal)   | #0D9488 (teal)   |
| Sessions      | Calendar icon   | #CFFAFE (light cyan)   | #0891B2 (cyan)   |

---

### Pattern 3: Search & Filter Bar

**Purpose**: Allow users to search and filter data with debouncing and live results.

**Usage**: Above data tables on Talents, Recruiters, Mentors, Opportunities, Broadcasts, Support, Logs pages.

**Appearance**:

```
┌────────────────────────────┬─────────────┬─────────────┐
│ 🔍 Search talents...       │ Status ▼    │ Sort by ▼   │
└────────────────────────────┴─────────────┴─────────────┘
```

#### Search Input Styling

```
Height:          h-[38px] (38px)
Padding:         px-3 py-2 (12px horizontal, 8px vertical)
Border:          1px solid #E1E4EA
Border Radius:   rounded-lg (8px)
Background:      white (bg-white)
Font Size:       13px
Font Color:      #111827 (primary text)
Placeholder:     rgba(0, 0, 0, 0.3) text opacity on gray
Focus:           border-[#2563EB] (blue focus)
Max Width:       max-w-[585px] (on desktop)
Flex:            flex-1 (takes available space on smaller screens)
```

#### Search Input HTML

```tsx
<input
  type="text"
  placeholder="Search talents by name, email, location..."
  value={searchValue}
  onChange={(e) => setSearchValue(e.target.value)}
  className="h-[38px] px-3 py-2 border border-[#E1E4EA] rounded-lg bg-white text-[13px] text-[#111827] placeholder:text-black/30 focus:outline-none focus:border-[#2563EB] flex-1 max-w-[585px]"
/>
```

#### Debounce Behavior

- **Debounce delay**: 300ms (waits 300ms after user stops typing before executing search)
- **API call trigger**: Only call API/filter when debounce timer completes
- **Clear button**: Shows when input has text, clears on click

#### Container Structure

```tsx
<div className="flex items-center gap-3 w-full">
  {/* Search Input */}
  <div className="flex-1 flex items-center">
    <svg className="w-4 h-4 text-[#525866] absolute left-3">
      {/* Search icon SVG */}
    </svg>
    <input
      type="text"
      placeholder="Search..."
      className="pl-8 pr-3 py-2 h-[38px] border border-[#E1E4EA] rounded-lg flex-1"
    />
  </div>

  {/* Filter Dropdown */}
  <select className="h-[38px] px-3 border border-[#E1E4EA] rounded-lg bg-[#F5F5F5] text-[13px]">
    <option>All Status</option>
    <option>Active</option>
    <option>Suspended</option>
  </select>

  {/* Sort Dropdown */}
  <select className="h-[38px] px-3 border border-[#E1E4EA] rounded-lg bg-[#F5F5F5] text-[13px]">
    <option>Newest</option>
    <option>Oldest</option>
    <option>A-Z</option>
  </select>
</div>
```

#### Mobile Responsiveness

On mobile:

- Search input takes full width or most of it
- Filter/Sort dropdowns stack below search bar
- Or use vertical layout (stack all three vertically)

---

### Pattern 4: Data Table

**Purpose**: Display tabular data with pagination, sorting, and mobile card fallback.

**Usage**: Talents, Recruiters, Mentors, Opportunities, Broadcasts, Support, Logs, Settings pages.

#### Desktop Table Structure

```
┌─────────────────────────────────────────────────────────┐
│ S/N │ NAME         │ STATUS    │ DATE       │ ACTIONS    │
├─────────────────────────────────────────────────────────┤
│ 1   │ John Doe     │ Active    │ Jan 15     │ View Edit  │
├─────────────────────────────────────────────────────────┤
│ 2   │ Jane Smith   │ Pending   │ Jan 16     │ View Edit  │
├─────────────────────────────────────────────────────────┤
│ 3   │ Bob Johnson  │ Banned    │ Jan 14     │ View Edit  │
└─────────────────────────────────────────────────────────┘
```

#### Table Header Styling

```
Background:      white (bg-white) or light gray
Font Size:       13px (text-[13px])
Font Weight:     600 (font-semibold)
Color:           #111827 (dark gray)
Padding:         px-6 py-3 (24px horizontal, 12px vertical)
Border Bottom:   1px solid #E1E4EA
Text Transform:  normal (titles not uppercase)
Text Align:      left (align-left)
```

#### Table Data Row Styling

```
Padding:         px-6 py-4 (24px horizontal, 16px vertical)
Border Bottom:   1px solid #E1E4EA
Font Size:       13px
Font Color:      #111827
Hover:           bg-gray-50 (light hover)
Cursor:          pointer (if clickable)
Height:          54-56px (min height)
```

#### Mobile Card Layout

On mobile (< 768px), table converts to card layout:

```
┌──────────────────────────────┐
│ NAME: John Doe               │
│ STATUS: Active               │
│ DATE: Jan 15                 │
│ [View] [Edit]                │
└──────────────────────────────┘

┌──────────────────────────────┐
│ NAME: Jane Smith             │
│ STATUS: Pending              │
│ DATE: Jan 16                 │
│ [View] [Edit]                │
└──────────────────────────────┘
```

**Mobile Card Styling**:

```
Background:      white (bg-white)
Border Radius:   rounded-[12px]
Border:          1px solid #E1E4EA
Padding:         p-4 (16px)
Margin Bottom:   mb-3
Display:         flex flex-col gap-3
Min Height:      min-h-[44px] (touch target)
```

#### Pagination Styling

Located at bottom of table:

```
┌─────────────────────────────────────────┐
│ Prev │ 1 2 3 ... 10 │ Next              │
│      │ Page 1 of 10 │ Rows: [10 ▼]      │
└─────────────────────────────────────────┘
```

**Pagination Controls**:

```
Button Size:     h-8 (32px) or h-10 (40px on mobile)
Button Padding:  px-3 or px-4
Border Radius:   rounded-lg
Border:          1px solid #E1E4EA
Gap Between:     gap-2
Text:            13px font
Focus Color:     #2563EB
Disabled:        opacity-50, cursor-not-allowed
```

#### Full Table Component Example

```tsx
<div className="overflow-x-auto">
  <table className="w-full">
    {/* Header */}
    <thead className="bg-white border-b border-[#E1E4EA]">
      <tr>
        <th className="px-6 py-3 text-[13px] font-semibold text-[#111827] text-left">
          S/N
        </th>
        <th className="px-6 py-3 text-[13px] font-semibold text-[#111827] text-left">
          Name
        </th>
        <th className="px-6 py-3 text-[13px] font-semibold text-[#111827] text-left">
          Status
        </th>
        <th className="px-6 py-3 text-[13px] font-semibold text-[#111827] text-left">
          Date
        </th>
        <th className="px-6 py-3 text-[13px] font-semibold text-[#111827] text-left">
          Actions
        </th>
      </tr>
    </thead>

    {/* Body */}
    <tbody>
      {data.map((row, index) => (
        <tr
          key={row.id}
          className="border-b border-[#E1E4EA] hover:bg-gray-50 cursor-pointer"
          onClick={() => handleRowClick(row)}
        >
          <td className="px-6 py-4 text-[13px] text-[#111827]">{index + 1}</td>
          <td className="px-6 py-4 text-[13px] text-[#111827]">{row.name}</td>
          <td className="px-6 py-4 text-[13px]">
            <StatusBadge status={row.status} />
          </td>
          <td className="px-6 py-4 text-[13px] text-[#525866]">{row.date}</td>
          <td className="px-6 py-4 text-[13px] gap-2 flex">
            <button className="text-[#2563EB] hover:underline">View</button>
            <button className="text-[#2563EB] hover:underline">Edit</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

### Pattern 5: Status Badge

**Purpose**: Color-coded indicator for status states (active, pending, banned, etc.).

**Usage**: Appears in tables, cards, detail views across all pages.

#### Badge Appearance

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ ● Active        │  │ ◐ Pending       │  │ ✗ Banned        │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

#### Status Types & Colors

| Status        | Badge Color | Background | Text Color | Icon |
| ------------- | ----------- | ---------- | ---------- | ---- |
| **Active**    | Green       | #ECFDF3    | #059669    | ●    |
| **Pending**   | Orange      | #FEF3C7    | #D97706    | ◐    |
| **Suspended** | Orange      | #FEF3C7    | #D97706    | −    |
| **Banned**    | Red         | #FEF2F2    | #DC2626    | ✗    |
| **Draft**     | Gray        | #F3F4F6    | #6B7280    | −    |
| **Sent**      | Blue        | #DBEAFE    | #2563EB    | ✓    |
| **Scheduled** | Blue        | #DBEAFE    | #2563EB    | ◐    |
| **Resolved**  | Green       | #ECFDF3    | #059669    | ✓    |
| **Closed**    | Gray        | #F3F4F6    | #6B7280    | −    |

#### Badge Styling

```
Display:         inline-flex
Align Items:     items-center
Gap:             gap-2 (between icon and text)
Padding:         px-3 py-1 (horizontal padding 12px, vertical 4px)
Border Radius:   rounded-[50px] (pill shape)
Font Size:       12px or 11px
Font Weight:     600 (semibold)
Width:           Fits content (w-fit)
Cursor:          default
```

#### Badge Component Example

```tsx
<span className="inline-flex items-center gap-2 px-3 py-1 rounded-[50px] bg-[#ECFDF3] text-[#059669] text-[12px] font-semibold">
  ● Active
</span>;

{
  /* Pending Status */
}
<span className="inline-flex items-center gap-2 px-3 py-1 rounded-[50px] bg-[#FEF3C7] text-[#D97706] text-[12px] font-semibold">
  ◐ Pending
</span>;

{
  /* Banned Status */
}
<span className="inline-flex items-center gap-2 px-3 py-1 rounded-[50px] bg-[#FEF2F2] text-[#DC2626] text-[12px] font-semibold">
  ✗ Banned
</span>;
```

---

### Pattern 6: Card Container

**Purpose**: Reusable bordered container for grouping content.

**Usage**: Section cards, content cards, form containers across all pages.

#### Card Appearance

```
┌────────────────────────────────┐
│ Card Title                     │
│ ────────────────────────────── │
│                                │
│ Card content goes here         │
│                                │
└────────────────────────────────┘
```

#### Card Styling

```
Border Radius:   rounded-2xl (16px)
Border:          1px solid #E1E4EA
Background:      white (bg-white)
Padding:         p-4 (mobile, 16px) / p-6 (desktop, 24px)
Hover State:     Optional - border-[#2563EB] or subtle shadow
Cursor:          default or pointer (if interactive)
Box Shadow:      none (clean, no shadow design)
Transition:      transition-colors
```

#### Card Structure

```tsx
<div className="rounded-2xl border border-[#E1E4EA] bg-white p-4 md:p-6">
  {/* Card Header (Optional) */}
  <div className="mb-4 pb-4 border-b border-[#E1E4EA]">
    <h2 className="text-[16px] font-semibold text-[#111827]">Card Title</h2>
    <p className="text-[13px] text-[#525866]">Optional description</p>
  </div>

  {/* Card Content */}
  <div className="flex flex-col gap-4">{/* Content here */}</div>

  {/* Card Footer (Optional) */}
  <div className="mt-4 pt-4 border-t border-[#E1E4EA]">
    {/* Footer content - buttons, etc. */}
  </div>
</div>
```

#### Card Variations

**Compact Card** (tighter spacing):

```
Padding: p-3 (mobile) / p-4 (desktop)
Gap:     gap-2 or gap-3
```

**Prominent Card** (more breathing room):

```
Padding:  p-5 (mobile) / p-8 (desktop)
Gap:      gap-6
Shadow:   Optional subtle shadow
```

**Interactive Card** (clickable):

```
Cursor:       cursor-pointer
Hover:        border-[#2563EB], subtle shadow
Transition:   transition-all duration-200
```

---

### Pattern 7: Modal/Dialog

**Purpose**: Display forms, confirmations, and detailed information in an overlay.

**Usage**: Detail views, create/edit forms, confirmations on all pages.

#### Modal Appearance

```
┌─────────────────────────────────────────┐
│ MODAL OVERLAY (dark background)         │
│ ┌─────────────────────────────────────┐ │
│ │ Modal Title                    [×]  │ │
│ ├─────────────────────────────────────┤ │
│ │                                     │ │
│ │ Modal Content                       │ │
│ │                                     │ │
│ ├─────────────────────────────────────┤ │
│ │ [Cancel]                   [Submit] │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### Overlay Styling

```
Position:       fixed (covers entire viewport)
Top/Left:       inset-0 (top-0 left-0 right-0 bottom-0)
Background:     bg-black/50 (50% opacity black)
Z-Index:        z-50
Display:        flex items-center justify-center
Cursor:         pointer (click to close)
```

#### Modal Window Styling

```
Width:          Mobile: w-[calc(100%-32px)] / Desktop: max-w-[600px]
Border Radius:  rounded-2xl (16px)
Background:     white (bg-white)
Box Shadow:     drop-shadow-lg or similar
Position:       relative (centered by overlay flex)
Max Height:     max-h-[90vh] (leaves breathing room)
Overflow:       overflow-y-auto (scrollable if needed)
Z-Index:        z-50 (on top of overlay)
```

#### Modal Header

```
Padding:        px-6 py-5 (24px horizontal, 20px vertical)
Border Bottom:  1px solid #E1E4EA
Display:        flex justify-between items-center
Gap:            gap-4

Title Font:     text-[18px] font-semibold text-[#111827]
Close Button:   h-8 w-8 rounded-lg, gray text, hover red

Structure:
┌─────────────────────────┐
│ Modal Title        [×]  │
└─────────────────────────┘
```

#### Modal Content

```
Padding:        px-6 py-5 (24px horizontal, 20px vertical)
Display:        flex flex-col gap-4
Font Size:      13px
Color:          #111827 (primary) or #525866 (secondary)
Line Height:    1.6
```

#### Modal Footer

```
Padding:        px-6 py-4 (24px horizontal, 16px vertical)
Border Top:     1px solid #E1E4EA
Display:        flex justify-end gap-3
Button Height:  h-10 (40px)
Button Padding: px-6 (24px horizontal)

Buttons:
[Cancel]        - Secondary button (gray)
[Submit/Save]   - Primary button (blue)
```

#### Full Modal Example

```tsx
<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
  {/* Modal Window */}
  <div className="w-[calc(100%-32px)] md:max-w-[600px] rounded-2xl bg-white z-50 max-h-[90vh] overflow-y-auto">
    {/* Header */}
    <div className="px-6 py-5 border-b border-[#E1E4EA] flex justify-between items-center">
      <h2 className="text-[18px] font-semibold text-[#111827]">Modal Title</h2>
      <button
        onClick={onClose}
        className="h-8 w-8 rounded-lg text-[#525866] hover:text-red-600 transition-colors"
      >
        ×
      </button>
    </div>

    {/* Content */}
    <div className="px-6 py-5 text-[13px] text-[#111827]">
      {/* Content here */}
    </div>

    {/* Footer */}
    <div className="px-6 py-4 border-t border-[#E1E4EA] flex justify-end gap-3">
      <button
        onClick={onClose}
        className="h-10 px-6 rounded-[50px] border border-[#E1E4EA] text-[13px] font-semibold"
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        className="h-10 px-6 rounded-[50px] bg-[#2563EB] text-white text-[13px] font-semibold"
      >
        Submit
      </button>
    </div>
  </div>
</div>
```

---

### Pattern 8: Filter Panel

**Purpose**: Sidebar or horizontal panel for filtering data with multiple filter types.

**Usage**: Optional on tables, used on Analytics, Talents, Recruiters pages.

#### Desktop Filter Panel (Sidebar)

```
┌──────────────────────┐
│ FILTERS              │
│ ────────────────────|
│ Status               │
│ ☑ Active             │
│ ☑ Pending            │
│ ☐ Suspended          │
│ ────────────────────|
│ Date Range           │
│ From: [Jan 1]        │
│ To:   [Jan 31]       │
│ ────────────────────|
│ [Reset]      [Apply] │
└──────────────────────┘
```

#### Mobile Filter Panel (Drawer)

Same as desktop, but in a full-width or slide-out drawer.

#### Filter Panel Styling

```
Width:          Desktop: 250-300px fixed / Mobile: full width drawer
Background:     white (bg-white)
Border:         right border on desktop (1px #E1E4EA)
Padding:        p-5 or p-6
Display:        flex flex-col gap-4
```

#### Filter Group Styling

```
Margin Bottom:  mb-6 (gap between filter groups)
Padding Bottom: pb-6 (gap before next divider)
Border Bottom:  1px solid #E1E4EA

Label:          text-[13px] font-semibold text-[#111827] mb-3
Option:         text-[13px] text-[#525866]
Checkbox:       w-4 h-4, blue when checked
```

#### Filter Panel Actions

```
Button Gap:     gap-3 (between Cancel and Apply)
Cancel Button:  w-full or flex-1, secondary style
Apply Button:   w-full or flex-1, primary (blue)
Button Height:  h-10 (40px)

Active Filters Badge:
Count:          Small red/blue badge showing number of active filters
```

---

### Pattern 9: Empty State

**Purpose**: Friendly message when no data is available.

**Usage**: When tables/lists have no data, search returns no results.

#### Empty State Appearance

```
┌─────────────────────────────────┐
│                                 │
│          📭 (Large icon)         │
│                                 │
│      No Talents Found            │
│                                 │
│  You haven't added any talents   │
│  yet. Click below to get started.│
│                                 │
│      [Add First Talent]          │
│                                 │
└─────────────────────────────────┘
```

#### Empty State Styling

```
Container:
  Display:      flex flex-col items-center justify-center
  Padding:      py-16 px-6
  Min Height:   min-h-[400px]
  Background:   bg-gray-50 or white
  Border:       Optional rounded border
  Text Align:   text-center

Icon:
  Size:         w-16 h-16 or w-20 h-20
  Color:        #D0D5DD (light gray)
  Margin:       mb-4

Title:
  Font Size:    16px
  Font Weight:  600
  Color:        #111827
  Margin:       mb-2

Description:
  Font Size:    13px
  Color:        #525866
  Line Height:  1.6
  Margin:       mb-6
  Max Width:    max-w-xs

CTA Button:
  Display:      Primary button style
  Padding:      px-6 py-2
  Height:       h-10
  Margin Top:   mt-4
```

#### Empty State Example

```tsx
<div className="flex flex-col items-center justify-center py-16 px-6 min-h-[400px] bg-gray-50 rounded-2xl text-center">
  {/* Icon */}
  <div className="w-16 h-16 mb-4 flex items-center justify-center">
    <svg className="text-[#D0D5DD]">{/* Empty box or similar icon */}</svg>
  </div>

  {/* Title */}
  <h3 className="text-[16px] font-semibold text-[#111827] mb-2">
    No Talents Found
  </h3>

  {/* Description */}
  <p className="text-[13px] text-[#525866] max-w-xs mb-6">
    You haven't added any talents yet. Click below to get started.
  </p>

  {/* CTA Button */}
  <button className="h-10 px-6 rounded-[50px] bg-[#2563EB] text-white text-[13px] font-semibold">
    Add First Talent
  </button>
</div>
```

---

### Pattern 10: Loading Skeleton

**Purpose**: Placeholder content while data is loading.

**Usage**: Page load, table load, modal content load.

#### Skeleton Appearance

```
┌──────────────────────┐
│ ▓▓▓▓▓▓               │  ← Animated shimmer
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    │
│                      │
│ ▓▓▓▓▓▓▓   ▓▓▓▓▓     │
│ ▓▓▓▓▓▓    ▓▓▓▓▓▓    │
│                      │
│ ▓▓▓▓▓▓▓▓▓▓           │
└──────────────────────┘
```

#### Skeleton Styling

```
Background:     bg-gray-200 (light gray)
Animation:      opacity pulse (fade in/out) or shimmer
Border Radius:  rounded based on element type
                - Text: rounded-md
                - Card: rounded-2xl
                - Avatar: rounded-full
Height:         Similar to actual element
Width:          70-90% of container (text looks more natural)
Margin:         Same margin as actual element
Display:        flex flex-col gap-3 for lists
```

#### Text Skeleton

```
Height:         h-4 (16px) for body text
Width:          w-full or w-3/4
Margin Bottom:  mb-2

Multiple lines (paragraph):
Line 1: w-full h-4
Line 2: w-full h-4
Line 3: w-2/3 h-4 ← Shorter last line
```

#### Card Skeleton

```
Container:      rounded-2xl bg-gray-100 p-6
Header:         flex gap-3
  Avatar:       w-10 h-10 rounded-full bg-gray-200
  Text:         flex flex-col gap-2
    Title:      w-32 h-4 bg-gray-200
    Subtitle:   w-24 h-4 bg-gray-200
Content:        flex flex-col gap-3 mt-4
  Line 1:       w-full h-3 bg-gray-200
  Line 2:       w-full h-3 bg-gray-200
  Line 3:       w-2/3 h-3 bg-gray-200
```

#### Table Skeleton

Repeat the following for each row (typically 5-8 rows):

```
Row:            h-16 flex items-center gap-6 px-6
Col 1:          w-12 h-4 bg-gray-200
Col 2:          w-48 h-4 bg-gray-200
Col 3:          w-20 h-4 bg-gray-200
Col 4:          w-24 h-4 bg-gray-200
Col 5:          w-16 h-4 bg-gray-200
Border:         border-b border-[#E1E4EA]
```

#### Skeleton Animation

```css
@keyframes shimmer {
  0% {
    background-color: #e5e7eb;
  }
  50% {
    background-color: #f3f4f6;
  }
  100% {
    background-color: #e5e7eb;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Apply to skeleton elements */
.skeleton {
  animation: shimmer 2s infinite;
  /* or */
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

## Page Layout Patterns

### Standard Page Structure

Every admin page follows this predictable pattern for consistency:

```
┌─────────────────────────────────────────┐
│ Header Section Card                     │  ← Optional: Welcome/intro
├─────────────────────────────────────────┤
│ Stats Grid (if applicable)              │  ← Optional: Key metrics
├─────────────────────────────────────────┤
│ Search + Filter Bar + Tabs              │  ← Optional: Data filtering
├─────────────────────────────────────────┤
│ Main Content:                           │  ← Tables, charts, forms
│ • Tables (desktop) / Cards (mobile)     │
│ • Charts, graphs                        │
│ • Forms and inputs                      │
├─────────────────────────────────────────┤
│ Pagination (if applicable)              │  ← Table pagination
├─────────────────────────────────────────┤
│ Modals (hidden, show on interaction)    │  ← Detail views, forms
└─────────────────────────────────────────┘
```

### Component Stacking Order

1. **Header Card** — Welcome message + page title (sticky-friendly)
2. **Stats Grid** — Key metrics (4-8 cards)
3. **Search/Filter/Tabs** — Data filtering controls (sticky)
4. **Main Content** — Table, list, or chart (scrollable)
5. **Pagination** — Controls at bottom
6. **Modals** — Hidden overlays for detail views or forms

### Page Container Wrapper

```tsx
<div className="px-3 py-4 md:px-5 md:py-5 flex flex-col gap-4 h-full overflow-y-auto">
  {/* All page sections stack vertically with gap-4 spacing */}

  {/* 1. Header Card */}
  <div className="flex-shrink-0">{/* Header Card Pattern */}</div>

  {/* 2. Stats Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
    {/* Stat Cards */}
  </div>

  {/* 3. Search/Filter Bar */}
  <div className="flex gap-3 flex-shrink-0">{/* Search and filters */}</div>

  {/* 4. Main Content */}
  <div className="flex-1 overflow-y-auto">{/* Table, list, or chart */}</div>

  {/* 5. Pagination */}
  <div className="flex justify-center items-center gap-2 flex-shrink-0">
    {/* Pagination controls */}
  </div>
</div>
```

### Page Layout Variations

#### Variation 1: Dashboard-Style (Charts + Stats)

```
Header Card
Stats Grid
Two-Column Layout:
  - Left (2/3): Trend Chart
  - Right (1/3): Activity Feed
```

#### Variation 2: Table-Based Pages (Talents, Recruiters, etc.)

```
Header Card
Stats Row (optional small count)
Search + Filter + Tabs
Data Table (desktop) / Card List (mobile)
Pagination
Modals (Detail, Edit, Delete)
```

#### Variation 3: Multi-Tab Pages (Settings)

```
Header Card
Tab Navigation
Tab 1 Content:
  - Form or Data specific to tab
Tab 2 Content:
  - Different form or data
Tab 3 Content:
  - Different form or data
```

#### Variation 4: Analytics Pages

```
Header Card (with date range)
Period Selector (7D, 30D, 90D)
Summary Stats Grid
Multi-Column Chart Layout:
  - Left (1/2): Primary chart
  - Right (1/2): Secondary chart
Detailed Breakdown Table
```

### Multi-Column Layouts

#### Two-Column Layout (Desktop)

```
Grid Layout: grid grid-cols-1 lg:grid-cols-3 gap-6

Column 1: lg:col-span-2 (2/3 width)
  - Main content, charts, large tables

Column 2: remainder (1/3 width)
  - Sidebar content, activity feed, stats
```

#### Mobile Stacking

On mobile (< 768px):

- All columns stack vertically
- Full width (grid-cols-1)
- Same gap maintained (gap-6)

---

## Sidebar Navigation

The sidebar is a crucial navigation component that only appears on desktop (lg breakpoint and above).

### Sidebar Dimensions & Positioning

**Desktop Display**:

- Width: `w-64` (256px fixed)
- Height: `h-screen` (100vh full viewport)
- Position: Sticks to left side
- Display: `hidden lg:block` (hidden on mobile, visible on tablet/desktop)
- Flex: `flex-shrink-0` (doesn't shrink, maintains fixed width)

**Layout**:

```
SIDEBAR (256px fixed width)
├─ Logo Section         (height: 50-70px, flex-shrink-0)
├─ Main Navigation      (flex-1, overflow-y-auto, scrollable)
├─ Divider             (border-top)
├─ Other Items         (Support, Settings)
└─ Profile Section      (height: 60-80px, flex-shrink-0)
```

### Logo & Header Section

**Container**:

```
Padding:        px-5 py-3 (20px horizontal, 12px vertical)
Flex Shrink:    flex-shrink-0 (doesn't collapse)
Display:        flex items-center gap-3
Border Bottom:  1px solid #E1E4EA (divides from menu)
Height:         ~60px
```

**Structure**:

```tsx
<div className="px-5 py-3 flex-shrink-0 border-b border-[#E1E4EA]">
  <div className="flex items-center gap-3">
    {/* Logo Image */}
    <img
      src="/logo.png"
      alt="Logo"
      className="w-10 h-10 rounded-md object-cover"
    />

    {/* App Name + Title */}
    <div className="flex flex-col">
      <span className="font-semibold text-[16px] text-[#111827]">App Name</span>
      <span className="text-[11px] text-[#525866]">Admin Portal</span>
    </div>
  </div>
</div>
```

**Logo Styling**:

- **Image size**: w-10 h-10 (40px × 40px)
- **Border radius**: rounded-md (8px)
- **Alt text**: Always include descriptive alt text

**Text Styling**:

- **App name**: 16px, semibold, gray-900
- **Subtitle**: 11px, regular, gray-500

### Main Navigation Items

**Container**:

```
Flex:           flex-1 (takes all available space)
Overflow:       overflow-y-auto (scrollable if menu too long)
Display:        flex flex-col gap-1
Padding:        px-3 py-4 (12px horizontal, 16px vertical)
```

**Item Styling**:

```
Padding:        px-3 py-2 (12px horizontal, 8px vertical)
Border Radius:  rounded-lg (8px)
Display:        flex items-center gap-2
Font Size:      13px
Font Weight:    500 (medium) when active, 400 when inactive
Color:          #111827 (dark) when active, #525866 (gray) when inactive
Cursor:         pointer
Hover:          bg-gray-50 (light hover background)
Transition:     transition-colors
```

**Active State**:

```
Background:     bg-gray-50 (light background)
Border-Left:    border-l-2 border-[#2563EB] (2px left blue border)
Font Weight:    font-semibold (600)
Text Color:     text-black or text-[#111827]
```

**Inactive State**:

```
Background:     transparent
Border:         none
Font Weight:    font-normal (400)
Text Color:     text-[#525866] (secondary gray)
```

### Navigation Items Example

```tsx
{
  mainNavigationItems.map((item) => (
    <Link
      key={item.id}
      href={item.href}
      className={cn(
        "px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-[13px]",
        activeItem === item.id
          ? "bg-gray-50 border-l-2 border-[#2563EB] font-semibold text-black"
          : "text-[#525866] hover:bg-gray-50",
      )}
      onClick={() => onItemSelect(item.id)}
    >
      {/* Icon */}
      <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>

      {/* Label */}
      <span className="flex-1">{item.label}</span>

      {/* Badge (if applicable) */}
      {item.showBadge && (
        <span className="text-[11px] bg-red-500 text-white px-2 py-1 rounded-full">
          5
        </span>
      )}
    </Link>
  ));
}
```

### Badge Indicators

Some menu items show notification badges:

```
Styling:
  Background:   bg-red-500 or bg-[#DC2626]
  Color:        text-white
  Padding:      px-2 py-1 (8px h, 4px v) or px-1.5 py-0.5
  Border Radius: rounded-full (pill shape)
  Font Size:    10px or 11px
  Font Weight:  semibold (600)
  Minimum Width: min-w-6 (to show at least two digits)
```

**Badge Position** (in the menu item):

- Right-aligned within the menu item
- Use flexbox to position (justify-between or ml-auto)

### Profile Section (Sidebar Bottom)

**Container**:

```
Padding:        px-3 py-4 (12px horizontal, 16px vertical)
Flex Shrink:    flex-shrink-0 (doesn't collapse)
Border Top:     1px solid #E1E4EA (divides from menu)
Height:         ~70px
Display:        flex flex-col gap-2
```

**Structure**:

```tsx
<div className="px-3 py-4 flex-shrink-0 border-t border-[#E1E4EA]">
  <button className="w-full flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors">
    {/* Avatar */}
    <img
      src={profileImage}
      alt={profileName}
      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
    />

    {/* Profile Info */}
    <div className="flex-1 text-left overflow-hidden">
      <p className="text-[13px] font-semibold text-[#111827] truncate">
        {profileName}
      </p>
      <p className="text-[11px] text-[#525866]">Admin</p>
    </div>

    {/* Dropdown Arrow */}
    <ChevronDown className="w-4 h-4 text-[#525866] flex-shrink-0" />
  </button>
</div>
```

**Avatar**:

- Size: w-10 h-10 (40px)
- Border radius: rounded-full (circular)
- Object-fit: object-cover (fills the circle)

**Profile Text**:

- Name: 13px, semibold, dark
- Role: 11px, regular, gray

### Sidebar Icons

All icons in sidebar are **custom SVGs** or **icon library icons** with consistent styling:

```
Size:           w-5 h-5 (20px × 20px)
Color:          #525866 (gray-500) when inactive
Color:          #111827 (dark) when active
Stroke Width:   1.25px (thin, clean look)
Flex Shrink:    flex-shrink-0 (doesn't shrink)
```

**Common Icons Used**:

- Dashboard: Grid icon
- Talents: Users icon
- Recruiters: Briefcase icon
- Mentors: Graduation cap icon
- Opportunities: File text icon
- Analytics: Bar chart icon
- Broadcasts: Radio icon
- Verifications: Shield check icon
- Logs: File search icon
- Support: Headphones icon
- Settings: Gear/cog icon

---

## Profile & User Menu

The profile section allows users to view their profile information, access settings, and log out.

### Profile Switcher Component

The profile switcher appears in the sidebar (desktop) and header area (mobile).

**Location**:

- Desktop: Bottom of sidebar (fixed position)
- Mobile: Top-right of header next to hamburger menu

**Displays**:

- Avatar image (40px)
- User name (13px, semibold)
- Role/title (11px, light)
- Optional: Dropdown indicator (chevron down icon)

**Structure**:

```tsx
<button
  onClick={() => setDropdownOpen(!dropdownOpen)}
  className="w-full flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors relative"
>
  {/* Avatar */}
  <img
    src={avatarImage}
    alt={userName}
    className="w-10 h-10 rounded-full object-cover"
  />

  {/* Profile Info */}
  <div className="flex-1 text-left hidden sm:block">
    <p className="text-[13px] font-semibold text-[#111827]">{userName}</p>
    <p className="text-[11px] text-[#525866]">Admin</p>
  </div>

  {/* Dropdown Indicator */}
  <ChevronDown className="w-4 h-4 text-[#525866]" />
</button>
```

### Profile Dropdown Menu

**Trigger**: Click on profile section

**Display Method**:

- Dropdown positioned below profile (desktop sidebar)
- Or popup menu positioned strategically for mobile

**Menu Options**:

```
┌─────────────────────────┐
│ View Profile            │
├─────────────────────────┤
│ Settings                │
├─────────────────────────┤
│ Help & Support          │
├─────────────────────────┤
│ Logout                  │
└─────────────────────────┘
```

#### Dropdown Menu Styling

```
Position:       absolute (positioned relative to profile button)
Top:            Below profile section
Right:          Aligned with profile button
Background:     white
Border:         1px solid #E1E4EA
Border Radius:  rounded-lg (8px)
Shadow:         drop-shadow-md
Z-Index:        z-50 (above overlays)
Min Width:      min-w-[200px]
```

#### Menu Item Styling

```
Padding:        px-4 py-3 (16px horizontal, 12px vertical)
Font Size:      13px
Color:          #111827
Cursor:         pointer
Hover:          bg-gray-50
Transition:     transition-colors
Border Bottom:  1px solid #E1E4EA (except last item)
First Item:     border-t-2 rounded-t-lg bg-gray-50/50
Last Item:      border-b-0 rounded-b-lg
```

**Destructive Item (Logout)**:

```
Color:          #DC2626 (red)
Hover:          bg-red-50
Font Weight:    semibold (slightly emphasized)
```

#### Dropdown Menu Implementation

```tsx
{
  dropdownOpen && (
    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-[#E1E4EA] rounded-lg shadow-lg z-50">
      {/* View Profile */}
      <button
        onClick={() => {
          navigateTo("/profile");
          setDropdownOpen(false);
        }}
        className="w-full text-left px-4 py-3 text-[13px] text-[#111827] hover:bg-gray-50 border-b border-[#E1E4EA] transition-colors"
      >
        View Profile
      </button>

      {/* Settings */}
      <button
        onClick={() => {
          navigateTo("/settings");
          setDropdownOpen(false);
        }}
        className="w-full text-left px-4 py-3 text-[13px] text-[#111827] hover:bg-gray-50 border-b border-[#E1E4EA] transition-colors"
      >
        Settings
      </button>

      {/* Help & Support */}
      <button
        onClick={() => {
          navigateTo("/support");
          setDropdownOpen(false);
        }}
        className="w-full text-left px-4 py-3 text-[13px] text-[#111827] hover:bg-gray-50 border-b border-[#E1E4EA] transition-colors"
      >
        Help & Support
      </button>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full text-left px-4 py-3 text-[13px] text-[#DC2626] hover:bg-red-50 rounded-b-lg font-semibold transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
```

### Avatar Styling

**Image**:

```
Width:          w-10 h-10 (40px on desktop)
                w-8 h-8 (32px on mobile)
Border Radius:  rounded-full (circular)
Object-fit:     object-cover (fills circle, maintains aspect ratio)
Border:         Optional: 2px solid white for emphasis
```

**Fallback (If no image)**:

```
Background:     bg-[#DBEAFE] (light blue)
Content:        User initials (e.g., "JD" for John Doe)
Text:           text-[#2563EB] text-sm font-semibold
Display:        flex items-center justify-center
```

**Fallback Initials** (if no avatar image):

```tsx
<div className="w-10 h-10 rounded-full bg-[#DBEAFE] flex items-center justify-center">
  <span className="text-[#2563EB] text-sm font-semibold">
    {userName
      .split(" ")
      .map((n) => n[0])
      .join("")}
  </span>
</div>
```

---

## Interactive Elements

This section covers buttons, inputs, toggles, and other interactive components used throughout the admin dashboard.

### Buttons

#### Button Sizes

| Size       | Height  | Padding   | Font Size | Use Case                   |
| ---------- | ------- | --------- | --------- | -------------------------- |
| **Small**  | 32px    | px-4 py-1 | 12px      | Compact actions, secondary |
| **Medium** | 38-40px | px-5 py-2 | 13px      | Standard buttons           |
| **Large**  | 44px    | px-6 py-2 | 14px      | Primary action, mobile     |

#### Button Variants

**Primary Button** (Main Actions)

```
Background:     bg-[#2563EB] (blue)
Text:           text-white
Border:         none
Padding:        px-5 py-2 or px-6 py-2
Height:         h-10 (40px)
Border Radius:  rounded-[50px] (pill)
Cursor:         pointer
Hover:          bg-[#1d4ed8] (darker blue)
Active:         bg-[#1e40af] (even darker)
Disabled:       opacity-50, cursor-not-allowed
Font Weight:    semibold (600)
Transition:     transition-colors duration-200
```

**Secondary Button** (Alternative Actions)

```
Background:     bg-gray-50 or transparent
Border:         1px solid #E1E4EA
Text:           text-[#111827]
Padding:        px-5 py-2 or px-6 py-2
Height:         h-10 (40px)
Border Radius:  rounded-[50px] (pill)
Cursor:         pointer
Hover:          bg-gray-100, border-[#2563EB]
Active:         bg-gray-200
Disabled:       opacity-50, cursor-not-allowed
Font Weight:    semibold (600)
Transition:     transition-all duration-200
```

**Danger Button** (Delete/Destructive)

```
Background:     bg-[#DC2626] (red)
Text:           text-white
Border:         none
Padding:        px-5 py-2
Height:         h-10 (40px)
Border Radius:  rounded-[50px] (pill)
Cursor:         pointer
Hover:          bg-[#b91c1c] (darker red)
Active:         bg-[#991b1b] (even darker)
Font Weight:    semibold (600)
Transition:     transition-colors duration-200
```

```tsx
{
  /* Primary Button */
}
<button className="h-10 px-6 rounded-[50px] bg-[#2563EB] text-white font-semibold text-[13px] hover:bg-[#1d4ed8] active:bg-[#1e40af] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
  Submit
</button>;

{
  /* Secondary Button */
}
<button className="h-10 px-6 rounded-[50px] bg-gray-50 border border-[#E1E4EA] text-[#111827] font-semibold text-[13px] hover:bg-gray-100 hover:border-[#2563EB] transition-all">
  Cancel
</button>;

{
  /* Danger Button */
}
<button className="h-10 px-6 rounded-[50px] bg-[#DC2626] text-white font-semibold text-[13px] hover:bg-[#b91c1c] transition-colors">
  Delete
</button>;
```

### Input Fields

#### Text Input Styling

```
Height:         h-[38px] (38px)
Padding:        px-3 py-2 (12px horizontal, 8px vertical)
Border:         1px solid #E1E4EA
Border Radius:  rounded-lg (8px)
Background:     white
Font Size:      13px
Color:          #111827
Placeholder:    rgba(0, 0, 0, 0.3) opacity
Transition:     transition-colors duration-200

Focus State:
  Border:       1px solid #2563EB
  Outline:      none (remove default outline)
  Box Shadow:   none

Disabled State:
  Background:   #F5F5F5 (light gray)
  Color:        #9CA3AF (gray)
  Cursor:       not-allowed
  Opacity:      opacity-60

Error State:
  Border:       1px solid #DC2626 (red)
  Color:        #DC2626
```

```tsx
<input
  type="text"
  placeholder="Enter text..."
  className="h-[38px] px-3 py-2 border border-[#E1E4EA] rounded-lg bg-white text-[13px] text-[#111827] placeholder:text-black/30 focus:outline-none focus:border-[#2563EB] disabled:bg-[#F5F5F5] disabled:cursor-not-allowed transition-colors"
/>
```

#### Textarea Styling

```
Padding:        px-3 py-2 (12px horizontal, 8px vertical)
Border:         1px solid #E1E4EA
Border Radius:  rounded-lg (8px)
Font Size:      13px
Min Height:     min-h-[100px]
Resize:         resize-y (vertical resize only)
Font Family:    sans-serif (same as inputs)

Focus:          border-[#2563EB]
```

```tsx
<textarea
  placeholder="Enter description..."
  className="px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] min-h-[100px] resize-y focus:outline-none focus:border-[#2563EB] transition-colors"
/>
```

### Dropdowns & Selects

**Styling**:

```
Height:         h-[38px]
Padding:        px-3 py-2 (12px horizontal, 8px vertical)
Border:         1px solid #E1E4EA
Border Radius:  rounded-lg (8px)
Background:     white
Font Size:      13px
Color:          #111827
Cursor:         pointer
Focus:          border-[#2563EB], outline-none

Hover:          border-[#2563EB]
Appearance:     none (remove browser default arrow)
```

```tsx
<select className="h-[38px] px-3 py-2 border border-[#E1E4EA] rounded-lg bg-white text-[13px] text-[#111827] cursor-pointer focus:outline-none focus:border-[#2563EB] hover:border-[#2563EB] appearance-none">
  <option>Select option...</option>
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Toggle Switch

**Default State** (Off):

```
Width:          w-11 (44px)
Height:         h-6 (24px)
Background:     bg-gray-300
Border Radius:  rounded-full
Cursor:         pointer
Transition:     transition-colors duration-300

Indicator (circle):
  Size:         w-5 h-5 (20px)
  Background:   white
  Border Radius: rounded-full
  Position:     left-1 (4px from left)
```

**Active State** (On):

```
Background:     bg-[#2563EB] (blue)
Indicator:
  Position:     right-1 (4px from right)
```

```tsx
<button
  onClick={() => setToggle(!toggle)}
  className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${
    toggle ? "bg-[#2563EB]" : "bg-gray-300"
  }`}
>
  <span
    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all duration-300 ${
      toggle ? "right-0.5" : "left-0.5"
    }`}
  />
</button>
```

### Checkboxes

```
Size:           w-5 h-5 (20px)
Border:         2px solid #E1E4EA when unchecked
Border Radius:  rounded-md (4px)
Background:     #2563EB when checked
Cursor:         pointer
Transition:     transition-colors
Checkmark:      white checkmark icon when checked
```

### Radio Buttons

```
Size:           w-5 h-5 (20px)
Border:         2px solid #E1E4EA when unchecked
Border Radius:  rounded-full (circular)
Background:     #2563EB when selected
Cursor:         pointer
Inner Circle:   white dot when selected
Transition:     transition-colors
```

### Links

**Default State**:

```
Color:          #2563EB (blue)
Text Decoration: underline (optional)
Cursor:         pointer
Font Weight:    400-500

Hover State:
  Color:        #1d4ed8 (darker blue)
  Text Decoration: underline

Visited State:
  Color:        #7c3aed (purple) - optional

Focus State:
  Outline:      2px solid #2563EB
  Outline Offset: 2px
```

```tsx
<a
  href="/page"
  className="text-[#2563EB] hover:text-[#1d4ed8] hover:underline focus:outline-2 focus:outline-offset-2 focus:outline-[#2563EB]"
>
  Link Text
</a>
```

---

## Responsive Design Guidelines

### Mobile-First Approach

The design system is built with a mobile-first approach: start with mobile layouts and enhance for larger screens.

**Workflow**:

1. Design/build for mobile (base styles)
2. Add `md:` prefixed styles for tablets
3. Add `lg:` and `xl:` prefixed styles for desktops

### Screen Size Breakpoints

Tailwind Default Breakpoints (used throughout this design system):

| Breakpoint | Name     | Width Range | Devices                   |
| ---------- | -------- | ----------- | ------------------------- |
| None       | Mobile   | < 640px     | Small phones              |
| `sm`       | Small    | ≥ 640px     | Large phones              |
| `md`       | Medium   | ≥ 768px     | Tablets, landscape phones |
| `lg`       | Large    | ≥ 1024px    | Laptops, desktops         |
| `xl`       | X-Large  | ≥ 1280px    | Large desktops            |
| `2xl`      | 2X-Large | ≥ 1536px    | Ultra-wide displays       |

### Key Responsive Changes

#### Sidebar Behavior

| Breakpoint     | Sidebar Display                                |
| -------------- | ---------------------------------------------- |
| Mobile (< lg)  | `hidden` - Replaced with mobile drawer overlay |
| Tablet (md-lg) | `hidden` - Replaced with mobile drawer overlay |
| Desktop (lg+)  | `block w-64` - Fixed sidebar visible           |

#### Padding Adjustments

| Breakpoint | Page Padding           | Card Padding | Font Sizes       |
| ---------- | ---------------------- | ------------ | ---------------- |
| Mobile     | `px-3 py-4` (12H, 16V) | `p-4` (16px) | Base (11-18px)   |
| Tablet     | `px-4 py-4` (16H, 16V) | `p-5` (20px) | Base (13-20px)   |
| Desktop    | `px-5 py-5` (20H, 20V) | `p-6` (24px) | Larger (13-24px) |

#### Grid Column Changes

| Breakpoint | Stat Cards           | Multi-Column          | Chart Layout            |
| ---------- | -------------------- | --------------------- | ----------------------- |
| Mobile     | 1 column (100%)      | 1 column              | Stacked                 |
| Tablet     | 2 columns (50% each) | 2 columns             | Stacked or side-by-side |
| Desktop    | 4 columns (25% each) | 3 columns (2/3 + 1/3) | Side-by-side            |

#### Typography Adjustments

```
Mobile:        Base sizes (14px body, 16px titles)
Tablet:        Medium sizes (15px body, 18px titles)
Desktop:       Larger sizes (15px body, 20px titles, 24px values)

Example - Stat Card Value:
  Mobile:      text-[20px]
  Desktop:     md:text-[24px]
```

#### Navigation Layout

| Breakpoint | Navigation                                |
| ---------- | ----------------------------------------- |
| Mobile     | Hamburger menu → Drawer overlay from left |
| Tablet     | Hamburger menu → Drawer overlay from left |
| Desktop    | Fixed sidebar (256px width)               |

### Touch Target Sizing

For mobile accessibility, maintain minimum sizes:

```
Buttons:       Minimum 44px × 44px
Links:         Minimum 44px × 44px
Checkboxes:    Minimum 20px × 20px (ideally 24px)
Radio Buttons: Minimum 20px × 20px (ideally 24px)
Input Fields:  Minimum 38-44px height
Menu Items:    Minimum 44px height
Pagination:    Minimum 40px height
```

### Mobile Table to Card Conversion

**Desktop**: Data displayed as table

```
│ S/N │ Name     │ Email           │ Status  │
├─────┼──────────┼─────────────────┼─────────┤
│ 1   │ John Doe │ john@example... │ Active  │
```

**Mobile**: Data displayed as cards

```
┌──────────────────────┐
│ Name: John Doe       │
│ Email: john@ex...    │
│ Status: Active       │
│ [View]  [Edit]       │
└──────────────────────┘
```

**Conversion Logic**:

```tsx
{
  isMobile ? (
    // Mobile: Card layout
    <div className="flex flex-col gap-3">
      {data.map((item) => (
        <div
          key={item.id}
          className="rounded-[12px] border border-[#E1E4EA] p-4"
        >
          <p>
            <strong>Name:</strong> {item.name}
          </p>
          <p>
            <strong>Email:</strong> {item.email}
          </p>
          <p>
            <strong>Status:</strong> <StatusBadge />
          </p>
          <div className="flex gap-2 mt-3">
            <button>View</button>
            <button>Edit</button>
          </div>
        </div>
      ))}
    </div>
  ) : (
    // Desktop: Table layout
    <table className="w-full">{/* Table structure */}</table>
  );
}
```

### Common Responsive Patterns

#### Full Width Container to Constrained

```tsx
{/* Mobile: full width */}
<div className="w-full">

{/* Desktop: max-width constraint, centered */}
<div className="mx-auto max-w-7xl">
```

#### Stack to Side-by-Side

```tsx
{/* Mobile: stack vertically */}
<div className="flex flex-col gap-4">

{/* Desktop: side-by-side */}
<div className="md:flex md:gap-6">
  <div className="md:flex-1">Column 1</div>
  <div className="md:flex-1">Column 2</div>
</div>
```

#### Hide/Show Elements

```tsx
{
  /* Hidden on mobile, visible on desktop */
}
<div className="hidden md:block">Visible only on tablet and desktop</div>;

{
  /* Visible on mobile, hidden on desktop */
}
<div className="md:hidden">Visible only on mobile</div>;
```

---

## Implementation Checklist & Quick Start

### Pre-Setup Requirements

- [ ] Next.js project initialized (v13+)
- [ ] Tailwind CSS installed and configured
- [ ] TypeScript enabled (recommended)
- [ ] Package manager ready (npm, yarn, pnpm)

### Step 1: Configure Tailwind

Update your `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        geist: ["Geist", "-apple-system", "Roboto", "Helvetica", "sans-serif"],
        sans: ["Geist", "-apple-system", "Roboto", "Helvetica", "sans-serif"],
      },
      colors: {
        brand: {
          primary: "#FF563D",
          "primary-light": "#FF9586",
        },
        gray: {
          50: "#FBFBFB",
          100: "#F2F4F7",
          200: "#F7F7F7",
          300: "#D0D5DD",
          400: "#98A2B3",
          500: "#667085",
          600: "#373F51",
          700: "#344054",
          800: "#222834",
          900: "#14171F",
        },
      },
      borderRadius: {
        lg: "0.5rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
```

### Step 2: Set Up Global Styles

Create `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --border: 214 32% 91%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings:
      "rlig" 1,
      "calt" 1;
  }
}
```

### Step 3: Create Component Directory Structure

```
components/
├── layouts/
│   ├── AdminLayout.tsx
│   ├── AdminSidebar.tsx
│   ├── AdminMobileNav.tsx
│   ├── AdminHeader.tsx
│   └── AdminProfileSwitcher.tsx
│
├── shared/
│   ├── DataTable.tsx
│   ├── SearchBar.tsx
│   ├── StatusBadge.tsx
│   ├── FilterPanel.tsx
│   ├── DetailModal.tsx
│   ├── ConfirmDialog.tsx
│   ├── EmptyState.tsx
│   ├── LoadingStates.tsx
│   ├── ExportButton.tsx
│   └── SectionCard.tsx
│
├── dashboard/
│   ├── DashboardStats.tsx
│   ├── TrendCharts.tsx
│   ├── ActivityFeed.tsx
│   └── index.ts
│
├── pages/
│   ├── talents/
│   ├── recruiters/
│   ├── mentors/
│   ├── opportunities/
│   ├── analytics/
│   ├── broadcasts/
│   ├── logs/
│   ├── support/
│   ├── verifications/
│   └── settings/
│
└── ui/
    ├── button.tsx
    ├── dropdown-menu.tsx
    └── modal.tsx
```

### Step 4: Build Core Components

Start with these base components:

#### SearchBar Component

```tsx
"use client";

import { useState, useCallback, useMemo } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  const debounce = useCallback(
    (callback: (value: string) => void, delay: number) => {
      let timeoutId: NodeJS.Timeout;
      return (value: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => callback(value), delay);
      };
    },
    [],
  );

  const debouncedOnChange = useMemo(
    () => debounce(onChange, debounceMs),
    [debounce, onChange, debounceMs],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  return (
    <div className="relative flex-1">
      <input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        className="h-[38px] w-full px-3 py-2 pl-8 border border-[#E1E4EA] rounded-lg bg-white text-[13px] text-[#111827] placeholder:text-black/30 focus:outline-none focus:border-[#2563EB] transition-colors"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#525866] hover:text-[#111827]"
        >
          ✕
        </button>
      )}
    </div>
  );
}
```

#### StatusBadge Component

```tsx
interface StatusBadgeProps {
  status:
    | "active"
    | "pending"
    | "suspended"
    | "banned"
    | "draft"
    | "sent"
    | "scheduled"
    | "resolved"
    | "closed";
  variant?: "default" | "outline";
}

const statusConfig: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  active: { bg: "#ECFDF3", text: "#059669", label: "Active" },
  pending: { bg: "#FEF3C7", text: "#D97706", label: "Pending" },
  suspended: { bg: "#FEF3C7", text: "#D97706", label: "Suspended" },
  banned: { bg: "#FEF2F2", text: "#DC2626", label: "Banned" },
  draft: { bg: "#F3F4F6", text: "#6B7280", label: "Draft" },
  sent: { bg: "#DBEAFE", text: "#2563EB", label: "Sent" },
  scheduled: { bg: "#DBEAFE", text: "#2563EB", label: "Scheduled" },
  resolved: { bg: "#ECFDF3", text: "#059669", label: "Resolved" },
  closed: { bg: "#F3F4F6", text: "#6B7280", label: "Closed" },
};

export function StatusBadge({ status, variant = "default" }: StatusBadgeProps) {
  const config = statusConfig[status];

  if (variant === "outline") {
    return (
      <span
        style={{
          borderColor: config.text,
          color: config.text,
        }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-[50px] border text-[12px] font-semibold"
      >
        {config.label}
      </span>
    );
  }

  return (
    <span
      style={{
        backgroundColor: config.bg,
        color: config.text,
      }}
      className="inline-flex items-center gap-2 px-3 py-1 rounded-[50px] text-[12px] font-semibold"
    >
      {config.label}
    </span>
  );
}
```

#### StatCard Component

```tsx
import React from "react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  iconBg?: string;
  onClick?: () => void;
}

export function StatCard({
  icon,
  label,
  value,
  subtitle,
  iconBg = "#DBEAFE",
  onClick,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col justify-center gap-3 p-4 rounded-2xl border border-[#E1E4EA] bg-white hover:border-[#2563EB] transition-colors cursor-pointer"
    >
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h3 className="text-[#525866] text-[11px] font-medium uppercase tracking-wider">
            {label}
          </h3>
          <p className="text-[20px] md:text-[24px] font-bold text-[#111827]">
            {value}
          </p>
        </div>
        <div
          style={{ backgroundColor: iconBg }}
          className="w-[36px] h-[36px] md:w-[40px] md:h-[40px] rounded-full flex items-center justify-center"
        >
          {icon}
        </div>
      </div>
      {subtitle && <p className="text-[#525866] text-[11px]">{subtitle}</p>}
    </div>
  );
}
```

### Step 5: Create Admin Layout

```tsx
// app/(admin)/layout.tsx
"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/layouts/AdminSidebar";
import { AdminMobileNav } from "@/components/layouts/AdminMobileNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <AdminSidebar activeItem={activeItem} onItemSelect={setActiveItem} />
      </div>

      {/* Mobile Navigation */}
      <AdminMobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeItem={activeItem}
        onItemSelect={setActiveItem}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
```

### Step 6: Build Admin Pages

Create each admin page with the standard structure:

```tsx
// app/(admin)/dashboard/page.tsx
"use client";

import { useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";

export default function DashboardPage() {
  return (
    <div className="px-3 py-4 md:px-5 md:py-5 flex flex-col gap-4 h-full overflow-y-auto">
      {/* Header Card */}
      <div className="w-full rounded-2xl border border-[#E1E4EA] bg-white p-4 md:p-6 flex-shrink-0">
        <p className="text-[#525866] text-[11px] mb-2">Good morning!</p>
        <h1 className="text-[#111827] text-[18px] font-bold mb-2">Dashboard</h1>
        <p className="text-[#525866] text-[13px]">
          Monitor platform activity and key metrics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Users className="w-5 h-5 text-[#2563EB]" />}
          label="Total Users"
          value="1,234"
          subtitle="15 new this week"
          iconBg="#DBEAFE"
        />
        {/* More stat cards */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">{/* Charts, tables, etc. */}</div>
    </div>
  );
}
```

### Step 7: Install Required Dependencies

```bash
npm install react lucide-react recharts @radix-ui/react-dialog
```

### Step 8: Customize Colors for Your Brand

Update hex color codes throughout components:

1. Find all instances of `#FF563D` (brand orange) and replace with your brand color
2. Find all instances of `#2563EB` (primary blue) and replace with your accent color
3. Keep `#14171F` to `#FBFBFB` (gray scale) consistent
4. Keep status colors (green, orange, red) unless culturally inappropriate

### Step 9: Test Responsive Behavior

Test at these breakpoints:

- **Mobile**: 375px (iPhone SE)
- **Mobile**: 390px (iPhone 14)
- **Tablet**: 768px (iPad)
- **Desktop**: 1024px (Laptop)
- **Desktop**: 1440px (Larger monitor)

### Step 10: Accessibility Audit

- [ ] All buttons have min 44px touch targets
- [ ] Color contrast meets WCAG AA standards
- [ ] Keyboard navigation works (Tab through elements)
- [ ] Focus states are visible
- [ ] Alt text on all images
- [ ] Semantic HTML used (button, nav, main, etc.)
- [ ] Form labels associated with inputs

---

## Reference Examples

### Color Palette Visual Reference

```
BRAND COLORS
┌─────────────┬─────────────┐
│ #FF563D     │ Brand Orange│
│ Brand       │ (Optional)  │
└─────────────┴─────────────┘

PRIMARY BLUE (Interactive)
┌─────────────────────────────────────┐
│ #2563EB - Primary Blue (Buttons)    │
│ #1d4ed8 - Hover State               │
│ #1e40af - Active State              │
└─────────────────────────────────────┘

GRAY SCALE (Foundation)
┌──────────┬──────────┬──────────┐
│ #FBFBFB  │ #667085  │ #14171F │
│ (Light)  │ (Medium) │ (Dark)  │
│ BG       │ Text     │ Text    │
└──────────┴──────────┴──────────┘

SEMANTIC COLORS
┌──────────────┬──────────────┬──────────────┐
│ #059669      │ #D97706      │ #DC2626      │
│ #ECFDF3 BG   │ #FEF3C7 BG   │ #FEF2F2 BG   │
│ Success      │ Warning      │ Error        │
└──────────────┴──────────────┴──────────────┘

BORDER & DIVIDER
┌──────────────────┐
│ #E1E4EA (Light)  │
│ Used on all      │
│ borders          │
└──────────────────┘
```

### Typography Hierarchy

```
HEADING 1 (Page Title)
20px | Bold | #111827
The Quick Brown Fox Jumps Over The Lazy Dog

Heading 2 (Section Title)
18px | Semibold | #111827
The Quick Brown Fox Jumps Over The Lazy Dog

Heading 3 (Card Title)
16px | Semibold | #111827
The Quick Brown Fox Jumps Over The Lazy Dog

Body/Description Text
13px | Normal | #525866
The quick brown fox jumps over the lazy dog. This is typical body text.

Label/Secondary
11px | Medium | #525866
UPPERCASE LABEL TEXT WITH TRACKING WIDER

Small/Caption
11px | Normal | #525866
This is smaller caption text for additional info
```

### Button Quick Reference

```
PRIMARY BUTTON
bg-[#2563EB] text-white h-10 px-6 rounded-[50px]
┌─────────────────┐
│ Save Changes    │
└─────────────────┘

SECONDARY BUTTON
bg-gray-50 border border-[#E1E4EA] text-[#111827] h-10 px-6 rounded-[50px]
┌─────────────────┐
│ Cancel          │
└─────────────────┘

DANGER BUTTON
bg-[#DC2626] text-white h-10 px-6 rounded-[50px]
┌─────────────────┐
│ Delete          │
└─────────────────┘

SMALL BUTTON
h-8 px-4 rounded-[50px]
┌─────────────┐
│ Edit        │
└─────────────┘

LARGE BUTTON (Mobile Touch)
h-[44px] px-6 rounded-[50px]
┌──────────────────┐
│ Submit           │
└──────────────────┘
```

### Component Layout Spacing Guide

```
PAGE CONTAINER PADDING
Mobile:   px-3 py-4 (12px H | 16px V)
Desktop:  px-5 py-5 (20px H | 20px V)

STAT GRID GAP
gap-3 (12px between cards)

SECTION GAP
gap-4 (16px vertical between sections)
gap-6 (24px for major sections)

CARD PADDING
Mobile:   p-4 (16px all sides)
Desktop:  p-6 (24px all sides)

FLEX ROW SPACING
gap-2 (8px for tight spacing)
gap-3 (12px standard)
gap-4 (16px generous)

TABLE CELL PADDING
Header:  px-6 py-3 (24px H | 12px V)
Data:    px-6 py-4 (24px H | 16px V)
```

### Before & After Common Design Issues

**❌ ISSUE 1: Poor Contrast**

```
Light gray text (#A0A0A0) on white background
Result: Hard to read, accessibility fail

✅ SOLUTION:
Use #525866 or darker for secondary text
Use #111827 for primary text
```

**❌ ISSUE 2: Undersized Touch Targets**

```
30px high button
Result: Hard to click on mobile

✅ SOLUTION:
Minimum 44px height on mobile (h-[44px])
38px minimum on desktop (h-[38px])
```

**❌ ISSUE 3: Inconsistent Spacing**

```
Different gaps throughout (8px, 14px, 18px)
Result: Chaotic, unprofessional look

✅ SOLUTION:
Use consistent gap scale: gap-3, gap-4, gap-6
Base unit: 4px
```

**❌ ISSUE 4: Missing Hover States**

```
Buttons don't change on hover
Result: Ambiguous if clickable

✅ SOLUTION:
Primary: hover:bg-[#1d4ed8] (darker blue)
Secondary: hover:bg-gray-100
Links: hover:underline
```

**❌ ISSUE 5: No Focus Indicators**

```
No visible focus state for keyboard navigation
Result: Accessibility failure

✅ SOLUTION:
focus:outline-none focus:border-[#2563EB]
Or: focus:ring-2 focus:ring-offset-2
```

---

## Summary & Next Steps

You now have a comprehensive design system guide covering:

✅ **Complete color palette** with hex codes and semantic meanings  
✅ **Typography system** with size scales and font weights  
✅ **Spacing grid** based on 4px base unit  
✅ **10 reusable component patterns** for consistency  
✅ **Layout architecture** for responsive desktop/mobile  
✅ **Sidebar & navigation** specifications  
✅ **Interactive element** styling (buttons, inputs, etc.)  
✅ **Responsive design guidelines** with breakpoints  
✅ **Implementation checklist** for quick setup  
✅ **Quick reference examples** for common patterns

### For Implementation Teams

1. **Start with tailwind.config.ts** — Configure all colors and sizing
2. **Build shared components** — SearchBar, StatusBadge, StatCard
3. **Create layout components** — Sidebar, Header, Main content wrapper
4. **Implement pages** — Use standard page structure for all pages
5. **Test responsiveness** — Verify at mobile, tablet, desktop sizes
6. **Audit accessibility** — Check touch targets, contrast, keyboard nav
7. **Customize branding** — Replace colors/logos with your brand identity

### For Documentation

Print or publish this guide for your team and stakeholders. Update based on:

- Any component pattern changes
- New pages or features added
- Brand color adjustments
- Accessibility improvements

---

**Document Version**: 1.0  
**Last Updated**: April 16, 2026  
**Applicable To**: Next.js + Tailwind CSS Admin Dashboards  
**License**: Available for internal team use and partner implementations
