# 🚀 Guía Completa: Desplegar Frontend y Backend en Render

Esta guía te ayudará a desplegar tanto el **frontend (React)** como el **backend (Laravel)** en Render.com paso a paso.

---

## 📋 Requisitos Previos

1. ✅ Cuenta en [Render.com](https://render.com) (gratis)
2. ✅ Repositorio en GitHub con tu código
3. ✅ Código ya está en GitHub: `Proyectos-completos/ZetaCuts`

---

## 🎯 Opción 1: Dos Servicios Separados (RECOMENDADO)

Esta opción despliega el frontend y backend como servicios independientes. Es más limpia y fácil de mantener.

---

## 🗄️ PASO 1: Crear Base de Datos PostgreSQL

### 1.1 Crear la base de datos

1. Ve a [render.com](https://render.com) e inicia sesión
2. En el Dashboard, haz clic en **"New +"** (arriba a la derecha)
3. Selecciona **"PostgreSQL"**
4. Configura:
   - **Name**: `zetacuts-db`
   - **Database**: `zetacuts`
   - **User**: Se genera automáticamente (anótalo)
   - **Region**: Elige la más cercana a ti (ej: `Oregon (US West)`)
   - **PostgreSQL Version**: `14` o superior
   - **Plan**: **Free** (gratis)
5. Haz clic en **"Create Database"**

### 1.2 Obtener las credenciales

1. Una vez creada la base de datos, haz clic en ella
2. En la pestaña **"Info"**, encontrarás:
   - **Internal Database URL**: `postgresql://user:password@host:5432/dbname`
   - **Host**: `dpg-xxxxx-a.oregon-postgres.render.com`
   - **Port**: `5432`
   - **Database**: `zetacuts`
   - **User**: `zetacuts_user` (ejemplo)
   - **Password**: Se muestra solo una vez (cópialo ahora)

**⚠️ IMPORTANTE**: 
- Copia la **Internal Database URL** completa
- Guarda la contraseña ahora - no la podrás ver después

---

## 🔧 PASO 2: Desplegar el Backend (Laravel)

### 2.1 Crear el servicio web

1. En el Dashboard de Render, haz clic en **"New +"**
2. Selecciona **"Web Service"**
3. Conecta tu repositorio:
   - Si es tu primera vez, haz clic en **"Configure account"** o **"Connect account"**
   - Autoriza Render para acceder a tu GitHub
   - Busca y selecciona: **`Proyectos-completos/ZetaCuts`**
   - Haz clic en **"Connect"**

### 2.2 Configurar el servicio backend

En la configuración del servicio:

**Basic Settings:**
- **Name**: `zetacuts-backend`
- **Region**: La misma que la base de datos
- **Branch**: `main`
- **Root Directory**: `backend` ⚠️ **IMPORTANTE**
- **Runtime**: **Docker** ⚠️ Render detectará el Dockerfile automáticamente
- **Plan**: **Free** (gratis)

**Build & Deploy:**
- **Build Command**: Déjalo vacío (Docker lo maneja)
- **Start Command**: Déjalo vacío (Docker lo maneja)

**⚠️ IMPORTANTE**: 
- Asegúrate de que **Root Directory** esté configurado como `backend`
- El **Runtime** debe ser **Docker** (no Node o PHP)

### 2.3 Configurar Variables de Entorno del Backend

En la sección **"Environment Variables"**, agrega estas variables:

**Variables de Base de Datos:**
```bash
DB_CONNECTION=pgsql
DATABASE_URL=<tu_internal_database_url_completa>
```
*(Usa la Internal Database URL que copiaste en el Paso 1.2)*

**O si prefieres variables individuales:**
```bash
DB_CONNECTION=pgsql
DB_HOST=<host_de_Render>
DB_PORT=5432
DB_DATABASE=zetacuts
DB_USERNAME=<usuario_de_Render>
DB_PASSWORD=<contraseña_de_Render>
```

**Variables de la Aplicación:**
```bash
APP_NAME=ZetaCuts
APP_ENV=production
APP_DEBUG=false
APP_URL=https://zetacuts-backend.onrender.com

CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync

SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,*.onrender.com
```

**⚠️ NOTA**: 
- `APP_URL` lo actualizarás después del primer despliegue con la URL real
- Todas estas variables se agregan **una por una** en Render
- Haz clic en **"Add Environment Variable"** para cada una

### 2.4 Desplegar el backend

1. Una vez configuradas todas las variables, haz clic en **"Create Web Service"**
2. Render comenzará a construir y desplegar
3. Ve a la pestaña **"Logs"** para ver el progreso
4. El primer despliegue puede tardar **10-15 minutos** mientras:
   - Construye la imagen Docker
   - Instala dependencias de Composer
   - Ejecuta las migraciones (automáticamente)

### 2.5 Obtener la URL del backend

1. Una vez desplegado, ve a **"Settings"** → **"Networking"**
2. Render te dará una URL automáticamente: `https://zetacuts-backend.onrender.com`
3. **Copia esta URL** - la necesitarás para el frontend

### 2.6 Actualizar APP_URL

1. Ve a **"Environment"** → **"Environment Variables"**
2. Edita la variable `APP_URL`
3. Actualízala con la URL real: `https://zetacuts-backend.onrender.com`
4. Render redesplegará automáticamente

---

## 🎨 PASO 3: Desplegar el Frontend (React)

### 3.1 Crear el servicio web para el frontend

1. En el Dashboard de Render, haz clic en **"New +"**
2. Selecciona **"Web Service"**
3. Selecciona el mismo repositorio: **`Proyectos-completos/ZetaCuts`**
4. Haz clic en **"Connect"**

### 3.2 Configurar el servicio frontend

**Basic Settings:**
- **Name**: `zetacuts-frontend`
- **Region**: La misma que el backend y la base de datos
- **Branch**: `main`
- **Root Directory**: `frontend` ⚠️ **IMPORTANTE**
- **Runtime**: **Node** (no Docker)
- **Plan**: **Free** (gratis)

**Build & Deploy:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npx serve -s build -l 10000`

**⚠️ IMPORTANTE**: 
- El **Root Directory** debe ser `frontend`
- El **Runtime** debe ser **Node**
- **Start Command** usa `serve` para servir los archivos estáticos

### 3.3 Instalar serve (si es necesario)

El comando `serve` puede que no esté instalado. Tienes dos opciones:

**Opción A: Instalar serve en el package.json**

Agrega `serve` como dependencia en `frontend/package.json`:
```json
"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "eject": "react-scripts eject",
  "serve": "npx serve -s build -l 10000"
},
"dependencies": {
  // ... tus dependencias existentes
  "serve": "^14.2.1"
}
```

Luego el **Start Command** en Render será: `npm run serve`

**Opción B: Usar npx (sin instalar)**

El **Start Command** debe ser: `npx serve -s build -l 10000`

### 3.4 Configurar Variables de Entorno del Frontend

En la sección **"Environment Variables"**, agrega:

```bash
REACT_APP_API_URL=https://zetacuts-backend.onrender.com/api
```

**⚠️ IMPORTANTE**: 
- Reemplaza `zetacuts-backend.onrender.com` con la URL real de tu backend
- Esta variable debe configurarse **antes** del primer despliegue

### 3.5 Desplegar el frontend

1. Haz clic en **"Create Web Service"**
2. Render comenzará a construir y desplegar
3. El proceso tarda **5-10 minutos** la primera vez
4. Una vez desplegado, Render te dará una URL: `https://zetacuts-frontend.onrender.com`

---

## ✅ PASO 4: Verificar que Todo Funciona

### 4.1 Verificar Backend

1. Ve a la URL del backend: `https://zetacuts-backend.onrender.com`
2. Prueba la API: `https://zetacuts-backend.onrender.com/api/barberos`
3. Deberías ver una respuesta JSON (puede estar vacía si no hay datos)

### 4.2 Verificar Frontend

1. Ve a la URL del frontend: `https://zetacuts-frontend.onrender.com`
2. La aplicación debería cargar correctamente
3. Intenta hacer login o cualquier acción que requiera el backend
4. Abre la consola del navegador (F12) para verificar:
   - Que las peticiones API funcionen
   - Que no haya errores de CORS

---

## 🔧 PASO 5: Configurar CORS (Si es necesario)

Si tienes errores de CORS, actualiza `backend/config/cors.php`:

```php
'allowed_origins' => [
    'http://localhost:3000', 
    'http://127.0.0.1:3000', 
    'http://localhost', 
    'http://127.0.0.1',
    'https://zetacuts-frontend.onrender.com',
    'http://zetacuts-frontend.onrender.com',
],

'allowed_origins_patterns' => [
    '/^https:\/\/.*\.onrender\.app$/',
],
```

Y actualiza `backend/config/sanctum.php`:

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1,*.onrender.com',
    Sanctum::currentApplicationUrlWithPort(),
))),
```

Después de actualizar, haz push a GitHub y Render redesplegará automáticamente.

---

## 🐛 Solución de Problemas

### Problema: Backend no inicia

**Solución**:
1. Revisa los logs en Render (pestaña **"Logs"**)
2. Verifica que el **Root Directory** esté configurado como `backend`
3. Verifica que el **Runtime** sea **Docker**
4. Asegúrate de que todas las variables de entorno estén correctas

### Problema: "Database connection failed"

**Solución**:
1. Verifica que el servicio de PostgreSQL esté creado y funcionando
2. Usa la **Internal Database URL** (no la externa)
3. Verifica que todas las variables de base de datos estén correctas
4. Asegúrate de que `DB_CONNECTION=pgsql` esté configurado

### Problema: "Migration failed"

**Solución**:
1. El `docker-entrypoint.sh` ejecuta las migraciones automáticamente
2. Revisa los logs en Render (pestaña **"Logs"**)
3. Verifica que la base de datos esté accesible
4. Verifica que las credenciales sean correctas

### Problema: Frontend no construye

**Solución**:
1. Revisa los logs en Render (pestaña **"Logs"**)
2. Verifica que el **Root Directory** esté configurado como `frontend`
3. Verifica que el **Runtime** sea **Node**
4. Verifica que el **Build Command** sea correcto: `npm install && npm run build`

### Problema: CORS errors en el frontend

**Solución**:
1. Actualiza `backend/config/cors.php` con la URL del frontend
2. Actualiza `backend/config/sanctum.php` con `*.onrender.com`
3. Haz push a GitHub y espera a que Render redesplegue
4. Asegúrate de que `REACT_APP_API_URL` esté configurada correctamente

### Problema: Frontend no puede conectar al backend

**Solución**:
1. Verifica que `REACT_APP_API_URL` esté configurada correctamente
2. Asegúrate de que la URL del backend sea accesible
3. Verifica que no haya errores de CORS
4. Revisa la consola del navegador para ver los errores específicos

---

## ⚠️ Nota Importante sobre Render Free

### Servicios "Dormidos"

- En el plan gratuito, Render "duerme" los servicios después de **15 minutos** de inactividad
- La primera petición después de dormir puede tardar **30-60 segundos** (tiempo de "despertar")
- Las siguientes peticiones serán rápidas normalmente
- Esto es normal y esperado en el plan gratuito

### Solución para evitar el "sueño"

Si necesitas que los servicios estén siempre activos:
1. Usa un servicio de "ping" como [UptimeRobot](https://uptimerobot.com/) (gratis)
2. Configúralo para hacer una petición cada 14 minutos a tu frontend o backend
3. Esto mantendrá los servicios activos

---

## 📊 URLs Finales

Una vez desplegado, tendrás:

- **Frontend**: `https://zetacuts-frontend.onrender.com`
- **Backend API**: `https://zetacuts-backend.onrender.com/api`
- **Base de Datos**: Interna en Render (no accesible externamente)

---

## 🔄 Actualizar los Servicios

Cada vez que hagas push a GitHub:

1. Render detecta automáticamente los cambios
2. Comienza un nuevo despliegue
3. El proceso toma aproximadamente **5-10 minutos**
4. Puedes ver el progreso en **Logs**

---

## 🎉 ¡Listo!

Una vez completados todos los pasos:

1. ✅ Base de datos PostgreSQL funcionando
2. ✅ Backend desplegado en Render
3. ✅ Frontend desplegado en Render
4. ✅ Migraciones ejecutadas
5. ✅ Frontend conectado al backend
6. ✅ Aplicación completa funcionando

---

## 🆘 ¿Necesitas Ayuda?

Si encuentras problemas:

1. **Revisa los logs** en Render (pestaña "Logs")
2. **Verifica las variables de entorno** están correctas
3. **Asegúrate de que los servicios** estén en la misma región
4. **Verifica que el Root Directory** esté configurado correctamente

---

**¡Feliz despliegue en Render! 🚀**

