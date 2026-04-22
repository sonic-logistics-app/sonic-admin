import AuthService from "../../../services/AuthService";

const apiUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api/admin";
const authService = new AuthService();

export interface RefundSyncResponse {
  success: boolean;
  data: {
    checked: number;
    updated: number;
    errors: number;
    details: Array<{
      order_id: string;
      status: "updated" | "no_change" | "error";
      message: string;
      refund_amount?: number;
      error?: string;
    }>;
  };
  message: string;
}

export interface RefundSummary {
  pending_refunds: number;
  completed_refunds: number;
  total_refund_amount: number;
  pending_refund_amount?: number;
  completed_refund_amount?: number;
}

export interface RefundSummaryResponse {
  success: boolean;
  data: RefundSummary;
  message: string;
}

export interface RefundDebugResponse {
  success: boolean;
  data: {
    order_id: string;
    flutterwave_response: any;
    detection_results: {
      amount_settled: number;
      amount_charged: number;
      is_refunded: boolean;
      refund_reason: string;
    };
    current_status: string;
  };
  message: string;
}

export default class RefundService {
  /**
   * Manually sync refund statuses with Flutterwave
   * Checks all pending refunds and updates their status
   */
  async syncRefunds(): Promise<RefundSyncResponse> {
    const response = await fetch(`${apiUrl}/refund/sync`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get refund summary statistics
   * Shows pending vs completed refunds and amounts
   */
  async getRefundSummary(): Promise<RefundSummaryResponse> {
    const response = await fetch(`${apiUrl}/refund/summary`, {
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Debug refund status for a specific order
   * Shows what Flutterwave is returning and detection results
   */
  async debugRefund(orderId: string): Promise<RefundDebugResponse> {
    const response = await fetch(`${apiUrl}/refund/debug/${orderId}`, {
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}