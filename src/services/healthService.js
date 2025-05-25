import axios from 'axios';
import { API_URL } from '../config/api';

const MAX_RETRIES = 12; // Aumentamos a 10 intentos
const TIMEOUT = 10000; // 10 segundos por intento
const MAX_TOTAL_TIME = 120000; // 2 minutos en total

export const healthService = {
  checkHealth: async () => {
    let retries = 0;
    const startTime = Date.now();
    
    while (retries < MAX_RETRIES) {
      try {
        // Verificar si hemos excedido el tiempo total máximo
        if (Date.now() - startTime > MAX_TOTAL_TIME) {
          console.log('Tiempo máximo de espera alcanzado');
          return false;
        }

        const response = await axios.get(`${API_URL}/api/health`, {
          timeout: TIMEOUT
        });
        
        if (response.data.status === 'OK') {
          console.log(`Servidor activo después de ${retries + 1} intentos`);
          return true;
        }
        
        throw new Error('Servidor no está listo');
      } catch (error) {
        console.log(`Intento ${retries + 1} fallido:`, error.message);
        retries++;
        
        if (retries === MAX_RETRIES) {
          console.log('Máximo número de intentos alcanzado');
          return false;
        }
        
        // Esperar antes de reintentar (backoff exponencial con un máximo de 15 segundos)
        const waitTime = Math.min(Math.pow(2, retries) * 1000, 15000);
        console.log(`Esperando ${waitTime/1000} segundos antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    return false;
  }
}; 