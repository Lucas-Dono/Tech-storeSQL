import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';

const MainLayout = () => {
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
};

export default MainLayout; 