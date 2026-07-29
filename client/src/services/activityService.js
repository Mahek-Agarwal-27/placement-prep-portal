import api from './api';

const activityService = {
  getActivities: async () => {
    const response = await api.get('/activities');
    return response.data;
  },

  logActivity: async (data) => {
    const response = await api.post('/activities', data);
    return response.data;
  },
};

export default activityService;
