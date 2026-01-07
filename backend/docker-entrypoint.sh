#!/bin/sh
set -e

echo "Esperando a que MySQL esté listo..."
# Esperar hasta que MySQL esté realmente listo para aceptar conexiones
until nc -z mysql 3306; do
  echo "Esperando a MySQL..."
  sleep 2
done
echo "Puerto MySQL está abierto, esperando inicialización completa..."
# Esperar un poco más para que MySQL termine de inicializar
sleep 10

# Verificar que MySQL acepta conexiones usando PHP (más confiable)
MAX_RETRIES=30
RETRY_COUNT=0
DB_READY=0

echo "Verificando conexión a MySQL..."

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  # Primero verificar con root (siempre existe)
  php -r "
  try {
    \$pdo = new PDO('mysql:host=mysql;port=3306', 'root', 'root123');
    \$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    exit(0);
  } catch (Exception \$e) {
    exit(1);
  }
  " > /dev/null 2>&1
  
  if [ $? -eq 0 ]; then
    # Si root funciona, verificar con el usuario de la aplicación
    php -r "
    try {
      \$pdo = new PDO('mysql:host=mysql;port=3306;dbname=zetacuts', 'zetacuts', 'zetacuts123');
      \$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      exit(0);
    } catch (Exception \$e) {
      exit(1);
    }
    " > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
      echo "MySQL está listo y acepta conexiones con el usuario zetacuts!"
      DB_READY=1
      break
    else
      echo "MySQL responde pero el usuario zetacuts aún no está listo... (intento $RETRY_COUNT/$MAX_RETRIES)"
    fi
  else
    echo "Esperando a que MySQL acepte conexiones... (intento $RETRY_COUNT/$MAX_RETRIES)"
  fi
  
  RETRY_COUNT=$((RETRY_COUNT + 1))
  sleep 3
done

if [ $DB_READY -eq 0 ]; then
  echo "ADVERTENCIA: MySQL no respondió correctamente después de $MAX_RETRIES intentos."
  echo "El servidor continuará, pero puede haber problemas de conexión a la base de datos."
fi

# Generar clave de aplicación si no existe
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
  else
    echo "ADVERTENCIA: No se encontró .env.example, creando .env básico..."
    cat > .env <<EOF
APP_NAME=ZetaCuts
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=zetacuts
DB_USERNAME=zetacuts
DB_PASSWORD=zetacuts123
EOF
  fi
  php artisan key:generate
fi

# Asegurar que la configuración de DB esté correcta (usar variables de entorno si están disponibles)
if [ ! -z "$DB_HOST" ]; then
  sed -i "s/DB_HOST=.*/DB_HOST=$DB_HOST/" .env
fi
if [ ! -z "$DB_DATABASE" ]; then
  sed -i "s/DB_DATABASE=.*/DB_DATABASE=$DB_DATABASE/" .env
fi
if [ ! -z "$DB_USERNAME" ]; then
  sed -i "s/DB_USERNAME=.*/DB_USERNAME=$DB_USERNAME/" .env
fi
if [ ! -z "$DB_PASSWORD" ]; then
  sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env
fi

# Ejecutar migraciones (solo si MySQL está listo)
if [ $DB_READY -eq 1 ]; then
  echo "Ejecutando migraciones..."
  php artisan migrate --force || echo "ADVERTENCIA: Error al ejecutar migraciones"
  
  # Ejecutar seeders para crear datos iniciales (admin, barberos, etc.)
  echo "Ejecutando seeders..."
  php artisan db:seed --force || echo "ADVERTENCIA: Error al ejecutar seeders"
else
  echo "OMITIENDO migraciones y seeders debido a problemas de conexión a MySQL"
fi

# Limpiar caché
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

exec "$@"



