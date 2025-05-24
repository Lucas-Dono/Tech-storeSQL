const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  // Upsert superadmin
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  if (!email || !password) {
    console.error('Define SUPERADMIN_EMAIL y SUPERADMIN_PASSWORD en .env.');
    process.exit(1);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const superadmin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: 'Super Admin',
      email,
      password: hashedPassword,
      role: 'superadmin'
    }
  });
  console.log('Superadmin seed OK:', superadmin.email);

  // Crear usuario admin
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = "admin123"; // Contraseña fija para demo/portafolio
  const adminName = process.env.ADMIN_NAME || 'Admin';
  
  if (adminEmail && adminPassword) {
    const adminHashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        name: adminName,
        email: adminEmail,
        password: adminHashedPassword,
        role: 'admin',
        createdById: superadmin.id
      }
    });
    console.log('Admin seed OK:', admin.email);
  }

  // Leer productos desde JSON
  const dataPath = path.resolve(__dirname, '../../src/data/products.json');
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
          createdById: superadmin.id
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
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  }); 