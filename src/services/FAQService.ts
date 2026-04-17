import AuthService from './AuthService';

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/admin';
const authService = new AuthService();

export interface FAQFilterParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface FAQFormData {
  question: string;
  answer: string;
  category: string;
}

export default class FAQService {
  getAllFAQs(params?: FAQFilterParams) {
    const queryParams = new URLSearchParams();

    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `${apiUrl}/faq?${queryString}`
      : `${apiUrl}/faq`;

    return fetch(url, {
      headers: authService.getAuthHeaders(),
    })
      .then(res => res.json())
      .then((d) => {
        return d.data || [];
      });
  }

  getFAQById(faqId: string) {
    return fetch(`${apiUrl}/faq/${faqId}`, {
      headers: authService.getAuthHeaders(),
    })
      .then(res => res.json())
      .then((d) => {
        return d.data;
      });
  }

  createFAQ(faqData: FAQFormData) {
    return fetch(`${apiUrl}/faq`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(faqData),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      });
  }

  updateFAQ(faqId: string, faqData: Partial<FAQFormData>) {
    return fetch(`${apiUrl}/faq/${faqId}`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(faqData),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      });
  }

  deleteFAQ(faqId: string) {
    return fetch(`${apiUrl}/faq`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ faq_id: faqId }),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      });
  }
}
