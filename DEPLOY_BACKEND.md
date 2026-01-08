# Guía de Despliegue del Backend en Render

Esta guía te ayudará a desplegar el backend Laravel de ZetaCuts en Render.com.

## 📋 Requisitos Previos

1. Cuenta en [Render.com](https://render.com) (gratuita)
2. Repositorio en GitHub con tu código
3. URL del frontend desplegado en Vercel

## 🚀 Paso 1: Crear Base de Datos PostgreSQL

1. Ve a tu [Dashboard de Render](https://dashboard.render.com)
2. Haz clic en **"New +"** → **"PostgreSQL"**
3. Configura:
   - **Name**: `zetacuts-db` (o el nombre que prefieras)
   - **Database**: `zetacuts`
   - **User**: Se generará automáticamente
   - **Region**: Elige la más cercana
   - **PostgreSQL Version**: 14 o superior
   - **Plan**: Free (para empezar)
4. Haz clic en **"Create Database"**
5. **Importante**: Anota las credenciales que aparecen:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_DATABASE`
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `INTERNAL_DATABASE_URL` (URL completa)

## 🔧 Paso 2: Crear Servicio Web (Backend)

1. En el Dashboard de Render, haz clic en **"New +"** → **"Web Service"**
2. Conecta tu repositorio de GitHub:
   - Selecciona **"Connect account"** si es la primera vez
   - Autoriza Render para acceder a tu GitHub
   - Selecciona el repositorio `Proyectos-completos/ZetaCuts`
3. Configura el servicio:

### Configuración Básica:
- **Name**: `zetacuts-backend`
- **Region**: La misma que la base de datos
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Docker`
- **Instance Type**: Free (para empezar)

### Build Command:
```
(No necesario, se construye con Docker)
```

### Start Command:
```
(No necesario, Docker lo maneja)
```

## 🔐 Paso 3: Configurar Variables de Entorno

En la sección **"Environment"** del servicio web, agrega estas variables:

### Variables de la Aplicación:
```
APP_NAME=ZetaCuts
APP_ENV=production
APP_DEBUG=false
APP_URL=https://zetacuts-backend.onrender.com
```

### Variables de Base de Datos:
```
DB_CONNECTION=pgsql
DB_HOST=<DB_HOST_de_la_base_de_datos>
DB_PORT=5432
DB_DATABASE=<DB_DATABASE>
DB_USERNAME=<DB_USERNAME>
DB_PASSWORD=<DB_PASSWORD>
```

**Nota**: Usa los valores exactos que Render te proporcionó al crear la base de datos.

### Variables Adicionales:
```
CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,*.vercel.app
```

### Generar APP_KEY:
1. Después de crear el servicio, Render ejecutará el build
2. El `docker-entrypoint.sh` generará automáticamente el `APP_KEY` si no está configurado
3. O puedes generarlo manualmente:
   ```bash
   php artisan key:generate --show
   ```
   Y agregarlo como variable de entorno `APP_KEY`

## 🗄️ Paso 4: Ejecutar Migraciones

El `docker-entrypoint.sh` ejecutará las migraciones automáticamente al iniciar. Si necesitas ejecutarlas manualmente:

1. Ve a **"Shell"** en tu servicio de Render
2. Ejecuta:
```bash
cd /var/www/html
php artisan migrate --force
```

## ✅ Paso 5: Verificar el Despliegue

1. Espera a que el build termine (puede tomar 5-10 minutos la primera vez)
2. Haz clic en la URL del servicio (ej: `https://zetacuts-backend.onrender.com`)
3. Deberías ver una respuesta JSON o el frontend si está configurado
4. Prueba la API: `https://zetacuts-backend.onrender.com/api/barberos`

## 🔗 Paso 6: Conectar Frontend con Backend

1. Ve a tu proyecto en Vercel
2. Ve a **Settings** → **Environment Variables**
3. Agrega:
   ```
   REACT_APP_API_URL=https://zetacuts-backend.onrender.com/api
   ```
4. Redespliega el frontend

## 📝 Notas Importantes

- **Primer despliegue**: Puede tardar 10-15 minutos mientras Render descarga e instala dependencias
- **Spinning down**: En el plan gratuito, el servicio se "duerme" después de 15 minutos de inactividad. La primera petición puede tardar 30-60 segundos
- **Logs**: Revisa los logs en Render si hay problemas. Están en la pestaña **"Logs"** de tu servicio
- **Base de datos interna**: Render proporciona una URL interna para la base de datos. Es más rápido que usar la URL externa

## 🐛 Solución de Problemas

### Error: "No APP_KEY"
- El `docker-entrypoint.sh` debería generarlo automáticamente
- Si no, agrégalo manualmente como variable de entorno

### Error: "Database connection failed"
- Verifica que todas las variables de base de datos estén correctas
- Asegúrate de usar la base de datos interna de Render (no externa)

### Error: "Migration failed"
- Revisa los logs de Render
- Asegúrate de que la base de datos esté creada y accesible
- Verifica que las credenciales sean correctas

### CORS Errors en el Frontend
- Asegúrate de que tu URL de Vercel esté en `SANCTUM_STATEFUL_DOMAINS`
- La configuración de CORS ya acepta dominios `*.vercel.app`

## 🔄 Actualizar el Backend

Cada vez que hagas push a GitHub, Render automáticamente:
1. Detectará los cambios
2. Construirá una nueva imagen Docker
3. Desplegará la nueva versión

El proceso toma aproximadamente 5-10 minutos.

