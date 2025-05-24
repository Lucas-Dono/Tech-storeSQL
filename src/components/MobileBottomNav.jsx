import { HomeIcon, TagIcon, ChartBarIcon, DevicePhoneMobileIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const MobileBottomNav = () => {
  const { t } = useTranslation();
  const { currentUser, isAdmin } = useAuth();

  return (
    <>
      {/* Barra inferior de navegación en móvil: Home, Products, Admin o Smartphones/Laptops */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white lg:hidden shadow-inner border-t z-40">
        <div className="flex justify-around py-2">
          <Link to="/" className="flex flex-col items-center text-gray-700 hover:text-blue-600">
            <HomeIcon className="h-6 w-6" />
            <span className="text-xs">{t('nav.home')}</span>
          </Link>

          <Link to="/productos" className="flex flex-col items-center text-gray-700 hover:text-blue-600">
            <TagIcon className="h-6 w-6" />
            <span className="text-xs">{t('nav.products')}</span>
          </Link>

          {currentUser && isAdmin ? (
            <Link to="/admin" className="flex flex-col items-center text-gray-700 hover:text-blue-600">
              <ChartBarIcon className="h-6 w-6" />
              <span className="text-xs">{t('nav.admin')}</span>
            </Link>
          ) : (
            <>
              <Link to="/productos?category=smartphones" className="flex flex-col items-center text-gray-700 hover:text-blue-600">
                <DevicePhoneMobileIcon className="h-6 w-6" />
                <span className="text-xs">Smartphones</span>
              </Link>
              <Link to="/productos?category=laptops" className="flex flex-col items-center text-gray-700 hover:text-blue-600">
                <ComputerDesktopIcon className="h-6 w-6" />
                <span className="text-xs">Laptops</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav; 