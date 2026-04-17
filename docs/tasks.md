 the task plan:

Create task: UI Replication — Apply design system from UI_REPLICATION_GUIDE.md
In Progress
#1
UI Replication — Apply design system from UI_REPLICATION_GUIDE.md
Master task: Apply the comprehensive design system from docs/UI_REPLICATION_GUIDE.md to the sonic-admin-next app. Covers layout, sidebar, typography, colors, components, and responsive design.
Create task: 1. Layout shell — sidebar border-r, main content padding, h-screen overflow
Open
#2
1. Layout shell — sidebar border-r, main content padding, h-screen overflow
Update (authenticated)/layout.tsx: Use `flex h-screen overflow-hidden` wrapper. Sidebar: `border-r border-[#E1E4EA]` instead of shadow-lg, remove shadow. Main content: `flex-1 flex flex-col overflow-hidden`, inner: `flex-1 overflow-y-auto bg-gray-50`, padding `px-3 py-4 md:px-5 md:py-5`. Remove AppFooter (guide doesn't mention one). Files: src/app/(authenticated)/layout.tsx
Create task: 2. Sidebar — logo section styling per guide specs
Open
#3
2. Sidebar — logo section styling per guide specs
Update AppMenu.tsx logo section: padding `px-5 py-3`, border-b `border-[#E1E4EA]`, logo image `w-10 h-10 rounded-md`, app name `text-[16px] font-semibold text-[#111827]`, add subtitle `text-[11px] text-[#525866]` "Admin Portal". Files: src/components/layout/AppMenu.tsx
Create task: 3. Sidebar nav items — text-[13px], colors, active state with border-l-2
Open
#4
3. Sidebar nav items — text-[13px], colors, active state with border-l-2
Update AppSubmenu.tsx: items `px-3 py-2 text-[13px] gap-2`. Active state: `bg-gray-50 border-l-2 border-[#2563EB] font-semibold text-[#111827]`. Inactive: `text-[#525866] hover:bg-gray-50`. Icons: `w-5 h-5` (text-[20px]). Remove border-r active indicator, use border-l-2 instead. Files: src/components/layout/AppSubmenu.tsx
Create task: 4. Sidebar profile section — avatar, name, role, chevron per guide
Open
#5
4. Sidebar profile section — avatar, name, role, chevron per guide
Update AppMenu.tsx profile card: avatar `w-10 h-10 rounded-full bg-[#DBEAFE]` with initials `text-[#2563EB] text-sm font-semibold`. Name: `text-[13px] font-semibold text-[#111827]`. Role: `text-[11px] text-[#525866]` showing "Admin". Use chevron-down icon instead of ellipsis-v. Padding `px-3 py-4`, border-t `border-[#E1E4EA]`. Files: src/components/layout/AppMenu.tsx
Create task: 5. Header card component — add greeting + title + description to each page
Open
#6
5. Header card component — add greeting + title + description to each page
Create a reusable HeaderCard component per Pattern 1: `rounded-2xl border border-[#E1E4EA] bg-white p-4 md:p-6`. Contains greeting (11px, #525866), title (18px bold #111827), description (13px #525866). Add to each page: Dashboard, Vendors, Drivers, Orders, Users, Support, FAQ, Vouchers, Profile, API Docs. Files: create src/components/shared/HeaderCard.tsx, update all page files
Create task: 6. Stat cards — restyle to guide Pattern 2 (rounded-2xl, border, icon circles)
Open
#7
6. Stat cards — restyle to guide Pattern 2 (rounded-2xl, border, icon circles)
Update DashboardStats.tsx: cards use `rounded-2xl border border-[#E1E4EA] bg-white p-4 hover:border-[#2563EB] transition-colors cursor-pointer`. Label: `text-[11px] font-medium uppercase tracking-wider text-[#525866]`. Value: `text-[20px] md:text-[24px] font-bold text-[#111827]`. Icon circles: `w-[36px] h-[36px] md:w-[40px] md:h-[40px] rounded-full` with colored backgrounds. Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3`. Files: src/components/dashboard/DashboardStats.tsx
Create task: 7. Status badges — pill shape, semantic colors per Pattern 5
Open
#8
7. Status badges — pill shape, semantic colors per Pattern 5
Update StatusBadge.tsx: Use `rounded-[50px]` pill shape, `px-3 py-1 text-[12px] font-semibold`. Colors: Active=#ECFDF3/#059669, Pending=#FEF3C7/#D97706, Banned=#FEF2F2/#DC2626, Draft=#F3F4F6/#6B7280. Add status icon indicators (●, ◐, ✗). Files: src/components/shared/StatusBadge.tsx
Create task: 8. Data tables — header/row styling, borders, hover, mobile card fallback
Open
#9
8. Data tables — header/row styling, borders, hover, mobile card fallback
Update table-based pages (vendors, drivers, orders, users). Headers: `px-6 py-3 text-[13px] font-semibold text-[#111827] border-b border-[#E1E4EA]`. Rows: `px-6 py-4 text-[13px] border-b border-[#E1E4EA] hover:bg-gray-50 cursor-pointer`. Mobile: convert to card layout `rounded-[12px] border border-[#E1E4EA] p-4`. Files: DataTable component and page files
Create task: 9. Search bar — h-[38px], border-[#E1E4EA], rounded-lg, debounce per guide
Open
#10
9. Search bar — h-[38px], border-[#E1E4EA], rounded-lg, debounce per guide
Update SearchBar.tsx: `h-[38px] px-3 py-2 border border-[#E1E4EA] rounded-lg bg-white text-[13px] text-[#111827] placeholder:text-black/30 focus:outline-none focus:border-[#2563EB]`. Add search icon left, clear button right. Debounce 300ms. Files: src/components/shared/SearchBar.tsx
Create task: 10. Buttons — pill shape rounded-[50px], h-10, primary/secondary/danger variants
Open
#11
10. Buttons — pill shape rounded-[50px], h-10, primary/secondary/danger variants
Update button styling across all pages: Primary `bg-[#2563EB] text-white h-10 px-6 rounded-[50px] font-semibold text-[13px]`. Secondary `bg-gray-50 border border-[#E1E4EA] text-[#111827] h-10 px-6 rounded-[50px]`. Danger `bg-[#DC2626] text-white`. Hover states as specified. Files: all page/component files using buttons
Create task: 11. Card containers — rounded-2xl border-[#E1E4EA] p-4 md:p-6 per Pattern 6
Open
#12
11. Card containers — rounded-2xl border-[#E1E4EA] p-4 md:p-6 per Pattern 6
Update all card wrappers across pages to use consistent styling: `rounded-2xl border border-[#E1E4EA] bg-white p-4 md:p-6`. No box-shadow (clean, flat design). Optional hover: `hover:border-[#2563EB]` for interactive cards. Files: dashboard components, page sections
Create task: 12. Typography pass — apply font sizes, weights, colors from guide scale
Open
#13
12. Typography pass — apply font sizes, weights, colors from guide scale
Audit all pages for typography: Page titles `text-[16px] md:text-[18px] font-semibold text-[#111827]`. Section labels `text-[11px] font-medium text-[#525866] uppercase tracking-wider`. Body text `text-[13px] text-[#525866]`. Stat values `text-[20px] md:text-[24px] font-bold text-[#111827]`. Files: all page and component files
Create task: 13. Empty state — icon, title, description, CTA per Pattern 9
Open
#14
13. Empty state — icon, title, description, CTA per Pattern 9
Update EmptyState.tsx: centered layout `flex flex-col items-center justify-center py-16 px-6 min-h-[400px] bg-gray-50 rounded-2xl text-center`. Icon `w-16 h-16 text-[#D0D5DD]`. Title `text-[16px] font-semibold text-[#111827]`. Description `text-[13px] text-[#525866] max-w-xs`. CTA button primary style. Files: src/components/shared/EmptyState.tsx
Create task: 14. Loading skeletons — shimmer animation, proper sizing per Pattern 10
Open
#15
14. Loading skeletons — shimmer animation, proper sizing per Pattern 10
Update LoadingStates.tsx: use `bg-gray-200 animate-pulse rounded-md` for skeleton elements. Card skeleton: `rounded-2xl bg-gray-100 p-6`. Table skeleton: `h-16 flex items-center gap-6 px-6 border-b border-[#E1E4EA]`. Add shimmer keyframes to globals.css. Files: src/components/shared/LoadingStates.tsx, src/app/globals.css
Create task: 15. Modals/Dialogs — rounded-2xl, header/content/footer styling per Pattern 7
Open
#16
15. Modals/Dialogs — rounded-2xl, header/content/footer styling per Pattern 7
Update dialog components (ConfirmDialog, FAQFormDialog, VoucherFormDialog, ChangePasswordDialog): modal `rounded-2xl bg-white max-w-[600px]`. Header `px-6 py-5 border-b border-[#E1E4EA]` with title `text-[18px] font-semibold`. Content `px-6 py-5 text-[13px]`. Footer `px-6 py-4 border-t border-[#E1E4EA] flex justify-end gap-3`. Buttons pill-shaped. Files: all dialog components
Create task: 16. Input fields — h-[38px], border-[#E1E4EA], rounded-lg, focus states
Open
#17
16. Input fields — h-[38px], border-[#E1E4EA], rounded-lg, focus states
Update form inputs across all pages: `h-[38px] px-3 py-2 border border-[#E1E4EA] rounded-lg bg-white text-[13px] text-[#111827] placeholder:text-black/30 focus:outline-none focus:border-[#2563EB]`. Textareas: `min-h-[100px] resize-y`. Select: same height + `appearance-none cursor-pointer`. Files: vendor create, profile, FAQ, voucher forms
Create task: 17. Responsive pass — mobile padding, grid cols, table→card, touch targets
Open
#18
17. Responsive pass — mobile padding, grid cols, table→card, touch targets
Audit all pages for responsive behavior: Mobile padding `px-3 py-4`, tablet `px-4 py-4`, desktop `px-5 py-5`. Stat grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`. Ensure 44px min touch targets on mobile. Tables convert to cards on mobile. Hide/show elements appropriately. Files: all page and component files