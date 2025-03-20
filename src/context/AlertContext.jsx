import { createContext, useContext, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import Alert from '../components/common/Alert';

const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const nextId = useRef(1);

  const showAlert = useCallback(({ type, message, title, autoClose = true, autoCloseDuration = 5000 }) => {
    const id = nextId.current++;
    setAlerts(prev => [...prev, { id, type, message, title, autoClose, autoCloseDuration }]);
    return id;
  }, []);

  const hideAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const success = useCallback((message, title = '¡Éxito!') => {
    return showAlert({ type: 'success', message, title });
  }, [showAlert]);

  const error = useCallback((message, title = 'Error') => {
    return showAlert({ type: 'error', message, title });
  }, [showAlert]);

  const warning = useCallback((message, title = 'Advertencia') => {
    return showAlert({ type: 'warning', message, title });
  }, [showAlert]);

  const info = useCallback((message, title = 'Información') => {
    return showAlert({ type: 'info', message, title });
  }, [showAlert]);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            type={alert.type}
            message={alert.message}
            title={alert.title}
            autoClose={alert.autoClose}
            autoCloseDuration={alert.autoCloseDuration}
            onClose={() => hideAlert(alert.id)}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
};

AlertProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert debe ser usado dentro de un AlertProvider');
  }
  return context;
}; 