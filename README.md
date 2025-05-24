# Tech Store

Una tienda en línea moderna construida con React, Node.js y Prisma.

## Características

- 🛍️ Catálogo de productos con búsqueda y filtros
- 🔐 Autenticación de usuarios
- 👤 Panel de administración
- 🌐 Soporte multiidioma
- 💳 Carrito de compras
- 📱 Diseño responsivo
- 🎨 Interfaz moderna y atractiva

## Tecnologías

- Frontend:
  - React
  - Tailwind CSS
  - Framer Motion
  - React Router
  - i18next

- Backend:
  - Node.js
  - Express
  - Prisma
  - PostgreSQL
  - JWT

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/Lucas-Dono/Tech-storeSQL.git
cd tech-store
```

2. Instala las dependencias:
```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd backend
npm install
```

3. Configura las variables de entorno:
```bash
# En la raíz del proyecto
cp .env.example .env

# En el directorio backend
cd backend
cp .env.example .env
```

4. Configura la base de datos:
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

5. Inicia el servidor de desarrollo:
```bash
# Terminal 1 (Frontend)
npm run dev

# Terminal 2 (Backend)
cd backend
npm run dev
```

## Estructura del Proyecto

```
tech-store/
├── src/                # Código fuente del frontend
│   ├── components/     # Componentes React
│   ├── pages/         # Páginas de la aplicación
│   ├── context/       # Contextos de React
│   ├── services/      # Servicios y APIs
│   └── utils/         # Utilidades
├── backend/           # Código fuente del backend
│   ├── prisma/        # Esquema y migraciones de Prisma
│   ├── src/           # Código fuente del servidor
│   └── uploads/       # Archivos subidos
└── public/            # Archivos estáticos
```

## Contribuir

1. Haz un Fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

Lucas Dono - [@Lucas_Dono](https://github.com/Lucas-Dono)

Link del proyecto: [https://github.com/Lucas-Dono/Tech-storeSQL](https://github.com/Lucas-Dono/Tech-storeSQL) 