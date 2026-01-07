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
   * @param {string[]} imageFilenames - Optional array of uploaded image filenames
   * @returns {Promise} Response data
   */
  sendSmartMessage: async (message, searchEngine = 'google', imageFilenames = []) => {
    const response = await apiClient.post('/smart-chat', {
      message,
      search_engine: searchEngine,
      image_filenames: imageFilenames,
    });
    return response.data;
  },
};

// Text-to-Speech API
export const ttsAPI = {
  /**
   * Convert text to speech
   * @param {string} text - The text to convert
   * @param {string} lang - Language code (default: 'vi')
   * @returns {Promise<Blob>} Audio blob
   */
  textToSpeech: async (text, lang = 'vi') => {
    const response = await apiClient.post('/text-to-speech', 
      { text, lang },
      { responseType: 'blob' }
    );
    return response.data;
  },
};

// Local LLM API
export const localLLMAPI = {
  /**
   * Chat with local LLM or Gemini API
   * @param {object} params - Chat parameters
   * @param {string} params.message - The message to send
   * @param {number} params.max_length - Max length of response
   * @param {number} params.temperature - Sampling temperature
   * @param {boolean} params.use_api - Use Gemini API or local LLM
   * @param {string} params.api_key - Gemini API key (if use_api is true)
   * @param {string} params.model_name - Gemini model name (if use_api is true)
   * @returns {Promise} Response data
   */
  chat: async (params) => {
    const response = await apiClient.post('/local-llm', params);
    return response.data;
  },
  
  /**
   * Create presentation slides
   * @param {object} params - Slide creation parameters
   * @param {string} params.topic - Topic for the presentation
   * @param {number} params.num_slides - Number of slides to create
   * @param {boolean} params.use_api - Use Gemini API or local LLM
   * @param {string} params.api_key - Gemini API key (if use_api is true)
   * @param {string} params.model_name - Gemini model name (if use_api is true)
   * @returns {Promise} Response data
   */
  createSlides: async (params) => {
    const response = await apiClient.post('/create-slides', params);
    return response.data;
  },
};

// Vision API
export const visionAPI = {
  /**
   * Upload an image
   * @param {File} file - The image file to upload
   * @returns {Promise} Response data
   */
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Perform vision analysis (VQA or OCR)
   * @param {object} params - Analysis parameters
   * @param {string} params.action - 'vqa' or 'ocr'
   * @param {string} params.image_filename - Name of the uploaded image
   * @param {string} params.question - Question for VQA (optional)
   * @returns {Promise} Response data
   */
  analyze: async (params) => {
    const response = await apiClient.post('/vision', params);
    return response.data;
  },
};

// Speech-to-Text API
export const speechAPI = {
  /**
   * Convert speech to text
   * @param {Blob} audioBlob - Audio blob from recording
   * @param {string} method - 'auto', 'whisper', or 'google'
   * @param {string} language - Language code (e.g., 'vi', 'en')
   * @param {boolean} translateToEnglish - Translate to English (Whisper only)
   * @param {string} openaiApiKey - OpenAI API key (optional)
   * @returns {Promise} Response data with transcribed text
   */
  transcribe: async (audioBlob, method = 'auto', language = 'vi', translateToEnglish = false, openaiApiKey = null) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');
    formData.append('method', method);
    formData.append('language', language);
    formData.append('translate_to_english', translateToEnglish);
    
    if (openaiApiKey) {
      formData.append('openai_api_key', openaiApiKey);
    }

    const response = await apiClient.post('/speech-to-text', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// ASR (Automatic Speech Recognition) API
export const asrAPI = {
  /**
   * Transcribe audio using Whisper model
   * @param {object} params - Transcription parameters
   * @param {File} params.audio - Audio file to transcribe
   * @param {string} params.language - Language code (e.g., 'vi', 'en') or null for auto-detect
   * @param {string} params.task - 'transcribe' or 'translate'
   * @param {string} params.model_name - Whisper model name
   * @returns {Promise} Response data with transcription
   */
  transcribe: async (params) => {
    const formData = new FormData();
    formData.append('audio', params.audio);
    
    if (params.language) {
      formData.append('language', params.language);
    }
    
    formData.append('task', params.task || 'transcribe');
    formData.append('model_name', params.model_name || 'large-v3');

    const response = await apiClient.post('/api/asr/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Image Generation API
export const imageGenAPI = {
  /**
   * Generate image from text prompt
   * @param {object} params - Generation parameters
   * @param {string} params.prompt - Text description of the image
   * @param {number} params.width - Image width (default: 1024)
   * @param {number} params.height - Image height (default: 1024)
   * @returns {Promise} Response data with image URL
   */
  textToImage: async (params) => {
    const response = await apiClient.post('/text-to-image', params);
    return response.data;
  },
};

// Video Generation API
export const videoGenAPI = {
  /**
   * Generate video from text prompt using Google Veo 3.1
   * @param {object} params - Generation parameters
   * @param {string} params.prompt - Text description of the video
   * @param {number} params.max_wait_time - Maximum wait time in seconds (default: 300)
   * @returns {Promise} Response data with video URL
   */
  textToVideo: async (params) => {
    const response = await apiClient.post('/text-to-video', params);
    return response.data;
  },

  /**
   * Generate video from image using Google Veo 3.1
   * @param {object} params - Generation parameters
   * @param {string} params.image_filename - Uploaded image filename
   * @param {string} params.prompt - Optional text prompt to guide generation
   * @param {number} params.max_wait_time - Maximum wait time in seconds (default: 300)
   * @returns {Promise} Response data with video URL
   */
  imageToVideo: async (params) => {
    const response = await apiClient.post('/image-to-video', params);
    return response.data;
  },

  /**
   * Generate video from multiple reference images using Google Veo 3.1
   * @param {object} params - Generation parameters
   * @param {string[]} params.image_filenames - Array of uploaded image filenames
   * @param {string} params.prompt - Text prompt to guide generation (required)
   * @param {number} params.max_wait_time - Maximum wait time in seconds (default: 300)
   * @returns {Promise} Response data with video URL
   */
  referenceImagesToVideo: async (params) => {
    const response = await apiClient.post('/reference-images-to-video', params);
    return response.data;
  },

  /**
   * Generate image from prompt then create video using Google Gemini 2.5 Flash Image + Veo 3.1
   * @param {object} params - Generation parameters
   * @param {string} params.prompt - Text prompt to generate image and video
   * @param {number} params.max_wait_time - Maximum wait time in seconds (default: 300)
   * @returns {Promise} Response data with generated image URL and video URL
   */
  promptToImageToVideo: async (params) => {
    const response = await apiClient.post('/prompt-to-image-to-video', params);
    return response.data;
  },
};

// Unified API object
export const api = {
  chat: chatAPI.sendMessage,
  smartChat: smartChatAPI.sendSmartMessage,
  uploadCSV: dataAPI.uploadCSV,
  analyzeData: dataAPI.analyzeData,
  clearData: dataAPI.clearData,
  textToSpeech: ttsAPI.textToSpeech,
  localLLMChat: localLLMAPI.chat,
  createSlides: localLLMAPI.createSlides,
  uploadImage: visionAPI.uploadImage,
  visionAnalysis: visionAPI.analyze,
  speechToText: speechAPI.transcribe,
  asrTranscribe: asrAPI.transcribe,
  textToImage: imageGenAPI.textToImage,
  textToVideo: videoGenAPI.textToVideo,
  imageToVideo: videoGenAPI.imageToVideo,
  referenceImagesToVideo: videoGenAPI.referenceImagesToVideo,
  promptToImageToVideo: videoGenAPI.promptToImageToVideo,
};

// Export default API client for custom requests
export default api;
