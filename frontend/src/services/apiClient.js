/**
 * Sonex Enterprises - Client API Service
 * 100% Decoupled REST API Client for Cloud Functions & Backend Server
 */

const CLOUD_API_URL = 'https://us-central1-sonex-enterprices.cloudfunctions.net/clientApi';
const LOCAL_API_URL = 'http://localhost:5001';

const isLocalHost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE_URL = import.meta.env.VITE_API_URL || (isLocalHost ? LOCAL_API_URL : CLOUD_API_URL);

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.isFallbackMode = false;
  }

  async request(endpoint, options = {}) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const contentType = response.headers.get('content-type');
      let data = null;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorMsg = data?.message || response.statusText || 'API Request Failed';
        throw new Error(errorMsg);
      }

      return data;
    } catch (error) {
      // If primary base URL fails and wasn't using CLOUD_API_URL, try cloud fallback
      if (this.baseUrl !== CLOUD_API_URL && !this.isFallbackMode) {
        try {
          const fallbackUrl = `${CLOUD_API_URL}${cleanEndpoint}`;
          const fallbackRes = await fetch(fallbackUrl, { ...options, headers });
          if (fallbackRes.ok) {
            const fbData = await fallbackRes.json();
            return fbData;
          }
        } catch {
          // Ignore secondary failure
        }
      }
      throw error;
    }
  }

  // Health Check
  async checkHealth() {
    return this.request('/health');
  }

  // Products
  async getProducts(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.category && params.category !== 'All Dresses') {
      searchParams.append('category', params.category);
    }
    if (params.search) {
      searchParams.append('search', params.search);
    }
    const queryStr = searchParams.toString();
    const endpoint = `/api/products${queryStr ? `?${queryStr}` : ''}`;
    return this.request(endpoint);
  }

  async getProductById(id) {
    return this.request(`/api/products/${id}`);
  }

  async getProduct360Preview(id, color, size) {
    const searchParams = new URLSearchParams();
    if (color) searchParams.append('color', color);
    if (size) searchParams.append('size', size);
    return this.request(`/api/products/${id}/360-preview?${searchParams.toString()}`);
  }

  // Orders & Checkout
  async createOrder(orderData) {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async submitUTR(orderId, utrNumber, payerApp = 'UPI') {
    return this.request(`/api/orders/${orderId}/utr`, {
      method: 'POST',
      body: JSON.stringify({ utrNumber, payerApp })
    });
  }

  async getUserOrders(userId) {
    return this.request(`/api/orders/user/${userId}`);
  }

  async getOrderById(orderId) {
    return this.request(`/api/orders/${orderId}`);
  }

  // User Profile & Wishlist
  async getUserProfile(uid) {
    return this.request(`/api/users/${uid}/profile`);
  }

  async updateUserProfile(uid, profileData) {
    return this.request(`/api/users/${uid}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async getUserWishlist(uid) {
    return this.request(`/api/users/${uid}/wishlist`);
  }

  async syncUserWishlist(uid, items) {
    return this.request(`/api/users/${uid}/wishlist`, {
      method: 'POST',
      body: JSON.stringify({ items })
    });
  }

  // Store Settings & Checkout Pricing
  async getSettings() {
    return this.request('/api/settings');
  }

  async getCheckoutPricing() {
    return this.request('/api/settings/pricing');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
