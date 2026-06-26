-- Perlebar image_url dari VARCHAR(2048) ke LONGTEXT
-- karena image_url berisi data:image/png;base64 yang bisa sangat panjang
ALTER TABLE `generated_images` MODIFY COLUMN `image_url` LONGTEXT NULL;
