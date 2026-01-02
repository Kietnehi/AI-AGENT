import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatAPI = {
  sendMessage: async (message, feature, searchEngine = 'duckduckgo') => {
    const response = await api.post('/chat', {
      message,
      feature,
      search_engine: searchEngine,
    });
    return response.data;
  },
};

export const searchAPI = {
  search: async (query, searchEngine = 'duckduckgo', maxResults = 5) => {
    const response = await api.post('/search', {
      query,
      search_engine: searchEngine,
      max_results: maxResults,
    });
    return response.data;
  },
};

export const mathAPI = {
  compute: async (query) => {
    const response = await api.post('/math', { query });
    return response.data;
  },
};

export const dataAPI = {
  uploadCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  analyzeData: async (action, params = {}) => {
    const response = await api.post('/analyze-data', {
      action,
      ...params,
    });
    return response.data;
  },

  getCharts: async () => {
    const response = await api.get('/charts');
    return response.data;
  },

  clearData: async () => {
    const response = await api.delete('/clear-data');
    return response.data;
  },
};

export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
