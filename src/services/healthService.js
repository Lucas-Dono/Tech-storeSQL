import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

export const healthService = {
  checkHealth: async () => {
    try {
      const response = await axios.get(`${API_URL}/health`);
      return response.data.status === 'OK';
    } catch (error) {
      console.error('Error checking server health:', error);
      return false;
    }
  }
}; 