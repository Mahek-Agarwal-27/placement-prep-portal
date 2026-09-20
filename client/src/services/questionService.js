/**
 * services/questionService.js — DSA Tracker API client calls
 *
 * Wraps all Axios calls for:
 *  - getQuestions  (with optional filter params)
 *  - getStats
 *  - addQuestion
 *  - updateQuestion
 *  - deleteQuestion
 */

import api from './api';

const questionService = {
  /**
   * Fetch all questions for logged-in user with optional filters
   * @param {Object} filters - { status, difficulty, topic, platform, search }
   */
  getQuestions: async (filters = {}) => {
    const response = await api.get('/questions', { params: filters });
    return response.data; // { success, data: Question[] }
  },

  /**
   * Get aggregate stats (by difficulty, by topic, totals)
   */
  getStats: async () => {
    const response = await api.get('/questions/stats');
    return response.data; // { success, data: { byDifficulty, byTopic, ... } }
  },

  /**
   * Add a new DSA problem entry
   * @param {Object} questionData - { title, platform, difficulty, topic, status, link, notes }
   */
  addQuestion: async (questionData) => {
    const response = await api.post('/questions', questionData);
    return response.data; // { success, data: Question }
  },

  /**
   * Update an existing question
   * @param {string} id           - Question document _id
   * @param {Object} questionData - Partial fields to update
   */
  updateQuestion: async (id, questionData) => {
    const response = await api.put(`/questions/${id}`, questionData);
    return response.data; // { success, data: Question }
  },

  /**
   * Delete a question by id
   * @param {string} id - Question document _id
   */
  deleteQuestion: async (id) => {
    const response = await api.delete(`/questions/${id}`);
    return response.data; // { success, message }
  },

  clearAll: async () => {
    const response = await api.delete('/questions/clear-all');
    return response.data;
  },
};

export default questionService;
