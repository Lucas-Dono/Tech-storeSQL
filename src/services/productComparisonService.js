const API_URL = import.meta.env.VITE_API_URL || '';

// Cliente para obtener productos comparables desde el backend
export const productComparisonService = {
  async getComparableProducts(productId) {
    const res = await fetch(`${API_URL}/api/products/compare-products?productId=${productId}`);
    if (!res.ok) throw new Error('Error al obtener productos comparables');
    const data = await res.json();
    return data;
  }
}; 