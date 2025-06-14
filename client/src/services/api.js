import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const resourceAPI = {
  // Get all resources with optional filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params.append(key, value);
      }
    });

    const response = await api.get(`/resources?${params.toString()}`);
    return response.data;
  },

  // Get resource by ID
  getById: async (id) => {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },

  // Create new resource
  create: async (resourceData) => {
    const response = await api.post('/resources', resourceData);
    return response.data;
  },

  // Update resource
  update: async (id, resourceData) => {
    const response = await api.put(`/resources/${id}`, resourceData);
    return response.data;
  },

  // Delete resource
  delete: async (id) => {
    const response = await api.delete(`/resources/${id}`);
    return response.data;
  },

  // Get all types
  getTypes: async () => {
    const response = await api.get('/resources/types/all');
    return response.data;
  },

  // Create new type
  createType: async (name) => {
    const response = await api.post('/resources/types', { name });
    return response.data;
  },

  // Delete type
  deleteType: async (id) => {
    const response = await api.delete(`/resources/types/${id}`);
    return response.data;
  },

  // Export resources to CSV
  exportCSV: async () => {
    const response = await api.get('/resources/export/csv', {
      responseType: 'blob',
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'resources.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  },

  // Import resources from CSV
  importCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/resources/import/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;