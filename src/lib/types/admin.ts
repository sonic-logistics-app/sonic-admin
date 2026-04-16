/**
 * TypeScript types for admin frontend
 * Compliant with design specification
 */

import { AdminUser } from "../auth/admin-auth";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  admin: AdminUser;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

// Dashboard Types
export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeDrivers: number;
  pendingOrders: number;
  completedOrders: number;
}

export interface ActivityItem {
  id: string;
  type: "order" | "user" | "driver" | "vendor";
  action: string;
  description: string;
  timestamp: string;
  user?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

// User/Customer Types
export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  status: "active" | "inactive" | "suspended";
  created_at: string;
  updated_at: string;
  orders_count?: number;
  total_spent?: number;
}

// Driver Types
export interface Driver {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  license_number: string;
  vehicle_type: string;
  status: "active" | "inactive" | "suspended";
  rating?: number;
  total_deliveries?: number;
  created_at: string;
  updated_at: string;
}

// Vendor Types
export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: "active" | "inactive" | "suspended";
  products_count?: number;
  total_orders?: number;
  rating?: number;
  created_at: string;
  updated_at: string;
}

// Order Types
export interface Order {
  id: string;
  customer_id: string;
  vendor_id: string;
  driver_id?: string;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "picked_up"
    | "delivered"
    | "cancelled";
  total_amount: number;
  delivery_address: string;
  delivery_fee: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  customer?: Customer;
  vendor?: Vendor;
  driver?: Driver;
}

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product_name: string;
}

// Voucher Types
export interface Voucher {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  minimum_order?: number;
  maximum_discount?: number;
  usage_limit?: number;
  used_count: number;
  expires_at?: string;
  status: "active" | "inactive" | "expired";
  created_at: string;
}

// FAQ Types
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

// Support Types
export interface SupportTicket {
  id: string;
  customer_id: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
  updated_at: string;
  customer?: Customer;
  messages?: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_type: "customer" | "admin";
  message: string;
  created_at: string;
  admin?: AdminUser;
}

// Analytics Types
export interface AnalyticsOverview {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  growth: {
    revenue: number;
    orders: number;
    customers: number;
  };
}

// Settings Types
export interface PlatformSettings {
  maintenance_mode: boolean;
  maintenance_message?: string;
  features: Record<string, boolean>;
  limits: {
    max_order_value?: number;
    min_order_value?: number;
    max_daily_orders?: number;
  };
}

// Table and Filter Types
export interface TableColumn<T = any> {
  field: keyof T;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  body?: (rowData: T) => React.ReactNode;
}

export interface FilterOption {
  label: string;
  value: string | number;
}

export interface TableFilters {
  search?: string;
  status?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  [key: string]: any;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  pagination?: PaginationState;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: PaginationState;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "select"
    | "textarea"
    | "date"
    | "checkbox";
  required?: boolean;
  options?: FilterOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
  };
}

// Modal Types
export interface ModalState {
  visible: boolean;
  data?: any;
  mode?: "create" | "edit" | "view" | "delete";
}

// Export types
export type { AdminUser } from "../auth/admin-auth";
