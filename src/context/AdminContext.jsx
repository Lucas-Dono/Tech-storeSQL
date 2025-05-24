import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { productService } from '../services/productService';

const AdminContext = createContext();

// Datos de ventas simuladas para el último año
const generateSalesData = () => {
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  
  let baseValue = 15000;
  const trend = 1.15;
  const variation = 0.2;

  return months.map((month) => {
    baseValue = baseValue * trend * (1 + (Math.random() * variation - variation/2));
    return {
      month,
      sales: Math.round(baseValue),
      orders: Math.round(baseValue / 250)
    };
  });
};

export const AdminProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData] = useState(() => generateSalesData());

  // Cargar productos al iniciar
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const data = await productService.getProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar productos');
        console.error('Error al cargar productos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const addProduct = async (newProduct) => {
    try {
      setIsLoading(true);
      const addedProduct = await productService.createProduct(newProduct);
      setProducts(prevProducts => [...prevProducts, addedProduct]);
      return addedProduct;
    } catch (error) {
      setError('Error al crear producto');
      console.error('Error al crear producto:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (productId, updatedData) => {
    try {
      setIsLoading(true);
      const updatedProduct = await productService.updateProduct(productId, updatedData);
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === productId ? updatedProduct : product
        )
      );
      return updatedProduct;
    } catch (error) {
      setError('Error al actualizar producto');
      console.error('Error al actualizar producto:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      setIsLoading(true);
      await productService.deleteProduct(productId);
      setProducts(prevProducts =>
        prevProducts.filter(product => product.id !== productId)
      );
    } catch (error) {
      setError('Error al eliminar producto');
      console.error('Error al eliminar producto:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getProduct = async (productId) => {
    try {
      return await productService.getProductById(productId);
    } catch (error) {
      setError('Error al obtener producto');
      console.error('Error al obtener producto:', error);
      throw error;
    }
  };

  // Estadísticas simuladas
  const getStatistics = () => {
    const lastMonth = salesData[salesData.length - 1];
    const previousMonth = salesData[salesData.length - 2];
    
    const salesGrowth = ((lastMonth.sales - previousMonth.sales) / previousMonth.sales) * 100;
    const ordersGrowth = ((lastMonth.orders - previousMonth.orders) / previousMonth.orders) * 100;

    return {
      totalSales: lastMonth.sales,
      totalOrders: lastMonth.orders,
      salesGrowth,
      ordersGrowth,
      averageOrderValue: lastMonth.sales / lastMonth.orders,
      topCategories: [
        { name: 'Laptops', percentage: 35 },
        { name: 'Smartphones', percentage: 25 },
        { name: 'Accesorios', percentage: 20 },
        { name: 'Tablets', percentage: 15 },
        { name: 'Monitores', percentage: 5 }
      ]
    };
  };

  const value = {
    products,
    isLoading,
    error,
    salesData,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    getStatistics
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

AdminProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export default AdminContext;
