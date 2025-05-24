export const PRODUCTS = [
  {
    id: 1,
    name: 'Laptop Pro X',
    description: 'Potente laptop con procesador de última generación, perfecta para profesionales y creativos. Diseñada para ofrecer el máximo rendimiento en un diseño elegante y portátil.',
    price: 1299.99,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1452&q=80',
    videoId: 'ZBwvrPoqx4E',
    category: 'Laptops',
    specs: {
      processor: {
        options: ['Intel Core i5', 'Intel Core i7', 'Intel Core i9'],
        default: 'Intel Core i5'
      },
      ram: {
        options: ['8GB', '16GB', '32GB'],
        default: '8GB'
      },
      storage: {
        options: ['256GB SSD', '512GB SSD', '1TB SSD'],
        default: '256GB SSD'
      },
      screen: '15.6" 4K OLED',
      graphics: 'NVIDIA RTX 3060 6GB',
      battery: 'Hasta 10 horas',
      ports: ['3x USB-C', '2x USB-A', 'HDMI', 'Audio jack'],
      weight: '1.8 kg'
    }
  },
  {
    id: 2,
    name: 'Smartphone Ultra',
    description: 'Smartphone de última generación con cámara profesional y pantalla AMOLED. Experimenta la fotografía móvil en su máxima expresión con nuestro sistema de cámaras más avanzado.',
    price: 899.99,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    videoId: '0CKX7z6dAKo',
    category: 'Smartphones',
    specs: {
      ram: {
        options: ['8GB', '12GB'],
        default: '8GB'
      },
      storage: {
        options: ['128GB', '256GB', '512GB'],
        default: '128GB'
      },
      screen: '6.7" AMOLED 120Hz',
      processor: 'Snapdragon 8 Gen 2',
      camera: '108MP principal + 12MP ultra + 10MP tele',
      battery: '5000mAh',
      charging: '45W rápida + inalámbrica',
      colors: {
        options: ['Negro Espacial', 'Plata', 'Azul Océano'],
        default: 'Negro Espacial'
      }
    }
  },
  {
    id: 3,
    name: 'Auriculares Pro',
    description: 'Auriculares inalámbricos con cancelación de ruido activa y calidad de sonido excepcional. Perfectos para disfrutar de tu música sin distracciones.',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    videoId: 'fcMNtvNsg3A',
    category: 'Accesorios',
    specs: {
      type: 'Over-ear inalámbrico',
      driver: '40mm de alta resolución',
      battery: 'Hasta 30 horas',
      anc: 'Cancelación de ruido activa',
      connectivity: 'Bluetooth 5.0',
      features: ['Modo ambiente', 'Control táctil', 'Asistente de voz'],
      colors: {
        options: ['Negro', 'Plata'],
        default: 'Negro'
      }
    }
  }
];

export const getProductById = (id) => {
  return PRODUCTS.find(product => product.id === Number(id));
};

export const getProductsByCategory = (category) => {
  if (!category) return PRODUCTS;
  return PRODUCTS.filter(product => product.category === category);
};

export const getYouTubeEmbedUrl = (videoId) => {
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&start=0&end=30&enablejsapi=1&playlist=${videoId}&loop=0`;
};

export const getConfigurableSpecs = (specs) => {
  return Object.entries(specs).reduce((acc, [key, value]) => {
    if (value && typeof value === 'object' && 'options' in value) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

export const getNonConfigurableSpecs = (specs) => {
  return Object.entries(specs).reduce((acc, [key, value]) => {
    if (!value || typeof value !== 'object' || !('options' in value)) {
      acc[key] = value;
    }
    return acc;
  }, {});
};
