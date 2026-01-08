#!/bin/sh
# Importante en Render: iniciar el servidor rápido para que detecte el puerto.
# Las migraciones/cachés se hacen en segundo plano.

echo "=== Iniciando aplicación Laravel ==="

# Render proporciona DATABASE_URL para Postgres. Laravel puede usar DB_URL directamente.
export DB_CONNECTION=pgsql
export DB_URL=${DATABASE_URL:-${DB_URL:-}}

# Crear/actualizar .env mínimo (sin depender de parsear DATABASE_URL)
cat > .env <<EOF
APP_NAME=ZetaCuts
APP_ENV=${APP_ENV:-production}
APP_KEY=${APP_KEY:-}
APP_DEBUG=${APP_DEBUG:-false}
APP_URL=${APP_URL:-http://localhost:8000}

DB_CONNECTION=pgsql
DB_URL=${DB_URL:-}

CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
EOF

# Permisos (evita el warning de cache)
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache 2>/dev/null || true
chmod -R 777 storage bootstrap/cache 2>/dev/null || true

# Puerto de Render
LISTEN_PORT=${PORT:-8000}
echo "=== Servidor iniciando en puerto $LISTEN_PORT ==="

# Iniciar servidor YA (Render detecta el puerto)
php artisan serve --host=0.0.0.0 --port=$LISTEN_PORT &
SERVER_PID=$!

# Arranque asíncrono: key + migraciones + limpiar caches (sin tumbar el servidor)
(
  if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force --no-interaction 2>/dev/null || true
  fi

  php artisan migrate --force --no-interaction 2>/dev/null || true

  php artisan config:clear 2>/dev/null || true
  php artisan cache:clear 2>/dev/null || true
  php artisan route:clear 2>/dev/null || true
  php artisan view:clear 2>/dev/null || true
) &

# Mantener el contenedor vivo con el servidor
wait $SERVER_PID
