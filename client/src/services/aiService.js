import api from './api';

const aiService = {
  /**
   * Send a prompt and context to the Gemini AI API
   * @param {Object} data - { prompt, context, action }
   * action can be 'summarize', 'explain', 'improve', or null/custom
   */
  generateAIResponse: async (data) => {
    const response = await api.post('/ai/generate', data);
    return response.data;
  },

  // Alias for backward compatibility
  generateContent: async (data) => {
    const response = await api.post('/ai/generate', data);
    return response.data;
  },
};

export default aiService;
