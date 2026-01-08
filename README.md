# ZetaCuts

Proyecto web con React (Frontend) y Laravel (Backend)

## Estructura del Proyecto

```
ZetaCuts/
├── frontend/           # Aplicación React
├── backend/            # API Laravel
├── docs/              # Documentación
├── docker-compose.yml # Configuración Docker
├── DOCKER_SETUP.md    # Guía completa de Docker
└── README.md          # Este archivo
```

## 🐳 Inicio Rápido con Docker (Recomendado)

**La forma más fácil de ejecutar el proyecto en cualquier computadora es usando Docker.**

### Requisitos
- Docker Desktop (Windows/Mac) o Docker Engine + Docker Compose (Linux)

### Comandos

```bash
# Construir e iniciar todos los servicios
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### Acceso a la Aplicación
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **phpMyAdmin**: http://localhost:8080

## Desarrollo Local (Sin Docker)

### Requisitos

- Node.js (v18+)
- PHP (v8.2+)
- Composer
- MySQL 8.0

### Frontend (React)
```bash
cd frontend
npm install
npm start
```

### Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

## Desarrollo

1. El frontend se ejecuta en `http://localhost:3000`
2. El backend se ejecuta en `http://localhost:8000`
