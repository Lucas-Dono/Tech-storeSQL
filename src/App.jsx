import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { AlertProvider } from './context/AlertContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { AdminProvider } from './context/AdminContext';
import { sampleProducts } from './data/sampleProducts';
import ServerStatus from './components/ServerStatus';
import AppRoutes from './routes';
import { useState } from 'react';

function App() {
  const [isServerReady, setIsServerReady] = useState(false);
  const [products, setProducts] = useState([]);

  const handleServerReady = () => {
    setIsServerReady(true);
  };

  const handleSampleProducts = (sampleProducts) => {
    setProducts(sampleProducts);
  };

  return (
    <Router>
      <ThemeProvider>
        <AlertProvider>
          <AuthProvider>
            <AdminProvider>
              <StoreProvider products={products}>
                <CartProvider>
                  {!isServerReady && (
                    <ServerStatus 
                      onServerReady={handleServerReady}
                      onSampleProducts={handleSampleProducts}
                    />
                  )}
                  <AppRoutes />
                </CartProvider>
              </StoreProvider>
            </AdminProvider>
          </AuthProvider>
        </AlertProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
