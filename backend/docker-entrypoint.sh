#!/bin/sh
# No usar set -e aquí porque queremos manejar errores manualmente

echo "Iniciando aplicación Laravel..."

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

# Asegurar que DB_CONNECTION esté configurado
if [ ! -z "$DB_CONNECTION" ]; then
  sed -i "s/^DB_CONNECTION=.*/DB_CONNECTION=$DB_CONNECTION/" .env 2>/dev/null || (grep -q "^DB_CONNECTION=" .env || echo "DB_CONNECTION=$DB_CONNECTION" >> .env)
else
  # Si no está definido, usar pgsql por defecto
  if ! grep -q "^DB_CONNECTION=" .env; then
    echo "DB_CONNECTION=pgsql" >> .env
  fi
fi

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
php artisan migrate --force || {
  echo "ADVERTENCIA: Error al ejecutar migraciones, continuando..."
}

# Limpiar caché DESPUÉS de las migraciones (con manejo de errores)
echo "Limpiando caché..."
php artisan config:clear || echo "ADVERTENCIA: No se pudo limpiar config cache"
php artisan cache:clear || echo "ADVERTENCIA: No se pudo limpiar cache (tabla puede no existir aún)"
php artisan route:clear || echo "ADVERTENCIA: No se pudo limpiar route cache"
php artisan view:clear || echo "ADVERTENCIA: No se pudo limpiar view cache"

# Construir el frontend si no existe
if [ ! -d "public/frontend" ] || [ -z "$(ls -A public/frontend 2>/dev/null)" ]; then
  echo "Frontend no encontrado, descargando y construyendo desde el repositorio..."
  
  # Obtener la URL del repositorio desde las variables de entorno de Render o Git
  REPO_URL="${RENDER_GIT_REPO_URL:-}"
  if [ -z "$REPO_URL" ] && [ -d ".git" ]; then
    REPO_URL=$(git config --get remote.origin.url 2>/dev/null || echo "")
  fi
  
  if [ ! -z "$REPO_URL" ]; then
    echo "Clonando repositorio para obtener el frontend..."
    cd /tmp
    git clone --depth 1 --single-branch --branch main "$REPO_URL" repo_temp 2>/dev/null || \
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
      echo "Frontend construido exitosamente"
    else
      echo "ADVERTENCIA: No se pudo encontrar el frontend en el repositorio"
      rm -rf /tmp/repo_temp
    fi
  else
    echo "ADVERTENCIA: No se pudo obtener la URL del repositorio para construir el frontend"
  fi
fi

# Ejecutar seeders (opcional, solo si es necesario)
# echo "Ejecutando seeders..."
# php artisan db:seed --force || echo "ADVERTENCIA: Error al ejecutar seeders"

echo "Aplicación lista para iniciar"

exec "$@"
