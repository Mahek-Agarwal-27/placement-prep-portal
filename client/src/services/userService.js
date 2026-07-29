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
};

export default userService;
