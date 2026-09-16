import { useEffect, useMemo, useState } from 'react'
import './AdminDashboardPage.css'
import StatCard from '../components/StatCard'
import ITSTable from '../components/ITSTable'
import Modal from '../components/Modal'
import Alert from '../components/Alert'
import { itsService } from '../services/itsService'
import { settingsService, extractYouTubeId } from '../services/settingsService'
import { validateITS } from '../utils/validators'

export default function AdminDashboardPage() {
  const [records, setRecords] = useState([])
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [newITS, setNewITS] = useState('')
  const [addError, setAddError] = useState(null)
  const [adding, setAdding] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  
  // Settings state
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [videoLink, setVideoLink] = useState('')
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsError, setSettingsError] = useState(null)

  const refresh = async () => {
    const list = await itsService.list()
    setRecords(list)
    const currentVideoId = await settingsService.getVideoId()
    setVideoLink(`https://youtube.com/watch?v=${currentVideoId}`)
  }

  useEffect(() => {
    refresh()
  }, [])

  const stats = useMemo(() => {
    const total = records.length
    const active = records.filter((r) => r.active).length
    return { total, active, disabled: total - active }
  }, [records])

  const filtered = useMemo(() => {
    if (!query.trim()) return records
    return records.filter((r) => r.its.includes(query.trim()))
  }, [records, query])

  const handleAdd = async (event) => {
    event.preventDefault()
    
    // Split by commas, newlines, or spaces
    const rawList = newITS.split(/[\s,]+/).filter(Boolean)
    
    if (rawList.length === 0) {
      setAddError('Please enter at least one ITS number.')
      return
    }

    const validList = []
    for (const its of rawList) {
      const result = validateITS(its)
      if (!result.valid) {
        setAddError(`Invalid ITS: "${its}". ${result.error}`)
        return
      }
      validList.push(result.value)
    }

    setAdding(true)
    setAddError(null)
    try {
      await itsService.addMany(validList)
      setNewITS('')
      setModalOpen(false)
      await refresh()
    } catch (err) {
      setAddError(err.message)
    } finally {
      setAdding(false)
    }
  }

  const handleToggle = async (record) => {
    await itsService.setActive(record.id, !record.active)
    await refresh()
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    await itsService.remove(confirmDelete.id)
    setConfirmDelete(null)
    await refresh()
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    setSettingsError(null)
    
    const videoId = extractYouTubeId(videoLink)
    if (!videoId) {
      setSettingsError('Could not extract a valid YouTube video ID from that link.')
      return
    }

    setSavingSettings(true)
    try {
      await settingsService.setVideoId(videoId)
      setSettingsOpen(false)
      // re-format the link to be clean
      setVideoLink(`https://youtube.com/watch?v=${videoId}`)
    } catch (err) {
      setSettingsError(err.message)
    } finally {
      setSavingSettings(false)
    }
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__head">
        <div>
          <h1>Authorized access</h1>
          <p>Manage which ITS numbers can sign in to Indore Relay.</p>
        </div>
        <div className="admin-dashboard__actions">
          <button type="button" className="admin-dashboard__settings" onClick={() => setSettingsOpen(true)}>
            Settings
          </button>
          <button type="button" className="admin-dashboard__add" onClick={() => setModalOpen(true)}>
            + Add ITS
          </button>
        </div>
      </div>

      <div className="admin-dashboard__stats">
        <StatCard label="Total ITS" value={stats.total} tone="accent" />
        <StatCard label="Active" value={stats.active} tone="active" />
        <StatCard label="Disabled" value={stats.disabled} tone="disabled" />
      </div>

      <div className="admin-dashboard__toolbar">
        <input
          type="text"
          inputMode="numeric"
          placeholder="Search by ITS number"
          value={query}
          onChange={(e) => setQuery(e.target.value.replace(/\D/g, '').slice(0, 8))}
          className="admin-dashboard__search"
        />
      </div>

      <ITSTable records={filtered} onToggle={handleToggle} onDelete={setConfirmDelete} />

      <Modal open={modalOpen} title="Add ITS number" onClose={() => setModalOpen(false)}>
        <form className="add-its-form" onSubmit={handleAdd}>
          <label className="add-its-form__field">
            <span>8-digit ITS (bulk add with commas/newlines)</span>
            <textarea
              autoFocus
              rows={4}
              value={newITS}
              onChange={(e) => setNewITS(e.target.value)}
              placeholder="00000000, 11111111..."
              style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', padding: '0.65rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--line-strong)', background: 'var(--bg-inset)', color: 'var(--text-primary)', resize: 'vertical' }}
            />
          </label>
          <Alert tone="error">{addError}</Alert>
          <button type="submit" className="add-its-form__submit" disabled={adding}>
            {adding ? 'Adding…' : 'Add ITS'}
          </button>
        </form>
      </Modal>

      <Modal
        open={Boolean(confirmDelete)}
        title="Delete this ITS?"
        onClose={() => setConfirmDelete(null)}
      >
        <div className="confirm-delete">
          <p>
            ITS <strong>{confirmDelete?.its}</strong> will lose access immediately, and any active
            session for it will be signed out. This can't be undone.
          </p>
          <div className="confirm-delete__actions">
            <button type="button" className="confirm-delete__cancel" onClick={() => setConfirmDelete(null)}>
              Cancel
            </button>
            <button type="button" className="confirm-delete__confirm" onClick={handleDelete}>
              Delete ITS
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={settingsOpen} title="App Settings" onClose={() => setSettingsOpen(false)}>
        <form className="add-its-form" onSubmit={handleSaveSettings}>
          <label className="add-its-form__field">
            <span>YouTube Video Link</span>
            <input
              type="text"
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              style={{ fontSize: '1rem', letterSpacing: 'normal' }}
            />
            <small style={{ color: 'var(--text-tertiary)', fontWeight: 'normal', marginTop: '0.2rem' }}>
              Paste the full YouTube URL. The app will extract the ID automatically.
            </small>
          </label>
          {settingsError && <Alert tone="error">{settingsError}</Alert>}
          <button type="submit" className="add-its-form__submit" disabled={savingSettings}>
            {savingSettings ? 'Saving…' : 'Save Settings'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
