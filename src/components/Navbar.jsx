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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { getCartItemsCount } = useStore();
  const { currentUser, logout } = useAuth();
  const { t } = useTranslation();

  const handleCategoryClick = (category) => {
    navigate(`/productos?category=${category.toLowerCase()}`);
    setShowCategories(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
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
            {/* Language Selector */}
            <LanguageSelector />

            {/* Mobile Auth Button */}
            <div className="lg:hidden">
              {currentUser ? (
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <UserCircleIcon className="h-6 w-6" />
                  <span className="text-sm truncate max-w-[80px]">{currentUser.name}</span>
                </button>
              ) : (
                <Link 
                  to="/auth" 
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-gray-600" />
              )}
            </button>

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
                  <div>
                    <button
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                      onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                      <UserCircleIcon className="h-6 w-6" />
                      <span className="text-sm">{currentUser.name}</span>
                    </button>
                    
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 animate-slide-down">
                        <div className="px-4 py-2 text-sm text-gray-500">
                          {currentUser.email}
                        </div>
                        {currentUser.isAdmin && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setShowUserMenu(false)}
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 bg-white rounded-lg shadow-lg py-2 animate-slide-down">
            <Link
              to="/"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.home')}
            </Link>

            <div className="px-4 py-2">
              <div className="text-sm font-medium text-gray-500 mb-2">
                {t('nav.categories')}
              </div>
              <div className="space-y-1">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {currentUser && (
              <div className="px-4 space-y-2">
                <div className="text-sm text-gray-500">
                  {currentUser.email}
                </div>
                {currentUser.isAdmin && (
                  <Link
                    to="/admin"
                    className="block text-sm text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <ChartBarIcon className="h-5 w-5" />
                      {t('nav.admin')}
                    </div>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  {t('auth.logout')}
                </button>
              </div>
            )}
          </div>
        )}

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
                  setIsMobileMenuOpen(false);
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
