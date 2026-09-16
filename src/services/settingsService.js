import { supabase } from '../config/supabase'

export function extractYouTubeId(urlOrId) {
  if (!urlOrId) return ''
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = urlOrId.match(regExp)
  if (match && match[2].length === 11) {
    return match[2]
  }
  // Fallback if they just pasted the ID directly
  if (urlOrId.length === 11) {
    return urlOrId
  }
  return ''
}

class SettingsService {
  async getVideoId() {
    const { data, error } = await supabase
      .from('app_settings')
      .select('video_id')
      .eq('id', 1)
      .single()

    if (error) {
      console.error('Failed to load video ID from settings', error)
      // Fallback ID if row doesn't exist
      return 'dQw4w9WgXcQ'
    }
    
    return data.video_id
  }

  async setVideoId(videoId) {
    const { error } = await supabase
      .from('app_settings')
      .upsert({ id: 1, video_id: videoId }, { onConflict: 'id' })

    if (error) {
      throw new Error('Failed to update video settings.')
    }
  }
}

export const settingsService = new SettingsService()
