import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const FEATURED_CATEGORIES = [
  {
    name: 'Laptops',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1452&q=80',
  },
  {
    name: 'Smartphones',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
  },
  {
    name: 'Accesorios',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
  }
];

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCategoryClick = (category) => {
    navigate(`/productos?categoria=${category}`);
  };

  return (
    <div className="container-custom py-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('home.welcome')}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          {t('home.subtitle')}
        </p>
        <Link to="/productos" className="btn-primary text-lg">
          {t('home.viewProducts')}
        </Link>
      </div>

      {/* Featured Categories */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('home.featuredCategories')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED_CATEGORIES.map((category) => (
            <div
              key={category.name}
              className="card group cursor-pointer transform hover:scale-105 transition-transform duration-200"
              onClick={() => handleCategoryClick(category.name)}
            >
              <div className="relative h-40 rounded-lg overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <span className="text-xl font-semibold text-white">{category.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('home.whyChooseUs')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: t('home.qualityProducts.title'),
              description: t('home.qualityProducts.description')
            },
            {
              title: t('home.fastShipping.title'),
              description: t('home.fastShipping.description')
            },
            {
              title: t('home.support.title'),
              description: t('home.support.description')
            }
          ].map((feature) => (
            <div key={feature.title} className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center bg-blue-50 rounded-lg py-12 px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {t('home.readyToExplore')}
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          {t('home.discoverProducts')}
        </p>
        <Link to="/productos" className="btn-primary text-lg">
          {t('home.startShopping')}
        </Link>
      </div>
    </div>
  );
};

export default Home;
