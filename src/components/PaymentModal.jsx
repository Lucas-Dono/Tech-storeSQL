import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../context/AlertContext';
import { useTranslation } from 'react-i18next';

const PaymentModal = ({ isOpen, onClose, total, onSuccess }) => {
  const { t } = useTranslation();
  const { error, success, info } = useAlert();
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiryDate, setExpiryDate] = useState('12/30');
  const [cvv, setCvv] = useState('123');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const validateForm = () => {
    if (!cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      error(t('payment.validationErrors.cardNumber'), t('payment.error'));
      return false;
    }

    if (!expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      error(t('payment.validationErrors.expiryDate'), t('payment.error'));
      return false;
    }

    const [month, year] = expiryDate.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const now = new Date();
    if (expiry < now) {
      error(t('payment.validationErrors.expiredCard'), t('payment.error'));
      return false;
    }

    if (!cvv.match(/^\d{3}$/)) {
      error(t('payment.validationErrors.cvv'), t('payment.error'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    info(t('payment.processing'), t('payment.pleaseWait'));

    // Simular procesamiento de pago
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsProcessing(false);
      setShowSuccess(true);
      success(
        t('payment.successDetails', { amount: total.toLocaleString() }),
        t('payment.paymentSuccess')
      );
      onSuccess();
    } catch (err) {
      setIsProcessing(false);
      error(t('payment.errorMessage'), t('payment.paymentError'));
    }
  };

  const handleBackToHome = () => {
    onClose();
    navigate('/');
    success(t('payment.successMessage'), t('payment.success'));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className={`bg-white rounded-lg w-full ${isMobile ? 'max-h-full h-full' : 'max-w-md'} ${isMobile ? 'p-4' : 'p-6'} relative animate-slide-up`}>
        {!showSuccess ? (
          <>
            <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-6`}>
              {t('payment.title')}
            </h2>
            
            {/* Mensaje de demostración */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <p className="text-sm text-blue-700">
                {t('payment.demoNotice')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('payment.amountToPay')}
                </label>
                <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-blue-600 mb-4`}>
                  ${total.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('payment.cardNumber')}
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength="19"
                  disabled={isProcessing}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('payment.expiryDate')}
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="MM/YY"
                    maxLength="5"
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('payment.cvv')}
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength="3"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-3 text-lg mt-6 disabled:opacity-50"
                disabled={isProcessing}
              >
                {isProcessing ? t('payment.processing') : t('cart.checkout')}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8 px-4">
            <div className="mb-6 relative">
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 md:w-20 md:h-20 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3H19.2L21 14H5L3 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 14L3 3H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 21C8.10457 21 9 20.1046 9 19C9 17.8954 8.10457 17 7 17C5.89543 17 5 17.8954 5 19C5 20.1046 5.89543 21 7 21Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M19 14H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="absolute top-0 right-1/3 bg-green-500 rounded-full p-2 shadow-lg animate-bounce">
                <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            </div>
            <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 mb-4`}>
              {t('payment.success')}
            </h2>
            <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-gray-600 mb-8`}>
              {t('payment.successMessage')}
            </p>
            <button
              onClick={handleBackToHome}
              className="btn-primary w-full py-3 text-base"
            >
              {t('payment.backToHome')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

PaymentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default PaymentModal;
