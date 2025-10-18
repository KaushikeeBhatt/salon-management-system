-- Fix the photo column in Products table to allow longer URLs
USE salon_db;

-- Alter the photo column to TEXT type to accommodate long URLs
ALTER TABLE Products MODIFY COLUMN photo TEXT;

-- Verify the change
DESCRIBE Products;