import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import Auth from './pages/Auth';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminProducts from './pages/Admin/Products';
import CreateProduct from './pages/Admin/CreateProduct';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { AdminProvider } from './context/AdminContext';
import { useAuth } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import UserManagement from './pages/Admin/UserManagement';

// Componente para proteger rutas que requieren autenticación
const PrivateRoute = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  if (!currentUser) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

// Componente para proteger rutas de administrador
const AdminRoute = () => {
  const { currentUser, isAdmin } = useAuth();
  const location = useLocation();

  if (!currentUser || !isAdmin()) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

// Componente para proteger rutas de superadmin
const SuperAdminRoute = () => {
  const { currentUser, isSuperAdmin } = useAuth();
  const location = useLocation();

  if (!currentUser || !isSuperAdmin()) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

function MainLayout() {
  const { t } = useTranslation();
  
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <Outlet />
      </main>
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto py-8 px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.about.title')}</h3>
              <p className="text-gray-400">
                {t('footer.about.description')}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.links.title')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/" className="hover:text-white">{t('footer.links.home')}</Link>
                </li>
                <li>
                  <Link to="/productos" className="hover:text-white">{t('footer.links.products')}</Link>
                </li>
                <li>
                  <Link to="/carrito" className="hover:text-white">{t('footer.links.cart')}</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.contact.title')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{t('footer.contact.email')}</li>
                <li>{t('footer.contact.phone')}</li>
                <li>{t('footer.contact.address')}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </>
  );
}

function App() {
  return (
    <AlertProvider>
      <AuthProvider>
        <StoreProvider>
          <AdminProvider>
            <Router>
              <Routes>
                {/* Rutas de Administración */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
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
                  <Route path="/productos" element={<Products />} />
                  <Route path="/producto/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Navigate to="/carrito" replace />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </Router>
          </AdminProvider>
        </StoreProvider>
      </AuthProvider>
    </AlertProvider>
  );
}

export default App;
