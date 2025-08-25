# 🚀 Configuración del Repositorio GitHub

## Pasos para crear el repositorio en GitHub:

### 1. Crear repositorio en GitHub
1. Ve a [GitHub.com](https://github.com)
2. Haz clic en "New repository" o el botón "+" verde
3. Configura el repositorio:
   - **Repository name**: `dactilo-backend`
   - **Description**: `Backend API para aplicación de dactilografía`
   - **Visibility**: Public
   - **NO** marques "Add a README file" (ya tenemos uno)
   - **NO** marques "Add .gitignore" (ya tenemos uno)
   - **NO** marques "Choose a license" (ya tenemos uno)

### 2. Conectar repositorio local con GitHub
Una vez creado el repositorio, ejecuta estos comandos:

```bash
# Agregar el repositorio remoto (reemplaza TU_USUARIO con tu nombre de usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/dactilo-backend.git

# Hacer push del código
git branch -M main
git push -u origin main
```

### 3. Variables de entorno para Vercel
Una vez que tengas el repositorio en GitHub, configura estas variables en Vercel:

- `NEON_CONNECTION_STRING`: Tu string de conexión a PostgreSQL
- `JWT_SECRET`: `446c3edeaf286db9138e48863058ce3af3c53fd1fb2b71b89176742ae4b470bc35750747f9082114dde5d79fcfafd4bcf69282f26c89d0b839247680305dca2e`

### 4. Deploy en Vercel
1. Ve a [Vercel.com](https://vercel.com)
2. Importa el repositorio `dactilo-backend`
3. Configura las variables de entorno
4. Deploy automático

## 📋 Comandos rápidos para después del setup:

```bash
# Verificar estado
git status

# Agregar cambios
git add .

# Commit cambios
git commit -m "Descripción de los cambios"

# Push a GitHub
git push

# Ver logs
git log --oneline
```

## 🔗 URLs importantes:
- **Repositorio**: `https://github.com/TU_USUARIO/dactilo-backend`
- **API Local**: `http://localhost:3000`
- **API Vercel**: `https://dactilo-backend.vercel.app` (después del deploy)
