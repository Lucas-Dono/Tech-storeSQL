import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import Toast from '../components/Toast';
import { productService } from '../services/productService';
import specifications from '../data/specifications.json';
import { fallbackProducts } from '../data/fallbackProducts';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { API_URL } from '../config/api';
import { healthService } from '../services/healthService';

const StoreContext = createContext();

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore debe ser usado dentro de un StoreProvider');
  }
  return context;
};

export const StoreProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const { getToken } = useAuth();
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });
  const [products, setProducts] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isServerAvailable, setIsServerAvailable] = useState(false);

  const checkServerStatus = useCallback(async () => {
    try {
      const isHealthy = await healthService.checkHealth();
      setIsServerAvailable(isHealthy);
      return isHealthy;
    } catch (error) {
      console.error('Error checking server status:', error);
      setIsServerAvailable(false);
      return false;
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const serverAvailable = await checkServerStatus();
      
      if (serverAvailable) {
        try {
        const data = await productService.getProducts();
        setProducts(data);
        setError(null);
        } catch (err) {
          console.error('Error al obtener productos:', err);
          setProducts(fallbackProducts);
          setError('Error al cargar productos. Mostrando productos de respaldo.');
        }
      } else {
        setProducts(fallbackProducts);
        setError('Servidor no disponible. Mostrando productos de respaldo.');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error al cargar productos:', err);
      setProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  }, [checkServerStatus]);

  // Cargar productos al iniciar
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Verificar estado del servidor periódicamente
  useEffect(() => {
    const interval = setInterval(async () => {
      const serverAvailable = await checkServerStatus();
      if (serverAvailable !== isServerAvailable) {
        setIsServerAvailable(serverAvailable);
        if (serverAvailable) {
          await fetchProducts();
        }
      }
    }, 60000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, [checkServerStatus, isServerAvailable, fetchProducts]);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Productos
  const addProduct = useCallback(async (productData) => {
    try {
      if (!isServerAvailable) {
        throw new Error('No se pueden agregar productos mientras el servidor no esté disponible');
      }
      const token = getToken();
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }
      const newProduct = await productService.createProduct(productData, token);
      await fetchProducts();
      showToast('Producto agregado exitosamente', 'success');
      return newProduct;
    } catch (err) {
      setError(err.message);
      showToast('Error al agregar el producto', 'error');
      throw err;
    }
  }, [showToast, getToken, fetchProducts, isServerAvailable]);

  const updateProduct = useCallback(async (productId, productData) => {
    try {
      if (!isServerAvailable) {
        throw new Error('No se pueden actualizar productos mientras el servidor no esté disponible');
      }
      const token = getToken();
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }
      const updatedProduct = await productService.updateProduct(productId, productData, token);
      await fetchProducts();
      showToast('Producto actualizado exitosamente', 'success');
      return updatedProduct;
    } catch (err) {
      setError(err.message);
      showToast('Error al actualizar el producto', 'error');
      throw err;
    }
  }, [showToast, getToken, fetchProducts, isServerAvailable]);

  const deleteProduct = useCallback(async (productId) => {
    try {
      if (!isServerAvailable) {
        throw new Error('No se pueden eliminar productos mientras el servidor no esté disponible');
      }
      const token = getToken();
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }
      await productService.deleteProduct(productId, token);
      await fetchProducts();
      showToast('Producto eliminado exitosamente', 'success');
    } catch (err) {
      setError(err.message);
      showToast('Error al eliminar el producto', 'error');
      throw err;
    }
  }, [showToast, getToken, fetchProducts, isServerAvailable]);

  // Carrito
  const addToCart = useCallback((product, quantity = 1) => {
    if (!product || !product.id) {
      console.error('Producto inválido:', product);
      return;
    }

    const price = typeof product.price === 'string' 
      ? parseFloat(product.price) 
      : product.price;

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          showToast(`Solo hay ${product.stock} unidades disponibles`, 'warning');
          return prevCart;
        }
        
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      if (quantity > product.stock) {
        showToast(`Solo hay ${product.stock} unidades disponibles`, 'warning');
        return prevCart;
      }

      return [...prevCart, {
        id: product.id,
        name: product.name,
        price: price,
        image: product.image,
        stock: product.stock,
        quantity: quantity,
        selectedOptions: product.selectedOptions || {}
      }];
    });

    showToast('Producto agregado al carrito', 'success');
  }, [showToast]);

  const removeFromCart = useCallback((productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
    showToast('Producto eliminado del carrito', 'success');
  }, [showToast]);

  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity < 1) return;

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    showToast('Carrito vaciado', 'success');
  }, [showToast]);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const getCartItemsCount = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const value = {
    cart,
    products,
    loading,
    error,
    specifications,
    isServerAvailable,
    addProduct,
    updateProduct,
    deleteProduct,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    fetchProducts
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </StoreContext.Provider>
  );
};

StoreProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default StoreContext;
