import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './pages/Admin/AdminLayout';
import MainLayout from './layouts/MainLayout';
import AdminRoute from './components/AdminRoute';
import SuperAdminRoute from './components/SuperAdminRoute';
import PrivateRoute from './components/PrivateRoute';

// Páginas de Administración
import Dashboard from './pages/Admin/Dashboard';
import AdminProducts from './pages/Admin/Products';
import CreateProduct from './pages/Admin/CreateProduct';
import UserManagement from './pages/Admin/UserManagement';

// Páginas Públicas
import Home from './pages/Home';
import PublicProducts from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Auth from './pages/Auth';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas de Administración */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="productos" element={<AdminProducts />} />
          <Route path="create-product" element={<CreateProduct />} />
        </Route>
      </Route>

      {/* Rutas de SuperAdmin */}
      <Route element={<SuperAdminRoute />}>
        <Route path="/admin/users" element={<UserManagement />} />
      </Route>

      {/* Rutas Privadas */}
      <Route element={<PrivateRoute />}>
        <Route path="/carrito" element={<Cart />} />
      </Route>

      {/* Layout Principal */}
      <Route element={<MainLayout />}>
        {/* Rutas Públicas */}
        <Route index element={<Home />} />
        <Route path="/productos" element={<PublicProducts />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Navigate to="/carrito" replace />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes; 