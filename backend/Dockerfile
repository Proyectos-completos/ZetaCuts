FROM php:8.2-cli

# Instalar dependencias del sistema para Render (incluyendo Node.js para construir el frontend)
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    netcat-openbsd \
    default-mysql-client \
    libpq-dev \
    && docker-php-ext-install pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalar Node.js y npm para construir el frontend
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copiar script de entrada ANTES de establecer WORKDIR
COPY backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh && \
    sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && \
    ls -la /usr/local/bin/docker-entrypoint.sh

# Establecer directorio de trabajo
WORKDIR /var/www/html

# Copiar archivos de composer del backend
COPY backend/composer.json backend/composer.lock ./

# Instalar dependencias de PHP
RUN composer install --no-scripts --no-autoloader

# Copiar el resto de los archivos del backend
COPY backend/ .

# Construir el frontend si está disponible (desde la raíz del repo)
WORKDIR /tmp
RUN if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then \
        echo "Construyendo frontend desde el contexto de build..."; \
        cd frontend && \
        npm install --legacy-peer-deps || npm install && \
        npm run build && \
        mkdir -p /var/www/html/public/frontend && \
        cp -r build/* /var/www/html/public/frontend/ && \
        echo "Frontend construido exitosamente"; \
    else \
        echo "Frontend no encontrado en el contexto de build, se construirá en tiempo de ejecución"; \
    fi
WORKDIR /var/www/html

# Crear directorios necesarios y configurar permisos antes de composer
RUN mkdir -p /var/www/html/bootstrap/cache \
    && mkdir -p /var/www/html/storage/framework/cache \
    && mkdir -p /var/www/html/storage/framework/sessions \
    && mkdir -p /var/www/html/storage/framework/views \
    && mkdir -p /var/www/html/storage/logs \
    && chmod -R 775 /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage

# Completar instalación de Composer
RUN composer dump-autoload --optimize

# Configurar permisos finales
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Exponer puerto 8000
EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]



