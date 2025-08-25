# Dactilo Backend API

Backend API para la aplicación de dactilografía desarrollada con Next.js, TypeScript y PostgreSQL.

## 🚀 Características

- **Autenticación JWT**: Sistema de registro y login de usuarios
- **Gestión de ejercicios**: CRUD para ejercicios de dactilografía
- **Resultados de pruebas**: Almacenamiento y consulta de resultados de velocidad y precisión
- **Base de datos PostgreSQL**: Usando Neon como proveedor
- **API RESTful**: Endpoints bien estructurados y documentados

## 📋 Requisitos

- Node.js 18+ 
- PostgreSQL (recomendado Neon)
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd Dactilo-backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crear un archivo `.env.local` con las siguientes variables:

```env
NEON_CONNECTION_STRING=postgresql://user:password@host:port/database
JWT_SECRET=tu_jwt_secret_super_seguro
```

4. **Inicializar la base de datos**
```bash
curl -X POST http://localhost:3000/api/init-db
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

## 🌐 Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión

### Ejercicios
- `GET /api/ejercicios` - Obtener ejercicios (con filtros opcionales)
- `POST /api/ejercicios` - Crear nuevo ejercicio

### Resultados
- `POST /api/resultados` - Guardar resultado de prueba
- `GET /api/resultados?usuario_id=X` - Obtener resultados de usuario

### Utilidades
- `POST /api/init-db` - Inicializar tablas de base de datos
- `GET /api/db/structure` - Obtener estructura completa de la base de datos
- `POST /api/db/execute` - Ejecutar operaciones DDL (CREATE, ALTER, DROP, etc.)

## 🗄️ Estructura de la Base de Datos

### Tabla: usuarios
- `id` (SERIAL PRIMARY KEY)
- `email` (VARCHAR UNIQUE)
- `password_hash` (VARCHAR)
- `nombre` (VARCHAR)
- `apellido` (VARCHAR)
- `rol` (VARCHAR DEFAULT 'usuario')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Tabla: ejercicios
- `id` (SERIAL PRIMARY KEY)
- `titulo` (VARCHAR)
- `descripcion` (TEXT)
- `texto` (TEXT)
- `dificultad` (VARCHAR DEFAULT 'facil')
- `categoria` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Tabla: resultados
- `id` (SERIAL PRIMARY KEY)
- `usuario_id` (INTEGER REFERENCES usuarios)
- `ejercicio_id` (INTEGER REFERENCES ejercicios)
- `velocidad_wpm` (INTEGER)
- `precision_porcentaje` (DECIMAL)
- `tiempo_segundos` (INTEGER)
- `errores` (INTEGER DEFAULT 0)
- `created_at` (TIMESTAMP)

## 🚀 Despliegue en Vercel

1. **Variables de entorno requeridas en Vercel:**
   - `NEON_CONNECTION_STRING`: String de conexión a PostgreSQL
   - `JWT_SECRET`: Clave secreta para JWT

2. **Comandos de build:**
   - Build Command: `npm run build`
   - Output Directory: `.next`

## 📝 Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Ejecutar en modo producción
- `npm run lint` - Ejecutar linter

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- JWT para autenticación
- Validación de datos en todos los endpoints
- CORS configurado para desarrollo

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
