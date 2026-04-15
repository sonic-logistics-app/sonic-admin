import AuthService from './AuthService';

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/admin';
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

export default class FAQService {
  // Get all FAQs
  getAllFAQs(params?: PaginationParams) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    
    const queryString = queryParams.toString();
    const url = queryString ? `${apiUrl}/faq?${queryString}` : `${apiUrl}/faq`;
    
    return fetch(url, {
      headers: authService.getAuthHeaders(),
    })
      .then(res => res.json())
      .then((d) => {
        // Backend returns: { message, faqs: [...] }
        return d.faqs || [];
      });
  }

  // Get FAQ by ID
  getFAQById(faqId: number | string) {
    return fetch(`${apiUrl}/faq/${faqId}`, {
      headers: authService.getAuthHeaders(),
    })
      .then(res => res.json())
      .then((d) => {
        // Backend returns: { message, faq: {...} }
        return d.faq;
      });
  }

  // Create new FAQ
  createFAQ(faqData: FAQFormData) {
    return fetch(`${apiUrl}/faq`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(faqData)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      });
  }

  // Update FAQ
  updateFAQ(faqId: number | string, faqData: Partial<FAQFormData>) {
    return fetch(`${apiUrl}/faq/${faqId}`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(faqData)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      });
  }

  // Delete FAQ
  deleteFAQ(faqId: number | string) {
    return fetch(`${apiUrl}/faq`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ faq_id: faqId.toString() })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      });
  }
}
