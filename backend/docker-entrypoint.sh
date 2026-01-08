#!/bin/sh
set -e

echo "=== Iniciando aplicación Laravel ==="

# Parse DATABASE_URL si está disponible (Render proporciona esto automáticamente)
if [ ! -z "$DATABASE_URL" ]; then
  echo "Parseando DATABASE_URL..."
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

# Crear archivo .env si no existe
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

DB_CONNECTION=pgsql
DB_HOST=${DB_HOST:-}
DB_PORT=${DB_PORT:-5432}
DB_DATABASE=${DB_DATABASE:-}
DB_USERNAME=${DB_USERNAME:-}
DB_PASSWORD=${DB_PASSWORD:-}

CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
EOF
  fi
fi

# FORZAR DB_CONNECTION=pgsql siempre
sed -i "s/^DB_CONNECTION=.*/DB_CONNECTION=pgsql/" .env 2>/dev/null || echo "DB_CONNECTION=pgsql" >> .env

# Actualizar .env con variables de entorno
if [ ! -z "$APP_KEY" ]; then
  sed -i "s/^APP_KEY=.*/APP_KEY=$APP_KEY/" .env 2>/dev/null || echo "APP_KEY=$APP_KEY" >> .env
fi

if [ ! -z "$DB_HOST" ]; then
  sed -i "s/^DB_HOST=.*/DB_HOST=$DB_HOST/" .env 2>/dev/null || echo "DB_HOST=$DB_HOST" >> .env
fi

if [ ! -z "$DB_PORT" ]; then
  sed -i "s/^DB_PORT=.*/DB_PORT=$DB_PORT/" .env 2>/dev/null || echo "DB_PORT=$DB_PORT" >> .env
fi

if [ ! -z "$DB_DATABASE" ]; then
  sed -i "s/^DB_DATABASE=.*/DB_DATABASE=$DB_DATABASE/" .env 2>/dev/null || echo "DB_DATABASE=$DB_DATABASE" >> .env
fi

if [ ! -z "$DB_USERNAME" ]; then
  sed -i "s/^DB_USERNAME=.*/DB_USERNAME=$DB_USERNAME/" .env 2>/dev/null || echo "DB_USERNAME=$DB_USERNAME" >> .env
fi

if [ ! -z "$DB_PASSWORD" ]; then
  sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env 2>/dev/null || echo "DB_PASSWORD=$DB_PASSWORD" >> .env
fi

# Configurar permisos PRIMERO (antes de cualquier operación)
echo "=== Configurando permisos ==="
mkdir -p storage/framework/cache/data
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/logs
mkdir -p bootstrap/cache

chmod -R 777 storage
chmod -R 777 bootstrap/cache

# Generar APP_KEY si no existe
if [ -z "$APP_KEY" ] || grep -q "^APP_KEY=$" .env 2>/dev/null; then
  echo "=== Generando APP_KEY ==="
  php artisan key:generate --force --no-interaction
fi

# Limpiar caché de configuración
echo "=== Limpiando caché de configuración ==="
php artisan config:clear --quiet 2>/dev/null || true

# Ejecutar migraciones
echo "=== Ejecutando migraciones ==="
php artisan migrate --force --no-interaction || {
  echo "ERROR en migraciones, pero continuando..."
}

# Limpiar caché (silenciosamente, ignorando errores)
echo "=== Limpiando caché ==="
php artisan config:clear --quiet 2>/dev/null || true
php artisan cache:clear --quiet 2>/dev/null || true
php artisan route:clear --quiet 2>/dev/null || true
php artisan view:clear --quiet 2>/dev/null || true
echo "Caché limpiado"

# Construir frontend si no existe (en segundo plano para no bloquear)
if [ ! -d "public/frontend" ] || [ -z "$(ls -A public/frontend 2>/dev/null)" ]; then
  echo "=== Construyendo frontend ==="
  REPO_URL="https://github.com/Proyectos-completos/ZetaCuts.git"
  cd /tmp
  rm -rf repo_temp
  git clone --depth 1 --branch main "$REPO_URL" repo_temp 2>/dev/null || \
  git clone --depth 1 "$REPO_URL" repo_temp 2>/dev/null || true
  
  if [ -d "repo_temp/frontend" ] && [ -f "repo_temp/frontend/package.json" ]; then
    cd repo_temp/frontend
    npm install --legacy-peer-deps --quiet 2>/dev/null || npm install --quiet 2>/dev/null
    npm run build --silent 2>/dev/null || npm run build
    mkdir -p /var/www/html/public/frontend
    cp -r build/* /var/www/html/public/frontend/
    cd /var/www/html
    rm -rf /tmp/repo_temp
    echo "Frontend construido exitosamente"
  fi
fi

# Render requiere que la aplicación escuche en el puerto especificado por PORT
LISTEN_PORT=${PORT:-8000}
echo "=== Iniciando servidor en puerto $LISTEN_PORT ==="

# Iniciar Laravel (esto debe ser el último comando y NO usar exec para que Render detecte el puerto)
php artisan serve --host=0.0.0.0 --port=$LISTEN_PORT
