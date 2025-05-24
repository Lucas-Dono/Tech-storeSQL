import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAlert } from '../context/AlertContext';
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import PaymentModal from '../components/PaymentModal';
import { useTranslation } from 'react-i18next';

const Cart = () => {
  const { t } = useTranslation();
  console.log('Cart component rendering');
  
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal,
    clearCart 
  } = useStore();
  
  console.log('Current cart state:', cart);
  
  const { success, warning } = useAlert();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    console.log('Cart mounted or updated:', cart);
  }, [cart]);

  const handlePaymentSuccess = () => {
    clearCart();
    success(t('payment.successDetails', { amount: getCartTotal().toLocaleString() }), t('payment.paymentSuccess'));
  };

  const handleRemoveItem = (itemId, itemName) => {
    removeFromCart(itemId);
    warning(t('cart.itemRemoved'));
  };

  const handleClearCart = () => {
    if (window.confirm(t('cart.clearCartConfirm'))) {
      clearCart();
      warning(t('cart.itemsCleared'));
    }
  };

  const handleUpdateQuantity = (itemId, newQuantity, itemName) => {
    updateQuantity(itemId, newQuantity);
    if (newQuantity === 1) {
      warning(t('products.minQuantity'));
    }
  };

  // Renderizado cuando el carrito está vacío
  if (!cart || cart.length === 0) {
    console.log('Rendering empty cart view');
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('cart.empty')}</h1>
        <p className="text-gray-600 mb-8">{t('cart.emptyMessage')}</p>
        <Link 
          to="/productos" 
          className="btn-primary inline-block"
        >
          {t('cart.continueShopping')}
        </Link>
      </div>
    );
  }

  // Renderizado cuando hay items en el carrito
  console.log('Rendering cart with items');
  return (
    <div className="container-custom py-8 debug-cart-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('cart.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div 
              key={item.id} 
              className="card flex items-center gap-4 animate-slide-up"
            >
              <Link to={`/producto/${item.id}`} className="shrink-0">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-md hover:opacity-80 transition-opacity"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link 
                  to={`/producto/${item.id}`}
                  className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-1"
                >
                  {item.name}
                </Link>
                {item.selectedOptions && Object.entries(item.selectedOptions).length > 0 && (
                  <div className="text-sm text-gray-500 mt-1">
                    {Object.entries(item.selectedOptions).map(([key, value]) => (
                      <div key={key}>
                        <span className="capitalize">{key}:</span> {value}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-blue-600 font-bold mt-1">
                  ${(item.price || 0).toLocaleString()}
                </p>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex items-center border rounded-md overflow-hidden">
                    <button
                      className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.name)}
                      disabled={item.quantity <= 1}
                      aria-label={t('cart.decreaseQuantity')}
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 border-x text-center min-w-[3rem]">
                      {item.quantity}
                    </span>
                    <button
                      className="p-2 hover:bg-gray-100 transition-colors"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.name)}
                      aria-label={t('cart.increaseQuantity')}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    className="text-red-500 hover:text-red-700 transition-colors p-2"
                    onClick={() => handleRemoveItem(item.id, item.name)}
                    aria-label={t('cart.removeItem')}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{t('cart.subtotal')}</p>
                <p className="text-lg font-bold text-gray-900">
                  ${((item.price || 0) * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))}

          <button
            className="text-red-500 hover:text-red-700 transition-colors mt-4"
            onClick={handleClearCart}
          >
            {t('cart.clearCart')}
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('cart.orderSummary')}</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>{t('cart.subtotal')}</span>
                <span>${getCartTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t('cart.shipping')}</span>
                <span>{t('cart.shippingFree')}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>{t('cart.total')}</span>
                  <span>${getCartTotal().toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{t('cart.taxesIncluded')}</p>
              </div>
            </div>
            <button 
              className="w-full btn-primary py-3 text-lg mt-6"
              onClick={() => setShowPaymentModal(true)}
            >
              {t('cart.checkout')}
            </button>
            <Link 
              to="/productos"
              className="block text-center mt-4 text-blue-600 hover:text-blue-700 transition-colors"
            >
              {t('cart.continueShopping')}
            </Link>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={getCartTotal()}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Cart;
