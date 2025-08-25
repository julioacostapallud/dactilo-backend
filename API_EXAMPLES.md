# Ejemplos de Uso de la API de Dactilo

## 🔐 Autenticación

### Registrar un nuevo usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "123456",
    "nombre": "Juan",
    "apellido": "Pérez"
  }'
```

**Respuesta:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "rol": "usuario"
  }
}
```

### Iniciar sesión
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "123456"
  }'
```

**Respuesta:**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "rol": "usuario"
  }
}
```

## 📝 Ejercicios

### Obtener todos los ejercicios
```bash
curl -X GET http://localhost:3000/api/ejercicios
```

### Obtener ejercicios por dificultad
```bash
curl -X GET "http://localhost:3000/api/ejercicios?dificultad=facil"
```

### Obtener ejercicios por categoría
```bash
curl -X GET "http://localhost:3000/api/ejercicios?categoria=frases&limit=5"
```

### Crear un nuevo ejercicio
```bash
curl -X POST http://localhost:3000/api/ejercicios \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Ejercicio básico",
    "descripcion": "Texto simple para principiantes",
    "texto": "El veloz murciélago hindú comía feliz cardillo y kiwi. La cigüeña tocaba el saxofón detrás del palenque de paja.",
    "dificultad": "facil",
    "categoria": "frases"
  }'
```

## 📊 Resultados

### Guardar resultado de prueba
```bash
curl -X POST http://localhost:3000/api/resultados \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "ejercicio_id": 1,
    "velocidad_wpm": 45,
    "precision_porcentaje": 95.5,
    "tiempo_segundos": 120,
    "errores": 3
  }'
```

### Obtener resultados de un usuario
```bash
curl -X GET "http://localhost:3000/api/resultados?usuario_id=1&limit=10"
```

## 🗄️ Utilidades

### Inicializar base de datos
```bash
curl -X POST http://localhost:3000/api/init-db
```

### Obtener estructura completa de la base de datos
```bash
curl -X GET http://localhost:3000/api/db/structure
```

### Ejecutar operaciones DDL en la base de datos
```bash
# Crear una nueva tabla
curl -X POST http://localhost:3000/api/db/execute \
  -H "Content-Type: application/json" \
  -d '{
    "query": "CREATE TABLE ejemplo (id SERIAL PRIMARY KEY, nombre VARCHAR(100))",
    "description": "Crear tabla de ejemplo"
  }'

# Agregar una columna a una tabla existente
curl -X POST http://localhost:3000/api/db/execute \
  -H "Content-Type: application/json" \
  -d '{
    "query": "ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20)",
    "description": "Agregar columna teléfono a usuarios"
  }'

# Eliminar una tabla
curl -X POST http://localhost:3000/api/db/execute \
  -H "Content-Type: application/json" \
  -d '{
    "query": "DROP TABLE IF EXISTS ejemplo",
    "description": "Eliminar tabla de ejemplo"
  }'
```

## 🔒 Endpoints Protegidos

Para usar endpoints protegidos, incluye el token JWT en el header:

```bash
curl -X GET http://localhost:3000/api/protected/ejemplo \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 📱 Ejemplo con JavaScript/Fetch

```javascript
// Login
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'usuario@ejemplo.com',
    password: '123456'
  })
});

const loginData = await loginResponse.json();
const token = loginData.token;

// Usar el token para endpoints protegidos
const ejerciciosResponse = await fetch('http://localhost:3000/api/ejercicios', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const ejercicios = await ejerciciosResponse.json();
```

## 🐛 Códigos de Error Comunes

- `400` - Datos inválidos o faltantes
- `401` - No autorizado (token inválido o faltante)
- `409` - Conflicto (email ya registrado)
- `500` - Error interno del servidor

## 📋 Notas Importantes

1. **JWT Token**: Los tokens expiran en 24 horas
2. **CORS**: Configurado para permitir todas las origenes en desarrollo
3. **Validación**: Todos los endpoints validan los datos de entrada
4. **Base de datos**: Usa PostgreSQL con Neon como proveedor recomendado
