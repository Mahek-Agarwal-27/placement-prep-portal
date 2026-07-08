import api from './api';

const resumeService = {
  /**
   * Upload resume and get AI analysis
   * @param {FormData} formData - Contains the 'resume' file and optional 'jobDescription' text
   */
  analyzeResume: async (formData) => {
    // We must ensure the headers are set to multipart/form-data
    // Axios usually sets this automatically when passing FormData, but we can enforce it.
    const response = await api.post('/resumes/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get all past resume analyses
   */
  getResumes: async () => {
    const response = await api.get('/resumes');
    return response.data;
  },

  /**
   * Delete a resume record
   * @param {string} id
   */
  deleteResume: async (id) => {
    const response = await api.delete(`/resumes/${id}`);
    return response.data;
  },
};

export default resumeService;
