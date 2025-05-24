const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  // Buscar superadmin para asignar createdById
  const superadmin = await prisma.user.findFirst({ where: { role: 'superadmin' } });
  if (!superadmin) {
    console.error('No se encontró superadmin. Asegúrate de inicializarlo primero.');
    process.exit(1);
  }

  // Leer productos desde JSON
  const dataPath = path.resolve(__dirname, '../src/data/products.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const { products } = JSON.parse(raw);

  for (const p of products) {
    try {
      await prisma.product.create({
        data: {
          name: p.name,
          name_es: p.name_es || p.name,
          name_en: p.name_en || p.name,
          description: p.description,
          description_es: p.description_es || p.description,
          description_en: p.description_en || p.description,
          basePrice: Number(p.basePrice),
          images: p.images || [],
          category: p.category,
          stock: Number(p.stock),
          variantType: p.variantType || 'SIMPLE',
          features: p.features || {},
          models: p.models || null,
          defaultConfiguration: p.defaultConfiguration || {},
          video: p.video || null,
          createdById: superadmin.id,
          // createdAt y updatedAt se asignan por defecto
        }
      });
      console.log(`Producto seed creado: ${p.name}`);
    } catch (e) {
      console.error(`Error creando producto ${p.name}:`, e.message);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => { await prisma.$disconnect(); }); 