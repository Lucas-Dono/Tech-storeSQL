import { useTranslation } from 'react-i18next';
import { LanguageIcon } from '@heroicons/react/24/outline';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
      title={i18n.language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      <LanguageIcon className="h-5 w-5" />
      <span className="uppercase">{i18n.language}</span>
    </button>
  );
};

export default LanguageSelector; 