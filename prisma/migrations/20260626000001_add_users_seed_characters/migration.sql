-- CreateTable: users (custom auth, menggantikan Supabase Auth)
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed: 4 karakter dari Supabase
INSERT INTO `characters` (`id`, `name`, `anime`, `description`, `tags`, `avatar_url`, `accent_color`, `is_active`, `created_at`)
VALUES
  ('a7a1fc2e-5e33-48f3-b93a-53666fd850bb', 'Mizuhara Chizuru', 'Rent-a-Girlfriend',
   'A calm, mature presence who listens deeply and supports you through anything.',
   '["Supportive","Calm","Mature"]', '/characters/mizuhara.png', '#EC4899', TRUE, '2026-06-23 11:42:15'),
  ('56f589cc-7ca3-430e-ac68-779237fc883d', 'Anya Forger', 'Spy x Family',
   'Playful, curious, and full of energy — Anya brings light to every conversation.',
   '["Funny","Cute","Energetic"]', '/characters/anya.png', '#F59E0B', TRUE, '2026-06-23 11:42:15'),
  ('2668706c-50c3-41e1-84f1-2c95048282d3', 'Will Serfort', 'Wistoria: Wand and Sword',
   'A composed, intelligent companion with a thoughtful, magical perspective.',
   '["Magic","Calm","Intelligent"]', '/characters/will.png', '#8B5CF6', TRUE, '2026-06-23 11:42:15'),
  ('4ab58e00-b43f-42dd-a481-a2c391d338df', 'Asta', 'Black Clover',
   'Relentlessly motivational warrior who reminds you to never give up.',
   '["Energetic","Motivational","Warrior"]', '/characters/asta.png', '#10B981', TRUE, '2026-06-23 11:42:15')
ON DUPLICATE KEY UPDATE `avatar_url` = VALUES(`avatar_url`), `name` = VALUES(`name`);
