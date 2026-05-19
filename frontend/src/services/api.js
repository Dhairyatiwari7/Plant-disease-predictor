import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Extract error message from Pydantic validation errors or string detail
function extractErrorMessage(detail) {
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    // Pydantic validation errors
    return detail.map(err => `${err.msg} (${err.loc.join('.')})`).join(', ');
  }
  return 'An error occurred';
}

// Handle responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail;
    const errorMessage = extractErrorMessage(detail) || error.message || 'Network error';
    
    // Create a proper Error object with the extracted message
    const err = new Error(errorMessage);
    err.response = error.response;
    err.originalError = error;
    
    // Mark 401 errors for special handling
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      err.requiresLogin = true;
    }
    
    return Promise.reject(err);
  }
);

// Auth endpoints
export const authAPI = {
  login: (username, password) =>
    apiClient.post('/auth/login', { username, password }),
  register: (userData) =>
    apiClient.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
  getCurrentUser: () =>
    apiClient.get('/auth/me'),
};

// Disease prediction endpoints
export const diseaseAPI = {
  predict: (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    return apiClient.post('/predict', formData, {
      headers: {
        // Let axios set the multipart boundary automatically
        'Content-Type': undefined,
      }
    });
  },
  getPredictions: (skip = 0, limit = 10) =>
    apiClient.get(`/predictions?skip=${skip}&limit=${limit}`),
  getPredictionById: (id) =>
    apiClient.get(`/predictions/${id}`),
  deletePrediction: (id) =>
    apiClient.delete(`/predictions/${id}`),
};

// User endpoints
export const userAPI = {
  getProfile: () =>
    apiClient.get('/users/profile'),
  updateProfile: (userData) =>
    apiClient.put('/users/profile', userData),
  changePassword: (oldPassword, newPassword) =>
    apiClient.put('/users/change-password', { oldPassword, newPassword }),
  deleteAccount: () =>
    apiClient.delete('/users/account'),
};

// Stats endpoints
export const statsAPI = {
  getDashboardStats: () =>
    apiClient.get('/stats/dashboard'),
  getRecentPredictions: (limit = 6) =>
    apiClient.get(`/stats/recent?limit=${limit}`),
};

export default apiClient;
