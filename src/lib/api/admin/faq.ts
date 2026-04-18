import AuthService from "../../../services/AuthService";

const apiUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api/admin";
const authService = new AuthService();

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  created_at: string;
  updated_at?: string;
}

export interface FAQFormData {
  question: string;
  answer: string;
  category: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number };
}

export default class FAQService {
  // Get all FAQs
  getAllFAQs(params?: PaginationParams): Promise<PaginatedResponse<FAQ>> {
    const queryParams = new URLSearchParams();

    queryParams.append("page", (params?.page ?? 1).toString());
    queryParams.append("limit", (params?.limit ?? 20).toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.category) queryParams.append("category", params.category);

    return fetch(`${apiUrl}/faq?${queryParams.toString()}`, {
      headers: authService.getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((d) => {
        const faqs = d.data || d.faqs || [];
        const meta = d.meta || { total: faqs.length, page: params?.page ?? 1, limit: params?.limit ?? 20 };
        return { data: faqs, meta };
      });
  }

  // Get FAQ by ID
  getFAQById(faqId: number | string) {
    return fetch(`${apiUrl}/faq/${faqId}`, {
      headers: authService.getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((d) => {
        // Backend returns: { message, faq: {...} }
        return d.faq;
      });
  }

  // Create new FAQ
  createFAQ(faqData: FAQFormData) {
    return fetch(`${apiUrl}/faq`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(faqData),
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
  }

  // Update FAQ
  updateFAQ(faqId: number | string, faqData: Partial<FAQFormData>) {
    return fetch(`${apiUrl}/faq/${faqId}`, {
      method: "PUT",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(faqData),
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
  }

  // Delete FAQ
  deleteFAQ(faqId: number | string) {
    return fetch(`${apiUrl}/faq`, {
      method: "DELETE",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ faq_id: faqId.toString() }),
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
  }
}
