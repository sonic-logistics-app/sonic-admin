import AuthService from "../../../services/AuthService";

const apiUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api/admin";
const authService = new AuthService();

export interface TransactionPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  order_id?: string;
  user_id?: number;
  vendor_id?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number };
  summary?: TransactionSummary;
}

export interface TransactionSummary {
  total_successful_payments: number;
  total_payment_amount: number;
  total_discount_given: number;
  net_payment_revenue: number;
  total_vendor_transactions: number;
  total_vendor_amount: number;
}

export interface Transaction {
  id: string;
  type: "payment" | "vendor_earning";
  order_id: string;
  tx_ref?: string;
  amount: number;
  discount?: number;
  status: string;
  method?: string;
  breakdown_snapshot?: any;
  vendor_transaction_type?: string;
  description?: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  vendor?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    business_type: string;
  };
  driver?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  voucher?: {
    code: string;
    name: string;
    original_amount: number;
    discount_applied: number;
  };
  order_details: {
    order_status: string;
    payment_status: string;
    order_type: string;
    items_subtotal: number;
    delivery_fee: number;
    service_fee: number;
    total: number;
  };
  created_at: string;
  updated_at: string;
}

export interface TransactionDetails extends Transaction {
  order?: {
    order_id: string;
    order_status: string;
    payment_status: string;
    order_type: string;
    items_subtotal: number;
    delivery_fee: number;
    service_fee: number;
    total: number;
    items: Array<{
      name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
    customer?: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  };
}

export default class TransactionService {
  getAllTransactions(params?: TransactionPaginationParams): Promise<PaginatedResponse<Transaction>> {
    const queryParams = new URLSearchParams();

    queryParams.append("page", (params?.page ?? 1).toString());
    queryParams.append("limit", (params?.limit ?? 20).toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.type) queryParams.append("type", params.type);
    if (params?.order_id) queryParams.append("order_id", params.order_id);
    if (params?.user_id) queryParams.append("user_id", params.user_id.toString());
    if (params?.vendor_id) queryParams.append("vendor_id", params.vendor_id);
    if (params?.date_from) queryParams.append("date_from", params.date_from);
    if (params?.date_to) queryParams.append("date_to", params.date_to);
    if (params?.min_amount) queryParams.append("min_amount", params.min_amount.toString());
    if (params?.max_amount) queryParams.append("max_amount", params.max_amount.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    return fetch(`${apiUrl}/transactions?${queryParams.toString()}`, {
      headers: authService.getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((d) => {
        const transactions = d.data?.transactions || [];
        const meta = d.meta || { total: transactions.length, page: params?.page ?? 1, limit: params?.limit ?? 20 };
        const summary = d.data?.summary;
        return { data: transactions, meta, summary };
      });
  }

  getTransactionDetails(transactionId: string, type: "payment" | "vendor_transaction" = "payment"): Promise<TransactionDetails> {
    const queryParams = new URLSearchParams();
    queryParams.append("type", type);

    return fetch(`${apiUrl}/transactions/${transactionId}?${queryParams.toString()}`, {
      headers: authService.getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((d) => d.data);
  }
}