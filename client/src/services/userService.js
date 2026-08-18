import api from './api';

const userService = {
  changePassword: async (passwords) => {
    const response = await api.put('/auth/change-password', passwords);
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await api.put('/auth/settings', settings);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/users/delete-account');
    return response.data;
  },

  exportData: async () => {
    const response = await api.get('/users/export-data');
    return response.data;
  },

  getRealtimeAnalytics: async () => {
    const response = await api.get('/analytics/realtime');
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/users/analytics');
    return response.data;
  },

  logStudySession: async (data) => {
    const response = await api.post('/users/study-session', data);
    return response.data;
  },
};

export default userService;
