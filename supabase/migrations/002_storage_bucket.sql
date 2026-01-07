-- FiskeApp Storage Setup
-- Kör denna fil i Supabase SQL Editor

-- Skapa storage bucket för fångstbilder
INSERT INTO storage.buckets (id, name, public)
VALUES ('catch-images', 'catch-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Inloggade användare kan ladda upp bilder
CREATE POLICY "Users can upload catch images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'catch-images');

-- Policy: Alla kan se bilder (public bucket)
CREATE POLICY "Public can view catch images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'catch-images');

-- Policy: Användare kan ta bort sina egna bilder
CREATE POLICY "Users can delete own catch images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'catch-images' AND auth.uid()::text = (storage.foldername(name))[1]);
