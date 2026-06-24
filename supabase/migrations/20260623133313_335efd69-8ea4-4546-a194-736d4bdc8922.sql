
-- 1. Drop unique constraint on profiles.username
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_key;

-- 2. Drop prompt_library
DROP TABLE IF EXISTS public.prompt_library CASCADE;

-- 3. Storage policies for avatars bucket (files stored under <user_id>/...)
CREATE POLICY "avatars read own"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars insert own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars update own"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars delete own"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
