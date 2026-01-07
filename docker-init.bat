@echo off
echo ========================================
echo   Inicializando ZetaCuts con Docker
echo ========================================
echo.

echo Verificando que Docker esta corriendo...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker no esta instalado o no esta en el PATH
    echo Por favor, instala Docker Desktop desde: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo Docker encontrado!
echo.

echo Construyendo e iniciando los contenedores...
echo Esto puede tardar varios minutos la primera vez...
echo.

docker-compose up -d --build

if errorlevel 1 (
    echo.
    echo ERROR: Hubo un problema al construir o iniciar los contenedores
    echo Revisa los logs con: docker-compose logs
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Contenedores iniciados correctamente!
echo ========================================
echo.
echo Esperando a que los servicios esten listos...
timeout /t 10 /nobreak >nul

echo.
echo Verificando estado de los contenedores...
docker-compose ps

echo.
echo ========================================
echo   Aplicacion disponible en:
echo ========================================
echo   Frontend:    http://localhost:3000
echo   Backend API: http://localhost:8000
echo   phpMyAdmin:  http://localhost:8080
echo.
echo   Credenciales phpMyAdmin:
echo   Usuario: root
echo   Password: root123
echo ========================================
echo.
echo Para ver los logs en tiempo real, ejecuta:
echo   docker-compose logs -f
echo.
echo Para detener los contenedores, ejecuta:
echo   docker-compose stop
echo.
pause

