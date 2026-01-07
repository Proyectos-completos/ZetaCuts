-- SQL para añadir la columna image_url a la tabla barberos
-- Ejecuta este SQL en phpMyAdmin o en tu cliente MySQL

ALTER TABLE `barberos` 
ADD COLUMN `image_url` VARCHAR(255) NULL AFTER `name`;

-- Actualizar barberos existentes con la imagen por defecto
UPDATE `barberos` 
SET `image_url` = '/imagenes/peluquero.png' 
WHERE `image_url` IS NULL;

