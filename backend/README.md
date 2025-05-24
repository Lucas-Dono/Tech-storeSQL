# Tech Store Backend

Backend para la aplicación Tech Store, construido con Node.js, Express y MongoDB.

## Características

- Autenticación JWT
- Roles de usuario (user, admin, superadmin)
- API RESTful
- Manejo de productos y variantes
- Seguridad mejorada (helmet, rate limiting, CORS)
- Validación de datos
- Manejo de errores centralizado

## Requisitos

- Node.js >= 14.0.0
- MongoDB Atlas cuenta
- Variables de entorno configuradas

## Variables de Entorno

Crear un archivo `.env` con las siguientes variables:

```
PORT=5000
MONGODB_URI=tu_uri_de_mongodb
JWT_SECRET=tu_jwt_secret
CORS_ORIGIN=url_del_frontend
NODE_ENV=development|production

# Credenciales Superadmin
SUPERADMIN_EMAIL=email
SUPERADMIN_PASSWORD=password
SUPERADMIN_NAME=nombre
```

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```
3. Configurar variables de entorno
4. Iniciar el servidor:
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Endpoints API

### Autenticación

- POST /api/auth/register - Registrar nuevo usuario
- POST /api/auth/login - Iniciar sesión
- GET /api/auth/profile - Obtener perfil (protegido)
- POST /api/auth/create-admin - Crear admin (solo superadmin)

## Despliegue

El backend está configurado para ser desplegado en Render:

1. Conectar repositorio a Render
2. Configurar variables de entorno
3. Seleccionar rama main
4. Usar `npm install` como comando de instalación
5. Usar `npm start` como comando de inicio

## Seguridad

- Helmet para headers HTTP seguros
- Rate limiting para prevenir ataques de fuerza bruta
- CORS configurado para el frontend
- Validación de datos en todas las rutas
- Sanitización de entradas
- Manejo seguro de contraseñas con bcrypt 