#!/bin/sh

echo "=== Iniciando aplicación Laravel ==="

# Parse DATABASE_URL si está disponible
if [ ! -z "$DATABASE_URL" ]; then
  echo "Parseando DATABASE_URL..."
  DB_URL=$(echo "$DATABASE_URL" | sed 's|postgresql://||' | sed 's|postgres://||')
  export DB_USERNAME=$(echo "$DB_URL" | cut -d: -f1)
  export DB_PASSWORD=$(echo "$DB_URL" | cut -d: -f2 | cut -d@ -f1)
  DB_HOST_PORT=$(echo "$DB_URL" | cut -d@ -f2 | cut -d/ -f1)
  export DB_HOST=$(echo "$DB_HOST_PORT" | cut -d: -f1)
  export DB_PORT=$(echo "$DB_HOST_PORT" | cut -d: -f2)
  export DB_DATABASE=$(echo "$DB_URL" | cut -d/ -f2)
  echo "DB_HOST: $DB_HOST, DB_DATABASE: $DB_DATABASE"
fi

export DB_CONNECTION=pgsql

# Crear .env
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

# Permisos
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chmod -R 777 storage bootstrap/cache

# APP_KEY
if [ -z "$APP_KEY" ]; then
  php artisan key:generate --force --no-interaction 2>/dev/null || true
fi

# Migraciones
php artisan migrate --force --no-interaction 2>/dev/null || true

# Puerto de Render
PORT=${PORT:-8000}
echo "=== Servidor iniciando en puerto $PORT ==="

# INICIAR SERVIDOR INMEDIATAMENTE
php artisan serve --host=0.0.0.0 --port=$PORT
