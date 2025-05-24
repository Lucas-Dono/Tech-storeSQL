import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, ChartBarIcon, CubeIcon, PlusCircleIcon, UserGroupIcon, ArrowLeftIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const AdminMobileNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isSuperAdmin } = useAuth();

  // Mapeo de rutas a título
  const routeTitles = {
    '/admin': t('admin.dashboard'),
    '/admin/productos': t('admin.products'),
    '/admin/create-product': t('admin.addProduct'),
    '/admin/users': t('nav.userManagement')
  };

  const currentTitle = routeTitles[location.pathname] || '';

  return (
    <>
      {/* Top Navigation para admin en móvil */}
      <nav className="bg-white shadow-md sticky top-0 z-50 lg:hidden">
        <div className="flex items-center justify-between px-4 h-12">
          {/* Botón Volver desde cualquier pantalla admin */}
          <button onClick={() => navigate(-1)} className="text-gray-600">
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <span className="text-sm font-medium truncate">{currentTitle}</span>
          {/* Botón Cuenta en lugar de logout */}
          <Link to="/auth" className="text-gray-600">
            <UserCircleIcon className="h-6 w-6" />
          </Link>
        </div>
      </nav>

      {/* Bottom Navigation para admin en móvil */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white lg:hidden shadow-inner border-t z-50">
        <div className="flex justify-around py-2">
          {/* Botón Volver global */}
          <button
            onClick={() => navigate(-1)}
            className="flex flex-col items-center text-gray-700 hover:text-blue-600"
          >
            <ArrowLeftIcon className="h-6 w-6" />
            <span className="text-xs">{t('common.exit')}</span>
          </button>

          <Link
            to="/admin"
            className={`flex flex-col items-center text-gray-700 hover:text-blue-600 ${location.pathname === '/admin' ? 'text-blue-600' : ''}`}
          >
            <HomeIcon className="h-6 w-6" />
            <span className="text-xs">{t('admin.dashboard')}</span>
          </Link>

          <Link
            to="/admin/productos"
            className={`flex flex-col items-center text-gray-700 hover:text-blue-600 ${location.pathname === '/admin/productos' ? 'text-blue-600' : ''}`}
          >
            <CubeIcon className="h-6 w-6" />
            <span className="text-xs">{t('admin.products')}</span>
          </Link>

          {isSuperAdmin && (
            <Link
              to="/admin/users"
              className={`flex flex-col items-center text-gray-700 hover:text-blue-600 ${location.pathname === '/admin/users' ? 'text-blue-600' : ''}`}
            >
              <UserGroupIcon className="h-6 w-6" />
              <span className="text-xs">{t('nav.userManagement')}</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default AdminMobileNav; 