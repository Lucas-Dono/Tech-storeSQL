# Tech Store

Tienda en línea de productos tecnológicos con panel de administración.

## Requisitos Previos

- Node.js >= 18.0.0
- npm >= 9.0.0

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/tech-store.git
cd tech-store
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```
Editar el archivo `.env` con tus credenciales.

## Desarrollo

Para iniciar el servidor de desarrollo:
```bash
npm run dev
```

## Producción

1. Construir la aplicación:
```bash
npm run build:prod
```

2. Iniciar el servidor de producción:
```bash
npm run start:prod
```

## Variables de Entorno

Crear un archivo `.env` con las siguientes variables:

```env
VITE_SECRET_KEY=tu-clave-secreta
VITE_JWT_SECRET=tu-clave-jwt
VITE_ADMIN_EMAIL=email@admin.com
VITE_ADMIN_PASSWORD=contraseña-segura
```

## Estructura del Proyecto

```
tech-store/
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── utils/
│   └── App.jsx
├── public/
├── server.js
└── package.json
```

## Características

- Autenticación de usuarios
- Panel de administración
- Gestión de productos
- Carrito de compras
- Comparación de productos
- Optimización de imágenes

## Seguridad

- Encriptación de contraseñas con PBKDF2
- Tokens JWT para sesiones
- Sanitización de inputs
- Validación de datos
- Protección de rutas admin

## Despliegue

1. Configurar el servidor con Node.js >= 18.0.0
2. Clonar el repositorio
3. Instalar dependencias: `npm install`
4. Configurar variables de entorno
5. Construir la aplicación: `npm run build:prod`
6. Iniciar el servidor: `npm run start:prod`

## Mantenimiento

- Actualizar dependencias regularmente
- Monitorear logs del servidor
- Realizar backups de la base de datos
- Mantener las variables de entorno seguras

## Licencia

MIT 