/**
 * services/taskService.js — Study Planner API client calls
 *
 * Wraps all Axios calls for:
 *  - getTasks      (with optional filter params)
 *  - getTaskStats
 *  - addTask
 *  - updateTask
 *  - deleteTask
 */

import api from './api';

const taskService = {
  /**
   * Fetch all tasks for logged-in user with optional filters
   * @param {Object} filters - { status, priority, category, search }
   */
  getTasks: async (filters = {}) => {
    const response = await api.get('/tasks', { params: filters });
    return response.data;
  },

  /**
   * Get aggregate task stats
   */
  getTaskStats: async () => {
    const response = await api.get('/tasks/stats');
    return response.data;
  },

  /**
   * Add a new study task
   * @param {Object} taskData - { title, description, category, priority, status, dueDate, estimatedHours }
   */
  addTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  /**
   * Update an existing task
   * @param {string} id       - Task document _id
   * @param {Object} taskData - Partial fields to update
   */
  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  /**
   * Delete a task by id
   * @param {string} id - Task document _id
   */
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

export default taskService;
