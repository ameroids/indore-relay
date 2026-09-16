import { isValidITSFormat } from '../utils/validators'
import { supabase } from '../config/supabase'

class SupabaseITSService {
  async list() {
    const { data, error } = await supabase
      .from('authorized_its')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data.map(this._mapRecord)
  }

  async add(itsNumber) {
    const its = String(itsNumber).trim()
    if (!isValidITSFormat(its)) {
      throw new Error('ITS number must be exactly 8 digits, numbers only.')
    }

    // Check if it already exists to provide a clean error message
    const { data: existing } = await supabase
      .from('authorized_its')
      .select('id')
      .eq('its', its)
      .single()
      
    if (existing) {
      throw new Error('This ITS number is already registered.')
    }

    const { data, error } = await supabase
      .from('authorized_its')
      .insert([{ its, active: true }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('This ITS number is already registered.')
      }
      throw error
    }

    return this._mapRecord(data)
  }

  async addMany(itsList) {
    // itsList is an array of already-validated strings e.g. ["12345678", "87654321"]
    if (!itsList || itsList.length === 0) return []

    // Construct records to insert
    const recordsToInsert = itsList.map(its => ({ its, active: true }))
    
    // Use upsert with ignoreDuplicates to skip existing ones silently
    const { data, error } = await supabase
      .from('authorized_its')
      .upsert(recordsToInsert, { onConflict: 'its', ignoreDuplicates: true })
      .select()

    if (error) {
      throw error
    }
    
    return data ? data.map(this._mapRecord) : []
  }

  async setActive(id, active) {
    // If disabling, also clear the active session
    const updateData = { active }
    if (!active) {
      updateData.active_session_id = null
      updateData.active_device_id = null
      updateData.session_issued_at = null
    }

    const { data, error } = await supabase
      .from('authorized_its')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error('ITS record not found or update failed.')
    return this._mapRecord(data)
  }

  async remove(id) {
    const { error } = await supabase
      .from('authorized_its')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async findByITS(itsNumber) {
    const its = String(itsNumber).trim()
    const { data, error } = await supabase
      .from('authorized_its')
      .select('*')
      .eq('its', its)
      .single()

    if (error || !data) return null
    return this._mapRecord(data)
  }

  async isAuthorized(itsNumber) {
    const record = await this.findByITS(itsNumber)
    return Boolean(record && record.active)
  }

  async attachSession(itsNumber, { sessionId, deviceId }) {
    const its = String(itsNumber).trim()
    
    // First get the record to check for existing sessions
    const { data: record, error: fetchError } = await supabase
      .from('authorized_its')
      .select('*')
      .eq('its', its)
      .single()
      
    if (fetchError || !record) throw new Error('ITS record not found.')

    if (record.active_device_id && record.active_device_id !== deviceId) {
      const err = new Error(
        'This ITS is already logged in on another device. Log out there first.'
      )
      err.code = 'ALREADY_ACTIVE_ELSEWHERE'
      throw err
    }

    const { data, error: updateError } = await supabase
      .from('authorized_its')
      .update({
        active_session_id: sessionId,
        active_device_id: deviceId,
        session_issued_at: new Date().toISOString()
      })
      .eq('its', its)
      .select()
      .single()

    if (updateError) throw updateError
    return this._mapRecord(data)
  }

  async clearSession(itsNumber, sessionId) {
    const its = String(itsNumber).trim()
    
    // Only clear if the session ID matches, to prevent stale sessions from logging out new ones
    const { error } = await supabase
      .from('authorized_its')
      .update({
        active_session_id: null,
        active_device_id: null,
        session_issued_at: null
      })
      .eq('its', its)
      .eq('active_session_id', sessionId)
      
    if (error) {
      console.error('Error clearing session:', error)
    }
  }

  async stats() {
    const { data, error } = await supabase
      .from('authorized_its')
      .select('active')
      
    if (error) return { total: 0, active: 0, disabled: 0 }
    
    const total = data.length
    const active = data.filter((r) => r.active).length
    return { total, active, disabled: total - active }
  }

  // Maps database record to the format expected by the frontend
  _mapRecord(dbRecord) {
    if (!dbRecord) return null
    return {
      id: dbRecord.id,
      its: dbRecord.its,
      active: dbRecord.active,
      createdAt: dbRecord.created_at,
      activeSession: dbRecord.active_session_id ? {
        sessionId: dbRecord.active_session_id,
        deviceId: dbRecord.active_device_id,
        issuedAt: dbRecord.session_issued_at
      } : null
    }
  }
}

export const itsService = new SupabaseITSService()
