import { supabase, isSupabaseConfigured } from './supabase'

export async function uploadCatchImage(
  file: File,
  userId: string
): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot upload image')
    return null
  }

  try {
    // Skapa unikt filnamn
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    // Ladda upp till Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('catch-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return null
    }

    // Hämta publik URL
    const { data } = supabase.storage
      .from('catch-images')
      .getPublicUrl(fileName)

    return data.publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    return null
  }
}

export async function deleteCatchImage(imageUrl: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !imageUrl) return false

  try {
    // Extrahera filnamn från URL
    const urlParts = imageUrl.split('/catch-images/')
    if (urlParts.length < 2) return false

    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from('catch-images')
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting image:', error)
    return false
  }
}
