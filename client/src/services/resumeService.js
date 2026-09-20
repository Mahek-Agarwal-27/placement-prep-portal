import api from './api';

const resumeService = {
  /**
   * Upload resume and get AI analysis
   * @param {FormData} formData - Contains the 'resume' file and optional 'jobDescription' text
   */
  analyzeResume: async (formData) => {
    // Do NOT manually set Content-Type for FormData.
    // Axios auto-sets multipart/form-data WITH the correct boundary when it
    // detects a FormData object. Setting it manually strips the boundary and
    // breaks multer's ability to parse the uploaded file on the server.
    const response = await api.post('/resumes/analyze', formData);
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

  clearAll: async () => {
    const response = await api.delete('/resumes/clear-all');
    return response.data;
  },
};

export default resumeService;
