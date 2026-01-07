-- Agregar campos is_barbero y barbero_id a la tabla users
-- Ejecutar este script directamente en la base de datos si la migración no funciona
-- Puedes ejecutarlo en phpMyAdmin o directamente en MySQL

-- Verificar si las columnas ya existen antes de agregarlas
SET @dbname = DATABASE();
SET @tablename = "users";
SET @columnname1 = "is_barbero";
SET @columnname2 = "barbero_id";

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname1)
  ) > 0,
  "SELECT 'Column is_barbero already exists.';",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname1, " BOOLEAN DEFAULT FALSE AFTER is_admin;")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname2)
  ) > 0,
  "SELECT 'Column barbero_id already exists.';",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname2, " BIGINT UNSIGNED NULL AFTER is_admin;")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar foreign key constraint si no existe
SET @fk_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_NAME = 'users_barbero_id_foreign' 
  AND TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'users'
);

SET @preparedStatement = (SELECT IF(
  @fk_exists > 0,
  "SELECT 'Foreign key already exists.';",
  "ALTER TABLE users ADD CONSTRAINT users_barbero_id_foreign FOREIGN KEY (barbero_id) REFERENCES barberos(id) ON DELETE CASCADE;"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Crear índice si no existe
SET @index_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE INDEX_NAME = 'users_barbero_id_index' 
  AND TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'users'
);

SET @preparedStatement = (SELECT IF(
  @index_exists > 0,
  "SELECT 'Index already exists.';",
  "CREATE INDEX users_barbero_id_index ON users (barbero_id);"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SELECT 'Migration completed successfully!' AS result;
