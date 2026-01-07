#!/bin/sh
set -e

echo "Iniciando aplicación Laravel..."

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
if [ ! -z "$APP_KEY" ]; then
  sed -i "s/APP_KEY=.*/APP_KEY=$APP_KEY/" .env || echo "APP_KEY=$APP_KEY" >> .env
fi
if [ ! -z "$DB_CONNECTION" ]; then
  sed -i "s/DB_CONNECTION=.*/DB_CONNECTION=$DB_CONNECTION/" .env || echo "DB_CONNECTION=$DB_CONNECTION" >> .env
fi
if [ ! -z "$DB_HOST" ]; then
  sed -i "s/DB_HOST=.*/DB_HOST=$DB_HOST/" .env || echo "DB_HOST=$DB_HOST" >> .env
fi
if [ ! -z "$DB_PORT" ]; then
  sed -i "s/DB_PORT=.*/DB_PORT=$DB_PORT/" .env || echo "DB_PORT=$DB_PORT" >> .env
fi
if [ ! -z "$DB_DATABASE" ]; then
  sed -i "s/DB_DATABASE=.*/DB_DATABASE=$DB_DATABASE/" .env || echo "DB_DATABASE=$DB_DATABASE" >> .env
fi
if [ ! -z "$DB_USERNAME" ]; then
  sed -i "s/DB_USERNAME=.*/DB_USERNAME=$DB_USERNAME/" .env || echo "DB_USERNAME=$DB_USERNAME" >> .env
fi
if [ ! -z "$DB_PASSWORD" ]; then
  sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env || echo "DB_PASSWORD=$DB_PASSWORD" >> .env
fi

# Generar clave de aplicación si no existe
if [ -z "$APP_KEY" ] || grep -q "APP_KEY=$" .env; then
  echo "Generando APP_KEY..."
  php artisan key:generate --force || echo "ADVERTENCIA: No se pudo generar APP_KEY"
fi

# Limpiar caché
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Ejecutar migraciones
echo "Ejecutando migraciones..."
php artisan migrate --force || echo "ADVERTENCIA: Error al ejecutar migraciones"

# Ejecutar seeders (opcional, solo si es necesario)
# echo "Ejecutando seeders..."
# php artisan db:seed --force || echo "ADVERTENCIA: Error al ejecutar seeders"

echo "Aplicación lista para iniciar"

exec "$@"
