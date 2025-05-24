import { useState } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  ChartBarIcon,
  CubeIcon,
  PlusCircleIcon,
  UserGroupIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import AdminMobileNav from '../../components/AdminMobileNav';

const AdminLayout = () => {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout, isAdmin } = useAuth();
  const location = useLocation();

  const MENU_ITEMS = [
    {
      name: t('admin.dashboard'),
      path: '/admin',
      icon: ChartBarIcon
    },
    {
      name: t('admin.products'),
      path: '/admin/productos',
      icon: CubeIcon
    }
  ];

  // Verificar si el usuario es admin
  if (!currentUser || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Mobile Nav (Top + Bottom) */}
      <div className="lg:hidden">
        <AdminMobileNav />
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-40 w-64 bg-white shadow">
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-center border-b">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              TechStore
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t p-4">
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
              <p className="text-sm text-gray-500">{currentUser.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
              {t('admin.logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* Page Content */}
      <div className="lg:pl-64">
        <div className="py-6">
          <div className="px-4 sm:px-6 md:px-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
