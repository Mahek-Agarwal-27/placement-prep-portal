import api from './api';

const aiHistoryService = {
  getHistory: async () => {
    const response = await api.get('/ai-history');
    return response.data;
  },

  addHistory: async (data) => {
    const response = await api.post('/ai-history', data);
    return response.data;
  },

  deleteItem: async (id) => {
    const response = await api.delete(`/ai-history/${id}`);
    return response.data;
  },

  clearAll: async () => {
    const response = await api.delete('/ai-history/clear-all');
    return response.data;
  },
};

export default aiHistoryService;
