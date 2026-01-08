# 🚂 Guía Completa: Desplegar Backend Laravel en Railway

Esta guía te ayudará a desplegar el backend Laravel de ZetaCuts en Railway.com paso a paso.

---

## 📋 Requisitos Previos

1. ✅ Cuenta en [Railway.app](https://railway.app) (gratis con $5 de crédito)
2. ✅ Repositorio en GitHub con tu código
3. ✅ Frontend desplegado en Vercel (ya lo tienes)

---

## 🚀 PASO 1: Crear Cuenta en Railway

1. Ve a [railway.app](https://railway.app)
2. Haz clic en **"Start a New Project"**
3. Conecta con GitHub:
   - Haz clic en **"Login with GitHub"**
   - Autoriza Railway para acceder a tus repositorios
4. Si es tu primera vez, Railway te dará **$5 de crédito gratis** (suficiente para empezar)

---

## 🗄️ PASO 2: Crear Base de Datos PostgreSQL

### 2.1 Crear el servicio de base de datos

1. En el Dashboard de Railway, haz clic en **"New Project"** (si no tienes uno)
2. Haz clic en **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway creará automáticamente una base de datos PostgreSQL
4. **Anota el nombre** del servicio (ej: `postgres`)

### 2.2 Obtener las credenciales

1. Haz clic en el servicio de **PostgreSQL** que acabas de crear
2. Ve a la pestaña **"Variables"**
3. Aquí verás las variables de entorno que Railway genera automáticamente:
   - `PGHOST` (o `DATABASE_HOST`)
   - `PGPORT` (o `DATABASE_PORT`)
   - `PGDATABASE` (o `DATABASE_NAME`)
   - `PGUSER` (o `DATABASE_USER`)
   - `PGPASSWORD` (o `DATABASE_PASSWORD`)
   - `DATABASE_URL` (URL completa de conexión)

**IMPORTANTE**: Railway también crea estas variables automáticamente en tu servicio web cuando lo conectes. Más adelante las usaremos.

---

## 🔧 PASO 3: Crear Servicio Web para el Backend

### 3.1 Crear el servicio

1. En el mismo proyecto, haz clic en **"+ New"** → **"GitHub Repo"**
2. Selecciona tu repositorio: **`Proyectos-completos/ZetaCuts`**
3. Railway detectará automáticamente el proyecto

### 3.2 Configurar Root Directory

1. Haz clic en el servicio que acabas de crear
2. Ve a **"Settings"**
3. En **"Root Directory"**, escribe: **`backend`**
4. Haz clic en **"Update Settings"**

### 3.3 Configurar para usar Docker

1. En **"Settings"**, desplázate hasta **"Build & Deploy"**
2. **Railway debería detectar automáticamente el Dockerfile** en el directorio `backend/`
3. Si no lo detecta, verifica que el Root Directory esté configurado como `backend`

---

## 🔐 PASO 4: Configurar Variables de Entorno

### 4.1 Conectar la base de datos

Railway automáticamente inyecta las variables de la base de datos cuando conectas los servicios. Tienes dos opciones:

#### Opción A: Usar variables de referencia (Recomendado)

1. En el servicio web que creaste, ve a la pestaña **"Variables"**
2. Haz clic en **"Reference Variable"**
3. Selecciona tu servicio de **PostgreSQL**
4. Railway mostrará las variables disponibles:
   - `PGHOST` → Haz referencia como `DB_HOST`
   - `PGPORT` → Haz referencia como `DB_PORT`
   - `PGDATABASE` → Haz referencia como `DB_DATABASE`
   - `PGUSER` → Haz referencia como `DB_USERNAME`
   - `PGPASSWORD` → Haz referencia como `DB_PASSWORD`

#### Opción B: Usar DATABASE_URL

Railway también provee automáticamente `DATABASE_URL`. Si prefieres usar esto, el `docker-entrypoint.sh` ya está preparado para parsear la URL.

**Recomendación**: Usa la Opción A (variables de referencia) ya que es más explícita y fácil de debuggear.

### 4.2 Agregar variables de la aplicación

En la misma sección de **"Variables"**, agrega manualmente estas variables:

```bash
APP_NAME=ZetaCuts
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-backend.up.railway.app

DB_CONNECTION=pgsql

CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync

SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,*.vercel.app
```

**Nota**: 
- `APP_URL` lo obtendrás después del primer despliegue
- `DB_CONNECTION=pgsql` es importante para PostgreSQL

### 4.3 Generar APP_KEY

Railway ejecutará automáticamente el `docker-entrypoint.sh` que generará el `APP_KEY` si no está configurado. O puedes generarlo localmente:

```bash
cd backend
php artisan key:generate --show
```

Y agregarlo como variable de entorno `APP_KEY` en Railway.

---

## 🚢 PASO 5: Configurar el Despliegue

### 5.1 Configurar puerto

1. En **"Settings"** → **"Networking"**
2. Railway detecta automáticamente el puerto del Dockerfile (8000)
3. Si necesitas cambiar el puerto, Railway usa la variable `PORT` automáticamente

### 5.2 Configurar Health Check (Opcional)

1. En **"Settings"** → **"Healthcheck Path"**
2. Puedes configurar: `/api/barberos` (ruta pública de tu API)

---

## ✅ PASO 6: Desplegar

### 6.1 Primer despliegue

1. Una vez configuradas las variables, Railway comenzará automáticamente el despliegue
2. Ve a la pestaña **"Deployments"** para ver el progreso
3. El primer despliegue puede tardar **10-15 minutos** mientras:
   - Descarga las dependencias de Composer
   - Construye la imagen Docker
   - Ejecuta las migraciones

### 6.2 Obtener la URL del backend

1. Una vez desplegado, ve a **"Settings"** → **"Networking"**
2. Railway te dará una URL como: `https://zetacuts-production.up.railway.app`
3. **Copia esta URL** - la necesitarás para el frontend

### 6.3 Actualizar APP_URL

1. Ve a **"Variables"**
2. Actualiza `APP_URL` con la URL real de Railway que acabas de obtener:
   ```
   APP_URL=https://zetacuts-production.up.railway.app
   ```
3. Railway redesplegará automáticamente con la nueva variable

---

## 🔗 PASO 7: Conectar Frontend (Vercel) con Backend (Railway)

### 7.1 Configurar variable de entorno en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en **Settings** → **Environment Variables**
3. Haz clic en **"Add New"**
4. Configura:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://tu-backend.up.railway.app/api`
     (Reemplaza con tu URL real de Railway)
   - **Environments**: Selecciona todas (Production, Preview, Development)
5. Haz clic en **"Save"**

### 7.2 Redesplegar el frontend

1. En Vercel Dashboard, ve a **Deployments**
2. Haz clic en los **"⋯"** del último deployment
3. Selecciona **"Redeploy"**
4. O simplemente haz un nuevo push a GitHub

---

## ✅ PASO 8: Verificar que Todo Funciona

### 8.1 Verificar Backend

1. Ve a la URL de Railway: `https://tu-backend.up.railway.app`
2. Prueba la API: `https://tu-backend.up.railway.app/api/barberos`
3. Deberías ver una respuesta JSON (puede estar vacía si no hay datos)

### 8.2 Verificar Frontend

1. Ve a tu URL de Vercel
2. La aplicación debería cargar correctamente
3. Intenta hacer login o cualquier acción que requiera el backend
4. Abre la consola del navegador (F12) para verificar que las peticiones API funcionen

---

## 🐛 Solución de Problemas

### Problema: "No APP_KEY found"

**Solución**: 
- El `docker-entrypoint.sh` debería generarlo automáticamente
- Si no, genera uno localmente: `php artisan key:generate --show`
- Agrégalo como variable de entorno `APP_KEY` en Railway

### Problema: "Database connection failed"

**Solución**:
1. Verifica que el servicio de PostgreSQL esté creado y funcionando
2. Verifica que las variables de referencia estén configuradas correctamente
3. Asegúrate de que `DB_CONNECTION=pgsql` esté configurado
4. Revisa los logs en Railway: pestaña **"Deployments"** → **"View Logs"**

### Problema: "Migration failed"

**Solución**:
1. El `docker-entrypoint.sh` ejecuta las migraciones automáticamente
2. Si fallan, revisa los logs en Railway
3. Verifica que la base de datos esté accesible
4. Puedes ejecutar manualmente en Railway: pestaña **"Deployments"** → **"View Logs"** → busca errores

### Problema: CORS errors en el frontend

**Solución**:
- Ya está configurado en `backend/config/cors.php` para aceptar `*.vercel.app`
- Si tu dominio de Vercel es diferente, agrégalo manualmente
- O agrega `FRONTEND_URL` como variable de entorno y úsala en la configuración de CORS

### Problema: Servicio no inicia

**Solución**:
1. Revisa los logs en Railway: pestaña **"Deployments"** → **"View Logs"**
2. Verifica que el Dockerfile esté correcto
3. Verifica que el Root Directory esté configurado como `backend`
4. Asegúrate de que todas las variables de entorno estén correctas

---

## 📊 URLs Finales

Una vez desplegado, tendrás:

- **Frontend**: `https://tu-frontend.vercel.app`
- **Backend API**: `https://tu-backend.up.railway.app/api`
- **Base de Datos**: Interna en Railway (no accesible externamente)

---

## 💡 Consejos y Mejores Prácticas

### Variables de Entorno

- **Usa variables de referencia** cuando sea posible (para la base de datos)
- **No subas el `.env`** al repositorio
- Railway maneja automáticamente las credenciales de la base de datos

### Logs

- Revisa los logs regularmente en Railway: **Deployments** → **View Logs**
- Los logs te ayudarán a debuggear problemas

### Dominio Personalizado

Si quieres un dominio personalizado:
1. En Railway: **Settings** → **Networking** → **Custom Domain**
2. Sigue las instrucciones para configurar el DNS

### Planes de Railway

- **Starter Plan**: Gratis con $5 de crédito/mes
- El plan gratuito es suficiente para proyectos pequeños
- Si necesitas más recursos, Railway cobra por uso

---

## 🔄 Actualizar el Backend

Cada vez que hagas push a GitHub:

1. Railway detecta automáticamente los cambios
2. Comienza un nuevo despliegue
3. El proceso toma aproximadamente **5-10 minutos**
4. Puedes ver el progreso en **Deployments**

---

## 🎉 ¡Listo!

Una vez completados todos los pasos:

1. ✅ Backend desplegado en Railway
2. ✅ Base de datos PostgreSQL funcionando
3. ✅ Migraciones ejecutadas
4. ✅ Frontend conectado al backend
5. ✅ Aplicación completa funcionando

---

## 🆘 ¿Necesitas Ayuda?

Si encuentras problemas:

1. **Revisa los logs** en Railway (Deployments → View Logs)
2. **Verifica las variables de entorno** están correctas
3. **Asegúrate de que la base de datos** esté creada y conectada
4. **Revisa que el Root Directory** esté configurado como `backend`

---

**¡Feliz despliegue! 🚀**

