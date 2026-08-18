import api from './api';

const activityTrackerService = {
  startActivity: async (activityType, title) => {
    const response = await api.post('/activity/start', { activityType, title });
    return response.data;
  },

  stopActivity: async (sessionId) => {
    const response = await api.post('/activity/stop', { sessionId });
    return response.data;
  },

  getActiveActivity: async () => {
    const response = await api.get('/activity/active');
    return response.data;
  },

  getActivityStats: async () => {
    const response = await api.get('/activity/stats');
    return response.data;
  },
};

export default activityTrackerService;
