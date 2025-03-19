import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import Toast from '../components/Toast';
import { productService } from '../services/productService';
import specifications from '../data/specifications.json';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';

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
      console.log('Initializing cart from localStorage:', savedCart);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });
  const [products, setProducts] = useState([]);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    try {
      console.log('Saving cart to localStorage:', cart);
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  // Función para cargar productos
  const loadProducts = useCallback(async () => {
    try {
      const data = await productService.getProducts();
      if (Array.isArray(data)) {
        // Traducir los productos según el idioma actual
        const translatedProducts = data.map(product => ({
          ...product,
          name: product[`name_${i18n.language}`] || product.name,
          description: product[`description_${i18n.language}`] || product.description,
          features: product.features ? Object.entries(product.features).reduce((acc, [key, feature]) => ({
            ...acc,
            [key]: {
              ...feature,
              name: feature[`name_${i18n.language}`] || feature.name,
              selectedComponent: feature.selectedComponent ? {
                ...feature.selectedComponent,
                name: feature.selectedComponent[`name_${i18n.language}`] || feature.selectedComponent.name,
                description: feature.selectedComponent[`description_${i18n.language}`] || feature.selectedComponent.description
              } : null,
              options: feature.options ? feature.options.map(option => ({
                ...option,
                name: option[`name_${i18n.language}`] || option.name,
                description: option[`description_${i18n.language}`] || option.description
              })) : []
            }
          }), {}) : null,
          models: product.models ? product.models.map(model => ({
            ...model,
            name: model[`name_${i18n.language}`] || model.name,
            description: model[`description_${i18n.language}`] || model.description
          })) : []
        }));
        setProducts(translatedProducts);
      } else {
        console.error('Los datos recibidos no son un array:', data);
        setProducts([]);
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError(err.message);
      setProducts([]);
      setIsLoading(false);
      showToast('Error al cargar productos', 'error');
    }
  }, [i18n.language]);

  // Cargar productos al montar el componente o cuando cambie el idioma
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Productos
  const addProduct = useCallback(async (productData) => {
    try {
      // Preparar datos con traducciones
      const productWithTranslations = {
        ...productData,
        name_es: productData.name,
        name_en: productData.name_en || productData.name,
        description_es: productData.description,
        description_en: productData.description_en || productData.description,
        features: productData.features ? Object.entries(productData.features).reduce((acc, [key, feature]) => ({
          ...acc,
          [key]: {
            ...feature,
            name_es: feature.name,
            name_en: feature.name_en || feature.name,
            selectedComponent: feature.selectedComponent ? {
              ...feature.selectedComponent,
              name_es: feature.selectedComponent.name,
              name_en: feature.selectedComponent.name_en || feature.selectedComponent.name,
              description_es: feature.selectedComponent.description,
              description_en: feature.selectedComponent.description_en || feature.selectedComponent.description
            } : null,
            options: feature.options ? feature.options.map(option => ({
              ...option,
              name_es: option.name,
              name_en: option.name_en || option.name,
              description_es: option.description,
              description_en: option.description_en || option.description
            })) : []
          }
        }), {}) : null,
        models: productData.models ? productData.models.map(model => ({
          ...model,
          name_es: model.name,
          name_en: model.name_en || model.name,
          description_es: model.description,
          description_en: model.description_en || model.description
        })) : []
      };

      const newProduct = await productService.createProduct(productWithTranslations, getToken());
      setProducts(prev => [...prev, newProduct]);
      showToast('Producto agregado exitosamente', 'success');
      return newProduct;
    } catch (err) {
      setError(err.message);
      showToast('Error al agregar el producto', 'error');
      throw err;
    }
  }, [showToast, getToken]);

  const updateProduct = useCallback(async (productId, productData) => {
    try {
      // Preparar datos con traducciones
      const productWithTranslations = {
        ...productData,
        name_es: productData.name,
        name_en: productData.name_en || productData.name,
        description_es: productData.description,
        description_en: productData.description_en || productData.description,
        features: productData.features ? Object.entries(productData.features).reduce((acc, [key, feature]) => ({
          ...acc,
          [key]: {
            ...feature,
            name_es: feature.name,
            name_en: feature.name_en || feature.name,
            selectedComponent: feature.selectedComponent ? {
              ...feature.selectedComponent,
              name_es: feature.selectedComponent.name,
              name_en: feature.selectedComponent.name_en || feature.selectedComponent.name,
              description_es: feature.selectedComponent.description,
              description_en: feature.selectedComponent.description_en || feature.selectedComponent.description
            } : null,
            options: feature.options ? feature.options.map(option => ({
              ...option,
              name_es: option.name,
              name_en: option.name_en || option.name,
              description_es: option.description,
              description_en: option.description_en || option.description
            })) : []
          }
        }), {}) : null,
        models: productData.models ? productData.models.map(model => ({
          ...model,
          name_es: model.name,
          name_en: model.name_en || model.name,
          description_es: model.description,
          description_en: model.description_en || model.description
        })) : []
      };

      const updatedProduct = await productService.updateProduct(productId, productWithTranslations, getToken());
      setProducts(prev => prev.map(product => 
        product.id === productId ? updatedProduct : product
      ));
      showToast('Producto actualizado exitosamente', 'success');
      return updatedProduct;
    } catch (err) {
      setError(err.message);
      showToast('Error al actualizar el producto', 'error');
      throw err;
    }
  }, [showToast, getToken]);

  const deleteProduct = useCallback(async (productId) => {
    try {
      console.log('Intentando eliminar producto:', productId);
      const token = getToken();
      console.log('Token disponible:', !!token);
      console.log('Token completo:', token);
      
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }

      if (!productId) {
        throw new Error('ID de producto no proporcionado');
      }

      await productService.deleteProduct(productId, token);
      // Recargar los productos después de eliminar
      await loadProducts();
      showToast('Producto eliminado exitosamente', 'success');
    } catch (err) {
      console.error('Error al eliminar el producto:', err);
      console.error('Detalles del error:', {
        message: err.message,
        stack: err.stack,
        productId,
        hasToken: !!token
      });
      showToast('Error al eliminar el producto', 'error');
      throw err;
    }
  }, [showToast, getToken, loadProducts]);

  // Carrito
  const addToCart = useCallback((product, quantity = 1) => {
    if (!product || !product.id) {
      console.error('Producto inválido:', product);
      return;
    }

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
        price: product.price,
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
    if (newQuantity < 1) {
      showToast('La cantidad debe ser mayor a 0', 'warning');
      return;
    }
    
    setCart(prevCart => {
      const item = prevCart.find(item => item.id === productId);
      if (!item) return prevCart;

      if (newQuantity > item.stock) {
        showToast(`Solo hay ${item.stock} unidades disponibles`, 'warning');
        return prevCart;
      }

      return prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  }, [showToast]);

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
    isLoading,
    error,
    specifications,
    addProduct,
    updateProduct,
    deleteProduct,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
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
  children: PropTypes.node.isRequired,
};

export default StoreContext;
