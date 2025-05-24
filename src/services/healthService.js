import axios from 'axios';
import { API_URL } from '../config/api';

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