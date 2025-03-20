import { useState, useEffect } from 'react';
import { healthService } from '../services/healthService';
import { sampleProducts } from '../data/sampleProducts';

const ServerStatus = ({ onServerReady, onSampleProducts }) => {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('Verificando estado del servidor...');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkServer = async () => {
      try {
        // Mostrar productos de muestra inmediatamente
        onSampleProducts(sampleProducts);
        
        // Intentar conectar con el servidor
        const isHealthy = await healthService.checkHealth();
        
        if (isHealthy) {
          setStatus('ready');
          setMessage('Servidor iniciado con éxito');
          onServerReady();
          setIsVisible(false);
        } else {
          setStatus('error');
          setMessage('Error al conectar con el servidor. Mostrando productos de muestra...');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Error al conectar con el servidor. Mostrando productos de muestra...');
      }
    };

    checkServer();
  }, [onServerReady, onSampleProducts]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-slide-up relative">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-center">
          {status === 'checking' ? (
            <div className="mb-4">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div className="mb-4">
              <svg className="w-16 h-16 text-yellow-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          )}
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {status === 'checking' ? 'Iniciando servidor...' : 'Servidor no disponible'}
          </h2>
          <p className="text-gray-600 mb-4">{message}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-700">
              Mientras tanto, puedes explorar algunos productos de muestra. El servidor se iniciará automáticamente cuando esté listo.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServerStatus; 