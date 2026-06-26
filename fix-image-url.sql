-- Jalankan ini langsung di MySQL/Laragon jika migration Prisma belum jalan
ALTER TABLE `generated_images` MODIFY COLUMN `image_url` LONGTEXT NULL;
ALTER TABLE `generated_voices` MODIFY COLUMN `audio_url` LONGTEXT NULL;
