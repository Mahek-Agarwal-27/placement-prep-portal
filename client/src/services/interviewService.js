import api from './api';

const interviewService = {
  /**
   * Start a new mock interview session
   * @param {Object} data - { type, topic }
   */
  startInterview: async (data) => {
    const response = await api.post('/interviews/start', data);
    return response.data;
  },

  /**
   * Submit candidate response and get next question
   * @param {string} id - Interview ID
   * @param {string} message - Candidate's text answer
   */
  submitResponse: async (id, message) => {
    const response = await api.post(`/interviews/${id}/message`, { message });
    return response.data;
  },

  respondToInterview: async (id, message) => {
    const response = await api.post(`/interviews/${id}/message`, { message });
    return response.data;
  },

  /**
   * End session and evaluate transcript via Gemini
   * @param {string} id - Interview ID
   */
  endAndEvaluate: async (id) => {
    const response = await api.post(`/interviews/${id}/end`);
    return response.data;
  },

  endInterview: async (id) => {
    const response = await api.post(`/interviews/${id}/end`);
    return response.data;
  },

  /**
   * Get all past interview sessions
   */
  getInterviews: async () => {
    const response = await api.get('/interviews');
    return response.data;
  },

  /**
   * Get details of a single session
   * @param {string} id
   */
  getInterviewById: async (id) => {
    const response = await api.get(`/interviews/${id}`);
    return response.data;
  },

  deleteInterview: async (id) => {
    const response = await api.delete(`/interviews/${id}`);
    return response.data;
  },

  clearAll: async () => {
    const response = await api.delete('/interviews/clear-all');
    return response.data;
  },
};

export default interviewService;
