import { useState } from 'react';
import { ShoppingCartIcon, UserCircleIcon, ChartBarIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

const CATEGORIES = [
  'Laptops',
  'Smartphones',
  'Tablets',
  'Monitores',
  'Accesorios'
];

const Navbar = () => {
  const [showCategories, setShowCategories] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { getCartItemsCount } = useStore();
  const { currentUser, logout, isAdmin, isSuperAdmin } = useAuth();
  const { t } = useTranslation();

  const handleCategoryClick = (category) => {
    navigate(`/productos?category=${category.toLowerCase()}`);
    setShowCategories(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
    setShowUserMenu(false);
  };

  const cartItemsCount = getCartItemsCount();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
            TechStore
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Language Selector - Ocultar en móvil (lg:hidden) */}
            <div className="hidden lg:block">
              <LanguageSelector />
            </div>

            {/* Mobile Auth Button */}
            <div className="lg:hidden">
              {currentUser ? (
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <UserCircleIcon className="h-6 w-6" />
                  {/* <span className="text-sm truncate max-w-[80px]">{currentUser.name}</span> */} {/* Ocultar nombre */}
                </button>
              ) : (
                <Link 
                  to="/auth" 
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <UserCircleIcon className="h-6 w-6" />
                  <span className="text-sm">{t('auth.login')}</span>
                </Link>
              )}
            </div>

            {/* Mobile Cart Icon */}
            <div className="lg:hidden">
              <Link 
                to="/carrito" 
                className="relative group"
              >
                <ShoppingCartIcon className="h-6 w-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center group-hover:bg-blue-700 transition-colors animate-scale-in">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {t('nav.home')}
              </Link>

              <div className="relative group">
                <button
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setShowCategories(!showCategories)}
                >
                  {t('nav.categories')}
                </button>
                
                {showCategories && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 animate-slide-down">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryClick(category)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link 
                to="/carrito" 
                className="relative group"
              >
                <ShoppingCartIcon className="h-6 w-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center group-hover:bg-blue-700 transition-colors animate-scale-in">
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              <div className="relative">
                {currentUser ? (
                  <div className="relative group">
                    <button
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    >
                      <UserCircleIcon className="h-6 w-6" />
                      <span className="text-sm">{currentUser.name}</span>
                    </button>

                    {/* Menú desplegable */}
                    {isProfileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                        {/* Opción de Admin solo para admin y superadmin */}
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            Panel de Admin
                          </Link>
                        )}

                        {/* Gestión de Usuarios solo para superadmin */}
                        {isSuperAdmin && (
                          <Link
                            to="/admin/users"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            Gestión de Usuarios
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            logout();
                            setIsProfileMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Cerrar Sesión
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link 
                    to="/auth" 
                    className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                  >
                    <UserCircleIcon className="h-6 w-6" />
                    <span className="text-sm">{t('auth.login')}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile User Menu Dropdown */}
        {showUserMenu && currentUser && (
          <div className="lg:hidden fixed top-16 right-4 w-48 bg-white rounded-md shadow-lg py-1 animate-slide-down">
            <div className="px-4 py-2 text-sm text-gray-500">
              {currentUser.email}
            </div>
            {currentUser.isAdmin && (
              <Link
                to="/admin"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setShowUserMenu(false);
                }}
              >
                <div className="flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5" />
                  {t('nav.admin')}
                </div>
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
            >
              {t('auth.logout')}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
