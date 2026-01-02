import axios from 'axios';

// Base URL for the backend API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Chat API for Math and Search features
export const chatAPI = {
  /**
   * Send a message to the chat API
   * @param {string} message - The message to send
   * @param {string} feature - The feature type ('math' or 'search')
   * @param {string} searchEngine - Optional search engine for search feature
   * @returns {Promise} Response data
   */
  sendMessage: async (message, feature, searchEngine = 'duckduckgo') => {
    const response = await apiClient.post('/chat', {
      message,
      feature,
      search_engine: searchEngine,
    });
    return response.data;
  },
};

// Data Analysis API
export const dataAPI = {
  /**
   * Upload a CSV file
   * @param {File} file - The CSV file to upload
   * @returns {Promise} Response data with file info and columns
   */
  uploadCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Analyze data (create charts, AI analysis, etc.)
   * @param {string} action - The analysis action to perform
   * @param {object} data - Additional data for the analysis
   * @returns {Promise} Response data
   */
  analyzeData: async (action, data) => {
    const response = await apiClient.post('/analyze-data', {
      action,
      ...data,
    });
    return response.data;
  },

  /**
   * Clear the current data
   */
  clearData: () => {
    // This is a local operation, no API call needed
    // The backend will handle new uploads by overwriting
    console.log('Data cleared on client side');
  },
};

// Smart Chat API
export const smartChatAPI = {
  /**
   * Send a message to the smart chat API
   * @param {string} message - The message to send
   * @param {string} searchEngine - The search engine to use
   * @returns {Promise} Response data
   */
  sendSmartMessage: async (message, searchEngine = 'google') => {
    const response = await apiClient.post('/smart-chat', {
      message,
      search_engine: searchEngine,
    });
    return response.data;
  },
};

// Export default API client for custom requests
export default apiClient;
