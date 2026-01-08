#!/bin/sh
# No usar set -e aquí porque queremos manejar errores manualmente

echo "Iniciando aplicación Laravel..."

# Parse DATABASE_URL si está disponible (Render proporciona esto automáticamente)
if [ ! -z "$DATABASE_URL" ]; then
  echo "Parseando DATABASE_URL..."
  # Formato: postgresql://user:password@host:port/database o postgres://user:password@host:port/database
  DB_URL=$(echo "$DATABASE_URL" | sed 's|postgresql://||' | sed 's|postgres://||')
  DB_USERNAME=$(echo "$DB_URL" | cut -d: -f1)
  DB_PASSWORD=$(echo "$DB_URL" | cut -d: -f2 | cut -d@ -f1)
  DB_HOST_PORT=$(echo "$DB_URL" | cut -d@ -f2 | cut -d/ -f1)
  DB_HOST=$(echo "$DB_HOST_PORT" | cut -d: -f1)
  DB_PORT=$(echo "$DB_HOST_PORT" | cut -d: -f2)
  DB_DATABASE=$(echo "$DB_URL" | cut -d/ -f2)
  
  export DB_HOST=${DB_HOST:-$DB_HOST}
  export DB_PORT=${DB_PORT:-${DB_PORT:-5432}}
  export DB_DATABASE=${DB_DATABASE:-$DB_DATABASE}
  export DB_USERNAME=${DB_USERNAME:-$DB_USERNAME}
  export DB_PASSWORD=${DB_PASSWORD:-$DB_PASSWORD}
  
  echo "DATABASE_URL parseado - DB_HOST: $DB_HOST, DB_DATABASE: $DB_DATABASE"
fi

# FORZAR PostgreSQL como conexión por defecto SIEMPRE
export DB_CONNECTION=pgsql

# Limpiar caché de configuración al inicio para asegurar que lea el .env actualizado
php artisan config:clear 2>/dev/null || true

# Crear archivo .env si no existe, usando variables de entorno de Render
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
  else
    echo "Creando .env desde variables de entorno..."
    cat > .env <<EOF
APP_NAME=ZetaCuts
APP_ENV=${APP_ENV:-production}
APP_KEY=${APP_KEY:-}
APP_DEBUG=${APP_DEBUG:-false}
APP_URL=${APP_URL:-http://localhost:8000}

DB_CONNECTION=${DB_CONNECTION:-pgsql}
DB_HOST=${DB_HOST:-}
DB_PORT=${DB_PORT:-5432}
DB_DATABASE=${DB_DATABASE:-}
DB_USERNAME=${DB_USERNAME:-}
DB_PASSWORD=${DB_PASSWORD:-}
EOF
  fi
fi

# Actualizar .env con variables de entorno si están disponibles
echo "Actualizando .env con variables de entorno de Render..."

if [ ! -z "$APP_KEY" ]; then
  sed -i "s/APP_KEY=.*/APP_KEY=$APP_KEY/" .env 2>/dev/null || echo "APP_KEY=$APP_KEY" >> .env
fi

# FORZAR DB_CONNECTION=pgsql siempre (antes de configurar otras variables)
sed -i "s/^DB_CONNECTION=.*/DB_CONNECTION=pgsql/" .env 2>/dev/null || echo "DB_CONNECTION=pgsql" >> .env
echo "DB_CONNECTION forzado a: pgsql"

# Actualizar variables de base de datos (críticas para la conexión)
if [ ! -z "$DB_HOST" ]; then
  sed -i "s/^DB_HOST=.*/DB_HOST=$DB_HOST/" .env 2>/dev/null || (grep -q "^DB_HOST=" .env || echo "DB_HOST=$DB_HOST" >> .env)
  echo "DB_HOST configurado: $DB_HOST"
else
  echo "ADVERTENCIA: DB_HOST no está definido en variables de entorno"
fi

if [ ! -z "$DB_PORT" ]; then
  sed -i "s/^DB_PORT=.*/DB_PORT=$DB_PORT/" .env 2>/dev/null || (grep -q "^DB_PORT=" .env || echo "DB_PORT=$DB_PORT" >> .env)
else
  if ! grep -q "^DB_PORT=" .env; then
    echo "DB_PORT=5432" >> .env
  fi
fi

if [ ! -z "$DB_DATABASE" ]; then
  sed -i "s/^DB_DATABASE=.*/DB_DATABASE=$DB_DATABASE/" .env 2>/dev/null || (grep -q "^DB_DATABASE=" .env || echo "DB_DATABASE=$DB_DATABASE" >> .env)
  echo "DB_DATABASE configurado: $DB_DATABASE"
else
  echo "ADVERTENCIA: DB_DATABASE no está definido en variables de entorno"
fi

if [ ! -z "$DB_USERNAME" ]; then
  sed -i "s/^DB_USERNAME=.*/DB_USERNAME=$DB_USERNAME/" .env 2>/dev/null || (grep -q "^DB_USERNAME=" .env || echo "DB_USERNAME=$DB_USERNAME" >> .env)
  echo "DB_USERNAME configurado"
else
  echo "ADVERTENCIA: DB_USERNAME no está definido en variables de entorno"
fi

if [ ! -z "$DB_PASSWORD" ]; then
  sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env 2>/dev/null || (grep -q "^DB_PASSWORD=" .env || echo "DB_PASSWORD=$DB_PASSWORD" >> .env)
  echo "DB_PASSWORD configurado"
else
  echo "ADVERTENCIA: DB_PASSWORD no está definido en variables de entorno"
fi

# FORZAR caché a usar archivos (no base de datos) para evitar errores antes de migraciones
if ! grep -q "^CACHE_STORE=" .env; then
  echo "CACHE_STORE=file" >> .env
else
  sed -i "s/^CACHE_STORE=.*/CACHE_STORE=file/" .env
fi

# FORZAR sesiones a usar archivos (no base de datos) para evitar errores antes de migraciones
if ! grep -q "^SESSION_DRIVER=" .env; then
  echo "SESSION_DRIVER=file" >> .env
else
  sed -i "s/^SESSION_DRIVER=.*/SESSION_DRIVER=file/" .env
fi

# Limpiar caché de configuración DESPUÉS de actualizar .env para que Laravel lea los nuevos valores
php artisan config:clear 2>/dev/null || true

# Generar clave de aplicación si no existe
if [ -z "$APP_KEY" ] || grep -q "APP_KEY=$" .env; then
  echo "Generando APP_KEY..."
  php artisan key:generate --force || {
    echo "ADVERTENCIA: No se pudo generar APP_KEY, continuando..."
  }
fi

# Ejecutar migraciones PRIMERO (antes de limpiar caché)
echo "Ejecutando migraciones..."
php artisan migrate --force 2>&1 || {
  echo "ADVERTENCIA: Error al ejecutar migraciones, continuando..."
  echo "Detalles del error de migraciones:"
  php artisan migrate --force 2>&1 | head -20 || true
}

# Asegurar permisos antes de limpiar caché
chmod -R 777 storage/framework/cache 2>/dev/null || true
chmod -R 777 storage/framework/sessions 2>/dev/null || true
chmod -R 777 storage/framework/views 2>/dev/null || true
chmod -R 777 bootstrap/cache 2>/dev/null || true

# Limpiar caché DESPUÉS de las migraciones (con manejo de errores)
echo "Limpiando caché..."
php artisan config:clear 2>&1 || echo "ADVERTENCIA: No se pudo limpiar config cache"
php artisan cache:clear 2>&1 || echo "ADVERTENCIA: No se pudo limpiar cache"
php artisan route:clear 2>&1 || echo "ADVERTENCIA: No se pudo limpiar route cache"
php artisan view:clear 2>&1 || echo "ADVERTENCIA: No se pudo limpiar view cache"

# Construir el frontend si no existe
if [ ! -d "public/frontend" ] || [ -z "$(ls -A public/frontend 2>/dev/null)" ]; then
  echo "Frontend no encontrado, construyendo desde el repositorio..."
  
  # URL del repositorio (Render lo proporciona o lo obtenemos de Git)
  REPO_URL="https://github.com/Proyectos-completos/ZetaCuts.git"
  
  echo "Clonando repositorio para obtener el frontend..."
  cd /tmp
  rm -rf repo_temp
  git clone --depth 1 --branch main "$REPO_URL" repo_temp 2>/dev/null || \
  git clone --depth 1 "$REPO_URL" repo_temp 2>/dev/null || true
  
  if [ -d "repo_temp/frontend" ] && [ -f "repo_temp/frontend/package.json" ]; then
    echo "Construyendo frontend..."
    cd repo_temp/frontend
    npm install --legacy-peer-deps || npm install
    npm run build
    mkdir -p /var/www/html/public/frontend
    cp -r build/* /var/www/html/public/frontend/
    cd /var/www/html
    rm -rf /tmp/repo_temp
    echo "✅ Frontend construido exitosamente"
  else
    echo "❌ ERROR: No se pudo encontrar el frontend en el repositorio"
    rm -rf /tmp/repo_temp
  fi
fi

# Ejecutar seeders (opcional, solo si es necesario)
# echo "Ejecutando seeders..."
# php artisan db:seed --force || echo "ADVERTENCIA: Error al ejecutar seeders"

echo "Aplicación lista para iniciar"

# Render requiere que la aplicación escuche en el puerto especificado por PORT
# Si PORT no está definido, usar 8000 como default
LISTEN_PORT=${PORT:-8000}
echo "Iniciando servidor en puerto: $LISTEN_PORT"

# Iniciar Laravel en el puerto correcto
exec php artisan serve --host=0.0.0.0 --port=$LISTEN_PORT
