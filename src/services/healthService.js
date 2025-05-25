import axios from 'axios';
import { API_URL } from '../config/api';

const MAX_RETRIES = 3;
const TIMEOUT = 10000; // 10 segundos

export const healthService = {
  checkHealth: async () => {
    let retries = 0;
    
    while (retries < MAX_RETRIES) {
      try {
        const response = await axios.get(`${API_URL}/api/health`, {
          timeout: TIMEOUT
        });
        return response.data.status === 'OK';
      } catch (error) {
        console.error(`Intento ${retries + 1} fallido:`, error);
        retries++;
        
        if (retries === MAX_RETRIES) {
          console.error('Error checking server health:', error);
          return false;
        }
        
        // Esperar antes de reintentar (backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
      }
    }
    
    return false;
  }
}; 