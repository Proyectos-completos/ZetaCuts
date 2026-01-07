-- Script SQL Simple para agregar campos de barbero a users
-- Ejecutar en phpMyAdmin o MySQL directamente
-- Este script es compatible con versiones de MySQL que no soportan IF NOT EXISTS en ALTER TABLE

-- Paso 1: Agregar columna is_barbero
ALTER TABLE `users` 
ADD COLUMN `is_barbero` BOOLEAN DEFAULT FALSE AFTER `is_admin`;

-- Paso 2: Agregar columna barbero_id
ALTER TABLE `users` 
ADD COLUMN `barbero_id` BIGINT UNSIGNED NULL AFTER `is_admin`;

-- Paso 3: Agregar foreign key constraint
ALTER TABLE `users` 
ADD CONSTRAINT `users_barbero_id_foreign` 
FOREIGN KEY (`barbero_id`) REFERENCES `barberos`(`id`) ON DELETE CASCADE;

-- Paso 4: Crear índice para mejorar rendimiento
CREATE INDEX `users_barbero_id_index` ON `users` (`barbero_id`);

-- Si obtienes errores de "duplicate column" o "duplicate key", significa que los campos ya existen
-- En ese caso, simplemente ignora esos errores

