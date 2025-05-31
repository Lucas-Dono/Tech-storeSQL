// Cliente para obtener productos comparables desde el backend
export const productComparisonService = {
  async getComparableProducts(productId) {
    const res = await fetch(`/api/products/compare-products?productId=${productId}`);
    if (!res.ok) throw new Error('Error al obtener productos comparables');
    return res.json();
  }
}; 