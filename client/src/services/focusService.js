import api from './api';

const focusService = {
  getTodaysFocus: async () => {
    const response = await api.get('/focus/todays-focus');
    return response.data;
  },
};

export default focusService;
